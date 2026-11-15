/** Thin gold divider with a small scroll in the middle. Its path can be drawn in with Anime.js. */
export const Flourish = ({ className = '' }: { className?: string }) => (
  <svg className={`flourish ${className}`.trim()} viewBox="0 0 240 24" aria-hidden="true">
    <path
      pathLength={1}
      d="M2 12 H86 C96 12 98 4 106 4 C114 4 114 12 120 12 C126 12 126 4 134 4 C142 4 144 12 154 12 H238 M112 16 L120 22 L128 16"
    />
  </svg>
)
