import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapPreview({ lat, lng }) {
  const position = [lat, lng]

  return (
    <div className="relative isolate w-full h-56 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)]">
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <CircleMarker center={position} radius={9} pathOptions={{ color: '#b3261e', fillColor: '#b3261e', fillOpacity: 1, weight: 2 }} />
      </MapContainer>
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0"
        style={{ zIndex: 1000 }}
        aria-label="Open location in Google Maps"
      ></a>
    </div>
  )
}