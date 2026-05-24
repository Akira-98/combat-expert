import { useBonuses } from '@azuro-org/sdk'
import { BonusStatus } from '@azuro-org/toolkit'
import type { Address } from 'viem'
import { useAppConfig } from '../config/useAppConfig'
import { getFreebetSummary } from '../helpers/freebets'
import { formatPercentRatio, formatSignedUsdt } from '../helpers/formatters'
import { getWalletAvatarUrl, shortenAddress } from '../helpers/walletUi'
import { useRankings, type RankingViewer } from '../hooks/useRankings'
import { useI18n } from '../i18n'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

type ProfilePageProps = {
  address?: `0x${string}`
  isConnected: boolean
  displayName: string
  usdtBalanceLabel: string
}

export function ProfilePage({ address, isConnected, displayName, usdtBalanceLabel }: ProfilePageProps) {
  const { t } = useI18n()
  const { affiliateAddress } = useAppConfig()
  const { viewer, isLoading, errorMessage } = useRankings(address)
  const { data: freebets = [], isLoading: isFreebetsLoading } = useBonuses({
    account: (address || ZERO_ADDRESS) as Address,
    affiliate: affiliateAddress as Address,
    bonusStatus: BonusStatus.Available,
    query: {
      enabled: Boolean(address && affiliateAddress),
    },
  })
  const freebetSummary = getFreebetSummary(freebets)

  return (
    <section className="mt-2.5 grid gap-4 px-3">
      {!isConnected || !address ? (
        <ProfileEmptyState title={t('profile.connectTitle')} description={t('profile.connectDescription')} />
      ) : isLoading ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="card-surface-soft card-shell-xl h-28" />
          <div className="card-surface-soft card-shell-xl h-28" />
          <div className="card-surface-soft card-shell-xl h-28" />
          <div className="card-surface-soft card-shell-xl h-28" />
        </div>
      ) : errorMessage ? (
        <div className="ui-state-danger rounded-2xl border p-4">
          <p className="m-0 text-sm font-semibold">{errorMessage}</p>
        </div>
      ) : (
        <ProfileStats
          address={address}
          displayName={displayName}
          freebetLabel={isFreebetsLoading ? t('account.freebetsChecking') : getFreebetLabel(freebetSummary)}
          usdtBalanceLabel={usdtBalanceLabel}
          viewer={viewer ?? EMPTY_PROFILE_STATS}
        />
      )}
    </section>
  )
}

const EMPTY_PROFILE_STATS = {
  rank: 0,
  netPnl: 0,
  roi: 0,
  totalWagered: 0,
  totalPayout: 0,
  winRate: 0,
  winCount: 0,
  loseCount: 0,
  eventCount: 0,
}

function ProfileStats({
  address,
  displayName,
  freebetLabel,
  usdtBalanceLabel,
  viewer,
}: {
  address: `0x${string}`
  displayName: string
  freebetLabel: string
  usdtBalanceLabel: string
  viewer: Pick<RankingViewer, 'rank' | 'netPnl' | 'roi' | 'totalWagered' | 'totalPayout' | 'winRate' | 'winCount' | 'loseCount' | 'eventCount'>
}) {
  const { t } = useI18n()

  return (
    <div className="grid gap-5 px-1 py-2">
      <section className="grid gap-6">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <img alt="" className="h-16 w-16 shrink-0 rounded-full border object-cover md:h-20 md:w-20" src={getWalletAvatarUrl(address)} />
            <div className="min-w-0">
              <p className="ui-text-strong m-0 truncate text-2xl font-semibold md:text-3xl">{displayName}</p>
              <p className="ui-text-muted mt-1.5 mb-0 truncate text-sm">{shortenAddress(address, 6, 4)}</p>
            </div>
          </div>
          <div className="shrink-0 text-left md:text-right">
            <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Rank</p>
            <p className="ui-text-strong mt-1 mb-0 text-2xl font-semibold">{getRankDisplay(viewer.rank)}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AccountDetail label={t('account.balance')} value={usdtBalanceLabel} />
          <AccountDetail label={t('account.freebets')} value={freebetLabel} />
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <HeroStat label={t('ranking.hitRate')} value={formatPercentRatio(viewer.winRate)} />
          <HeroStat label={t('ranking.pnl')} value={formatSignedUsdt(viewer.netPnl)} />
          <HeroStat label={t('ranking.events')} value={String(viewer.eventCount)} />
        </div>
      </section>

      <div className="ui-divider-faint border-t" />

      <section className="grid grid-cols-3 gap-2 md:gap-3">
        <StatCard label={t('ranking.record')} value={t('ranking.winsLosses', { wins: viewer.winCount, losses: viewer.loseCount })} />
        <StatCard label={t('ranking.totalPayout')} value={`${viewer.totalPayout.toFixed(2)} USDT`} />
        <StatCard label={t('ranking.totalWagered')} value={`${viewer.totalWagered.toFixed(2)} USDT`} />
      </section>
    </div>
  )
}

function ProfileEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card-surface-soft card-shell-xl ui-border border px-5 py-10 text-center">
      <p className="ui-text-strong m-0 text-xl font-bold">{title}</p>
      <p className="ui-text-muted mt-2 mb-0 text-sm">{description}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface-soft card-shell-lg ui-border min-w-0 border px-2 py-3 text-center md:px-5 md:py-4">
      <p className="ui-text-muted m-0 truncate text-xs font-semibold md:text-sm">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 truncate text-base font-semibold md:mt-2 md:text-2xl">{value}</p>
    </div>
  )
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-divider-faint flex min-w-0 items-center justify-between gap-3 border-b py-3 md:border-b-0 md:py-0">
      <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">{label}</p>
      <p className="ui-text-strong m-0 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface-soft card-shell-lg ui-border min-w-0 border px-2 py-3 text-center md:px-5 md:py-4">
      <p className="ui-text-muted m-0 truncate text-xs font-semibold md:text-sm">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 truncate text-lg font-semibold md:mt-2 md:text-4xl">{value}</p>
    </div>
  )
}

function getFreebetLabel(summary: { count: number; totalAmount: string }) {
  if (summary.count <= 0) return '0 available'
  return `${summary.count} available - ${summary.totalAmount} USDT`
}

function getRankDisplay(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  if (rank > 0) return `#${rank}`
  return '-'
}
