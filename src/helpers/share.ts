export type ShareOrCopyResult = 'shared' | 'copied' | 'aborted'

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const didCopy = document.execCommand('copy')
    if (!didCopy) throw new Error('Copy command was rejected.')
  } finally {
    document.body.removeChild(textarea)
  }
}

export function isShareAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function shareOrCopyUrl(shareData: ShareData): Promise<ShareOrCopyResult> {
  const urlOnlyShareData: ShareData = { url: shareData.url }
  const nativeShareData = !navigator.share
    ? undefined
    : !navigator.canShare || navigator.canShare(shareData)
      ? shareData
      : shareData.url && navigator.canShare(urlOnlyShareData)
        ? urlOnlyShareData
        : undefined

  if (nativeShareData) {
    try {
      await navigator.share(nativeShareData)
      return 'shared'
    } catch (error) {
      if (isShareAbortError(error)) return 'aborted'
    }
  }

  if (!shareData.url) throw new Error('Share URL is required.')
  await copyTextToClipboard(shareData.url)
  return 'copied'
}
