import React from "react";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";

const ConfirmationModal: React.FC = observer(() => {
  const { uiStore } = useStore();
  const { isOpen, title, message, onConfirm } = uiStore.confirmation;

  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeConfirmation()}
      title={title}
    >
      <div>
        <p className="text-brand-subtext">{message}</p>
        <div className="flex justify-end pt-6 space-x-2 space-x-reverse">
          <button
            onClick={() => uiStore.closeConfirmation()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold text-sm"
          >
            لغو
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
          >
            تایید
          </button>
        </div>
      </div>
    </Modal>
  );
});

export default ConfirmationModal;
