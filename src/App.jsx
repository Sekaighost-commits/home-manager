// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontSize: '2rem'
    }}>
      🏠
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/courses"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/repas"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/frigo"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/menage"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/bricolage" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/depenses"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/agenda"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/notes"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
