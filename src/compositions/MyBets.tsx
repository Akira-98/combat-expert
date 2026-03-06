import type { Bet } from '@azuro-org/sdk'

type MyBetsProps = {
  address?: `0x${string}`
  bets: Bet[]
  redeemPending: boolean
  redeemingBetTokenId?: string
  onRedeemBet: (bet: Bet) => void
}

export function MyBets({ address, bets, redeemPending, redeemingBetTokenId, onRedeemBet }: MyBetsProps) {
  return (
    <section className="ui-surface rounded-none border-x-0 p-2.5 md:rounded-xl md:border md:p-4">
      <h2 className="ui-text-strong m-0 text-lg font-semibold">내 베팅</h2>
      {!address && <p className="ui-text-muted mt-2 text-sm">지갑 연결 후 조회됩니다.</p>}
      {address && bets.length === 0 && <p className="ui-text-muted mt-2 text-sm">베팅 내역이 없습니다.</p>}
      {address && bets.length > 0 && (
        <ul className="m-0 mt-2.5 grid list-none gap-1.5 p-0 md:mt-3 md:gap-2">
          {bets.slice(0, 5).map((bet) => {
            const canRedeem = bet.isRedeemable && !bet.isRedeemed
            const isRedeeming = redeemPending && redeemingBetTokenId === bet.tokenId
            const actionLabel = isRedeeming ? '수령 중...' : canRedeem ? '수령하기' : bet.isRedeemed ? '수령완료' : '정산대기'

            return (
              <li
                key={`${bet.tokenId}-${bet.createdAt}`}
                className="ui-surface-soft ui-text-body rounded-md border p-2 text-sm md:rounded-lg md:p-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="ui-text-strong m-0 truncate text-sm font-semibold">#{bet.tokenId}</p>
                    <p className="ui-text-muted m-0.5 truncate text-xs">
                      금액 {bet.amount} | 상태 {bet.status}
                    </p>
                  </div>
                  <button
                    className="ui-btn-primary rounded-md border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canRedeem || redeemPending}
                    onClick={() => onRedeemBet(bet)}
                    type="button"
                  >
                    {actionLabel}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
