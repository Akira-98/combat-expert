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
          <h3 className="ui-text-strong mt-2 text-base font-semibold">로그인 후 지갑 연결</h3>
          <p className="ui-text-muted mt-2 text-sm">우측 상단에서 로그인하고 지갑을 연결하면 베팅과 송금 기능이 활성화됩니다.</p>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.14em]">Step 2</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">경기와 마켓 확인</h3>
          <p className="ui-text-muted mt-2 text-sm">경기 목록에서 원하는 매치를 선택하고, 배당과 마켓 구성을 확인한 뒤 결과를 고릅니다.</p>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.14em]">Step 3</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">베팅 제출과 정산 확인</h3>
          <p className="ui-text-muted mt-2 text-sm">베팅슬립에서 수량과 금액을 확인해 제출하고, 내 베팅에서 정산 상태를 추적합니다.</p>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="ui-surface-soft rounded-xl border p-4">
          <h3 className="ui-text-strong m-0 text-base font-semibold">체크 포인트</h3>
          <ul className="ui-text-muted mt-3 grid gap-2 pl-5 text-sm">
            <li>모바일에서는 하단 내비게이션으로 탐색, 채팅, 내 베팅 이동이 가능합니다.</li>
            <li>지갑 메뉴에서는 주소 복사, 네트워크 확인, 로그아웃을 처리할 수 있습니다.</li>
            <li>정산이 늦을 때는 내 베팅에 결과 반영 대기 상태가 표시될 수 있습니다.</li>
          </ul>
        </article>
        <article className="ui-surface-soft rounded-xl border p-4">
          <h3 className="ui-text-strong m-0 text-base font-semibold">권장 순서</h3>
          <ol className="ui-text-muted mt-3 grid gap-2 pl-5 text-sm">
            <li>로그인</li>
            <li>지갑 연결</li>
            <li>경기 선택</li>
            <li>베팅 제출</li>
            <li>내 베팅에서 정산 확인</li>
          </ol>
        </article>
      </div>
    </section>
  )
}
