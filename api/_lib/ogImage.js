import { ImageResponse } from '@vercel/og'

const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 630

export function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

export function getRequestOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'combatexpert.xyz'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export function h(type, props, ...children) {
  const nextProps = { ...(props || {}) }

  if (type === 'div') {
    nextProps.style = {
      display: 'flex',
      ...(nextProps.style || {}),
    }
  }

  return {
    type,
    props: {
      ...nextProps,
      children,
    },
  }
}

export async function sendPngImage(res, element, options = {}) {
  const response = new ImageResponse(element, {
    width: options.width ?? DEFAULT_WIDTH,
    height: options.height ?? DEFAULT_HEIGHT,
  })
  const arrayBuffer = await response.arrayBuffer()

  res.statusCode = 200
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', options.cacheControl ?? 's-maxage=300, stale-while-revalidate=600')
  res.end(Buffer.from(arrayBuffer))
}
