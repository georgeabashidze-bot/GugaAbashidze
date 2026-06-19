import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix the default-marker asset paths so they don't break with Webpack/CRA.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TBILISI_CENTER = { lat: 41.7151, lng: 44.8271 };

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

/**
 * AddressMapPicker
 * ----------------
 * Bilingual, free OpenStreetMap-based address picker.
 * - Click anywhere on the map to drop / move the pin.
 * - Drag the pin for finer adjustment.
 * - "Use my location" calls the browser geolocation API.
 * - Reverse-geocoded street suggestion is exposed via `onResolved`
 *   (uses OSM Nominatim — free, no API key, polite rate-limited).
 */
export default function AddressMapPicker({
  value,
  onChange,
  onResolved,
  lang = "en",
  testId = "address-map-picker",
}) {
  const initial = useMemo(() => {
    if (value && typeof value.lat === "number" && typeof value.lng === "number") return value;
    return TBILISI_CENTER;
  }, [value]);

  const [pos, setPos] = useState(initial);
  const [busy, setBusy] = useState(false);

  // Push parent updates immediately so the form sees the new coords
  useEffect(() => {
    if (pos) onChange?.(pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.lat, pos.lng]);

  const reverseGeocode = async (coords) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=${lang === "ka" ? "ka" : "en"}&zoom=18`,
        { headers: { Accept: "application/json" } }
      );
      if (!r.ok) return;
      const data = await r.json();
      const addr = data.address || {};
      const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
      onResolved?.({
        street,
        district: addr.suburb || addr.city_district || addr.district || "",
        city: addr.city || addr.town || addr.village || "Tbilisi",
        postal_code: addr.postcode || "",
        full: data.display_name || "",
      });
    } catch (e) {
      // Silent failure — we still have valid coordinates
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const next = { lat: geo.coords.latitude, lng: geo.coords.longitude };
        setPos(next);
        reverseGeocode(next);
        setBusy(false);
      },
      () => setBusy(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const setPin = (next) => {
    setPos(next);
    reverseGeocode(next);
  };

  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground tabular-nums">
          {lang === "ka" ? "კოორდინატები:" : "Coordinates:"} <span className="font-mono">
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
          </span>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={busy}
          data-testid="address-map-locate-btn"
          className="text-xs font-bold text-[#0A4D8C] hover:text-[#F25C05] disabled:opacity-50"
        >
          {busy
            ? lang === "ka" ? "მდებარეობის ძიება..." : "Finding location..."
            : lang === "ka" ? "ჩემი მდებარეობის გამოყენება" : "Use my location"}
        </button>
      </div>
      <div
        className="rounded-xl overflow-hidden border border-border"
        style={{ height: 280 }}
      >
        <MapContainer
          center={[initial.lat, initial.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={setPin} />
          <Recenter position={pos} />
          <Marker
            position={[pos.lat, pos.lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setPin({ lat, lng });
              },
            }}
          />
        </MapContainer>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {lang === "ka"
          ? "დააწექი რუკაზე ან გადაიტანე ჭდე — ქუჩა ავტომატურად შეივსება."
          : "Click anywhere on the map or drag the pin — the street will autofill."}
      </p>
    </div>
  );
}
