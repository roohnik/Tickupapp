import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { format } from "date-fns-jalali";

const ModerationDashboard: React.FC = observer(() => {
  const { auditStore, userStore, roleStore } = useStore();

  const logs = auditStore.logs.slice(0, 100); // latest 100 actions

  const getUserName = (id: string) =>
    userStore.users.find((u) => u.id === id)?.name || "ناشناس";

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-brand-text">داشبورد نظارت</h2>
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-brand-subtext">
            <tr>
              <th className="px-4 py-2 text-right">کاربر</th>
              <th className="px-4 py-2 text-right">عملیات</th>
              <th className="px-4 py-2 text-right">موجودیت</th>
              <th className="px-4 py-2 text-right">زمان</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.timestamp} className="border-t">
                <td className="px-4 py-2 text-right">
                  {getUserName(log.userId)}
                </td>
                <td className="px-4 py-2 text-right">{log.action}</td>
                <td className="px-4 py-2 text-right">{log.entityType}</td>
                <td className="px-4 py-2 text-right">
                  {format(new Date(log.timestamp), "yyyy/MM/dd - HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ModerationDashboard;
