import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import { Objective, Strategy, Index, ObjectiveCategoryId } from '../types';
import Modal from '../modals/Modal';
import { CategorySelector, IndexSelector, ParentObjectiveSelector } from './ObjectiveSelectors';
import { OBJECTIVE_COLOR_OPTIONS, OBJECTIVE_COLOR_MAP } from '../constants';


interface EditObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  strategies: Strategy[];
  indices: Index[];
  objectives: Objective[];
  onSubmit: (objectiveId: string, title: string, description: string, strategyId: string | undefined, indexIds: string[], category: ObjectiveCategoryId, parentId: string | undefined, color: string) => void;
}

const EditObjectiveModal: React.FC<EditObjectiveModalProps> = ({ isOpen, onClose, objective, strategies, indices, objectives, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [strategyId, setStrategyId] = useState<string | undefined>(undefined);
  const [selectedIndexIds, setSelectedIndexIds] = useState<string[]>([]);
  const [category, setCategory] = useState<ObjectiveCategoryId | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string>('');


  useEffect(() => {
    if (objective) {
      setTitle(objective.title);
      setDescription(objective.description);
      setStrategyId(objective.strategyId);
      setSelectedIndexIds(objective.indexIds || []);
      setCategory(objective.category);
      setParentId(objective.parentId);
      setColor(objective.color || OBJECTIVE_COLOR_OPTIONS[0]);
    }
  }, [objective]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان هدف الزامی است.');
      return;
    }
    if (!category) {
      alert('لطفا یک دسته بندی انتخاب کنید.');
      return;
    }
    onSubmit(objective.id, title, description, strategyId, selectedIndexIds, category, parentId, color);
    onClose();
  };
  
  const childObjectives = objectives.filter(o => o.parentId === objective.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ویرایش هدف" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label htmlFor="edit-obj-title" className="block text-sm font-medium text-brand-text">عنوان هدف</label>
          <input
            type="text"
            id="edit-obj-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full input-style"
            required
          />
        </div>
        <div>
          <label htmlFor="edit-obj-desc" className="block text-sm font-medium text-brand-text">توضیحات (اختیاری)</label>
          <textarea
            id="edit-obj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full input-style"
          ></textarea>
        </div>
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">دسته‌بندی</label>
            <CategorySelector selected={category} onSelect={setCategory} />
        </div>
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">رنگ هدف</label>
            <div className="flex space-x-2 space-x-reverse mt-1">
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
         <div>
          <label htmlFor="obj-strategy" className="block text-sm font-medium text-brand-text">استراتژی</label>
          <select
            id="obj-strategy"
            value={strategyId}
            onChange={(e) => setStrategyId(e.target.value || undefined)}
            className="mt-1 block w-full input-style"
          >
            <option value="">بدون استراتژی</option>
            {strategies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">شاخص‌های مرتبط</label>
            <IndexSelector indices={indices} selectedIds={selectedIndexIds} onChange={setSelectedIndexIds} />
        </div>

        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-brand-text">هم‌راستایی OKR</h3>
            <div>
                <label className="block text-xs font-medium text-brand-subtext mb-1">هدف بالادستی</label>
                <ParentObjectiveSelector
                    objectives={objectives}
                    currentObjectiveId={objective.id}
                    selectedParentId={parentId}
                    onChange={setParentId}
                />
            </div>
            {childObjectives.length > 0 && (
                <div>
                    <label className="block text-xs font-medium text-brand-subtext mb-1">اهداف پایین‌دستی</label>
                    <div className="space-y-1 p-2 bg-gray-100/70 rounded-lg border">
                        {childObjectives.map(child => (
                            <p key={child.id} className="text-sm text-brand-text truncate">{child.title}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>


        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditObjectiveModal;