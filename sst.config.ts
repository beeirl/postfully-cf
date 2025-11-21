/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'postfully',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'cloudflare',
      providers: {
        aws: {
          profile: process.env.GITHUB_ACTIONS
            ? undefined
            : input.stage === 'production'
              ? 'postfully-production'
              : 'postfully-dev',
          region: 'eu-central-1',
        },
        cloudflare: true,
        planetscale: true,
      },
    }
  },
  async run() {
    await import('./infra/auth')
    await import('./infra/web')
    await import('./infra/remotion')
  },
})
