import React, { useState, useEffect } from 'react';
import { FeedbackTag } from '../types';
import { ICONS, PlusIcon, SparklesIcon, LightbulbIcon, ThanksIcon, HandshakeIcon, TrophyIcon, StarIcon, ChatBubbleOvalLeftEllipsisIcon, TrashIcon, EditIcon } from '../components/Icons';
import Modal from './Modal';

const AVAILABLE_ICONS = ['SparklesIcon', 'LightbulbIcon', 'ThanksIcon', 'HandshakeIcon', 'TrophyIcon', 'StarIcon', 'ChatBubbleOvalLeftEllipsisIcon'];
const AVAILABLE_COLORS = ['#fcd34d', '#93c5fd', '#f9a8d4', '#86efac', '#a78bfa', '#fb923c', '#6ee7b7', '#fca5a5'];

interface ManageFeedbackTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: FeedbackTag[];
  onSave: (tag: FeedbackTag) => void;
  onDelete: (tagId: string) => void;
}

const ManageFeedbackTagsModal: React.FC<ManageFeedbackTagsModalProps> = ({ isOpen, onClose, tags, onSave, onDelete }) => {
  const [tagToEdit, setTagToEdit] = useState<FeedbackTag | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);

  useEffect(() => {
    if (tagToEdit) {
      setName(tagToEdit.name);
      setDescription(tagToEdit.description);
      setIcon(tagToEdit.icon);
      setColor(tagToEdit.color);
    } else {
      resetForm();
    }
  }, [tagToEdit]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon(AVAILABLE_ICONS[0]);
    setColor(AVAILABLE_COLORS[0]);
    setTagToEdit(null);
  };

  const handleSave = () => {
    if (!name || !description) {
      alert('نام و توصیف برچسب الزامی است.');
      return;
    }
    const tagData: FeedbackTag = {
      id: tagToEdit?.id || `tag-${Date.now()}`,
      name,
      description,
      icon,
      color,
    };
    onSave(tagData);
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="مدیریت برچسب‌های بازخورد" size="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side: Add/Edit Form */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{tagToEdit ? 'ویرایش برچسب' : 'افزودن برچسب جدید'}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">نام برچسب</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: تلاش" className="input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">توصیف نمایشی</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="مثال: از تلاشت ممنونم." className="input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">آیکون</label>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {AVAILABLE_ICONS.map(iconName => {
                const IconComponent = ICONS[iconName];
                return (
                  <button key={iconName} onClick={() => setIcon(iconName)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${icon === iconName ? 'border-brand-primary' : 'border-gray-200'}`}>
                    <IconComponent className="w-6 h-6" style={{ color }} />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">رنگ</label>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {AVAILABLE_COLORS.map(colorHex => (
                <button key={colorHex} onClick={() => setColor(colorHex)} className={`w-8 h-8 rounded-full border-2 ${color === colorHex ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'}`} style={{ backgroundColor: colorHex }} />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse pt-2">
            <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">ذخیره</button>
            {tagToEdit && <button onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg">لغو ویرایش</button>}
          </div>
        </div>

        {/* Right side: List of tags */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">برچسب‌های موجود</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {tags.map(tag => {
              const IconComponent = ICONS[tag.icon];
              return (
                <div key={tag.id} className="flex items-center p-2 rounded-lg bg-gray-100/70 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${tag.color}20` }}>
                    <IconComponent className="w-5 h-5" style={{ color: tag.color }} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{tag.name}</p>
                    <p className="text-xs text-gray-500">{tag.description}</p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setTagToEdit(tag)} className="p-1 text-gray-500 hover:text-blue-600 rounded-full"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(tag.id)} className="p-1 text-gray-500 hover:text-red-600 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManageFeedbackTagsModal;
