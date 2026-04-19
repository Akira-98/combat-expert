import { allowMethods, sendJson, sendServerError } from './_lib/http.js'
import { fetchNewsItems } from './_lib/newsFeed.js'

const NEWS_CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return

  try {
    const { items, failedSources } = await fetchNewsItems()

    return sendJson(
      res,
      200,
      {
        items,
        failedSources,
        updatedAt: new Date().toISOString(),
      },
      NEWS_CACHE_CONTROL,
    )
  } catch (error) {
    return sendServerError(res, error, 'Failed to load news')
  }
}
