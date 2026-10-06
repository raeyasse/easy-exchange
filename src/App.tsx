import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './AppDataProvider'
import { Header } from './components/Header'
import { EditRecordPage } from './pages/EditRecordPage'
import { HomePage } from './pages/HomePage'
import { NewRecordPage } from './pages/NewRecordPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { RecordDetailPage } from './pages/RecordDetailPage'

export default function App() {
  return (
    <AppDataProvider>
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/records/new" element={<NewRecordPage />} />
          <Route path="/records/:id" element={<RecordDetailPage />} />
          <Route path="/records/:id/edit" element={<EditRecordPage />} />
          <Route path="/users/:id" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </AppDataProvider>
  )
}
