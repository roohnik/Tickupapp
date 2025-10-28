import React, { useState } from 'react';
import { MicroLearning, QuizQuestion } from '../types';
import Modal from './Modal';

interface MicroLearningViewerModalProps {
    isOpen: boolean;
    learning: MicroLearning | null;
    onClose: () => void;
}

const QuizView: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (questionIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setShowResults(true);
    };
    
    const score = answers.reduce((correct, answer, index) => {
        return answer === quiz[index].correctAnswerIndex ? correct + 1 : correct;
    }, 0);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">کوئیز</h3>
            {quiz.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-gray-50/70">
                    <p className="font-semibold">{qIndex + 1}. {q.questionText}</p>
                    <div className="mt-3 space-y-2">
                        {q.options.map((option, oIndex) => {
                            const isSelected = answers[qIndex] === oIndex;
                            let resultClass = '';
                            if (showResults) {
                                if (oIndex === q.correctAnswerIndex) {
                                    resultClass = 'bg-green-100 border-green-400';
                                } else if (isSelected) {
                                    resultClass = 'bg-red-100 border-red-400';
                                }
                            }
                            return (
                                <label key={oIndex} className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-brand-primary bg-blue-50' : 'border-gray-200'} ${resultClass}`}>
                                    <input 
                                        type="radio" 
                                        name={`q-${qIndex}`} 
                                        checked={isSelected} 
                                        onChange={() => handleAnswer(qIndex, oIndex)}
                                        disabled={showResults}
                                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="mr-3">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
            {!showResults ? (
                <button onClick={handleSubmit} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">
                    ثبت پاسخ‌ها
                </button>
            ) : (
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="font-semibold text-lg">نتیجه شما: {score} از {quiz.length}</p>
                </div>
            )}
        </div>
    );
};


const MicroLearningViewerModal: React.FC<MicroLearningViewerModalProps> = ({ isOpen, learning, onClose }) => {
    if (!isOpen || !learning) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={learning.topic} size="2xl">
            <div className="space-y-6">
                <div 
                    className="prose prose-sm max-w-none prose-p:my-2 prose-h2:mt-4 prose-h2:mb-1" 
                    dangerouslySetInnerHTML={{ __html: learning.generatedText.replace(/\n/g, '<br/>') }}
                />
                
                {learning.quiz && learning.quiz.length > 0 && (
                    <div className="border-t pt-6">
                        <QuizView quiz={learning.quiz} />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MicroLearningViewerModal;
