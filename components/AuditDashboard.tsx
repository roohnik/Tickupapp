import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";

const AuditDashboard: React.FC = observer(() => {
  const { auditStore, heatmapStore } = useStore();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-brand-text">تاریخچه عملیات</h2>
      <ul className="space-y-2">
        {auditStore.logs.map((log) => (
          <li key={log.timestamp} className="text-sm text-gray-700">
            <strong>{log.userId}</strong> did <strong>{log.action}</strong> on{" "}
            <strong>{log.entityType}</strong> <code>{log.entityId}</code> at{" "}
            {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold text-brand-text mt-8">فعالیت‌ها</h2>
      <ul className="space-y-2">
        {heatmapStore.activities.map((act) => (
          <li key={act.timestamp} className="text-sm text-gray-600">
            {act.userId} → {act.action} → {act.entityType}{" "}
            <code>{act.entityId}</code>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default AuditDashboard;
