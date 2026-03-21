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

function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/complaints`);
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setComplaints([]);
    }
  };

  const validComplaints = complaints.filter(
    (item) => item.lat && item.lng && !isNaN(Number(item.lat)) && !isNaN(Number(item.lng))
  );

  const mapCenter = useMemo(() => {
    if (validComplaints.length > 0) {
      return [Number(validComplaints[0].lat), Number(validComplaints[0].lng)];
    }
    return [28.6139, 77.209];
  }, [validComplaints]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Map & Registered Complaints</h1>
          <p className="mt-1 text-sm text-slate-300">
            Hover over a marker to view the complaint reference number.
          </p>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[1.3fr_0.7fr]">
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
                      <br />
                      <strong>Category:</strong> {item.category}
                      <br />
                      <strong>Status:</strong> {item.status}
                      <br />
                      <strong>Priority:</strong> {item.priority}
                      <br />
                      <strong>Location:</strong> {item.location}
                      <br />
                      <br />
                      {item.text}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h2 className="mb-4 text-lg font-bold text-white">Registered Complaints</h2>

            <div className="space-y-3">
              {complaints.map((item) => (
                <div
                  key={item._id || item.id}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                >
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

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {item.category}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">{item.location}</p>

                  <p className="mt-2 text-sm text-slate-300 line-clamp-2">{item.text}</p>

                  <Link
                    to={`/track?ref=${item._id || item.id}`}
                    className="mt-3 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
                  >
                    Track this complaint
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsPage;