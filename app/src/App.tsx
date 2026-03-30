import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Store from './pages/Store'
import Cards from './pages/Cards'
import Merchant from './pages/Merchant'
import Nav from './components/layout/Nav'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireMerchant({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'merchant') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth><Dashboard /></RequireAuth>
        } />
        <Route path="/store" element={
          <RequireAuth><Store /></RequireAuth>
        } />
        <Route path="/settings/cards" element={
          <RequireAuth><Cards /></RequireAuth>
        } />
        <Route path="/merchant" element={
          <RequireMerchant><Merchant /></RequireMerchant>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
