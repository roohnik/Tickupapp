import React, { useState } from "react";
import { MicroLearning, QuizQuestion } from "../types";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { SparklesIcon } from "../components/Icons";
import {
  generateMicroLearning,
  generateQuizForText,
  AIPrompts,
} from "../services/geminiService";

type GenerationState = "idle" | "generating_text" | "generating_quiz" | "done";

// const CreateMicroLearningModal: React.FC<CreateMicroLearningModalProps> = ({ isOpen, onClose, onSubmit, aiPrompts }) => {
const CreateMicroLearningModal: React.FC = observer(() => {
  const { uiStore, learningStore, settingsStore } = useStore();
  const isOpen = uiStore.isOpen("createMicroLearning");
  const aiPrompts = settingsStore.aiPrompts;

  const [topic, setTopic] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState("");

  const handleGenerateText = async () => {
    if (!topic.trim()) {
      setError("لطفا یک موضوع وارد کنید.");
      return;
    }
    setError("");
    setState("generating_text");
    try {
      const text = await generateMicroLearning(
        topic,
        aiPrompts.generateMicroLearning
      );
      setGeneratedText(text);
      setState("idle");
    } catch (err) {
      setError("خطا در تولید محتوا. لطفا دوباره تلاش کنید.");
      setState("idle");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!generatedText) return;
    setState("generating_quiz");
    setError("");
    try {
      const quizData = await generateQuizForText(
        generatedText,
        aiPrompts.generateQuizForText
      );
      setQuiz(quizData);
      setState("done");
    } catch (err) {
      setError("خطا در تولید کوئیز. لطفا دوباره تلاش کنید.");
      setState("idle");
    }
  };

  const handleSave = () => {
    if (!topic || !generatedText) return;
    learningStore.submitMicroLearning({ topic, generatedText, quiz });
    uiStore.closeModal("createMicroLearning");
  };

  if (!isOpen) return null;

  const resetState = () => {
    setTopic("");
    setGeneratedText("");
    setQuiz([]);
    setState("idle");
    setError("");
  };

  const handleClose = () => {
    resetState();
    uiStore.closeModal("closing Modal");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ایجاد دوره آموزشی با هوش مصنوعی"
      size="2xl"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-brand-text"
          >
            موضوع
          </label>
          <div className="flex items-center space-x-2 space-x-reverse mt-1">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: اصول ارائه بازخورد موثر"
              className="input-style flex-grow"
              disabled={state !== "idle" || !!generatedText}
            />
            {!generatedText && (
              <button
                onClick={handleGenerateText}
                disabled={state === "generating_text"}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center disabled:bg-purple-300 w-32"
              >
                {state === "generating_text" ? (
                  "در حال تولید..."
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 ml-2" /> تولید محتوا
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {generatedText && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-brand-text">محتوای تولید شده:</h3>
            <div
              className="prose prose-sm max-w-none p-4 border rounded-lg bg-gray-50/70 max-h-60 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: generatedText.replace(/\n/g, "<br/>"),
              }}
            ></div>

            {quiz.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-brand-text">
                  کوئیز تولید شده:
                </h3>
                {quiz.map((q, i) => (
                  <div
                    key={i}
                    className="text-sm p-3 border rounded-lg bg-gray-50/70"
                  >
                    <p className="font-semibold">
                      {i + 1}. {q.questionText}
                    </p>
                    <ul className="mt-2 space-y-1 pr-4">
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={`${
                            j === q.correctAnswerIndex
                              ? "font-semibold text-green-700"
                              : ""
                          }`}
                        >
                          - {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={handleGenerateQuiz}
                disabled={state === "generating_quiz"}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center disabled:bg-purple-300 w-32"
              >
                {state === "generating_quiz" ? (
                  "در حال تولید..."
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 ml-2" /> تولید کوئیز
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 space-x-2 space-x-reverse border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold text-sm"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!generatedText || state !== "done"}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 font-semibold text-sm disabled:bg-gray-300"
          >
            ذخیره
          </button>
        </div>
      </div>
    </Modal>
  );
});

export default CreateMicroLearningModal;
