import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DemoPage from './pages/DemoPage'
import ChatPage from './pages/ChatPage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
