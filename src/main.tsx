import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// webfonts, served with the site (latin only; a face downloads only once the page uses it)
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/abhaya-libre/latin-400.css'
import '@fontsource/abhaya-libre/latin-700.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'
import '@fontsource/jost/latin-600.css'
import '@fontsource/luxurious-script/latin-400.css'
// Kannada (only downloaded once a Kannada glyph is actually on screen)
import '@fontsource/noto-serif-kannada/kannada-400.css'
import '@fontsource/noto-serif-kannada/kannada-500.css'
import '@fontsource/noto-serif-kannada/kannada-600.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/layout.css'
import './styles/sections.css'
import './styles/arch.css'
import './styles/scene.css'
import './styles/gate.css'
import './styles/lang.css'
import { LangProvider } from './i18n/LangProvider'
import App from './App'
import { track } from './lib/track'

// private guest log (off until invite.trackUrl is set; see src/lib/track.ts)
track('opened')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
