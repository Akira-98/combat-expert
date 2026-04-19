import Parser from 'rss-parser'

const NEWS_FEEDS = [
  { source: 'Sherdog', url: 'https://www.sherdog.com/rss/news.xml' },
  { source: 'MMA Fighting', url: 'https://www.mmafighting.com/rss/index.xml' },
]

const NEWS_ITEM_LIMIT = 30
const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function stripHtml(value) {
  return asString(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(value, maxLength) {
  const text = stripHtml(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}...`
}

function readMediaUrl(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = readMediaUrl(entry)
      if (url) return url
    }
    return ''
  }
  if (typeof value === 'object') {
    return asString(value.url) || asString(value.$?.url)
  }
  return ''
}

function extractImageUrl(item) {
  const enclosureUrl = asString(item.enclosure?.url)
  if (enclosureUrl) return enclosureUrl

  const mediaContentUrl = readMediaUrl(item.mediaContent)
  if (mediaContentUrl) return mediaContentUrl

  const mediaThumbnailUrl = readMediaUrl(item.mediaThumbnail)
  if (mediaThumbnailUrl) return mediaThumbnailUrl

  const html = asString(item.contentEncoded) || asString(item.content)
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] || null
}

function normalizeDate(item) {
  const dateValue = asString(item.isoDate) || asString(item.pubDate)
  if (!dateValue) return null

  const timestamp = Date.parse(dateValue)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function normalizeItem(item, source) {
  const title = asString(item.title)
  const link = asString(item.link) || asString(item.guid)
  const publishedAt = normalizeDate(item)

  return {
    id: link || `${source}:${title}:${publishedAt || ''}`,
    title,
    link,
    source,
    publishedAt,
    summary: truncateText(item.contentSnippet || item.summary || item.content, 220) || null,
    imageUrl: extractImageUrl(item),
  }
}

export async function fetchNewsItems() {
  const settledFeeds = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url)
      return {
        source: feed.source,
        items: Array.isArray(parsed.items)
          ? parsed.items.map((item) => normalizeItem(item, feed.source))
          : [],
      }
    }),
  )

  const failedSources = []
  const items = []

  for (const [index, result] of settledFeeds.entries()) {
    if (result.status === 'rejected') {
      failedSources.push(NEWS_FEEDS[index]?.source || 'Unknown')
      continue
    }

    items.push(...result.value.items)
  }

  const uniqueItems = [
    ...new Map(
      items
        .filter((item) => item.title && item.link)
        .map((item) => [item.link, item]),
    ).values(),
  ]

  uniqueItems.sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return bTime - aTime
  })

  return {
    items: uniqueItems.slice(0, NEWS_ITEM_LIMIT),
    failedSources,
  }
}
