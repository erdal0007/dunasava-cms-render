import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
const Login = lazy(() => import('./pages/Login'))

const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminSections = lazy(() => import('./admin/AdminSections'))
const AdminProducts = lazy(() => import('./admin/AdminProducts'))
const AdminSectors = lazy(() => import('./admin/AdminSectors'))
const AdminTranslations = lazy(() => import('./admin/AdminTranslations'))
const AdminStatistics = lazy(() => import('./admin/AdminStatistics'))
const AdminSettings = lazy(() => import('./admin/AdminSettings'))
const AdminMedia = lazy(() => import('./admin/AdminMedia'))

const DUNASAVA_HOSTS = new Set(['dunasava.com', 'www.dunasava.com'])
const REMOTE_CMS_ORIGIN = 'https://dunasava-cms.onrender.com'

export default function App() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    const path = window.location.pathname
    const isCmsPath = path.startsWith('/login') || path.startsWith('/admin')
    if (DUNASAVA_HOSTS.has(host) && isCmsPath) {
      window.location.replace(`${REMOTE_CMS_ORIGIN}${path}${window.location.search}${window.location.hash}`)
      return null
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1414]" />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sections" element={<AdminSections />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="sectors" element={<AdminSectors />} />
          <Route path="translations" element={<AdminTranslations />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="media" element={<AdminMedia />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
