let lockCount = 0
let prevHtmlOverflow = ''
let prevBodyOverflow = ''

export function lockDocumentScroll() {
  if (lockCount === 0) {
    prevHtmlOverflow = document.documentElement.style.overflow
    prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

export function unlockDocumentScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.documentElement.style.overflow = prevHtmlOverflow
    document.body.style.overflow = prevBodyOverflow
  }
}
