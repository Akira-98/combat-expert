import type { Locale } from '../i18n'
import { useI18n } from '../i18n'
import type { NewsItem } from '../api/news'
import { useNews } from '../hooks/useNews'

function formatPublishedAt(value: string | null, locale: Locale) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function NewsPage() {
  const { t, locale } = useI18n()
  const news = useNews()

  return (
    <section className="grid gap-3">
      <div className="px-4 pt-4 pb-1 md:px-4 md:pt-5 md:pb-1">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="ui-text-strong m-0 text-[28px] font-semibold tracking-tight md:text-[36px]">{t('news.pageTitle')}</h2>
            <p className="ui-text-muted m-0 mt-1 text-sm">{t('news.pageSubtitle')}</p>
          </div>
          {news.updatedAt ? (
            <p className="ui-text-muted m-0 text-xs">
              {t('news.updatedAt', { time: formatPublishedAt(news.updatedAt, locale) })}
            </p>
          ) : null}
        </div>
      </div>

      {news.isLoading ? (
        <NewsLoadingState />
      ) : news.errorMessage ? (
        <NewsErrorState errorMessage={news.errorMessage} onRetry={() => void news.refetch()} />
      ) : news.items.length === 0 ? (
        <NewsEmptyState />
      ) : (
        <div className="grid gap-3 px-4 pb-6">
          {news.items.map((item) => (
            <NewsArticleCard key={item.id} item={item} publishedAt={formatPublishedAt(item.publishedAt, locale)} />
          ))}
        </div>
      )}
    </section>
  )
}

function NewsArticleCard({ item, publishedAt }: { item: NewsItem; publishedAt: string }) {
  return (
    <article className="card-surface-soft card-shell-xl overflow-hidden">
      <a className="grid min-h-[104px] grid-cols-[104px_minmax(0,1fr)] gap-0 text-inherit no-underline md:min-h-[132px] md:grid-cols-[176px_minmax(0,1fr)]" href={item.link} rel="noreferrer" target="_blank">
        {item.imageUrl ? (
          <img alt="" className="h-full min-h-[104px] w-full object-cover md:min-h-[132px]" loading="lazy" referrerPolicy="no-referrer" src={item.imageUrl} />
        ) : (
          <div className="ui-divider-faint flex h-full min-h-[104px] items-center justify-center border-r md:min-h-[132px]">
            <span className="ui-text-muted px-2 text-center text-[10px] font-semibold uppercase md:text-xs">{item.source}</span>
          </div>
        )}
        <div className="min-w-0 p-3 md:p-4">
          <div className="ui-text-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold md:text-xs">
            <span>{item.source}</span>
            {publishedAt ? <span>{publishedAt}</span> : null}
          </div>
          <h3 className="ui-text-strong m-0 mt-1 break-words text-sm font-semibold leading-snug md:mt-2 md:text-xl">{item.title}</h3>
          {item.summary ? (
            <p className="ui-text-body m-0 mt-1 hidden break-words text-sm leading-6 sm:[-webkit-box-orient:vertical] sm:[display:-webkit-box] sm:line-clamp-2 sm:overflow-hidden md:mt-2">
              {item.summary}
            </p>
          ) : null}
        </div>
      </a>
    </article>
  )
}

function NewsLoadingState() {
  return (
    <div className="grid gap-3 px-4">
      <div className="card-surface-soft card-shell-xl h-[104px] md:h-40" />
      <div className="card-surface-soft card-shell-xl h-[104px] md:h-40" />
      <div className="card-surface-soft card-shell-xl h-[104px] md:h-40" />
    </div>
  )
}

function NewsErrorState({ errorMessage, onRetry }: { errorMessage: string; onRetry: () => void }) {
  const { t } = useI18n()
  return (
    <div className="ui-state-danger mx-4 rounded-md border p-4">
      <p className="m-0 text-sm font-semibold">{errorMessage}</p>
      <button className="ui-btn-secondary mt-3 rounded-md border px-3 py-2 text-sm font-semibold" onClick={onRetry} type="button">
        {t('common.retry')}
      </button>
    </div>
  )
}

function NewsEmptyState() {
  const { t } = useI18n()
  return (
    <div className="card-surface-soft card-shell-xl mx-4 p-4 text-center">
      <p className="ui-text-body m-0 text-sm">{t('news.empty')}</p>
    </div>
  )
}
