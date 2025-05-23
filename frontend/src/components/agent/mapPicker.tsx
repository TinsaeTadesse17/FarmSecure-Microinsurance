'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapPickerProps {
  onChange: (lat: number, lng: number) => void;
  defaultPosition?: [number, number];
}

function LocationMarker({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function MapPicker({ onChange, defaultPosition }: MapPickerProps) {
  const [center, setCenter] = useState<[number, number]>(defaultPosition || [9.03, 38.74]); // Addis Ababa

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onChange={onChange} />
      </MapContainer>
    </div>
  );
}
