import { useBodyScrollLock } from './useBodyScrollLock'

type UseAppLayoutParams = {
  isBodyScrollLocked: boolean
}

export function useAppLayout({ isBodyScrollLocked }: UseAppLayoutParams) {
  useBodyScrollLock(isBodyScrollLocked)
}
