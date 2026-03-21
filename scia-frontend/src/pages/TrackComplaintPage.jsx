import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function TrackComplaintPage() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get("ref") || "");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (searchParams.get("ref")) {
      handleSearch(searchParams.get("ref"));
    }
  }, []);

  const handleSearch = async (forcedRef) => {
    const ref = forcedRef || reference;
    if (!ref) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/complaints`);
      const complaints = Array.isArray(response.data) ? response.data : [];
      const match = complaints.find((item) => String(item.id) === String(ref));

      if (match) {
        setResult(match);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch (err) {
      setResult(null);
      setNotFound(true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Track Complaint</h1>
          <p className="mt-1 text-sm text-slate-300">
            Search for a complaint using its reference number.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter complaint reference number"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none"
            />
            <button
              onClick={() => handleSearch()}
              className="rounded-lg bg-[#1f4e79] px-5 py-3 font-semibold text-white"
            >
              Search
            </button>
          </div>

          {result && (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <p className="text-sm text-slate-300">Reference</p>
              <p className="text-xl font-bold text-white">#{result.id}</p>

              <div className="mt-4 space-y-2 text-slate-300">
                <p><span className="font-semibold text-white">Category:</span> {result.category}</p>
                <p><span className="font-semibold text-white">Priority:</span> {result.priority}</p>
                <p><span className="font-semibold text-white">Status:</span> {result.status}</p>
                <p><span className="font-semibold text-white">Location:</span> {result.lat}, {result.lng}</p>
                <p><span className="font-semibold text-white">Complaint:</span> {result.text}</p>
              </div>
            </div>
          )}

          {notFound && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
              No complaint found for that reference number.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackComplaintPage;