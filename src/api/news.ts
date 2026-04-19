import { translate } from '../i18n'
import { getJson } from './http'

export type NewsItem = {
  id: string
  title: string
  link: string
  source: string
  publishedAt: string | null
  summary: string | null
  imageUrl: string | null
}

export type NewsPayload = {
  items: NewsItem[]
  failedSources: string[]
  updatedAt: string | null
}

function normalizeNewsItem(value: unknown): NewsItem | null {
  if (!value || typeof value !== 'object') return null

  const item = value as Partial<Record<keyof NewsItem, unknown>>
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  const link = typeof item.link === 'string' ? item.link.trim() : ''
  const id = typeof item.id === 'string' && item.id ? item.id : link
  const source = typeof item.source === 'string' ? item.source.trim() : ''

  if (!title || !link || !source) return null

  return {
    id,
    title,
    link,
    source,
    publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : null,
    summary: typeof item.summary === 'string' && item.summary ? item.summary : null,
    imageUrl: typeof item.imageUrl === 'string' && item.imageUrl ? item.imageUrl : null,
  }
}

export async function fetchNews(): Promise<NewsPayload> {
  const payload: unknown = await getJson('/api/news', translate('news.loadingFailed'))
  const payloadRecord = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}

  const items = Array.isArray(payloadRecord.items)
    ? payloadRecord.items.map(normalizeNewsItem).filter((item): item is NewsItem => Boolean(item))
    : []
  const failedSources = Array.isArray(payloadRecord.failedSources)
    ? payloadRecord.failedSources.filter((source: unknown): source is string => typeof source === 'string' && Boolean(source))
    : []

  return {
    items,
    failedSources,
    updatedAt: typeof payloadRecord.updatedAt === 'string' ? payloadRecord.updatedAt : null,
  }
}
