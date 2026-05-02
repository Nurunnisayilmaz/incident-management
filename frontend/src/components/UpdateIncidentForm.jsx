import { useEffect, useState } from "react";
import axios from "../api/axios";

const UpdateIncidentForm = ({ incidentId, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");

        const res = await axios.get(`/incidents/${incidentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForm(res.data.data);
      } catch (err) {
        alert("Failed to load incident");
      } finally {
        setLoading(false);
      }
    };

    if (incidentId) fetchDetail();
  }, [incidentId]);

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("accessToken");

      await axios.patch(`/incidents/${incidentId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onUpdated?.();
    } catch (err) {
      alert("Failed to update incident");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!form) return null;

  return (
    <div className="mt-3 p-4 border rounded-2xl bg-base-100 space-y-3">
      <input
        className="input input-bordered w-full"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <input
        className="input input-bordered w-full"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
      />

      <select
        className="select select-bordered w-full"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option value="open">open</option>
        <option value="investigating">investigating</option>
        <option value="resolved">resolved</option>
      </select>

      <select
        className="select select-bordered w-full"
        value={form.severity}
        onChange={(e) => setForm({ ...form, severity: e.target.value })}
      >
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>

      <textarea
        className="textarea textarea-bordered w-full"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <button
        className="btn btn-warning w-full"
        onClick={handleUpdate}
        disabled={saving}
      >
        {saving ? "Updating..." : "Update"}
      </button>
    </div>
  );
};

export default UpdateIncidentForm;