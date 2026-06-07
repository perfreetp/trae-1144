import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Schedule from '@/pages/Schedule'
import Orders from '@/pages/Orders'
import Members from '@/pages/Members'
import Courses from '@/pages/Courses'
import Inspection from '@/pages/Inspection'
import Finance from '@/pages/Finance'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/members" element={<Members />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/finance" element={<Finance />} />
        </Route>
      </Routes>
    </Router>
  )
}
