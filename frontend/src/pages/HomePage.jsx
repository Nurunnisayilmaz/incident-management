import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { Plus, ClipboardList, ArrowRight } from "lucide-react";
import CreateIncidentForm from "../components/CreateIncidentForm";
import IncidentList from "../components/IncidentList";
import FilterSelect from "../components/FilterSelect";
import { initSocket, disconnectSocket } from "../utils/socket";

const HomePage = ({ user, error }) => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({
    service: "",
    status: "",
    severity: "",
  });
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!user) {
        setIncidents([]);
        setPagination(null);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("/incidents", {
          params: { page, limit, ...filters },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = res.data.data;
        setIncidents(responseData.items || []);
        setPagination(responseData.pagination || null);
      } catch (err) {
        setLoadError("Unable to load incidents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [user, page, filters]);

  useEffect(() => {
    if (!user) return;

    const socket = initSocket();

    if (!socket) return;

    const handleCreated = (data) => {
      setIncidents((prev) => [data, ...prev]);
    };

    const handleUpdated = (data) => {
      setIncidents((prev) =>
        prev.map((item) => (item.id === data.id ? data : item)),
      );
    };

    const handleDeleted = ({ id }) => {
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    };

    socket.on("incident:created", handleCreated);
    socket.on("incident:updated", handleUpdated);
    socket.on("incident:deleted", handleDeleted);

    return () => {
      socket.off("incident:created", handleCreated);
      socket.off("incident:updated", handleUpdated);
      socket.off("incident:deleted", handleDeleted);
    };
  }, [user]);

  const renderPagination = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, totalItems } = pagination;

    return (
      <div className="mt-6 flex flex-col items-center gap-2">
        {/* pagination controls */}
        <div className="flex items-center gap-2">
          {/* PREV */}
          <button
            className={`px-2 py-1 rounded ${
              currentPage === 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-base-300"
            }`}
            disabled={currentPage === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            ‹
          </button>

          {/* NUMBERS */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 2),
                Math.min(totalPages, currentPage + 1),
              )
              .map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`btn btn-sm ${
                    pageNum === currentPage ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
          </div>

          {/* NEXT */}
          <button
            className={`px-2 py-1 rounded ${
              currentPage === totalPages
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-base-300"
            }`}
            disabled={currentPage === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            ›
          </button>
        </div>

        {/* INFO */}
        <div className="text-sm text-base-content/70">
          Page {currentPage} - {totalPages} of {totalItems} items
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-base-200">
      <div className="card bg-base-100 p-8 rounded-3xl shadow-xl w-full max-w-5xl border border-base-300">
        {error && <p className="text-error mb-4">{error}</p>}
        {user ? (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              {/* LEFT */}
              <h2 className="text-3xl font-bold text-base-content">
                Welcome, {user.username}!
              </h2>

              {/* RIGHT */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* STATUS */}
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  options={[
                    { label: "Open", value: "open" },
                    { label: "Investigating", value: "investigating" },
                    { label: "Resolved", value: "resolved" },
                  ]}
                  onChange={(val) => {
                    setFilters({ ...filters, status: val });
                    setPage(1);
                  }}
                />

                {/* SEVERITY */}
                <FilterSelect
                  label="Severity"
                  value={filters.severity}
                  options={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                    { label: "Critical", value: "critical" },
                  ]}
                  onChange={(val) => {
                    setFilters({ ...filters, severity: val });
                    setPage(1);
                  }}
                />

                {/* SERVICE */}
                <input
                  className="input input-sm input-bordered"
                  placeholder="service"
                  value={filters.service}
                  onChange={(e) =>
                    setFilters({ ...filters, service: e.target.value })
                  }
                />

                {/* PLUS BUTTON */}
                <button
                  title="Add Incident"
                  onClick={() => setShowCreate((prev) => !prev)}
                  className="btn btn-primary btn-sm flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {showCreate && (
              <CreateIncidentForm
                onCreated={() => {
                  setShowCreate(false);
                  setPage(1);
                }}
              />
            )}

            {loadError && <p className="text-error mb-4">{loadError}</p>}

            <IncidentList
              incidents={incidents}
              loading={loading}
              error={loadError}
            />

            {renderPagination()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
            {/* ICON */}
            <div className="bg-primary/10 p-6 rounded-full">
              <ClipboardList className="text-primary" size={48} />
            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-bold text-base-content">
              Incident Management System
            </h1>

            {/* DESCRIPTION */}
            <p className="text-base-content/70 max-w-md">
              Manage incidents and track changes with audit logs.
            </p>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-4">
              <Link
                to="/login"
                className="btn btn-primary flex items-center gap-2"
              >
                <ArrowRight size={18} />
                Sign in to continue
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
