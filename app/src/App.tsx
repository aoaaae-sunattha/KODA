import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PageWrapper><Login /></PageWrapper>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <PageWrapper><Dashboard /></PageWrapper>
          </RequireAuth>
        } />
        <Route path="/store" element={
          <RequireAuth>
            <PageWrapper><Store /></PageWrapper>
          </RequireAuth>
        } />
        <Route path="/settings/cards" element={
          <RequireAuth>
            <PageWrapper><Cards /></PageWrapper>
          </RequireAuth>
        } />
        <Route path="/merchant" element={
          <RequireMerchant>
            <PageWrapper><Merchant /></PageWrapper>
          </RequireMerchant>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
