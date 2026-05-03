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
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
      alert("Failed to delete incident");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()?.trim()) {
      case "open":
        return "badge-outline border-red-300 text-red-400";
      case "investigating":
        return "badge-outline border-yellow-300 text-yellow-500";
      case "resolved":
        return "badge-outline border-green-300 text-green-500";
      default:
        return "badge-outline border-gray-300 text-gray-400";
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()?.trim()) {
      case "low":
        return "badge-outline border-blue-300 text-blue-400";
      case "medium":
        return "badge-outline border-yellow-300 text-yellow-500";
      case "high":
        return "badge-outline border-orange-300 text-orange-500";
      case "critical":
        return "badge-outline border-red-300 text-red-400";
      default:
        return "badge-outline border-gray-300 text-gray-400";
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
      {/* TABLE HEADER */}
      <div className="grid grid-cols-12 px-5 py-3 text-sm font-semibold text-base-content/70 border-b border-base-300">
        <div className="col-span-5">Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Severity</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>

      {/* TABLE BODY */}
      {incidents.map((incident) => (
        <div key={incident.id}>
          <div
            onClick={() =>
              setSelectedIncidentId((prev) =>
                prev === incident.id ? null : incident.id,
              )
            }
            className="grid grid-cols-12 items-center px-5 py-4 border-b border-base-200 hover:bg-base-200 cursor-pointer"
          >
            {/* TITLE */}
            <div className="col-span-5 font-medium">{incident.title}</div>

            {/* STATUS */}
            <div className="col-span-2">
              <span className={`badge ${getStatusBadge(incident.status)}`}>
                {incident.status}
              </span>
            </div>

            {/* SEVERITY */}
            <div className="col-span-2">
              <span className={`badge ${getSeverityBadge(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="col-span-3 flex justify-end gap-2">
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

          {selectedIncidentId === incident.id && (
            <div className="px-5 pb-4">
              <IncidentDetailForm incidentId={incident.id} />
            </div>
          )}

          {updateIncidentId === incident.id && (
            <div className="px-5 pb-4">
              <UpdateIncidentForm
                incidentId={incident.id}
                onUpdated={() => setUpdateIncidentId(null)}
              />
            </div>
          )}

          {auditIncidentId === incident.id && (
            <div className="px-5 pb-4">
              <IncidentAuditLog incidentId={incident.id} />
            </div>
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
