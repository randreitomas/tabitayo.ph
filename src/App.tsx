import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { GuestLayout } from '@/layouts/GuestLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { EventPage } from '@/pages/guest/EventPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { HostDashboard } from '@/pages/host/Dashboard'
import { HostPendingApproval } from '@/pages/host/PendingApproval'
import { CreateEvent } from '@/pages/host/CreateEvent'
import { EventDetail } from '@/pages/host/EventDetail'
import { QRPage } from '@/pages/host/QRPage'
import { HostList } from '@/pages/admin/HostList'
import { AdminEventList } from '@/pages/admin/EventList'
import { ActivityLogPage } from '@/pages/admin/ActivityLog'
import { LandingPage } from '@/pages/landing/LandingPage'
import { BusinessPage } from '@/pages/landing/BusinessPage'

function HostRoutes() {
  return (
    <DashboardLayout
      basePath="/host"
      title="Host dashboard"
      navItems={[
        { to: '/host/events', label: 'Events', end: true },
      ]}
    />
  )
}

function AdminRoutes() {
  return (
    <DashboardLayout
      basePath="/admin"
      title="Admin console"
      navItems={[
        { to: '/admin/hosts', label: 'Hosts', end: true },
        { to: '/admin/events', label: 'Events' },
        { to: '/admin/activity', label: 'Activity log' },
      ]}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/business" element={<BusinessPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<GuestLayout />}>
            <Route path="/e/:eventId" element={<EventPage />} />
          </Route>

          <Route
            path="/host/pending"
            element={
              <ProtectedRoute role="host">
                <HostPendingApproval />
              </ProtectedRoute>
            }
          />

          <Route
            path="/host"
            element={
              <ProtectedRoute role="host">
                <HostRoutes />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/host/events" replace />} />
            <Route path="events" element={<HostDashboard />} />
            <Route path="events/new" element={<CreateEvent />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="events/:id/guests" element={<EventDetail />} />
            <Route path="events/:id/qr" element={<QRPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminRoutes />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/hosts" replace />} />
            <Route path="hosts" element={<HostList />} />
            <Route path="events" element={<AdminEventList />} />
            <Route path="activity" element={<ActivityLogPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
