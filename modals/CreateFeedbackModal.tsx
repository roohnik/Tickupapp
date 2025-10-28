import React, { useState, useEffect } from "react";
import {
  User,
  FeedbackTag,
  LearningResourceType,
  MicroLearning,
  YouTubeVideo,
  Book,
  StyleSettings,
  GeneralFeedback,
  FeedbackCategory,
  Task,
  Form,
} from "../types";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { ICONS, ArrowLeftIcon } from "../components/Icons";
import LearningResourceSelectorModal from "../components/LearningResourceSelectorModal";

// interface CreateFeedbackModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   users: User[];
//   feedbackTags: FeedbackTag[];
//   onSubmit: (data: Omit<GeneralFeedback, 'id' | 'giverId' | 'createdAt'>) => void;
//   styleSettings: StyleSettings;
//   tasks: Task[];
//   forms: Form[];
// }

const CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  Icon: React.FC<any>;
}[] = [
  { id: "TASKS", label: "وظایف", Icon: ICONS.ClipboardListIcon },
  { id: "PROCESSES", label: "فرایندها", Icon: ICONS.CubeIcon },
  { id: "OBJECTIVES", label: "اهداف", Icon: ICONS.GoalIcon },
  { id: "STRATEGIES", label: "استراتژی‌ها", Icon: ICONS.RocketIcon },
];

// const CreateFeedbackModal: React.FC<CreateFeedbackModalProps> = ({ isOpen, onClose, users, feedbackTags, onSubmit, styleSettings, tasks, forms }) => {
const CreateFeedbackModal: React.FC = observer(() => {
  const { uiStore, feedbackStore, userStore, taskStore, formStore } =
    useStore();
  const isOpen = uiStore.isOpen("createFeedback");

  const users = userStore.users;
  const feedbackTags = feedbackStore.feedbackTags;
  const tasks = taskStore.tasks;
  const forms = formStore.forms;

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [receiverId, setReceiverId] = useState("");
  const [comment, setComment] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [attachedTaskIds, setAttachedTaskIds] = useState<string[]>([]);
  const [attachedFormIds, setAttachedFormIds] = useState<string[]>([]);

  // Not in props, so assuming it should be an empty object or not used.
  // Based on `components/CreateFeedbackModal.tsx` errors, it seems some code is missing from the prompt.
  // I'll assume `resources` is an empty object if it's not passed, to avoid further errors.
  const resources = { microLearnings: [], youtubeVideos: [], books: [] };
  const [suggestedResource, setSuggestedResource] = useState<{
    id: string;
    type: LearningResourceType;
    title: string;
  } | null>(null);

  const resetState = () => {
    setStep(1);
    setCategory(null);
    setReceiverId("");
    setComment("");
    setSelectedTagIds([]);
    setAttachedTaskIds([]);
    setAttachedFormIds([]);
    setSuggestedResource(null);
  };

  const handleClose = () => {
    resetState();
    uiStore.closeModal("closing Feedback");
  };

  const handleNext = () => {
    if (category && receiverId) {
      setStep(2);
    }
  };

  // const handleSubmit = () => {
  //     if (!category || !receiverId || !comment.trim() || selectedTagIds.length === 0) {
  //         alert('لطفا تمام فیلدها را تکمیل کنید.');
  //         return;
  //     }
  //     onSubmit({ category, receiverId, comment, tagIds: selectedTagIds, attachedTaskIds, attachedFormIds });
  //     handleClose();
  // };
  const handleSubmit = () => {
    feedbackStore.submitFeedback({
      category,
      receiverId,
      comment,
      tagIds: selectedTagIds,
      attachedTaskIds,
      attachedFormIds,
    });
    uiStore.closeModal("createFeedback");
  };

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    // <Modal isOpen={isOpen} onClose={handleClose} title="" size="2xl">
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="2xl">
      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              ایجاد بازخورد جدید
            </h2>
            <p className="text-gray-600 mt-2">
              برای شروع، دسته و گیرنده بازخورد را مشخص کنید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">دسته بازخورد</h3>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    category === cat.id
                      ? "border-brand-primary bg-blue-50"
                      : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                  }`}
                >
                  <cat.Icon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-2">گیرنده بازخورد</h3>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="input-style w-full"
            >
              <option value="">انتخاب کنید...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={!category || !receiverId}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-300"
            >
              مرحله بعد
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">ثبت بازخورد</h2>
            <p className="text-gray-600 mt-2">
              نظر خود را بنویسید و برچسب‌های مرتبط را انتخاب کنید.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">برچسب بازخورد</h3>
            <div className="flex flex-wrap gap-3">
              {feedbackTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                const Icon = ICONS[tag.icon];
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-3 py-1.5 rounded-full border-2 font-medium transition-colors text-sm ${
                      isSelected
                        ? "border-transparent text-white"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-2">متن بازخورد</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="input-style w-full"
              placeholder="بازخورد خود را اینجا بنویسید..."
            />
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-2">
              پیوست کردن تسک یا فرم (اختیاری)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  تسک‌ها
                </label>
                <select
                  multiple
                  value={attachedTaskIds}
                  onChange={(e) => {
                    const selectedIds = Array.from(
                      e.target.selectedOptions,
                      (opt: HTMLOptionElement) => opt.value
                    );
                    setAttachedTaskIds(selectedIds);
                    // Suggest learning based on task
                    if (selectedIds.length === 1) {
                      const task = tasks.find((t) => t.id === selectedIds[0]);
                      if (
                        task &&
                        task.content.toLowerCase().includes("قرارداد")
                      ) {
                        const contractResource = resources.microLearnings.find(
                          (r) => r.topic.includes("قرارداد")
                        );
                        if (contractResource) {
                          setSuggestedResource({
                            id: contractResource.id,
                            type: LearningResourceType.MICRO_LEARNING,
                            title: contractResource.topic,
                          });
                        }
                      }
                    } else {
                      setSuggestedResource(null);
                    }
                  }}
                  className="input-style h-24 mt-1"
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.content}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  فرم‌ها
                </label>
                <select
                  multiple
                  value={attachedFormIds}
                  onChange={(e) => {
                    const selectedIds = Array.from(
                      e.target.selectedOptions,
                      (opt: HTMLOptionElement) => opt.value
                    );
                    setAttachedFormIds(selectedIds);
                    // Suggest learning based on form
                    if (selectedIds.length === 1) {
                      const form = forms.find((f) => f.id === selectedIds[0]);
                    }
                  }}
                  className="input-style h-24 mt-1"
                >
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"
            >
              بازگشت
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105"
            >
              ثبت نهایی
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
});

export default CreateFeedbackModal;
