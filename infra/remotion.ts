import path from 'path'

const remotionBucket = new sst.cloudflare.Bucket('RemotionBucket', {
  transform: {
    bucket: {
      location: 'weur',
    },
  },
})
const remotionBucketDomain = new cloudflare.R2ManagedDomain('RemotionBucketDomain', {
  accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
  bucketName: remotionBucket.name,
  enabled: true,
}).domain

export const remotionQueue = new cloudflare.Queue('RemotionQueue', {
  accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
  queueName: `${$app.name}-${$app.stage}-remotion-queue`,
})

const remotionSite = new sst.cloudflare.StaticSite('RemotionSite', {
  path: 'packages/remotion',
  build: {
    command: 'bun remotion bundle',
    output: './build',
  },
})

const remotionRole = new aws.iam.Role('RemotionRole', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
      },
    ],
  }),
  managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
})

const remotionLambda = new aws.lambda.Function('RemotionLambda', {
  role: remotionRole.arn,
  runtime: 'nodejs18.x',
  handler: 'index.handler',
  architectures: ['arm64'],
  code: new $util.asset.FileArchive(process.cwd() + '/node_modules/@remotion/lambda/remotionlambda-arm64.zip'),
  timeout: 120,
  memorySize: 2048,
  layers: [
    'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-fonts-arm64:17',
    'arn:aws:lambda:eu-central-1:678892195805:layer:remotion-binaries-chromium-arm64:18',
  ],
  ephemeralStorage: {
    size: 2048,
  },
})

const remotionPolicy = new aws.iam.Policy('RemotionPolicy', {
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: ['s3:*'],
        Resource: ['*'],
        Effect: 'Allow',
      },
      {
        Action: ['lambda:*'],
        Resource: [remotionLambda.arn],
        Effect: 'Allow',
      },
      {
        Effect: 'Allow',
        Action: ['logs:CreateLogGroup'],
        Resource: ['arn:aws:logs:*:*:log-group:/aws/lambda-insights'],
      },
      {
        Effect: 'Allow',
        Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
        Resource: [
          $util.interpolate`arn:aws:logs:*:*:log-group:/aws/lambda/${remotionLambda.name}:*`,
          'arn:aws:logs:*:*:log-group:/aws/lambda-insights:*',
        ],
      },
    ],
  },
})

new aws.iam.PolicyAttachment('RemotionPolicyAttachment', {
  policyArn: remotionPolicy.arn,
  roles: [remotionRole.name],
})

const remotionUser = new aws.iam.User('RemotionUser')
new aws.iam.UserPolicy('RemotionUserPolicy', {
  user: remotionUser.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'HandleQuotas',
        Effect: 'Allow',
        Action: [
          'servicequotas:GetServiceQuota',
          'servicequotas:GetAWSDefaultServiceQuota',
          'servicequotas:RequestServiceQuotaIncrease',
          'servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota',
        ],
        Resource: ['*'],
      },
      {
        Sid: 'PermissionValidation',
        Effect: 'Allow',
        Action: ['iam:SimulatePrincipalPolicy'],
        Resource: ['*'],
      },
      {
        Sid: 'LambdaInvokation',
        Effect: 'Allow',
        Action: ['iam:PassRole'],
        Resource: [$interpolate`arn:aws:iam::*:role/${remotionRole.name}`],
      },
      {
        Sid: 'Storage',
        Effect: 'Allow',
        Action: [
          's3:GetObject',
          's3:DeleteObject',
          's3:PutObjectAcl',
          's3:PutObject',
          's3:CreateBucket',
          's3:ListBucket',
          's3:GetBucketLocation',
          's3:PutBucketAcl',
          's3:DeleteBucket',
          's3:PutBucketOwnershipControls',
          's3:PutBucketPublicAccessBlock',
          's3:PutLifecycleConfiguration',
        ],
        Resource: ['*'],
      },
      {
        Sid: 'BucketListing',
        Effect: 'Allow',
        Action: ['s3:ListAllMyBuckets'],
        Resource: ['*'],
      },
      {
        Sid: 'FunctionListing',
        Effect: 'Allow',
        Action: ['lambda:ListFunctions', 'lambda:GetFunction'],
        Resource: ['*'],
      },
      {
        Sid: 'FunctionManagement',
        Effect: 'Allow',
        Action: [
          'lambda:InvokeAsync',
          'lambda:InvokeFunction',
          'lambda:CreateFunction',
          'lambda:DeleteFunction',
          'lambda:PutFunctionEventInvokeConfig',
          'lambda:PutRuntimeManagementConfig',
          'lambda:TagResource',
        ],
        Resource: [$interpolate`arn:aws:lambda:*:*:function:${remotionLambda.name}`],
      },
      {
        Sid: 'LogsRetention',
        Effect: 'Allow',
        Action: ['logs:CreateLogGroup', 'logs:PutRetentionPolicy'],
        Resource: [$interpolate`arn:aws:logs:*:*:log-group:/aws/lambda/${remotionLambda.name}`],
      },
      {
        Sid: 'FetchBinaries',
        Effect: 'Allow',
        Action: ['lambda:GetLayerVersion'],
        Resource: [
          'arn:aws:lambda:*:678892195805:layer:remotion-binaries-*',
          'arn:aws:lambda:*:580247275435:layer:LambdaInsightsExtension*',
        ],
      },
    ],
  },
})

export const remotionAccessKey = new aws.iam.AccessKey('RemotionAccessKey', {
  user: remotionUser.name,
})

export const remotion = new sst.Linkable('Remotion', {
  properties: {
    bucketName: remotionBucket.name,
    bucketUrl: $interpolate`https://${remotionBucketDomain}`,
    functionName: remotionLambda.name,
    siteUrl: remotionSite.url,
  },
})
