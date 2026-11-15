import { asset } from './asset'

/**
 * Keeps the phone's screen from going dark. While auto-scroll runs nobody touches the phone, so the display
 * would time out; the browser then suspends (or reloads) the page and the invite starts again from the top.
 *
 * Primary: the Screen Wake Lock API (Chrome / Android, Safari 16.4+). The browser drops the lock whenever the tab
 * is hidden, so it is asked for again when the page becomes visible while still wanted.
 * Fallback (no API, or the request is refused, e.g. older iPhones and some in-app browsers): a tiny muted, looping,
 * inline video kept playing off screen, which phones treat as "media playing" and keep the screen on for.
 * Nothing here may ever break the invitation, so every call is guarded.
 */
type Sentinel = { release(): Promise<void>; addEventListener(type: 'release', cb: () => void): void }
type WakeLockApi = { request(type: 'screen'): Promise<Sentinel> }

export function createWakeLock() {
  const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock
  let wanted = false
  let sentinel: Sentinel | null = null
  let video: HTMLVideoElement | null = null

  const startVideo = () => {
    try {
      if (!video) {
        video = document.createElement('video')
        video.src = asset('assets/keepawake.mp4')
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.setAttribute('playsinline', '')
        video.setAttribute('muted', '')
        video.setAttribute('aria-hidden', 'true')
        Object.assign(video.style, { position: 'fixed', left: '-100px', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' })
        document.body.appendChild(video)
      }
      void video.play().catch(() => {})
    } catch {
      /* ignore */
    }
  }
  const stopVideo = () => {
    try {
      video?.pause()
    } catch {
      /* ignore */
    }
  }

  const acquire = async () => {
    if (!wanted || sentinel || document.hidden) return
    if (api) {
      try {
        const s = await api.request('screen')
        if (!wanted) {
          void s.release().catch(() => {})
          return
        }
        sentinel = s
        s.addEventListener('release', () => {
          if (sentinel === s) sentinel = null
        })
        stopVideo()
        return
      } catch {
        /* refused (not allowed here, battery saver…): fall back to the video */
      }
    }
    startVideo()
  }

  const onVisible = () => {
    if (!document.hidden && wanted) void acquire()
  }
  document.addEventListener('visibilitychange', onVisible)

  return {
    on() {
      if (wanted) return
      wanted = true
      void acquire()
    },
    off() {
      if (!wanted) return
      wanted = false
      const s = sentinel
      sentinel = null
      if (s) void s.release().catch(() => {})
      stopVideo()
    },
    destroy() {
      this.off()
      document.removeEventListener('visibilitychange', onVisible)
      video?.remove()
      video = null
    },
  }
}
