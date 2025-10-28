import React, { useState, useMemo } from 'react';
import { Project, Board, ViewMode } from '../types';
import Modal from './Modal';
import { ArrowRightIcon, ViewColumnsIcon } from '../components/Icons';

interface MoveFormToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  boards: Board[];
  onMove: (boardId: string) => void;
}

const MoveFormToBoardModal: React.FC<MoveFormToBoardModalProps> = ({ isOpen, onClose, projects, boards, onMove }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const kanbanBoards = useMemo(() => {
    if (!selectedProjectId) return [];
    
    // Find the selected project to check its properties.
    const project = projects.find(p => p.id === selectedProjectId);

    // A project is considered to support Kanban ("board") view if its `enabledViews` is not defined (meaning all views are enabled),
    // is an empty array, or if it explicitly includes 'board'.
    const projectSupportsKanban = !project?.enabledViews || project.enabledViews.length === 0 || project.enabledViews.includes('board');
    
    if (projectSupportsKanban) {
        // If the project supports Kanban view, then all boards belonging to this project are considered valid Kanban boards for this purpose.
        return boards.filter(b => b.projectId === selectedProjectId);
    }
    
    // If the project itself does not support Kanban view, then none of its boards can be used.
    return [];
  }, [boards, projects, selectedProjectId]);

  const handleSelectBoard = (boardId: string) => {
    onMove(boardId);
    onClose();
  };

  const handleClose = () => {
    setSelectedProjectId(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={selectedProjectId ? "انتخاب برد" : "انتخاب پروژه"}>
        <div className="min-h-[300px]">
            {selectedProjectId ? (
                <div>
                    <button onClick={() => setSelectedProjectId(null)} className="flex items-center text-sm font-semibold text-brand-primary mb-4">
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                        بازگشت به پروژه‌ها
                    </button>
                    <div className="space-y-2">
                        {kanbanBoards.map(board => (
                            <button
                                key={board.id}
                                onClick={() => handleSelectBoard(board.id)}
                                className="w-full p-3 text-right bg-gray-100/70 rounded-lg hover:bg-gray-200/70 flex items-center"
                            >
                                <ViewColumnsIcon className="w-5 h-5 ml-2 text-gray-500" />
                                {board.name}
                            </button>
                        ))}
                        {kanbanBoards.length === 0 && <p className="text-center text-sm text-gray-500 py-4">هیچ برد کانبانی در این پروژه یافت نشد.</p>}
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {projects.filter(p => !p.isArchived).map(project => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className="w-full p-3 text-right bg-gray-100/70 rounded-lg hover:bg-gray-200/70"
                        >
                            {project.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </Modal>
  );
};

export default MoveFormToBoardModal;