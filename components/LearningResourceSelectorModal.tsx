import React, { useState } from 'react';
import { MicroLearning, YouTubeVideo, Book, LearningResourceType } from '../types';
import Modal from '../modals/Modal';
import { SparklesIcon, VideoCameraIcon, BookOpenIcon } from './Icons';

interface LearningResourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (resource: { id: string; type: LearningResourceType, title: string }) => void;
  resources: {
    microLearnings: MicroLearning[];
    youtubeVideos: YouTubeVideo[];
    books: Book[];
  };
}

type Tab = 'micro' | 'video' | 'book';

const LearningResourceSelectorModal: React.FC<LearningResourceSelectorModalProps> = ({ isOpen, onClose, onSelect, resources }) => {
  const [activeTab, setActiveTab] = useState<Tab>('micro');

  const handleSelect = (id: string, type: LearningResourceType, title: string) => {
    onSelect({ id, type, title });
    onClose();
  };

  const renderResourceList = () => {
    switch (activeTab) {
      case 'micro':
        return resources.microLearnings.map(r => (
          <button key={r.id} onClick={() => handleSelect(r.id, LearningResourceType.MICRO_LEARNING, r.topic)} className="w-full text-right p-3 hover:bg-gray-100 rounded-lg flex items-center space-x-3 space-x-reverse">
            <SparklesIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <span>{r.topic}</span>
          </button>
        ));
      case 'video':
        return resources.youtubeVideos.map(r => (
          <button key={r.id} onClick={() => handleSelect(r.id, LearningResourceType.YOUTUBE_VIDEO, r.title)} className="w-full text-right p-3 hover:bg-gray-100 rounded-lg flex items-center space-x-3 space-x-reverse">
            <VideoCameraIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{r.title}</span>
          </button>
        ));
      case 'book':
        return resources.books.map(r => (
          <button key={r.id} onClick={() => handleSelect(r.id, LearningResourceType.BOOK, r.title)} className="w-full text-right p-3 hover:bg-gray-100 rounded-lg flex items-center space-x-3 space-x-reverse">
            <BookOpenIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p>{r.title}</p>
              <p className="text-xs text-gray-500">{r.author}</p>
            </div>
          </button>
        ));
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="انتخاب منبع یادگیری">
      <div>
        <div className="border-b mb-4">
          <nav className="-mb-px flex space-x-4 space-x-reverse">
            <button onClick={() => setActiveTab('micro')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'micro' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'}`}>دوره‌های AI</button>
            <button onClick={() => setActiveTab('video')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'video' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'}`}>ویدیوها</button>
            <button onClick={() => setActiveTab('book')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'book' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'}`}>کتاب‌ها</button>
          </nav>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {renderResourceList()}
        </div>
      </div>
    </Modal>
  );
};

export default LearningResourceSelectorModal;
