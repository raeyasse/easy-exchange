import { HashRouter, Route, Routes } from 'react-router-dom'
import { loadState } from './data'
import { HomePage } from './pages/HomePage'

loadState()

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}
