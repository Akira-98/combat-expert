export function GuidePage({ onBack }: { onBack: () => void }) {
  return (
    <section className="ui-surface grid gap-4 rounded-none border-x-0 p-3 md:gap-5 md:rounded-xl md:border md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.18em]">Guide</p>
          <h2 className="ui-text-strong mt-1 text-xl font-semibold">이용 가이드</h2>
        </div>
        <button className="ui-btn-secondary inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onBack} type="button">
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path d="m15 6-6 6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
          뒤로
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="ui-surface-soft rounded-xl border p-4">
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.14em]">Step 1</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">국내 거래소 USDT(테더) 구매 후 해외 거래소 송금</h3>
          <p className="ui-text-muted mt-2 text-sm">국내 거래소에서 테더 구매 후 해외거래소(바이낸스, okx, 코인베이스)로 송금합니다. 이 때 네트워크는 Tron이 가장 저렴합니다.</p>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.14em]">Step 2</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">해외 거래소에서 세기의 격잘알로 송금</h3>
          <p className="ui-text-muted mt-2 text-sm">해외 거래소에서 세기의 격잘알로 USDT를 송금합니다. 구글로 로그인 후 프로필을 누르면 0x...으로 시작하는 주소가 뜹니다. 해당 주소를 복사한 후 거래소 송금 창에 붙혀넣습니다. 이 때 네트워크는 반드시 Polygon으로 합니다.</p>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.14em]">Step 3</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">베팅 제출과 정산 확인</h3>
          <p className="ui-text-muted mt-2 text-sm">베팅에서 수량과 금액을 확인해 제출하고, 내 베팅에서 정산 상태를 추적합니다. 경기 결과가 나오지 않은 경우 '정산 대기' 문구가 뜹니다.</p>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="ui-surface-soft rounded-xl border p-4">
          <h3 className="ui-text-strong m-0 text-base font-semibold">체크 포인트</h3>
          <ul className="ui-text-muted mt-3 grid gap-2 pl-5 text-sm">
            <li>베팅은 USDT(테더)로 이루어집니다.</li>
            <li>해외거래소에서 지갑주소로 USDT가 들어올 때 네트워크는 반드시 Polygon이어야 합니다.</li>
            <li>메타마스크로 로그인 하는 경우 가스비가 대납되지 않아 Polygon 토큰이 필요합니다.</li>
          </ul>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <h3 className="ui-text-strong m-0 text-base font-semibold">문의 사항</h3>
          <div className="mt-3 grid gap-2">
            <a
              className="ui-btn-secondary flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-semibold no-underline transition hover:translate-y-[-1px]"
              href="https://t.me/LegendaryChoi"
              rel="noreferrer"
              target="_blank"
            >
              <span>텔레그램 문의</span>
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </a>
            <a
              className="ui-btn-secondary flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-semibold no-underline transition hover:translate-y-[-1px]"
              href="https://discord.gg/kb7x9SH7M"
              rel="noreferrer"
              target="_blank"
            >
              <span>디스코드 입장</span>
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
