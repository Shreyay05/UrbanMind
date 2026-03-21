import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";

const API_BASE_URL = "http://localhost:5000";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VIEW_LANGUAGES = [
  { label: "English",  isoCode: "en", flag: "🇬🇧" },
  { label: "हिन्दी",   isoCode: "hi", flag: "🇮🇳" },
  { label: "தமிழ்",   isoCode: "ta", flag: "🇮🇳" },
  { label: "తెలుగు",  isoCode: "te", flag: "🇮🇳" },
  { label: "ಕನ್ನಡ",   isoCode: "kn", flag: "🇮🇳" },
  { label: "മലയാളം", isoCode: "ml", flag: "🇮🇳" },
  { label: "मराठी",   isoCode: "mr", flag: "🇮🇳" },
  { label: "বাংলা",   isoCode: "bn", flag: "🇮🇳" },
];

function useTranslatedText(text, targetLang) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || targetLang === "en") {
      setTranslated(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axios
      .post(`${API_BASE_URL}/api/translate`, {
        text,
        sourceLang: "en",
        targetLang,
      })
      .then((res) => {
        if (!cancelled) setTranslated(res.data.translatedText || text);
      })
      .catch(() => {
        if (!cancelled) setTranslated(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [text, targetLang]);

  return { translated, loading };
}

// Single complaint card with lazy per-card translation
function ComplaintCard({ item, viewLang }) {
  const { translated, loading } = useTranslatedText(item.text, viewLang);
  const displayText = viewLang === "en" ? item.text : (translated ?? item.text);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-white">
          Ref #{String(item._id || item.id).slice(-6)}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            item.status === "Resolved"
              ? "bg-green-500/10 text-green-300 border border-green-500/30"
              : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
          }`}
        >
          {item.status}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-200">{item.category}</p>
      <p className="mt-1 text-xs text-slate-400">{item.location}</p>

      <div className="relative mt-2">
        {loading && (
          <div className="absolute inset-0 flex items-center">
            <span className="text-xs text-slate-500 animate-pulse">Translating…</span>
          </div>
        )}
        <p className={`text-sm text-slate-300 line-clamp-2 ${loading ? "opacity-0" : ""}`}>
          {displayText}
        </p>
      </div>

      {/* Show original if we've translated */}
      {translated && viewLang !== "en" && (
        <p className="mt-1 text-xs text-slate-500 italic line-clamp-1" title={item.text}>
          (Original: {item.text.slice(0, 60)}{item.text.length > 60 ? "…" : ""})
        </p>
      )}

      <Link
        to={`/track?ref=${item._id || item.id}`}
        className="mt-3 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
      >
        Track this complaint
      </Link>
    </div>
  );
}

function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [viewLang, setViewLang] = useState("en");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/complaints`);
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch {
      setComplaints([]);
    }
  };

  const validComplaints = complaints.filter(
    (item) => item.lat && item.lng && !isNaN(Number(item.lat)) && !isNaN(Number(item.lng))
  );

  const mapCenter = useMemo(() => {
    if (validComplaints.length > 0)
      return [Number(validComplaints[0].lat), Number(validComplaints[0].lng)];
    return [28.6139, 77.209];
  }, [validComplaints]);

  const selectedLangLabel = VIEW_LANGUAGES.find((l) => l.isoCode === viewLang)?.label ?? "English";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-700 px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Map & Registered Complaints</h1>
              <p className="mt-1 text-sm text-slate-300">
                Hover over a marker to view the complaint reference number.
              </p>
            </div>

            {/* ── View Language Selector ── */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                View In
              </label>
              <div className="relative">
                <select
                  value={viewLang}
                  onChange={(e) => setViewLang(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-600 bg-slate-800 pl-3 pr-8 py-2 text-sm font-semibold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {VIEW_LANGUAGES.map((l) => (
                    <option key={l.isoCode} value={l.isoCode}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
              </div>
              {viewLang !== "en" && (
                <p className="text-xs text-blue-400 mt-0.5">
                  Complaints auto-translated to {selectedLangLabel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Map + List grid */}
        <div className="grid gap-6 p-6 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Map */}
          <div className="overflow-hidden rounded-xl border border-slate-700">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validComplaints.map((item) => (
                <Marker
                  key={item._id || item.id}
                  position={[Number(item.lat), Number(item.lng)]}
                  icon={markerIcon}
                >
                  <Tooltip direction="top" offset={[0, -25]} opacity={1}>
                    Ref #{item._id || item.id}
                  </Tooltip>
                  <Popup>
                    <div style={{ minWidth: "220px" }}>
                      <strong>Reference:</strong> #{item._id || item.id}
                      <br /><strong>Category:</strong> {item.category}
                      <br /><strong>Status:</strong> {item.status}
                      <br /><strong>Priority:</strong> {item.priority}
                      <br /><strong>Location:</strong> {item.location}
                      <br /><br />{item.text}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Complaints List */}
          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Registered Complaints</h2>
              {viewLang !== "en" && (
                <span className="text-xs rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 font-semibold">
                  {VIEW_LANGUAGES.find(l => l.isoCode === viewLang)?.flag} {selectedLangLabel}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {complaints.map((item) => (
                <ComplaintCard
                  key={item._id || item.id}
                  item={item}
                  viewLang={viewLang}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsPage;
