// If you want to eliminate manual emitWithAck calls, you can create a helper like:
// src/utils/socketActions.ts
import { emitWithAck } from "./emitWithAck";
import { showToast } from "./toast";
import { appStore } from "../stores/AppStore"; // ✅ to access roleStore


export async function safeEmit(
  event: string,
  payload: any,
  successMsg?: string,
  entity?: string,
  action?: string
) {
  try {
    // ✅ If entity/action provided, verify permission before emit
    if (entity && action) {
      const can = appStore.roleStore.can(entity, action);
      if (!can) {
        console.warn(`⛔ ${appStore.roleStore.currentRole} not allowed to ${action} ${entity}`);
        showToast(`You don’t have permission to ${action} ${entity}`, "error");
        return { ok: false, error: "unauthorized_action" };
      }
    }
    const res = await emitWithAck(event, payload);
    if (successMsg && res.ok) {
      showToast(successMsg, "success");
    }

    return res;
  } catch (err: any) {
    showToast(err?.message || `Error: ${event}`, "error");
    return { ok: false, error: err?.message || "Unknown error" };
  }
}

/*
Then use it anywhere:

await safeEmit("boards:create", newBoard, "Board created");
await safeEmit("projects:update", project, "Project updated");
This gives you consistent UX and error reporting app-wide.

*/

/*
🧠 4. Example Server Response Format

Your Socket.IO server handlers should always respond with this shape:

socket.on("notifications:list", async (data, callback) => {
  try {
    const notifications = await getNotifications(data.userId);
    callback({ ok: true, data: notifications });
  } catch (err) {
    callback({ ok: false, error: err.message });
  }
});


That way emitWithAck and safeEmit always work predictably.
*/
