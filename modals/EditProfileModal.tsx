import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import Modal from "./Modal";
import { DocumentArrowUpIcon } from "../components/Icons";
import { User } from "@/types";

// interface EditProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   user: User | null;
//   onSubmit: (userId: string, name: string, username: string, password?: string, signatureUrl?: string | null) => void;
// }
const EditProfileModal: React.FC = observer(() => {
  // const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSubmit }) => {
  const { uiStore, userStore } = useStore();
  const user = userStore.currentUser;
  const isOpen = uiStore.isOpen("editProfile");
  if (!uiStore.isEditProfileModalOpen) return null;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SIGNATURE_WIDTH = 300;
  const SIGNATURE_HEIGHT = 75;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setSignatureUrl(user.signatureUrl || null);
    }
  }, [user]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIGNATURE_WIDTH;
        canvas.height = SIGNATURE_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fill background with white
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);

        // Calculate aspect ratio to fit the image inside the canvas
        const scale = Math.min(
          SIGNATURE_WIDTH / img.width,
          SIGNATURE_HEIGHT / img.height
        );
        const x = SIGNATURE_WIDTH / 2 - (img.width / 2) * scale;
        const y = SIGNATURE_HEIGHT / 2 - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        setSignatureUrl(canvas.toDataURL("image/png"));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password && password !== confirmPassword) {
      setError("رمزهای عبور مطابقت ندارند.");
      return;
    }
    if (user) {
      userStore.updateUser({
        ...user,
        name,
        username,
        signatureUrl,
        password: password || undefined,
      });
    }

    uiStore.closeModal("editProfile");
  };
  // onSubmit(user.id, name, username, password || undefined, signatureUrl);
  // onClose();
  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("editProfile")}
      title="ویرایش پروفایل"
    >
      {/* <Modal isOpen={isOpen} onClose={onClose} title="ویرایش پروفایل"> */}
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-sm font-medium text-brand-text"
          >
            نام کامل
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="profile-username"
            className="block text-sm font-medium text-brand-text"
          >
            نام کاربری
          </label>
          <input
            id="profile-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          />
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-brand-subtext mb-2">
            برای تغییر رمز عبور، فیلدهای زیر را پر کنید. در غیر این صورت، خالی
            بگذارید.
          </p>
          <div>
            <label
              htmlFor="profile-password"
              className="block text-sm font-medium text-brand-text"
            >
              رمز عبور جدید
            </label>
            <input
              id="profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="profile-confirm-password"
              className="block text-sm font-medium text-brand-text"
            >
              تکرار رمز عبور جدید
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-brand-text">
            امضا
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex justify-center items-center w-full h-28 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-primary bg-gray-50"
          >
            {signatureUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={signatureUrl}
                  alt="User signature"
                  style={{ width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT }}
                  className="max-w-full h-auto border bg-white"
                />
                <span className="mt-2 text-xs text-brand-primary font-semibold">
                  تغییر امضا
                </span>
              </div>
            ) : (
              <div className="text-center text-brand-subtext">
                <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm">برای آپلود امضا کلیک کنید</p>
                <p className="text-xs">
                  سایز استاندارد: {SIGNATURE_WIDTH}x{SIGNATURE_HEIGHT} پیکسل
                </p>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </Modal>
  );
});

export default EditProfileModal;
