export const database = new sst.Linkable('Database', {
  properties: {
    host: $dev ? 'supabase.co' : 'aws-eu-central-1.pg.psdb.cloud',
    database: 'postgres',
    username: DATABASE_USERNAME.value,
    password: DATABASE_PASSWORD.value,
    port: 5432,
  },
})
