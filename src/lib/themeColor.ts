/**
 * The phone browser's top bar colour (`<meta name="theme-color">`), matched to whatever is at the top of the
 * screen. Chrome / Android honour changes live; browsers without the feature ignore it.
 */
let current = ''

export function setThemeColor(color: string) {
  if (color === current) return
  current = color
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
}

/** Top-of-screen colour per section id (sampled from the art). */
export const SECTION_COLORS: Record<string, string> = {
  invitation: '#0559b3', // hero sky
  invite: '#f3ece0', // arch card cream
  scene: '#86c4f1', // temple scene sky
}
