import React from "react";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { Objective, KeyResult } from "../types";
import { ArrowUturnLeftIcon } from "../components/Icons";

// interface ArchivedItemsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   objectives: Objective[];
//   onUnarchiveObjective: (objectiveId: string) => void;
//   onUnarchiveKeyResult: (objectiveId: string, keyResultId: string) => void;
// }

// const ArchivedItemsModal: React.FC<ArchivedItemsModalProps> = ({
//   isOpen,
//   onClose,
//   objectives,
//   onUnarchiveObjective,
//   onUnarchiveKeyResult,
// }) => {

// const archivedObjectives = objectives.filter(o => o.isArchived);
// const archivedKeyResults = objectives.flatMap(o =>
//   o.keyResults
//     .filter(kr => kr.isArchived)
//     .map(kr => ({ ...kr, objectiveTitle: o.title, objectiveId: o.id }))
// );

const ArchivedItemsModal: React.FC = observer(() => {
  const { uiStore, objectiveStore } = useStore();
  const isOpen = uiStore.isOpen("archivedItems");

  const archivedObjectives = objectiveStore.objectives.filter(
    (o) => o.isArchived
  );
  const archivedKeyResults = objectiveStore.objectives.flatMap((o) =>
    o.keyResults
      .filter((kr) => kr.isArchived)
      .map((kr) => ({ ...kr, objectiveTitle: o.title, objectiveId: o.id }))
  );

  if (!isOpen) return null;
  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="آیتم‌های آرشیو شده" size="xl">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("archivedItems")}
      title="آیتم‌های آرشیو شده"
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">
            اهداف آرشیو شده
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50/50">
            {archivedObjectives.length > 0 ? (
              archivedObjectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex justify-between items-center p-2 bg-white rounded-md border"
                >
                  <span className="font-medium text-sm text-brand-text">
                    {obj.title}
                  </span>
                  <button
                    onClick={() => onUnarchiveObjective(obj.id)}
                    className="flex items-center text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    title="بازگردانی"
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4 ml-1" />
                    بازگردانی
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-brand-subtext py-4">
                هیچ هدف آرشیو شده‌ای وجود ندارد.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">
            نتایج کلیدی / تارگت‌های روزانه آرشیو شده
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50/50">
            {archivedKeyResults.length > 0 ? (
              archivedKeyResults.map((kr) => (
                <div
                  key={kr.id}
                  className="flex justify-between items-center p-2 bg-white rounded-md border"
                >
                  <div>
                    <span className="font-medium text-sm text-brand-text">
                      {kr.title}
                    </span>
                    <p className="text-xs text-brand-subtext">
                      از هدف: {kr.objectiveTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => onUnarchiveKeyResult(kr.objectiveId, kr.id)}
                    className="flex items-center text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    title="بازگردانی"
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4 ml-1" />
                    بازگردانی
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-brand-subtext py-4">
                هیچ نتیجه کلیدی آرشیو شده‌ای وجود ندارد.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default ArchivedItemsModal;
