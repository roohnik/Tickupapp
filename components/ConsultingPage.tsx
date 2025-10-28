import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SparklesIcon, ArrowRightIcon, UserIcon, PaperAirplaneIcon } from './Icons';
import { Consultant } from '../types';

// New AIAvatar component
const AIAvatar: React.FC<{ consultant: Consultant; sizeClass: string; className?: string }> = ({ consultant, sizeClass, className }) => {
    return (
        <div className={`rounded-full flex-shrink-0 flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: consultant.color, border: '2px solid rgba(255,255,255,0.5)' }}>
            <SparklesIcon className="w-3/5 h-3/5 text-white" />
        </div>
    );
};

// Message type
interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ConsultingPageProps {
  consultant: Consultant;
  onBack: () => void;
}

const ConsultingPage: React.FC<ConsultingPageProps> = ({ consultant, onBack }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: consultant.systemInstruction,
            },
        });
        setChat(newChat);
        setMessages([{ role: 'model', text: `سلام! من ${consultant.name} هستم. چطور می‌توانم به شما کمک کنم؟` }]);
    }, [consultant]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
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
    
    return (
        <div className="flex flex-col h-full bg-white border rounded-xl shadow-sm animate-fade-in">
            <div className="flex-shrink-0 p-3 border-b flex items-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
                <AIAvatar consultant={consultant} sizeClass="w-10 h-10" className="mr-3" />
                <div>
                    <h3 className="font-semibold">{consultant.name}</h3>
                    <p className="text-xs text-gray-500">{consultant.specialty}</p>
                </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <AIAvatar consultant={consultant} sizeClass="w-6 h-6" />}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <UserIcon className="w-6 h-6 rounded-full bg-gray-200 p-1 text-gray-600 self-start" />}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <AIAvatar consultant={consultant} sizeClass="w-6 h-6" />
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

export default ConsultingPage;