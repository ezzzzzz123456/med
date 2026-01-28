import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for the missing marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle clicks
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      console.log("📍 Map Clicked at:", e.latlng); // Debug Log
      setPosition(e.latlng);
      // This sends the data UP to the dashboard
      onSelect(e.latlng); 
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const MapSelector = ({ onLocationSelect }) => {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%", borderRadius: "10px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onSelect={onLocationSelect} />
    </MapContainer>
  );
};

export default MapSelector;