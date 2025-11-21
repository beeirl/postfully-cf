import { domain, isPermanentStage, zoneID } from './stage'

const storageRegion = 'weur'

export const privateStorageBucket = new sst.cloudflare.Bucket('PrivateStorage', {
  transform: {
    bucket: {
      location: storageRegion,
    },
  },
})

export const publicStorageBucket = new sst.cloudflare.Bucket('PublicStorage', {
  transform: {
    bucket: {
      location: storageRegion,
    },
  },
})

const publicStorageDomain = isPermanentStage
  ? new cloudflare.R2CustomDomain('PublicStorageCustomDomain', {
      accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
      enabled: true,
      bucketName: publicStorageBucket.name,
      domain: `storage.${domain}`,
      zoneId: zoneID,
    }).domain
  : new cloudflare.R2ManagedDomain('PublicStorageManagedDomain', {
      accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
      bucketName: publicStorageBucket.name,
      enabled: true,
    }).domain

new cloudflare.R2BucketCors('PublicStorageBucketCors', {
  accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
  bucketName: publicStorageBucket.name,
  rules: [
    {
      allowed: {
        headers: ['*'],
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        origins: ['http://localhost:5173'],
      },
    },
  ],
})
