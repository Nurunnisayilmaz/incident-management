import { useState } from "react";
import IncidentDetailForm from "./IncidentDetailForm";
import UpdateIncidentForm from "./UpdateIncidentForm";
import ConfirmModal from "./ConfirmModal";
import IncidentAuditLog from "./IncidentAuditLog";
import { Pencil, Trash2, Eye } from "lucide-react";
import axios from "../api/axios";

const IncidentList = ({ incidents, loading, error }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [updateIncidentId, setUpdateIncidentId] = useState(null);
  const [auditIncidentId, setAuditIncidentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`/incidents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteId(null);
      window.location.reload();
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
      alert("Failed to delete incident");
    }
  };

  if (error) {
    return <p className="text-error mb-4">{error}</p>;
  }

  if (loading) {
    return <div className="text-center py-12">Loading incidents...</div>;
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/80">No incidents found yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <div key={incident.id}>
          <div
            onClick={() =>
              setSelectedIncidentId((prev) =>
                prev === incident.id ? null : incident.id,
              )
            }
            className="cursor-pointer rounded-3xl border border-base-200 bg-base-200 p-5 shadow-sm"
          >
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold">{incident.title}</h3>

              <div className="flex items-center gap-2">
                <span className="badge badge-outline">{incident.status}</span>

                {/* AUDIT LOG */}
                <button
                  title="Audit Log History"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuditIncidentId((prev) =>
                      prev === incident.id ? null : incident.id,
                    );
                  }}
                  className="btn btn-ghost btn-xs"
                >
                  <Eye size={16} />
                </button>

                {/* UPDATE */}
                <button
                  title="Edit Incident"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncidentId(null);
                    setUpdateIncidentId((prev) =>
                      prev === incident.id ? null : incident.id,
                    );
                  }}
                  className="btn btn-ghost btn-xs"
                >
                  <Pencil size={16} />
                </button>
                
                {/* DELETE */}
                <button
                  title="Delete Incident"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(incident.id);
                  }}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {selectedIncidentId === incident.id && (
            <IncidentDetailForm incidentId={incident.id} />
          )}

          {updateIncidentId === incident.id && (
            <UpdateIncidentForm
              incidentId={incident.id}
              onUpdated={() => setUpdateIncidentId(null)}
            />
          )}

          {auditIncidentId === incident.id && (
            <IncidentAuditLog incidentId={incident.id} />
          )}
        </div>
      ))}

      {/* MODAL */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Incident"
        description="Are you sure you want to delete this incident?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
};

export default IncidentList;
