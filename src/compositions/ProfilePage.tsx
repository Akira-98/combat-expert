import { useBonuses } from '@azuro-org/sdk'
import { BonusStatus } from '@azuro-org/toolkit'
import type { Address } from 'viem'
import type { MyReferral } from '../api/referrals'
import { useAppConfig } from '../config/useAppConfig'
import { getFreebetSummary } from '../helpers/freebets'
import { formatPercentRatio, formatSignedUsdt } from '../helpers/formatters'
import { getWalletAvatarUrl, shortenAddress } from '../helpers/walletUi'
import { useRankings, type RankingViewer } from '../hooks/useRankings'
import { useMyReferral } from '../hooks/useMyReferral'
import { useI18n } from '../i18n'
import { ReferralPanel } from './profile/ReferralPanel'

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
  const referral = useMyReferral({ address, isConnected })
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
          referral={referral.referral}
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
  referral,
  usdtBalanceLabel,
  viewer,
}: {
  address: `0x${string}`
  displayName: string
  freebetLabel: string
  referral?: MyReferral
  usdtBalanceLabel: string
  viewer: Pick<RankingViewer, 'rank' | 'netPnl' | 'roi' | 'totalWagered' | 'totalPayout' | 'winRate' | 'winCount' | 'loseCount' | 'eventCount'>
}) {
  const { t } = useI18n()
  const pnlToneClass = viewer.netPnl >= 0 ? 'ui-profile-value-positive' : 'ui-profile-value-negative'

  return (
    <div className="px-1 py-2">
      <section className="ui-profile-hero overflow-hidden rounded-2xl border p-5 md:p-7">
        <div className="relative z-10 mx-auto grid max-w-3xl gap-6">
          <div className="grid justify-items-center gap-3 text-center">
            <div className="ui-profile-avatar-ring relative h-24 w-24 rounded-full p-[3px] md:h-28 md:w-28">
              <img alt="" className="h-full w-full rounded-full object-cover" src={getWalletAvatarUrl(address)} />
              <span className="ui-profile-rank-chip absolute -right-2 -bottom-1 inline-flex min-w-10 items-center justify-center rounded-full px-2 py-1 text-xs font-black">
                {getRankDisplay(viewer.rank)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="ui-text-strong m-0 truncate text-2xl font-black md:text-3xl">{displayName}</p>
              <p className="ui-text-muted mt-1.5 mb-0 truncate text-sm font-semibold">{shortenAddress(address, 6, 4)}</p>
            </div>
          </div>

          <div className="grid justify-items-center gap-1 text-center">
            <div className="ui-profile-icon ui-profile-icon-strong">
              <ProfileIcon name="chart" />
            </div>
            <p className="ui-text-muted m-0 text-[10px] font-bold uppercase tracking-[0.18em]">{t('ranking.pnl')}</p>
            <p className={`m-0 max-w-full truncate text-5xl font-black md:text-6xl ${pnlToneClass}`}>{formatSignedUsdt(viewer.netPnl)}</p>
          </div>

          <div className="ui-profile-list grid gap-1">
            <ProfileMetric icon="trophy" label="Rank" value={getRankDisplay(viewer.rank)} />
            <ProfileMetric icon="wallet" label={t('account.balance')} value={usdtBalanceLabel} />
            <ProfileMetric icon="ticket" label={t('account.freebets')} value={freebetLabel} />
            <ProfileMetric icon="target" label={t('ranking.hitRate')} value={formatPercentRatio(viewer.winRate)} />
            <ProfileMetric icon="activity" label={t('ranking.events')} value={String(viewer.eventCount)} />
            <ProfileMetric icon="record" label={t('ranking.record')} value={t('ranking.winsLosses', { wins: viewer.winCount, losses: viewer.loseCount })} />
            <ProfileMetric icon="payout" label={t('ranking.totalPayout')} value={`${viewer.totalPayout.toFixed(2)} USDT`} />
            <ProfileMetric icon="coins" label={t('ranking.totalWagered')} value={`${viewer.totalWagered.toFixed(2)} USDT`} />
          </div>

          {referral && <ReferralPanel referral={referral} />}
        </div>
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

function ProfileMetric({ icon, label, value }: { icon: ProfileIconName; label: string; value: string }) {
  return (
    <div className="ui-profile-row grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3">
      <div className="ui-profile-icon">
        <ProfileIcon name={icon} />
      </div>
      <p className="ui-text-muted m-0 truncate text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
      <p className="ui-text-strong m-0 max-w-[44vw] truncate text-right text-sm font-black md:max-w-xs md:text-base">{value}</p>
    </div>
  )
}

type ProfileIconName = 'activity' | 'chart' | 'coins' | 'payout' | 'record' | 'target' | 'ticket' | 'trophy' | 'wallet'

function ProfileIcon({ name }: { name: ProfileIconName }) {
  const paths: Record<ProfileIconName, string[]> = {
    activity: ['M4 13h3l2-6 4 10 2-4h5'],
    chart: ['M4 18V6', 'M4 18h16', 'M7 14l3-3 3 2 5-6'],
    coins: ['M7 8c0-1.7 2.7-3 6-3s6 1.3 6 3-2.7 3-6 3-6-1.3-6-3Z', 'M7 8v8c0 1.7 2.7 3 6 3s6-1.3 6-3V8', 'M7 12c0 1.7 2.7 3 6 3s6-1.3 6-3'],
    payout: ['M5 17h14', 'M7 14l4-4 3 3 5-6', 'M17 7h2v2'],
    record: ['M7 7h10v10H7z', 'M10 11l2 2 4-5'],
    target: ['M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 12h.01'],
    ticket: ['M5 7h14v4a2 2 0 0 0 0 4v2H5v-2a2 2 0 0 0 0-4V7Z', 'M9 9v6'],
    trophy: ['M8 5h8v4a4 4 0 0 1-8 0V5Z', 'M8 7H5a3 3 0 0 0 3 3', 'M16 7h3a3 3 0 0 1-3 3', 'M12 13v4', 'M9 19h6'],
    wallet: ['M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M16 12h5v4h-5a2 2 0 0 1 0-4Z'],
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      {paths[name].map((path) => (
        <path key={path} d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ))}
    </svg>
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
