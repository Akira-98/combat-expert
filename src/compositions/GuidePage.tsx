const steps = [
  {
    step: 'Step 1',
    title: 'USDT 구매 후 해외 거래소로 이동',
    summary: '국내 거래소에서 USDT를 준비합니다.',
    points: ['해외 거래소 예시: 바이낸스, OKX, 코인베이스', '출금 네트워크: Tron 권장'],
  },
  {
    step: 'Step 2',
    title: '세기의 격잘알 지갑으로 입금',
    summary: '해외 거래소에서 프로필의 0x 주소로 USDT를 보냅니다.',
    points: ['구글 로그인 후 프로필에서 주소 복사', '입금 네트워크: Polygon 필수'],
  },
  {
    step: 'Step 3',
    title: '베팅 제출 후 정산 확인',
    summary: '금액 확인 후 제출하고 결과를 기다립니다.',
    points: ['내 베팅에서 상태 확인', "결과 전에는 '정산 대기' 표시"],
  },
] as const

export function GuidePage() {
  return (
    <section className="panel section-shell desktop-surface-variant grid gap-3 p-3 md:gap-4 md:p-5">
      <div>
        <div>
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.18em]">Guide</p>
          <h2 className="ui-text-strong mt-1 text-xl font-semibold">이용 가이드</h2>
        </div>
      </div>

      <div className="grid gap-2.5 md:grid-cols-3">
        {steps.map((item) => (
          <article key={item.title} className="card-surface-soft card-shell-lg p-4">
            <p className="ui-text-muted m-0 text-[11px] font-semibold uppercase tracking-[0.14em]">{item.step}</p>
            <h3 className="ui-text-strong mt-1 text-base font-semibold">{item.title}</h3>
            <p className="ui-text-muted mt-3 text-sm">{item.summary}</p>
            <ul className="ui-text-muted mt-2.5 grid gap-1.5 pl-5 text-sm">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="card-surface-soft card-shell-lg border-amber-400/30 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Important</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">체크 포인트</h3>
          <ul className="ui-text-muted mt-3 grid gap-2 pl-5 text-sm">
            <li>베팅 통화는 USDT입니다.</li>
            <li>세기의 격잘알 입금은 Polygon만 사용합니다.</li>
            <li>메타마스크 로그인 시 POL 가스비가 필요할 수 있습니다.</li>
          </ul>
        </article>
        <article className="card-surface-soft card-shell-lg p-4">
          <p className="ui-text-strong m-0 text-sm font-semibold">궁금한 점, 제안, 잡담 모두 환영합니다!</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <a
                aria-label="텔레그램 1:1 문의"
                className="ui-btn-secondary inline-flex h-12 w-12 items-center justify-center rounded-full border no-underline transition hover:translate-y-[-1px]"
                href="https://t.me/LegendaryChoi"
                rel="noreferrer"
                target="_blank"
                title="텔레그램 1:1 문의"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 5 3.8 11.6c-.8.3-.8 1.4 0 1.7l4.4 1.4 1.4 4.4c.3.8 1.4.8 1.7 0L18 1.9c.3-.8-.5-1.6-1.3-1.3Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path d="m8 14 10-10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </a>
              <span className="ui-text-muted text-xs">1:1 문의</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <a
                aria-label="디스코드 커뮤니티"
                className="ui-btn-secondary inline-flex h-12 w-12 items-center justify-center rounded-full border no-underline transition hover:translate-y-[-1px]"
                href="https://discord.gg/kb7x9SH7M"
                rel="noreferrer"
                target="_blank"
                title="디스코드 커뮤니티"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M8.7 7.6A14.6 14.6 0 0 1 12 7c1.1 0 2.2.2 3.3.6l.7 1.5c1.8.2 3.1 1.1 3.6 2.8.4 1.4.3 3-.4 4.8a9.7 9.7 0 0 1-3.3 1.7l-.8-1.3c.5-.2 1-.4 1.4-.7-.1.1-.2.1-.3.2A10.3 10.3 0 0 1 12 18c-1.5 0-2.9-.3-4.2-.9l-.3-.2c.4.3.9.5 1.4.7l-.8 1.3a9.7 9.7 0 0 1-3.3-1.7c-.7-1.8-.8-3.4-.4-4.8.5-1.7 1.8-2.6 3.6-2.8l.7-1.5Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path d="M9.4 12.3h.1m5 0h.1" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
                </svg>
              </a>
              <span className="ui-text-muted text-xs">커뮤니티</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
