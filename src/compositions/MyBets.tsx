import type { Bet } from '@azuro-org/sdk'

type MyBetsProps = {
  address?: `0x${string}`
  bets: Bet[]
}

export function MyBets({ address, bets }: MyBetsProps) {
  return (
    <section className="ui-surface rounded-none border-x-0 p-2.5 md:rounded-xl md:border md:p-4">
      <h2 className="ui-text-strong m-0 text-lg font-semibold">내 베팅</h2>
      {!address && <p className="ui-text-muted mt-2 text-sm">지갑 연결 후 조회됩니다.</p>}
      {address && (
        <ul className="m-0 mt-2.5 grid list-none gap-1.5 p-0 md:mt-3 md:gap-2">
          {bets.slice(0, 5).map((bet) => (
            <li
              key={`${bet.tokenId}-${bet.createdAt}`}
              className="ui-surface-soft ui-text-body grid grid-cols-[1fr_auto_auto] gap-2.5 rounded-md border p-2 text-sm md:gap-3 md:rounded-lg md:p-2.5"
            >
              <span>#{bet.tokenId}</span>
              <span>{bet.amount}</span>
              <span>{bet.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
