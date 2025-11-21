import { remotion, remotionAccessKey, remotionQueue } from './remotion'
import { allSecrets } from './secret'
import { privateStorageBucket, publicStorageBucket } from './storage'

new sst.cloudflare.x.SolidStart('Web', {
  path: 'packages/web',
  link: [privateStorageBucket, publicStorageBucket, remotion, remotionQueue, ...allSecrets],
  environment: {
    REMOTION_AWS_ACCESS_KEY_ID: remotionAccessKey.id,
    REMOTION_AWS_SECRET_ACCESS_KEY: remotionAccessKey.secret,
  },
  transform: {
    server: {
      transform: {
        worker: {
          placement: { mode: 'smart' },
        },
      },
    },
  },
})
