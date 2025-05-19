import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login';
import Menu from './pages/Menu';
import Registros from './pages/Register';
import Usuarios from './pages/Usuarios';
import Tarifas from './pages/Tarifas';
//import TasaForm from './pages/TasaForm';
import Reportes from './pages/Reportes';
import LicenciaHistorial from './pages/LicenciaHistorial';
import TasaHistorial from './pages/TasaHistorial';
import NomenclaturaHistorial from './pages/NomenclaturaHistorial';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/registros" element={<Registros />} />
         <Route path="/reportes" element={<Reportes />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/tarifas" element={<Tarifas />} />
        <Route path="/historial-tasas" element={<TasaHistorial />} />
        <Route path="/historial-licencias" element={<LicenciaHistorial />} />
         <Route path="/historial-nomenclaturas" element={<NomenclaturaHistorial />} />
        {/* <Route path="/tasaForm" element={<TasaForm />} /> */}
        
      </Routes>
    </Router>
  )
}

export default App
