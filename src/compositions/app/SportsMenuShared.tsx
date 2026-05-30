export function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
