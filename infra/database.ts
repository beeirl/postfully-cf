import { secret } from './secret'

export const database = new sst.Linkable('Database', {
  properties: {
    host: $app.stage === 'production' ? 'aws-eu-central-1.pg.psdb.cloud' : 'aws-1-eu-central-1.pooler.supabase.com',
    database: 'postgres',
    username: secret.DATABASE_USERNAME.value,
    password: secret.DATABASE_PASSWORD.value,
    port: 5432,
  },
})
