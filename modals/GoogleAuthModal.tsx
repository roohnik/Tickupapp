import React from "react";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { UserIcon } from "../components/Icons";

// interface GoogleAuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelectAccount: (email: string, name: string) => void;
// }
const GoogleAuthModal: React.FC = observer(() => {
  const { uiStore, userStore } = useStore();
  const isOpen = uiStore.isOpen("googleAuth");

  const mockAccounts = [
    {
      email: "sara.p@example.com",
      name: "سارا پرویزی",
      avatar: "https://i.pravatar.cc/150?u=sara",
    },
    {
      email: "ali.m@example.com",
      name: "علی محمدی",
      avatar: "https://i.pravatar.cc/150?u=ali",
    },
  ];

  const GoogleIcon: React.FC = () => (
    <svg viewBox="0 0 48 48" className="w-6 h-6">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      ></path>
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.011 35.636 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"
      ></path>
    </svg>
  );
  const handleSelect = (email: string, name: string) => {
    userStore.selectGoogleAccount(email, name);
    uiStore.closeModal("googleAuth");
  };

  if (!isOpen) return null;

  // const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSelectAccount }) => {
  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("googleAuth")}
      title=""
    >
      <div className="flex flex-col items-center text-center p-4">
        <GoogleIcon />
        <h2 className="text-2xl font-semibold mt-4 text-brand-text">
          یک حساب را انتخاب کنید
        </h2>
        <p className="text-brand-subtext mt-2">برای ادامه به tickup</p>

        <div className="w-full mt-8 border-t">
          {mockAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => onSelectAccount(account.email, account.name)}
              className="w-full flex items-center text-right p-3 border-b hover:bg-gray-100 transition-colors"
            >
              <img
                src={account.avatar}
                alt={account.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="mr-4">
                <p className="font-semibold text-brand-text">{account.name}</p>
                <p className="text-sm text-brand-subtext">{account.email}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() =>
              onSelectAccount(
                `new.user.${Math.floor(Math.random() * 1000)}@example.com`,
                "کاربر جدید"
              )
            }
            className="w-full flex items-center text-right p-3 border-b hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="mr-4">
              <p className="font-semibold text-brand-text">
                استفاده از یک حساب دیگر
              </p>
            </div>
          </button>
        </div>

        <p className="text-xs text-brand-subtext mt-8">
          برای ادامه، گوگل نام، آدرس ایمیل و عکس پروفایل شما را با tickup به
          اشتراک خواهد گذاشت.
        </p>
      </div>
    </Modal>
  );
});

export default GoogleAuthModal;
