import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// FIX: Added KeyResult to imports to resolve name not found error.
import { Form, AIDisplayContentType, Task, Project, Objective, User, KanbanColumn, WORKFLOW_STATES, Strategy, CompanyVision, ObjectiveCategoryId, SuggestedPerspective, SuggestedObjectiveWithKRs, SuggestedKR, KRType, KRCategory, KeyResult } from '../types';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from '@google/genai';
import { SparklesIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, CloseIcon, PlusIcon, PaperAirplaneIcon, UserIcon, ICONS, GoalIcon, ClipboardListIcon, DocumentTextIcon, ViewColumnsIcon, Bars3Icon, TrashIcon, PencilIcon, CheckCircleIcon, ChevronDownIcon } from './Icons';
import { AIPrompts, generateSmartObjectives } from '../services/geminiService';
import { OBJECTIVE_CATEGORY_LIST } from '../constants';
import StarRating from './StarRating';

// =================================================================
// 1. TYPES
// =================================================================
type FlowType = 'smart-objective';
interface ActiveFlow {
  type: FlowType;
  step: number;
  data: any;
}

type MessagePart = {
    type: 'text';
    content: string;
} | {
    type: 'item';
    itemType: 'task' | 'objective' | 'form';
    itemId: string;
    title: string;
} | {
    type: 'interactive-component';
    component: 'strategy-selector' | 'topic-rater' | 'dimension-sliders' | 'perspective-results';
    data: any;
    isCompleted: boolean;
};

interface Message {
    id: string;
    role: 'user' | 'model';
    parts: MessagePart[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  chat: Chat;
}

interface AIChatPanelProps {
    viewMode: 'sidebar' | 'fullscreen';
    onClose: () => void;
    onToggleFullscreen: () => void;
    tasks: Task[];
    projects: Project[];
    objectives: Objective[];
    users: User[];
    columns: KanbanColumn[];
    handleAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist'>) => void;
    onSelectTask: (taskId: string | null) => void;
    onSelectObjective: (objective: Objective | null) => void;
    strategies: Strategy[];
    companyVision: CompanyVision;
    aiPrompts: AIPrompts;
    onAddObjective: (objectiveData: Omit<Objective, 'id' | 'keyResults'>, keyResultsData: Omit<KeyResult, 'id'>[]) => Objective;
}

// =================================================================
// 2. HELPER COMPONENTS & FUNCTIONS
// =================================================================

const AIAvatar: React.FC<{ sizeClass: string }> = ({ sizeClass }) => (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 ${sizeClass}`}>
        <SparklesIcon className="w-3/5 h-3/5 text-white" />
    </div>
);

const parseResponse = (text: string): MessagePart[] => {
    const parts: MessagePart[] = [];
    const regex = /\[(task|objective|form):([^\]]+?)\]\((.+?)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
        }
        parts.push({
            type: 'item',
            itemType: match[1] as 'task' | 'objective' | 'form',
            itemId: match[2],
            title: match[3],
        });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
};

const createTaskFunctionDeclaration: FunctionDeclaration = {
  name: 'createTask',
  description: 'Creates a new task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: 'The title or content of the task.' },
      projectId: { type: Type.STRING, description: 'The ID of the project this task belongs to. If not provided, ask the user.' },
      assigneeId: { type: Type.STRING, description: 'The ID of the user assigned to this task. If not provided, ask the user.' },
      dueDate: { type: Type.STRING, description: 'The due date in ISO format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ). Optional.' },
    },
    required: ['content'],
  },
};

const startObjectiveWizardFunctionDeclaration: FunctionDeclaration = {
  name: 'startObjectiveWizard',
  description: 'Starts the smart objective design wizard to help the user create strategic goals and key results. Call this when the user wants to "design a smart objective", "create a strategic goal", or "طراحی هدف".',
  parameters: { type: Type.OBJECT, properties: {} },
};

function convertMessagesToHistory(messages: Message[]): any[] {
  return messages.slice(1).map(msg => {
    const combinedText = msg.parts.map(part => {
      if (part.type === 'text') return part.content;
      if (part.type === 'item') return `[${part.itemType}:${part.itemId}](${part.title})`;
      return ''; 
    }).join('');
    return {
      role: msg.role,
      parts: [{ text: combinedText }]
    };
  });
}

// =================================================================
// 3. INTERACTIVE FLOW COMPONENTS
// =================================================================

const StrategySelectorComponent: React.FC<{ strategies: Strategy[]; onComplete: (selectedIds: string[]) => void; disabled: boolean }> = ({ strategies, onComplete, disabled }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    return (
        <div className="p-3 bg-white border rounded-lg space-y-3">
            {strategies.filter(s => !s.isArchived).map(strategy => (
                <label key={strategy.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                    <input type="checkbox" checked={selectedIds.includes(strategy.id)} onChange={() => setSelectedIds(p => p.includes(strategy.id) ? p.filter(id => id !== strategy.id) : [...p, strategy.id])} disabled={disabled} className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3" />
                    <span>{strategy.name}</span>
                </label>
            ))}
            {!disabled && <button onClick={() => onComplete(selectedIds)} className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md">ادامه</button>}
        </div>
    );
};

const TopicRaterComponent: React.FC<{ onComplete: (ratings: Map<ObjectiveCategoryId, number>) => void; disabled: boolean }> = ({ onComplete, disabled }) => {
    const [ratings, setRatings] = useState<Map<ObjectiveCategoryId, number>>(new Map());
    return (
        <div className="p-3 bg-white border rounded-lg space-y-3">
            {OBJECTIVE_CATEGORY_LIST.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-2">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <StarRating rating={ratings.get(cat.id) || 0} setRating={disabled ? undefined : (r) => setRatings(p => new Map(p.set(cat.id, r)))} size="w-5 h-5" />
                </div>
            ))}
            {!disabled && <button onClick={() => onComplete(ratings)} className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md">ادامه</button>}
        </div>
    );
};

const DimensionSlidersComponent: React.FC<{ onComplete: (dims: any) => void; disabled: boolean }> = ({ onComplete, disabled }) => {
    const [dimensions, setDimensions] = useState({ ambition: 50, focus: 50, horizon: 50, certainty: 50 });
    const DimensionSlider: React.FC<{ label: string, value: number, onChange: (v: number) => void }> = ({ label, value, onChange }) => (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input type="range" min="1" max="100" value={value} onChange={e => onChange(parseInt(e.target.value))} disabled={disabled} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1" />
        </div>
    );
    return (
        <div className="p-3 bg-white border rounded-lg space-y-4">
            <DimensionSlider label="سطح جاه‌طلبی (بهینه‌سازی/تحول)" value={dimensions.ambition} onChange={v => setDimensions(d => ({...d, ambition: v}))} />
            <DimensionSlider label="تمرکز (داخلی/خارجی)" value={dimensions.focus} onChange={v => setDimensions(d => ({...d, focus: v}))} />
            <DimensionSlider label="افق زمانی (کوتاه‌مدت/بلندمدت)" value={dimensions.horizon} onChange={v => setDimensions(d => ({...d, horizon: v}))} />
            <DimensionSlider label="میزان قطعیت (اکتشافی/اجرایی)" value={dimensions.certainty} onChange={v => setDimensions(d => ({...d, certainty: v}))} />
            {!disabled && <button onClick={() => onComplete(dimensions)} className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white text-sm font-semibold rounded-md">دریافت پیشنهادات</button>}
        </div>
    );
};

const PerspectiveResultsComponent: React.FC<{ perspectives: SuggestedPerspective[]; onSelectObjective: (obj: SuggestedObjectiveWithKRs, krs: SuggestedKR[]) => void; }> = ({ perspectives, onSelectObjective }) => {
    const [finalSelection, setFinalSelection] = useState<{ objective: SuggestedObjectiveWithKRs; keyResults: Map<string, SuggestedKR> } | null>(null);

    if (!perspectives || perspectives.length === 0) {
        return <div className="p-3 bg-white border rounded-lg"><p className="text-sm text-center text-gray-500">متاسفانه پیشنهادی یافت نشد. لطفا دوباره تلاش کنید.</p></div>;
    }

    const handleSelectObjective = (obj: SuggestedObjectiveWithKRs) => {
        const initialKRs = new Map<string, SuggestedKR>();
        obj.keyResults.forEach(kr => initialKRs.set(kr.title, kr));
        setFinalSelection({ objective: obj, keyResults: initialKRs });
    };

    const handleToggleKR = (kr: SuggestedKR) => {
        if (!finalSelection) return;
        const newKRs = new Map(finalSelection.keyResults);
        if (newKRs.has(kr.title)) newKRs.delete(kr.title);
        else newKRs.set(kr.title, kr);
        setFinalSelection({ ...finalSelection, keyResults: newKRs });
    };

    const handleFinalSubmit = () => {
        if (!finalSelection) return;
        onSelectObjective(finalSelection.objective, Array.from(finalSelection.keyResults.values()));
    };

    return (
        <div className="p-3 bg-transparent space-y-4">
            {perspectives.map((p, pIndex) => (
                <div key={pIndex} className="bg-white border rounded-lg p-3">
                    <h4 className="font-bold">{p.perspectiveTitle}</h4>
                    <p className="text-xs text-gray-500 mb-2">{p.perspectiveDescription}</p>
                    <div className="space-y-2">
                        {p.objectives.map((obj, oIndex) => {
                            const isSelected = finalSelection?.objective === obj;
                            return (
                                <div key={oIndex} className={`p-2 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <h5 className="font-semibold text-sm">{obj.objectiveTitle}</h5>
                                        {!isSelected && <button onClick={() => handleSelectObjective(obj)} className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500 text-white">انتخاب</button>}
                                    </div>
                                    {isSelected && (
                                        <div className="mt-2 pt-2 border-t space-y-1">
                                            <h5 className="text-xs font-semibold">نتایج کلیدی پیشنهادی (برای اضافه کردن انتخاب کنید):</h5>
                                            {obj.keyResults.map(kr => (
                                                <label key={kr.title} className="flex items-center text-xs p-1 cursor-pointer">
                                                    <input type="checkbox" checked={finalSelection.keyResults.has(kr.title)} onChange={() => handleToggleKR(kr)} className="w-3 h-3 ml-2"/>
                                                    <span>{kr.title} ({kr.startValue} &rarr; {kr.targetValue})</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {finalSelection && (
                <div className="mt-4 text-center">
                    <button onClick={handleFinalSubmit} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg">ایجاد این هدف</button>
                </div>
            )}
        </div>
    );
};


// =================================================================
// 4. MAIN COMPONENT
// =================================================================

const AIChatPanel: React.FC<AIChatPanelProps> = (props) => {
    const { viewMode, onClose, onToggleFullscreen, tasks, projects, objectives, users, columns, handleAddTask, onSelectTask, onSelectObjective, strategies, companyVision, aiPrompts, onAddObjective } = props;
    
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [activeFlow, setActiveFlow] = useState<ActiveFlow | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeSession = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId);
    }, [sessions, activeSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages, isLoading, activeFlow]);

    const getSystemInstruction = useCallback(() => {
        const projectContext = projects.map(p => `- Project: ${p.name} (ID: ${p.id})`).join('\n');
        const userContext = users.map(u => `- User: ${u.name} (ID: ${u.id})`).join('\n');
        return `You are a helpful and creative assistant for an OKR and project management application. Your responses should be in Persian.
When you reference a task, objective, or form that exists in the system, you MUST use the format [type:ID](Title). For example: [task:t-hotel-5](نهایی کردن طرح رنگ). Valid types are "task", "objective", and "form". Do not use this format for anything else.
You have the ability to create tasks. When a user asks to create a task, ask for any missing information (content, project, assignee) before calling the function. You must have at least content. If project or assignee are missing, you can ask, but you can also choose a default if it makes sense.
You can also launch special wizards for users. If a user wants to 'design a smart objective', 'create a strategic goal', or 'design an OKR', call the 'startObjectiveWizard' function.
If a user mentions "mission", "purpose", "ikigai", "ماموریت", "هدف غایی", or "ایکگای", do NOT call a function. Instead, guide them by saying: "برای تعریف ماموریت، می‌توانید از بخش 'ماموریت' در منوی اصلی استفاده کنید که ابزار ایکیگای را در اختیار شما قرار می‌دهد."
Available projects:\n${projectContext}\nAvailable users:\n${userContext}`;
    }, [projects, users]);

    const generateAndSetChatTitle = useCallback(async (sessionId: string, messagesForTitle: Message[]) => {
        if (messagesForTitle.length < 2) return;

        const conversationHistory = messagesForTitle.map(msg => {
            const text = msg.parts.map(p => {
                if (p.type === 'text') return p.content;
                if (p.type === 'item') return `[${p.title}]`;
                return ''; 
            }).join('');
            return `${msg.role === 'user' ? 'User' : 'AI'}: ${text}`;
        }).join('\n');

        const prompt = `Based on the following conversation, suggest a short, clear, and concise title in Persian (maximum 5 words). Do not add quotation marks or any other formatting.
---
CONVERSATION:
${conversationHistory}
---
TITLE:`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const newTitle = response.text.trim().replace(/"/g, '');

            if (newTitle) {
                setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
            }
        } catch (error) {
            console.error("Failed to generate chat title:", error);
        }
    }, []);

    const handleNewChat = useCallback(() => {
        try {
            if (!process.env.API_KEY) throw new Error("API key not set");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: getSystemInstruction(),
                    tools: [{ functionDeclarations: [createTaskFunctionDeclaration, startObjectiveWizardFunctionDeclaration] }],
                },
            });

            const newSessionId = `session-${Date.now()}`;
            const newSession: ChatSession = {
                id: newSessionId,
                title: "چت جدید",
                messages: [{ id: `msg-${Date.now()}`, role: 'model', parts: [{ type: 'text', content: 'سلام! من دستیار هوشمند شما هستم. چطور می‌توانم در خلق کردن به شما کمک کنم؟' }] }],
                chat: newChatInstance,
            };

            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSessionId);
            setActiveFlow(null);
        } catch (e) {
            console.error("Failed to initialize new AI Chat session:", e);
            const errorSessionId = `session-error-${Date.now()}`;
            const errorSession: ChatSession = {
                id: errorSessionId,
                title: "خطای اتصال",
                messages: [{ id: `msg-err-${Date.now()}`, role: 'model', parts: [{ type: 'text', content: 'خطا در اتصال به دستیار هوشمند. لطفا از معتبر بودن کلید API خود اطمینان حاصل کنید.' }] }],
                chat: null as any,
            };
            setSessions([errorSession]);
            setActiveSessionId(errorSessionId);
        }
    }, [getSystemInstruction]);

    useEffect(() => {
        if (sessions.length === 0) {
            handleNewChat();
        }
    }, [sessions, handleNewChat]);

    const handleSelectSession = (sessionId: string) => {
        setActiveSessionId(sessionId);
        setActiveFlow(null);
    };

    const handleDeleteSession = (sessionId: string) => {
        const newSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(newSessions);

        if (activeSessionId === sessionId) {
            if (newSessions.length > 0) {
                setActiveSessionId(newSessions[0].id);
            } else {
                handleNewChat();
            }
            setActiveFlow(null);
        }
    };

    const handleSaveTitle = (sessionId: string, newTitle: string) => {
        const trimmedTitle = newTitle.trim();
        if (trimmedTitle) {
            setSessions(prev => prev.map(s =>
                s.id === sessionId ? { ...s, title: trimmedTitle } : s
            ));
        }
        setEditingSessionId(null);
    };
    
    const handleItemClick = (itemType: 'task' | 'objective' | 'form', itemId: string) => {
        if (itemType === 'task') {
            onSelectTask(itemId);
        } else if (itemType === 'objective') {
            const objective = objectives.find(o => o.id === itemId);
            if (objective) onSelectObjective(objective);
        }
    };

    const appendMessage = useCallback((sessionId: string, message: Message) => {
        setSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, messages: [...s.messages, message] } : s
        ));
    }, []);
    
    const handleFinalObjectiveSelection = (objective: SuggestedObjectiveWithKRs, keyResults: SuggestedKR[]) => {
        // FIX: Corrected category type to avoid 'unknown' error. The type of `activeFlow.data.topicRatings.keys()` was inferred as `unknown` due to an `any` type upstream. Added a type assertion to `ObjectiveCategoryId` as we know the type is correct from the surrounding logic.
        const categoryId = (activeFlow?.data.topicRatings instanceof Map && activeFlow.data.topicRatings.size > 0)
            ? (Array.from(activeFlow.data.topicRatings.keys())[0] as ObjectiveCategoryId)
            : 'BUSINESS_GROWTH';
    
        const objectiveData: Omit<Objective, 'id' | 'keyResults'> = {
            title: objective.objectiveTitle,
            description: objective.objectiveDescription,
            ownerId: users[0].id, // default owner
            category: categoryId,
            isArchived: false,
        };
        const keyResultsData = keyResults.map(kr => ({
            title: kr.title,
            type: kr.type,
            startValue: kr.startValue,
            targetValue: kr.targetValue,
            ownerId: users[0].id,
            // FIX: Resolved 'Cannot find name' error for KRCategory.
            category: KRCategory.Standard, // Default to standard
        }));

        const newObjective = onAddObjective(objectiveData, keyResultsData);
        
        // Confirm in chat
        const confirmationMessage: Message = {
            id: `msg-confirm-${Date.now()}`,
            role: 'model',
            parts: [
                { type: 'text', content: `عالی! هدف زیر با موفقیت برای شما ایجاد شد:` },
                { type: 'item', itemType: 'objective', itemId: newObjective.id, title: newObjective.title },
            ],
        };
        if (activeSessionId) {
            appendMessage(activeSessionId, confirmationMessage);
        }
        setActiveFlow(null); // End the flow
    };


    const handleFlowUpdate = useCallback(async (flowType: FlowType, step: number, data: any) => {
        if (!activeFlow || activeFlow.type !== flowType || activeFlow.step !== step || !activeSessionId) return;

        // 1. Mark current interactive component as completed
        setSessions(prev => prev.map(s => {
            if (s.id !== activeSessionId) return s;
            const newMessages = [...s.messages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
                const newParts = lastMessage.parts.map(p => 
                    p.type === 'interactive-component' ? { ...p, isCompleted: true } : p
                );
                newMessages[newMessages.length - 1] = { ...lastMessage, parts: newParts };
            }
            return { ...s, messages: newMessages };
        }));
        
        // 2. Update flow state and add next message
        let nextStepMessage: Message | null = null;
        const updatedFlowData = { ...activeFlow.data, ...data };
        
        switch (step) {
            case 1: // Strategy selection done
                setActiveFlow({ ...activeFlow, step: 2, data: updatedFlowData });
                nextStepMessage = { id: `msg-flow-${Date.now()}`, role: 'model', parts: [
                    { type: 'text', content: 'متشکرم. حالا به موضوعات زیر امتیاز دهید تا اولویت‌های خود را مشخص کنید (۱ کمترین، ۵ بیشترین).' },
                    { type: 'interactive-component', component: 'topic-rater', data: {}, isCompleted: false },
                ]};
                break;
            case 2: // Topic rating done
                setActiveFlow({ ...activeFlow, step: 3, data: updatedFlowData });
                nextStepMessage = { id: `msg-flow-${Date.now()}`, role: 'model', parts: [
                    { type: 'text', content: 'عالیست. در نهایت، با تنظیم این نوارها، به هوش مصنوعی کمک کنید تا ماهیت هدف شما را بهتر درک کند.' },
                    { type: 'interactive-component', component: 'dimension-sliders', data: {}, isCompleted: false },
                ]};
                break;
            case 3: // Dimension sliders done, time to generate
                setActiveFlow({ ...activeFlow, step: 4, data: updatedFlowData });
                setIsLoading(true);
                if (activeSessionId) appendMessage(activeSessionId, { id: `msg-loading-${Date.now()}`, role: 'model', parts: [] }); // Placeholder for loading
                try {
                    const results = await generateSmartObjectives({
                        ...updatedFlowData,
                        strategies: props.strategies,
                        companyVision: props.companyVision,
                        existingPerspectives: [],
                    }, props.aiPrompts.generateSmartObjectives);
                    
                    nextStepMessage = { id: `msg-flow-${Date.now()}`, role: 'model', parts: [
                        { type: 'text', content: 'بر اساس ورودی‌های شما، این زوایای دید و اهداف پیشنهاد می‌شوند. بهترین گزینه را انتخاب کنید.' },
                        { type: 'interactive-component', component: 'perspective-results', data: { perspectives: results }, isCompleted: false },
                    ]};
                } catch (e) {
                    console.error(e);
                    nextStepMessage = { id: `msg-err-${Date.now()}`, role: 'model', parts: [{ type: 'text', content: "خطا در دریافت پیشنهادات." }] };
                    setActiveFlow(null);
                } finally {
                    setIsLoading(false);
                }
                break;
        }
        
        if (nextStepMessage && activeSessionId) {
             // Remove placeholder loading message before adding the real one
             setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.filter(m => m.id !== `msg-loading-${Date.now()}`) } : s));
             appendMessage(activeSessionId, nextStepMessage);
        }
    }, [activeFlow, activeSessionId, appendMessage, props.strategies, props.companyVision, props.aiPrompts.generateSmartObjectives]);


    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim() || isLoading || !activeSessionId) return;

        const currentSession = sessions.find(s => s.id === activeSessionId);
        if (!currentSession || !currentSession.chat) {
            console.error("Active session or chat not found.");
            setIsLoading(false);
            return;
        }
        const currentChat = currentSession.chat;
    
        const userMessageText = userInput;
        const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', parts: [{ type: 'text', content: userMessageText }] };
    
        setUserInput('');
        setIsLoading(true);

        const isFirstUserMessage = currentSession.title === "چت جدید" && currentSession.messages.length === 1;
        
        appendMessage(activeSessionId, userMessage);
        
        if (isFirstUserMessage) {
            generateAndSetChatTitle(activeSessionId, [...currentSession.messages, userMessage]);
        }
        
        try {
            const response = await currentChat.sendMessage({ message: userMessageText });
    
            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                let toolResponsePayload;
    
                if (call.name === 'createTask') {
                    const { content, projectId, assigneeId, dueDate } = call.args;
                    handleAddTask({ content, projectId: projectId || projects[0]?.id, assigneeId: assigneeId || users[0]?.id, dueDate, columnId: columns[0]?.id || 'todo', status: WORKFLOW_STATES[0] });
                    toolResponsePayload = { result: `Task "${content}" created successfully.` };

                    const response2 = await currentChat.sendMessage({
                        message: [{ functionResponse: { name: call.name, response: toolResponsePayload } }]
                    });
                    const modelMessage: Message = { id: `msg-${Date.now()}`, role: 'model', parts: parseResponse(response2.text) };
                    appendMessage(activeSessionId, modelMessage);

                } else if (call.name === 'startObjectiveWizard') {
                    const newFlow: ActiveFlow = {
                        type: 'smart-objective',
                        step: 1,
                        data: { goalDescription: userMessageText },
                    };
                    setActiveFlow(newFlow);

                    const flowStartMessage: Message = {
                        id: `msg-${Date.now()}`,
                        role: 'model',
                        parts: [
                            { type: 'text', content: 'عالی! برای طراحی هدف هوشمند، لطفا استراتژی‌های اصلی مرتبط با این هدف را انتخاب کنید.' },
                            { type: 'interactive-component', component: 'strategy-selector', data: { strategies }, isCompleted: false },
                        ],
                    };
                    appendMessage(activeSessionId, flowStartMessage);
                }
    
            } else {
                const modelMessage: Message = { id: `msg-${Date.now()}`, role: 'model', parts: parseResponse(response.text) };
                appendMessage(activeSessionId, modelMessage);
            }
    
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { id: `msg-err-${Date.now()}`, role: 'model', parts: [{ type: 'text', content: "متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمد." }] };
            appendMessage(activeSessionId, errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, activeSessionId, sessions, columns, handleAddTask, projects, users, strategies, generateAndSetChatTitle, appendMessage, handleFlowUpdate, onAddObjective]);
    
    return (
        <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
            <div className="flex flex-col h-full w-full">
                <div className="flex-shrink-0 p-2 border-b dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-slate-200">
                            دستیار هوشمند
                        </h3>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsHistoryPanelOpen(prev => !prev)}
                            className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                            title="تاریخچه چت‌ها"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                        <div className="h-5 w-px bg-gray-200 dark:bg-slate-600 mx-1"></div>
                        {viewMode === 'sidebar' ? (
                            <button onClick={onToggleFullscreen} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full" title="تمام صفحه">
                                <ArrowsPointingOutIcon className="w-5 h-5" />
                            </button>
                        ) : (
                             <button onClick={onToggleFullscreen} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full" title="بازگشت به حالت کناری">
                                <ArrowsPointingInIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full" title="بستن">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    {activeSession?.messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <AIAvatar sizeClass="w-7 h-7" />}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 border dark:border-slate-600'}`}>
                                <div className="text-sm whitespace-pre-wrap space-y-2">
                                    {msg.parts.map((part, pIndex) => {
                                        if (part.type === 'text') {
                                            return <p key={pIndex}>{part.content}</p>;
                                        } else if (part.type === 'item'){
                                            const Icon = part.itemType === 'task' ? ClipboardListIcon : part.itemType === 'objective' ? GoalIcon : DocumentTextIcon;
                                            return (
                                                <button
                                                    key={pIndex}
                                                    onClick={() => handleItemClick(part.itemType, part.itemId)}
                                                    className="inline-flex items-center bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-lg my-1 mx-1 hover:bg-blue-200 transition-colors text-right"
                                                >
                                                    <Icon className="w-4 h-4 ml-2"/>
                                                    {part.title}
                                                </button>
                                            );
                                        } else if (part.type === 'interactive-component') {
                                            return (
                                                <div key={pIndex} className="mt-2">
                                                    {part.component === 'strategy-selector' && <StrategySelectorComponent strategies={props.strategies} onComplete={(selectedIds) => handleFlowUpdate('smart-objective', 1, { priorityStrategyIds: selectedIds })} disabled={part.isCompleted} />}
                                                    {part.component === 'topic-rater' && <TopicRaterComponent onComplete={(ratings) => handleFlowUpdate('smart-objective', 2, { topicRatings: ratings })} disabled={part.isCompleted} />}
                                                    {part.component === 'dimension-sliders' && <DimensionSlidersComponent onComplete={(dims) => handleFlowUpdate('smart-objective', 3, { dimensions: dims })} disabled={part.isCompleted} />}
                                                    {part.component === 'perspective-results' && <PerspectiveResultsComponent perspectives={part.data.perspectives} onSelectObjective={handleFinalObjectiveSelection} />}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                            {msg.role === 'user' && <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <AIAvatar sizeClass="w-7 h-7" />
                            <div className="max-w-md p-3 rounded-lg bg-white dark:bg-slate-700 border dark:border-slate-600">
                                <div className="flex items-center space-x-1 space-x-reverse">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 p-3 border-t dark:border-slate-700">
                    <div className="flex items-center space-x-2 space-x-reverse bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg pr-4">
                        <textarea 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="پیام خود را بنویسید..."
                            rows={1}
                            className="flex-grow bg-transparent border-none focus:ring-0 p-2 text-sm resize-none dark:text-slate-200 dark:placeholder-slate-400"
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="p-2 text-white bg-blue-600 rounded-md m-1 disabled:bg-blue-300">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* History Panel */}
            <div className={`absolute top-0 right-0 h-full w-60 bg-gray-100/95 dark:bg-slate-900/95 backdrop-blur-sm border-l dark:border-slate-700 transition-transform duration-300 ease-in-out transform ${isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}>
                <div className="p-3 border-b dark:border-slate-700">
                    <button onClick={handleNewChat} className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600">
                        <PlusIcon className="w-4 h-4 ml-2" />
                        چت جدید
                    </button>
                </div>
                <ul className="p-2 space-y-1 overflow-y-auto" style={{height: 'calc(100% - 65px)'}}>
                    {sessions.map(session => (
                        <li key={session.id}>
                            <div className="w-full rounded-md group/item flex justify-between items-center pr-2">
                               {editingSessionId === session.id ? (
                                    <input
                                        type="text"
                                        defaultValue={session.title}
                                        onBlur={(e) => handleSaveTitle(session.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveTitle(session.id, (e.target as HTMLInputElement).value);
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                        autoFocus
                                        className="flex-grow text-sm bg-white dark:bg-slate-800 border border-blue-500 rounded p-1"
                                    />
                               ) : (
                                    <button
                                        className={`flex-grow text-right p-2 rounded-md ${activeSessionId === session.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-slate-800'}`}
                                        onClick={() => handleSelectSession(session.id)}
                                    >
                                        <span className="text-sm truncate block">{session.title}</span>
                                    </button>
                               )}
                                <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingSessionId(session.id); }}
                                        className="text-gray-500 dark:text-slate-400 hover:text-blue-500 p-1"
                                        title="تغییر نام"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                        className="text-gray-500 dark:text-slate-400 hover:text-red-500 p-1"
                                        title="حذف چت"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AIChatPanel;