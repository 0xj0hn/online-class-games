import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import leaderboard from '../api/leaderboard'
import packs from '../api/packs'
import { db } from '../api/lib/db'
import { MAX_PACK_BYTES } from '../api/lib/packs'

type ApiHandler = (req: any, res: any) => Promise<unknown> | unknown

export interface AppOptions {
  distDir: string
  maxBodyBytes?: number
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

const API_PREFIX = '/api/'

function json(res: ServerResponse, code: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.statusCode = code
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('content-length', Buffer.byteLength(payload))
  res.end(payload)
}

async function readBody(req: IncomingMessage, maxBytes: number): Promise<{ ok:true; value:unknown } | { ok:false }> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = chunk as Buffer
    size += buf.length
    if(size > maxBytes) return { ok:false }
    chunks.push(buf)
  }
  if(!chunks.length) return { ok:true, value:undefined }
  try { return { ok:true, value: JSON.parse(Buffer.concat(chunks).toString('utf8')) } }
  catch { return { ok:true, value:undefined } }
}

function toApiRes(res: ServerResponse) {
  return {
    setHeader: (k: string, v: string)=> res.setHeader(k, v),
    status(code: number) { res.statusCode = code; return this },
    json(body: unknown) { json(res, res.statusCode, body); return this },
    end() { res.end(); return this },
  }
}

async function serveFile(res: ServerResponse, filePath: string, immutable: boolean) {
  const body = await readFile(filePath)
  res.statusCode = 200
  res.setHeader('content-type', MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream')
  res.setHeader('content-length', body.length)
  res.setHeader('cache-control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache')
  res.end(body)
}

async function serveStatic(req: IncomingMessage, res: ServerResponse, distDir: string) {
  const root = resolve(distDir)
  const rawPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  const candidate = resolve(join(root, rawPath))

  if(candidate === root || candidate.startsWith(root + sep)) {
    try {
      const info = await stat(candidate)
      if(info.isFile()) {
        return void await serveFile(res, candidate, rawPath.startsWith('/assets/'))
      }
    } catch { /* fall through to index.html */ }
  }

  const fallback = join(root, 'index.html')
  try {
    await serveFile(res, fallback, false)
  } catch {
    json(res, 500, { reason:'app-not-built' })
  }
}

export function createRequestListener(options: AppOptions) {
  const distDir = resolve(options.distDir)
  const maxBodyBytes = options.maxBodyBytes ?? 16 * 1024

  const handlers: Record<string, { handler: ApiHandler; maxBody?: number }> = {
    '/api/leaderboard': { handler: leaderboard },
    '/api/packs': { handler: packs, maxBody: MAX_PACK_BYTES + 4096 },
  }

  return async function onRequest(req: IncomingMessage, res: ServerResponse) {
    const path = (req.url ?? '/').split('?')[0]

    if(path === '/api/health') {
      try {
        await db().execute('SELECT 1')
        return json(res, 200, { ok:true })
      } catch {
        return json(res, 503, { ok:false })
      }
    }

    if(path.startsWith(API_PREFIX)) {
      const route = handlers[path.replace(/\/+$/, '')]
      if(!route) return json(res, 404, { reason:'not-found' })
      try {
        const wantsBody = req.method !== 'GET' && req.method !== 'HEAD'
        const parsedBody = wantsBody
          ? await readBody(req, route.maxBody ?? maxBodyBytes)
          : { ok:true as const, value:undefined }
        if(!parsedBody.ok) return json(res, 413, { reason:'body-too-large' })
        const url = new URL(req.url ?? '/', 'http://localhost')
        const query: Record<string, string> = {}
        url.searchParams.forEach((v, k)=> { query[k] = v })
        return void await route.handler(
          { method:req.method, query, headers:req.headers as Record<string, unknown>, body:parsedBody.value },
          toApiRes(res),
        )
      } catch (err) {
        console.error('api error', err)
        return json(res, 500, { reason:'server-error' })
      }
    }

    if(req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { reason:'method-not-allowed' })
    return void await serveStatic(req, res, distDir)
  }
}