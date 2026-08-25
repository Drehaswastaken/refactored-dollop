import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Background } from './components/Background'
import { DriftingPetals } from './components/Petals'
import { ThemeToggle } from './components/ThemeToggle'
import { Landing } from './pages/Landing'
import { Builder } from './pages/Builder'
import { Share } from './pages/Share'
import { OpenLink } from './pages/OpenLink'
import { Recipient } from './pages/Recipient'

export default function App() {
  return (
    <HashRouter>
      <Background />
      <DriftingPetals count={9} />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<Builder />} />
        <Route path="/created" element={<Share />} />
        <Route path="/open" element={<OpenLink />} />
        <Route path="/b/:data" element={<Recipient />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
