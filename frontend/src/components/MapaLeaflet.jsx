import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapaLeaflet = ({ initialPosition = [14.63472, -89.98889], onUbicacionSeleccionada }) => {
  const [markerPosition, setMarkerPosition] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        if (onUbicacionSeleccionada) {
          onUbicacionSeleccionada({ latitud: lat, longitud: lng });
        }
      },
    });
    return null;
  };

  return (
    <MapContainer center={initialPosition} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>Ubicación seleccionada</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

MapaLeaflet.propTypes = {
  initialPosition: PropTypes.array,
  onUbicacionSeleccionada: PropTypes.func,
};

export default MapaLeaflet;
