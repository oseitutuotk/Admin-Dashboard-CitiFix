// src/App.jsx — replace entirely
import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import AdminLayout from './components/layout/AdminLayout'
import DashboardOverview from './pages/DashboardOverview'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Departments from './pages/Departments'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/departments" element={<Departments />} />
        </Route>
      </Route>
    </Routes>
  )
}