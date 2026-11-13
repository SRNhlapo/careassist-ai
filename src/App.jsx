import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientRegistration from './pages/PatientRegistration'
import Screening from './pages/Screening'
import Handover from './pages/Handover'
import DoctorDashboard from './pages/DoctorDashboard'
import AuditLogs from './pages/AuditLogs'

const P = ({ roles, children }) => (
  <ProtectedRoute roles={roles}><Layout>{children}</Layout></ProtectedRoute>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<P><Dashboard /></P>} />
          <Route path='/register' element={<P roles={['nurse', 'receptionist']}><PatientRegistration /></P>} />
          <Route path='/screening/:encounterId' element={<P roles={['nurse']}><Screening /></P>} />
          <Route path='/handover/:encounterId' element={<P roles={['nurse', 'doctor']}><Handover /></P>} />
          <Route path='/doctor' element={<P roles={['doctor']}><DoctorDashboard /></P>} />
          <Route path='/audit' element={<P roles={['admin', 'supervisor']}><AuditLogs /></P>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}