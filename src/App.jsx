// src/App.jsx — replace entirely
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import DashboardOverview from './pages/DashboardOverview'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import WeeklyReports from './pages/WeeklyReports'
import Departments from './pages/Departments'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AdminLayout crumb="Admin Portal" />}>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/weekly-reports" element={<WeeklyReports />} />
        <Route path="/departments" element={<Departments />} />
      </Route>
    </Routes>
  )
}