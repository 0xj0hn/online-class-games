import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { db } from '../api/lib/db'
import { migrate } from './migrate'
import { createRequestListener } from './app'

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'
const distDir = resolve(process.env.DIST_DIR ?? 'dist')

if(!process.env.TURSO_DATABASE_URL) {
  console.error('TURSO_DATABASE_URL is required. Use file:./data/leaderboard.db for a local database.')
  process.exit(1)
}

try {
  await migrate()
  console.log('database ready')
} catch (err) {
  console.error('database migration failed', err)
  process.exit(1)
}

const server = createServer(createRequestListener({ distDir }))

server.listen(port, host, ()=> {
  console.log(`bbb-games listening on http://${host}:${port} (serving ${distDir})`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`)
  server.close()
  try { db().close() } catch {}
  process.exit(0)
}

process.on('SIGTERM', ()=> void shutdown('SIGTERM'))
process.on('SIGINT', ()=> void shutdown('SIGINT'))