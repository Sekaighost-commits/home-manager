import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import CoursesPage from './pages/CoursesPage'
import FrigoPage from './pages/FrigoPage'
import RepasPage from './pages/RepasPage'
import MenagePage from './pages/MenagePage'
import BricolagePage from './pages/BricolagePage'
import NotesPage from './pages/NotesPage'
import ComingSoonPage from './pages/ComingSoonPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontSize: '2rem', background: '#000'
    }}>
      🧄
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
          <Route path="/login"     element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/"          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profil"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/courses"   element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/frigo"     element={<ProtectedRoute><FrigoPage /></ProtectedRoute>} />
          <Route path="/repas"     element={<ProtectedRoute><RepasPage /></ProtectedRoute>} />
          <Route path="/menage"    element={<ProtectedRoute><MenagePage /></ProtectedRoute>} />
          <Route path="/bricolage" element={<ProtectedRoute><BricolagePage /></ProtectedRoute>} />
          <Route path="/depenses"  element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
          <Route path="/agenda"    element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
          <Route path="/notes"     element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
