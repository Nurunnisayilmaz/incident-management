import { useEffect, useState } from "react";
import axios from "../api/axios";

const IncidentDetailForm = ({ incidentId }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/incidents/${incidentId}`);
        setForm(res.data.data);
      } catch (err) {
        alert("Failed to load incident");
      } finally {
        setLoading(false);
      }
    };

    if (incidentId) {
      fetchDetail();
    }
  }, [incidentId]);

  if (loading) return <div>Loading detail...</div>;
  if (!form) return null;

  return (
    <div className="mt-4 p-4 border rounded-xl bg-base-100 space-y-2">
      <div>
        <span className="font-semibold">Service:</span>{" "}
        <span>{form.service}</span>
      </div>

      <div>
        <span className="font-semibold">Description:</span>{" "}
        <span>{form.description}</span>
      </div>

      <div>
        <span className="font-semibold">Status:</span>{" "}
        <span className="badge badge-outline">{form.status}</span>
      </div>

      <div>
        <span className="font-semibold">Severity:</span>{" "}
        <span className="badge badge-outline">{form.severity}</span>
      </div>
    </div>
  );
};

export default IncidentDetailForm;
