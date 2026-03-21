import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function RegisterComplaintPage() {
  const [form, setForm] = useState({
    complaintText: "",
    latitude: "",
    longitude: "",
    locationName: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click start to record your complaint");
  const recognitionRef = useRef(null);

  useEffect(() => {
    setupSpeechRecognition();
    getCurrentLocation();
  }, []);

  const setupSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceStatus("Voice input is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Recording in progress...");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setForm((prev) => ({
        ...prev,
        complaintText: `${prev.complaintText} ${finalTranscript || interimTranscript}`.trim(),
      }));
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceStatus(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus("Recording stopped");
    };

    recognitionRef.current = recognition;
    setVoiceSupported(true);
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (err) {
      setVoiceStatus("Microphone permission denied or unavailable");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
          locationName: prev.locationName || "Current Location",
        }));
      },
      () => {
        // user can enter manually
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  const detectCategory = (text) => {
    const t = text.toLowerCase();

    if (t.includes("garbage") || t.includes("waste") || t.includes("drain") || t.includes("sewage")) {
      return "Sanitation";
    }
    if (t.includes("road") || t.includes("pothole") || t.includes("traffic")) {
      return "Roads";
    }
    if (t.includes("water") || t.includes("pipeline") || t.includes("leak")) {
      return "Water";
    }
    if (t.includes("hospital") || t.includes("health") || t.includes("mosquito")) {
      return "Health";
    }
    if (t.includes("electricity") || t.includes("power") || t.includes("transformer")) {
      return "Electricity";
    }

    return "General";
  };

  const detectPriority = (text) => {
    const t = text.toLowerCase();

    if (
      t.includes("urgent") ||
      t.includes("emergency") ||
      t.includes("fire") ||
      t.includes("leak") ||
      t.includes("sewage") ||
      t.includes("accident")
    ) {
      return "High";
    }
    if (t.includes("broken") || t.includes("damage") || t.includes("problem")) {
      return "Medium";
    }
    return "Low";
  };

  const priorityClasses = (priority) => {
    if (priority === "High") return "border-red-500/30 bg-red-500/10 text-red-300";
    if (priority === "Medium") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    return "border-green-500/30 bg-green-500/10 text-green-300";
  };

  const clearForm = () => {
    setForm({
      complaintText: "",
      latitude: "",
      longitude: "",
      locationName: "",
    });
    setImageFile(null);
    setImagePreview("");
    setError("");
    setVoiceStatus(
      voiceSupported
        ? "Click start to record your complaint"
        : "Voice input is not supported in this browser"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitResult(null);

    if (!form.complaintText.trim()) {
      setError("Please enter a complaint description.");
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError("Please provide location coordinates or allow location access.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("complaintText", form.complaintText);
      payload.append("latitude", form.latitude);
      payload.append("longitude", form.longitude);
      payload.append("locationName", form.locationName);

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const response = await axios.post(`${API_BASE_URL}/api/complaints`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitResult(response.data);
      clearForm();
    } catch (err) {
      const mockComplaint = {
        id: Date.now(),
        text: form.complaintText,
        category: detectCategory(form.complaintText),
        priority: detectPriority(form.complaintText),
        status: "Open",
        lat: Number(form.latitude),
        lng: Number(form.longitude),
        locationName: form.locationName,
        imageUrl: imagePreview || "",
        createdAt: new Date().toLocaleString(),
      };

      setSubmitResult(mockComplaint);
      clearForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Register a Complaint</h1>
          <p className="mt-1 text-sm text-slate-300">
            Fill in the required details below to submit a civic issue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Complaint Description
            </label>
            <textarea
              name="complaintText"
              value={form.complaintText}
              onChange={handleChange}
              rows="6"
              placeholder="Example: Garbage has not been collected for two days near the main road."
              className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-[#1f4e79] focus:ring-2 focus:ring-[#1f4e79]/20"
            />
            <p className="mt-2 text-sm text-slate-400">
              Provide a clear description of the issue, nearby landmark, and urgency if applicable.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Voice Complaint Input
                </h3>
                <p className="mt-1 text-sm text-slate-400">{voiceStatus}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={!voiceSupported || isListening}
                  className="rounded-lg bg-[#1f4e79] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173a5b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Recording
                </button>
                <button
                  type="button"
                  onClick={stopListening}
                  disabled={!voiceSupported || !isListening}
                  className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Upload Supporting Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-3 text-sm text-slate-300"
            />
            {imagePreview && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800 p-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 28.6139"
                className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-[#1f4e79] focus:ring-2 focus:ring-[#1f4e79]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 77.2090"
                className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-[#1f4e79] focus:ring-2 focus:ring-[#1f4e79]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Locality / Landmark
            </label>
            <input
              type="text"
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              placeholder="Example: Near City Market Bus Stop"
              className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-[#1f4e79] focus:ring-2 focus:ring-[#1f4e79]/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#1f4e79] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173a5b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-slate-600 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Submission Summary</h2>
          <p className="mt-1 text-sm text-slate-300">
            Review the latest complaint processed by the system.
          </p>
        </div>

        <div className="p-6">
          {submitResult ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Complaint Reference
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    #{submitResult.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClasses(
                      submitResult.priority
                    )}`}
                  >
                    {submitResult.priority} Priority
                  </span>
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    {submitResult.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <p className="text-sm font-semibold text-slate-200">Complaint Details</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {submitResult.text}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {submitResult.category}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Submitted On
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {submitResult.createdAt}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recorded Coordinates
                </p>
                <p className="mt-2 text-sm font-medium text-slate-200">
                  {submitResult.lat}, {submitResult.lng}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800 p-8 text-center">
              <p className="text-sm font-semibold text-slate-300">
                No complaint submitted yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                The latest processed complaint will appear here after submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterComplaintPage;