import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapaLeaflet = ({
  initialPosition = [14.63472, -89.98889],
  onUbicacionSeleccionada,
  direccion = "",
  nombrePropietario = "",
}) => {
  const [markerPosition, setMarkerPosition] = useState(
    initialPosition && Array.isArray(initialPosition) ? initialPosition : null
  );

  useEffect(() => {
    if (initialPosition && Array.isArray(initialPosition)) {
      setMarkerPosition(initialPosition);
    }
  }, [initialPosition]);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        const nuevaPos = [lat, lng];
        setMarkerPosition(nuevaPos);
        if (onUbicacionSeleccionada) {
          onUbicacionSeleccionada({ latitud: lat, longitud: lng });
        }
      },
    });
    return null;
  };

  const CenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, 13);
        setTimeout(() => {
          map.invalidateSize(); // Necesario cuando el mapa se muestra en un Dialog
        }, 200);
      }
    }, [position, map]);
    return null;
  };

  CenterMap.propTypes = {
    position: PropTypes.arrayOf(PropTypes.number),
  };

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <CenterMap position={initialPosition} />
      <MapClickHandler />
      {markerPosition && (
        <Marker position={markerPosition} icon={customIcon}>
          <Popup>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "4px",
                }}
              >
                Ubicación seleccionada
              </div>
              <div>Latitud: {markerPosition[0].toFixed(8)}</div>
              <div>Longitud: {markerPosition[1].toFixed(8)}</div>
              {direccion && <div>Dirección: {direccion}</div>}
              {nombrePropietario && <div>Propietario: {nombrePropietario}</div>}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

MapaLeaflet.propTypes = {
  initialPosition: PropTypes.array,
  onUbicacionSeleccionada: PropTypes.func,
  direccion: PropTypes.string,
  nombrePropietario: PropTypes.string,
};

export default MapaLeaflet;
