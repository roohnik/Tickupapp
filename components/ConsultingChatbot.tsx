import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SparklesIcon, ArrowRightIcon, UserIcon, PaperAirplaneIcon } from './Icons';

// Define Consultant types
interface Consultant {
  id: string;
  name: string;
  specialty: string;
  color: string; // Hex color
  systemInstruction: string;
}

// New AIAvatar component
const AIAvatar: React.FC<{ consultant: Consultant; sizeClass: string; className?: string }> = ({ consultant, sizeClass, className }) => {
    return (
        <div className={`rounded-full flex-shrink-0 flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: consultant.color, border: '2px solid rgba(255,255,255,0.5)' }}>
            <SparklesIcon className="w-3/5 h-3/5 text-white" />
        </div>
    );
};


// Define Consultants
const CONSULTANTS: Consultant[] = [
    {
        id: 'legal',
        name: 'مشاور حقوقی',
        specialty: 'مسائل قانونی و قراردادها',
        color: '#3b82f6', // blue-500
        systemInstruction: 'شما یک مشاور حقوقی متخصص در حقوق تجارت، قراردادها و مالکیت معنوی هستید. مشاوره حقوقی واضح، مختصر و مفیدی ارائه دهید. همیشه یک سلب مسئولیت اضافه کنید که شما یک هوش مصنوعی هستید و این جایگزین مشاوره حقوقی حرفه‌ای نیست.'
    },
    {
        id: 'dev',
        name: 'مربی توسعه فردی',
        specialty: 'رشد شخصی و شغلی',
        color: '#8b5cf6', // purple-500
        systemInstruction: 'شما یک مربی توسعه فردی حمایتگر و فهیم هستید. به کاربران کمک کنید تا اهداف خود را تعیین کنند، بر چالش‌ها غلبه کنند و عادات بهتری بسازند. از لحنی مثبت و دلگرم‌کننده استفاده کنید.'
    },
    {
        id: 'finance',
        name: 'مشاور مالی',
        specialty: 'بودجه‌بندی و سرمایه‌گذاری',
        color: '#22c55e', // green-500
        systemInstruction: 'شما یک مشاور مالی برای کسب‌وکارهای کوچک و افراد هستید. در مورد بودجه‌بندی، برنامه‌ریزی مالی و استراتژی‌های سرمایه‌گذاری مشاوره دهید. یک سلب مسئولیت اضافه کنید که شما یک هوش مصنوعی هستید و یک برنامه‌ریز مالی معتبر نیستید.'
    },
    {
        id: 'marketing',
        name: 'استراتژیست بازاریابی',
        specialty: 'رشد و جذب مشتری',
        color: '#f97316', // orange-500
        systemInstruction: 'شما یک استراتژیست بازاریابی خلاق و داده‌محور هستید. به کاربران کمک کنید تا کمپین‌های بازاریابی را توسعه دهند، مخاطبان هدف خود را درک کنند و حضور برند خود را بهبود بخشند.'
    }
];

// Message type
interface Message {
    role: 'user' | 'model';
    text: string;
}

const ConsultingChatbot: React.FC = () => {
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConsultant = (consultant: Consultant) => {
        setSelectedConsultant(consultant);
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: consultant.systemInstruction,
            },
        });
        setChat(newChat);
        setMessages([{ role: 'model', text: `سلام! من ${consultant.name} هستم. چطور می‌توانم به شما کمک کنم؟` }]);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userMessage.text });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: 'model', text: "متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBack = () => {
        setSelectedConsultant(null);
        setChat(null);
        setMessages([]);
    }

    if (!selectedConsultant) {
        return (
            <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-brand-text mb-2">انتخاب مشاور</h2>
                <p className="text-brand-subtext mb-6">با یکی از مشاوران متخصص ما گفتگو کنید تا راهنمایی‌های لازم را دریافت کنید.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CONSULTANTS.map(c => (
                        <button key={c.id} onClick={() => handleSelectConsultant(c)} className="text-right p-4 border rounded-xl hover:shadow-lg hover:border-blue-300 transition-all flex items-center space-x-4 space-x-reverse">
                            <AIAvatar consultant={c} sizeClass="w-16 h-16" />
                            <div>
                                <h3 className="font-semibold text-brand-text">{c.name}</h3>
                                <p className="text-sm text-brand-subtext">{c.specialty}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-230px)] bg-white border rounded-xl shadow-sm animate-fade-in">
            <div className="flex-shrink-0 p-3 border-b flex items-center">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
                <AIAvatar consultant={selectedConsultant} sizeClass="w-10 h-10" className="mr-3" />
                <div>
                    <h3 className="font-semibold">{selectedConsultant.name}</h3>
                    <p className="text-xs text-gray-500">{selectedConsultant.specialty}</p>
                </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <AIAvatar consultant={selectedConsultant} sizeClass="w-6 h-6" />}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <UserIcon className="w-6 h-6 rounded-full bg-gray-200 p-1 text-gray-600 self-start" />}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <AIAvatar consultant={selectedConsultant} sizeClass="w-6 h-6" />
                        <div className="max-w-xs p-3 rounded-lg bg-gray-100 text-gray-800">
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

            <div className="flex-shrink-0 p-3 border-t">
                <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 rounded-lg pr-4">
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
                        className="flex-grow bg-transparent border-none focus:ring-0 p-2 text-sm resize-none"
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="p-3 text-white bg-blue-500 rounded-lg m-1 disabled:bg-blue-300">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsultingChatbot;