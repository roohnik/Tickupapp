import React, { useState, useEffect } from "react";
import { NavItem } from "../types";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { ArrowLeftIcon, ArrowRightIcon } from "../components/Icons";

// interface CustomizeNavModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   navItems: NavItem[];
//   onSave: (newNavItems: NavItem[]) => void;
// }

// const CustomizeNavModal: React.FC<CustomizeNavModalProps> = ({ isOpen, onClose, navItems, onSave }) => {
const CustomizeNavModal: React.FC = observer(() => {
  const { uiStore, sidebarStore } = useStore();
  const isOpen = uiStore.isOpen("customizeNav");

  const [currentNavItems, setCurrentNavItems] = useState(navItems);

  useEffect(() => {
    if (isOpen) setCurrentNavItems(sidebarStore.navItems);
  }, [isOpen]);
  const handleMove = (itemId: string, to: "main" | "more") => {
    setCurrentNavItems((prev) =>
      prev.map((item) => {
        if (item.type === "item" && item.id === itemId) {
          // Settings should not be moved
          if (item.id === "settings") return item;
          return { ...item, location: to };
        }
        return item;
      })
    );
  };

  //   const handleSave = () => {
  //     onSave(currentNavItems);
  //   };
  const handleSave = () => {
    sidebarStore.setNavItems(currentNavItems);
    uiStore.closeModal("customizeNav");
  };

  if (!isOpen) return null;

  const mainItems = currentNavItems.filter(
    (item): item is Extract<NavItem, { type: "item" }> =>
      item.type === "item" &&
      item.visible &&
      item.location !== "more" &&
      item.id !== "settings"
  );
  const moreItems = currentNavItems.filter(
    (item): item is Extract<NavItem, { type: "item" }> =>
      item.type === "item" &&
      item.visible &&
      item.location === "more" &&
      item.id !== "settings"
  );

  const renderItemList = (
    items: Extract<NavItem, { type: "item" }>[],
    target: "main" | "more"
  ) => (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between p-2 bg-white rounded-md border"
        >
          <div className="flex items-center">
            <item.Icon className="w-5 h-5 text-gray-500 ml-2" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <button
            onClick={() =>
              handleMove(item.id, target === "main" ? "more" : "main")
            }
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
            title={
              target === "main"
                ? "انتقال به منوی 'بیشتر'"
                : "انتقال به منوی اصلی"
            }
          >
            {target === "main" ? (
              <ArrowLeftIcon className="w-5 h-5" />
            ) : (
              <ArrowRightIcon className="w-5 h-5" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="شخصی‌سازی منو">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("customizeNav")}
      title="شخصی‌سازی منو"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">نمایش در منو اصلی</h3>
          <div className="p-3 bg-gray-100/70 rounded-lg border h-80 overflow-y-auto">
            {renderItemList(mainItems, "main")}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">نمایش در منوی 'بیشتر'</h3>
          <div className="p-3 bg-gray-100/70 rounded-lg border h-80 overflow-y-auto">
            {renderItemList(moreItems, "more")}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-6 mt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm ml-2"
        >
          لغو
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg"
        >
          ذخیره تغییرات
        </button>
      </div>
    </Modal>
  );
});

export default CustomizeNavModal;
