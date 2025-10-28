import React, { useState, useEffect, useRef } from 'react';
import { User, Strategy, Index, ObjectiveCategoryId, Objective, StyleSettings } from '../types';
import { UserIcon, RocketIcon, StarIcon } from './Icons';
import { UserSelector, IndexSelector, CategorySelector, ParentObjectiveSelector } from './ObjectiveSelectors';
import { OBJECTIVE_COLOR_OPTIONS, OBJECTIVE_COLOR_MAP } from '../constants';


interface NewObjectiveFormProps {
  users: User[];
  strategies: Strategy[];
  indices: Index[];
  objectives: Objective[];
  onSubmit: (title: string, description: string, ownerId: string, strategyId: string | undefined, indexIds: string[], category: ObjectiveCategoryId, parentId: string | undefined, color: string) => void;
  onCancel: () => void;
  defaultOwnerId: string;
  styleSettings: StyleSettings;
}

const NewObjectiveForm: React.FC<NewObjectiveFormProps> = ({ users, strategies, indices, objectives, onSubmit, onCancel, defaultOwnerId, styleSettings }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState(defaultOwnerId);
  const [strategyId, setStrategyId] = useState<string | undefined>(undefined);
  const [selectedIndexIds, setSelectedIndexIds] = useState<string[]>([]);
  const [category, setCategory] = useState<ObjectiveCategoryId | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string>(OBJECTIVE_COLOR_OPTIONS[0]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const isModern2Style = styleSettings.primaryColor === '#F59E0B';

  const handleDescriptionInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setDescription(e.currentTarget.value);
    if(descriptionRef.current){
        descriptionRef.current.style.height = 'auto';
        descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان هدف الزامی است.');
      return;
    }
    if (!category) {
      alert('لطفاً یک دسته‌بندی برای هدف انتخاب کنید.');
      return;
    }
    onSubmit(title, description, ownerId, strategyId, selectedIndexIds, category, parentId, color);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 text-right">
        <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold border-none focus:ring-0 p-1 -m-1 bg-transparent placeholder-gray-400"
              placeholder="یک عنوان قدرتمند برای هدف خود بنویسید..."
              required
            />
            <textarea
              ref={descriptionRef}
              value={description}
              onInput={handleDescriptionInput}
              rows={1}
              className="mt-2 w-full text-md text-brand-subtext border-none focus:ring-0 resize-none p-1 -m-1 bg-transparent placeholder-gray-400"
              placeholder="جزئیات بیشتری درباره این هدف اضافه کنید (اختیاری)"
            ></textarea>
        </div>
        
        <div className="pt-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-text mb-2">دسته‌بندی</label>
                <CategorySelector selected={category} onSelect={setCategory} />
            </div>
             <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-brand-text mb-2">هم‌راستایی OKR</h3>
                <ParentObjectiveSelector
                    objectives={objectives}
                    selectedParentId={parentId}
                    onChange={setParentId}
                />
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">رنگ هدف</label>
            <div className="flex space-x-2 space-x-reverse">
                {OBJECTIVE_COLOR_OPTIONS.map(c => (
                <button 
                    key={c} 
                    type="button" 
                    onClick={() => setColor(c)} 
                    className={`w-6 h-6 rounded-full border-2 transition-all ${OBJECTIVE_COLOR_MAP[c].bg} ${color === c ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'}`}
                />
                ))}
            </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200">
             <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
                <div className="flex items-center text-sm text-brand-subtext">
                    <UserIcon className="w-5 h-5 ml-2"/>
                    <span>مالک</span>
                </div>
                <UserSelector users={users} selectedUserId={ownerId} onChange={setOwnerId} />
             </div>
             <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
                <div className="flex items-center text-sm text-brand-subtext">
                    <RocketIcon className="w-5 h-5 ml-2"/>
                    <span>استراتژی</span>
                </div>
                 <select
                    value={strategyId || ''}
                    onChange={(e) => setStrategyId(e.target.value || undefined)}
                    className="w-full p-2 text-brand-text text-sm font-medium border-none focus:ring-0 bg-transparent rounded-lg hover:bg-gray-100"
                >
                    <option value="">بدون استراتژی</option>
                    {strategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
             </div>
             <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
                <div className="flex items-center text-sm text-brand-subtext">
                    <StarIcon className="w-5 h-5 ml-2"/>
                    <span>شاخص‌ها</span>
                </div>
                <IndexSelector indices={indices} selectedIds={selectedIndexIds} onChange={setSelectedIndexIds} />
             </div>
        </div>
      
      <div className={`flex items-center pt-6 border-t ${isModern2Style ? "justify-center space-x-4 space-x-reverse" : "justify-end space-x-2 space-x-reverse"}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-lg font-semibold transition-colors ${isModern2Style ? 'px-8 py-4 text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'px-4 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          لغو
        </button>
        <button
          type="submit"
          className={`text-white rounded-lg transition-colors font-semibold ${isModern2Style ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm'}`}
          style={{ backgroundColor: styleSettings.primaryColor }}
        >
          مرحله بعد
        </button>
      </div>
    </form>
  );
};

export default NewObjectiveForm;