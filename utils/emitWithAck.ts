import { socket } from "../services/socketService";
import { showToast } from "./toast";

//wraps socket.emit in a Promise, so you can safely await the server’s response.
export const emitWithAck = (
  event: string,
  payload?: any,
  onRollback?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res: any) => {
      if (!res?.ok) {
        showToast(`❌ ${res?.error || "Server error"}`);
        if (onRollback) onRollback();
        reject(res?.error || "Server error");
      } else if (res?.ok && res.message) {
        showToast(`✅ ${res.message}`);
        resolve(res);
      }
    });
  });
};


/*
⚡ Optional: Strongly Typed Version (for TypeScript)

If you want type safety for the payload and response, use generics:

export const emitWithAck = <TResponse = any, TPayload = any>(
  event: string,
  payload?: TPayload,
  onRollback?: () => void
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res: any) => {
      if (!res?.ok) {
        showToast(`❌ ${res?.error || "Server error"}`);
        if (onRollback) onRollback();
        reject(res?.error || "Server error");
      } else {
        if (res?.message) showToast(`✅ ${res.message}`);
        resolve(res as TResponse);
      }
    });
  });
};
*/
/*
🧠 How You Use It
✅ Option 1: Promise Syntax
emitWithAck("notifications:list", { userId: store.currentUser.id })
  .then((res) => {
    console.log("Notifications:", res);
  })
  .catch((err) => {
    console.error("Error fetching notifications:", err);
  });

✅ Option 2: Async/Await Syntax
try {
  const res = await emitWithAck("notifications:list", { userId: store.currentUser.id });
  console.log("Notifications:", res);
} catch (err) {
  console.error("Error fetching notifications:", err);
}
*/
/*
export const emitWithAck = (event: string, payload?: any, onRollback?: any) => {
  socket.emit(event, payload, (res: any) => {
    if (!res?.ok) {
      showToast(`❌ ${res?.error || "Server error"}`);
      if (onRollback) onRollback();
    } else if (res?.ok && res.message) {
      showToast(`✅ ${res.message}`);
    }
  });
};
*/

/*
const res = await emitWithAck("projects:update", projectData);
if (!res.ok) showToast("Failed to update project", "error");
*/

/*
Usage example:

const old = store.projects.slice();
store.setProjects(updated);

emitWithAck("projects:update", updatedProject, () => store.setProjects(old));
*/

/*
Example usage (in any component):
import { emitWithAck } from "../utils/emitWithAck";

// optimistic update
const prev = store.projects.slice();
store.setProjects(updatedProjects);

emitWithAck("projects:update", updatedProject, (res) => {
  if (!res?.ok) store.setProjects(prev); // rollback on failure
});
*/
//You have a utils/emitWithAck.ts file already in your repo. Use it to replace direct socket.emit(...) calls for create/update/delete flows where you do optimistic updates.
