import { useState } from "react";
import axios from "../api/axios";

const CreateIncidentForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    service: "",
    severity: "low",
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await axios.post("/incidents", form);

      setForm({
        title: "",
        description: "",
        service: "",
        severity: "low",
      });

      onCreated();
    } catch (err) {
      alert("Failed to create incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-2xl bg-base-200">
      <div className="grid gap-3">
        <input
          type="text"
          placeholder="Title"
          className="input input-bordered w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          type="text"
          placeholder="Service"
          className="input input-bordered w-full"
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        />

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
          placeholder="Description"
          className="textarea textarea-bordered w-full"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button
          className="btn btn-success"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Incident"}
        </button>
      </div>
    </div>
  );
};

export default CreateIncidentForm;