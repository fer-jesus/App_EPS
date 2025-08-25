import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from './pages/Login';
import Menu from './pages/Menu';
import Registros from './pages/Register';
import Nomenclaturas from './pages/Nomenclaturas';
import Usuarios from './pages/Usuarios';
import Tarifas from './pages/Tarifas';
import ReportLicencias from './pages/ReportLicencias';
import ReportNomenclaturas from './pages/ReportNomenclaturas';
import LicenciaHistorial from './pages/LicenciaHistorial';
import TasaHistorial from './pages/TasaHistorial';
import NomenclaturaHistorial from './pages/NomenclaturaHistorial';
import CambiarContrasena from './pages/CambiarContrasena';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={ <ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/registros" element={<ProtectedRoute><Registros /></ProtectedRoute>} />
        <Route path="/nomenclaturas" element={<ProtectedRoute><Nomenclaturas /></ProtectedRoute>} />
        <Route path="/report-licencias" element={<ProtectedRoute><ReportLicencias /></ProtectedRoute>} />
        <Route path="/report-nomenclaturas" element={<ProtectedRoute><ReportNomenclaturas /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        <Route path="/tarifas" element={<ProtectedRoute><Tarifas /></ProtectedRoute>} />
        <Route path="/historial-tasas" element={<ProtectedRoute><TasaHistorial /></ProtectedRoute>} />
        <Route path="/historial-licencias" element={<ProtectedRoute><LicenciaHistorial /></ProtectedRoute>} />
         <Route path="/historial-nomenclaturas" element={<ProtectedRoute><NomenclaturaHistorial /></ProtectedRoute>} />
         <Route path="/actualizar-contrasena" element={<ProtectedRoute><CambiarContrasena /></ProtectedRoute>} />
        
      </Routes>
    </Router>
  )
}

export default App
