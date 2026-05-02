import { useEffect, useState, useRef, useCallback } from "react";
import axios from "../api/axios";

const AuditRow = ({ log, getUsername }) => {
  const [username, setUsername] = useState("...");

  useEffect(() => {
    const load = async () => {
      const name = await getUsername(log.changedByUserId);
      setUsername(name);
    };

    load();
  }, [log.changedByUserId]);

  return (
    <div className="text-sm border-b border-base-200 pb-2 space-y-1">
      {/* TOP ROW */}
      <div className="flex justify-between items-center">
        <span className="font-medium">{log.field}</span>
        <span className="text-xs opacity-70">{username}</span>
      </div>

      {/* SECOND ROW */}
      <div className="flex justify-between items-center text-xs opacity-70">
        <span>
          {log.oldValue ?? "-"} → {log.newValue ?? "-"}
        </span>

        <span className="text-[11px] opacity-50">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const IncidentAuditLog = ({ incidentId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userCache, setUserCache] = useState({});
  const [page, setPage] = useState(1);

  const observerRef = useRef(null);
  const limit = 2;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");

        const res = await axios.get(`/incident-audit-logs/${incidentId}`, {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newLogs = res.data.data.items || [];

        setLogs((prev) => (page === 1 ? newLogs : [...prev, ...newLogs]));

        setHasMore(newLogs.length === limit);
      } catch (err) {
        console.log("AUDIT LOG ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    if (incidentId) fetchLogs();
  }, [incidentId, page]);

  const getUsername = async (userId) => {
    if (!userId) return "system";
    if (userCache[userId]) return userCache[userId];

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const username = res.data?.data?.username || "unknown";

      setUserCache((prev) => ({
        ...prev,
        [userId]: username,
      }));

      return username;
    } catch {
      return "unknown";
    }
  };

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  if (!logs.length && loading) {
    return <div className="p-4">Loading audit logs...</div>;
  }

  if (!logs.length) {
    return <div className="p-4 text-sm opacity-70">No audit logs</div>;
  }

  return (
    <div className="mt-3 p-4 border rounded-xl bg-base-100">
      <h4 className="font-semibold mb-3">Audit Logs</h4>

      <div className="space-y-3">
        {logs.map((log, index) => {
          if (index === logs.length - 1) {
            return (
              <div ref={lastElementRef} key={log.id}>
                <AuditRow log={log} getUsername={getUsername} />
              </div>
            );
          }

          return <AuditRow key={log.id} log={log} getUsername={getUsername} />;
        })}
      </div>

      {loading && (
        <div className="text-sm opacity-60 mt-3">Loading more...</div>
      )}
    </div>
  );
};

export default IncidentAuditLog;
