import { useState } from "react";
import MapaLeaflet from "../components/MapaLeaflet";
import AppNavbar from "../components/AppNavBar";

const Maps = () => {
  const [ubicacion, setUbicacion] = useState(null);

  const handleUbicacionSeleccionada = (coords) => {
    setUbicacion(coords);
  };

  return (
    <>
    <AppNavbar />
    <div style={{ padding: "20px" }}>
      <h2>MAPA DE UBICACIÓN</h2>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <MapaLeaflet onUbicacionSeleccionada={handleUbicacionSeleccionada} />
      </div>

      {ubicacion && (
        <div>
          <h4>Ubicación seleccionada:</h4>
          <p><strong>Latitud:</strong> {ubicacion.latitud}</p>
          <p><strong>Longitud:</strong> {ubicacion.longitud}</p>
        </div>
      )}
    </div>
    </>
  );
};

export default Maps;
