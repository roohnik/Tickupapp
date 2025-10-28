import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Document, DocumentBlock, DocumentBlockType, User, Task, Form, DocumentStatus } from '../types';
import EditableBlock from './EditableBlock';
import SlashCommandMenu from './SlashCommandMenu';
import DocumentToolbar from './DocumentToolbar';
import { StarIcon, UserIcon, SparklesIcon, ClockIcon, TagIcon, ChevronDownIcon, ArrowRightIcon, EditIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import ReadConfirmation from './ReadConfirmation';


interface DocumentEditorProps {
  document: Document;
  onUpdate: (updatedDoc: Document) => void;
  users: User[];
  tasks: Task[];
  forms: Form[];
  documentStatuses: DocumentStatus[];
  onSelectTask: (taskId: string) => void;
  onOpenForm: (formId: string) => void;
  isMobileView?: boolean;
  onBack?: () => void;
  // New props for prerequisite study mode
  forceReadOnly?: boolean;
  taskContext?: Task;
  onUpdateTaskContext?: (updatedTask: Task) => void;
}

const FONT_OPTIONS = [
  { name: 'وزیرمتن', value: 'Vazirmatn, sans-serif' },
  { name: 'لاله‌زار', value: 'Lalezar, cursive' },
  { name: 'تنها', value: 'Tanha, cursive' },
  { name: 'میخک', value: 'Mikhak, sans-serif' },
];

const FONT_SIZE_OPTIONS: { name: string; value: Document['fontSize'] }[] = [
    { name: 'کوچک', value: 'sm' },
    { name: 'عادی', value: 'base' },
    { name: 'بزرگ', value: 'lg' },
    { name: 'خیلی بزرگ', value: 'xl' },
]

const getFontSizeClass = (size: Document['fontSize']) => {
    switch (size) {
        case 'sm': return 'text-sm';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case 'base':
        default:
            return 'text-base';
    }
}

const DocumentEditor: React.FC<DocumentEditorProps> = (props) => {
  const { document, onUpdate, users, tasks, forms, documentStatuses, onSelectTask, onOpenForm, isMobileView, onBack, forceReadOnly = false, taskContext, onUpdateTaskContext } = props;
  const [history, setHistory] = useState([document]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentDoc = history[historyIndex];
  
  const [isEditingInternal, setIsEditingInternal] = useState(false);
  const isEditing = !forceReadOnly && isEditingInternal;


  const [slashMenuState, setSlashMenuState] = useState<{
    blockId: string;
    position: { top: number; left: number };
    query: string;
  } | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [blockToFocus, setBlockToFocus] = useState<string | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const [isMetaVisible, setIsMetaVisible] = useState(false);


  useEffect(() => {
    // Reset history when the document being edited changes
    setHistory([document]);
    setHistoryIndex(0);
    setActiveBlockId(null);
    setIsEditingInternal(false);
  }, [document.id]);
  
  useEffect(() => {
    const handleSelection = () => {
        if (!isEditing) {
            setToolbarPosition(null);
            return;
        }
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            setToolbarPosition(null);
            return;
        }

        const range = selection.getRangeAt(0);
        const container = editorContainerRef.current;

        if (!container || selection.isCollapsed || !container.contains(range.commonAncestorContainer)) {
            setToolbarPosition(null);
            return;
        }
        
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) { // Avoid showing on empty selections (e.g., just clicking)
            setToolbarPosition(null);
            return;
        }

        setToolbarPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX + rect.width / 2,
        });
    };

    window.document.addEventListener('selectionchange', handleSelection);
    return () => window.document.removeEventListener('selectionchange', handleSelection);
}, [isEditing]);


  const commitChange = useCallback((updatedDoc: Document, fromUndoRedo = false) => {
      const docWithTimestamp = { ...updatedDoc, lastUpdatedAt: new Date().toISOString() };
      if (!fromUndoRedo) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(docWithTimestamp);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
      }
      onUpdate(docWithTimestamp);
  }, [history, historyIndex, onUpdate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
            setIsStatusMenuOpen(false);
        }
    };
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
        window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusMenuRef]);


  const handleUndo = () => {
      if (!isEditing || historyIndex <= 0) return;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onUpdate(history[newIndex]);
  };

  const handleRedo = () => {
      if (!isEditing || historyIndex >= history.length - 1) return;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onUpdate(history[newIndex]);
  };

  const handleUpdateBlock = useCallback((blockId: string, newContent: DocumentBlock['content']) => {
    if (!isEditing) return;
    const newBlocks = currentDoc.content.map(b => (b.id === blockId ? { ...b, content: newContent } : b));
    commitChange({ ...currentDoc, content: newBlocks });
  }, [currentDoc, commitChange, isEditing]);

  const handleAddNewBlock = useCallback((currentBlockId: string) => {
    if (!isEditing) return;
    const newBlock: DocumentBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: '', textAlign: 'right' };
    const blockIndex = currentDoc.content.findIndex(b => b.id === currentBlockId);
    
    const currentBlock = currentDoc.content[blockIndex];
    if (currentBlock && (currentBlock.type === 'numberedList' || currentBlock.type === 'checklist')) {
        newBlock.type = currentBlock.type;
        if (currentBlock.type === 'checklist') {
            newBlock.content = { text: '', checked: false };
        }
    }

    const newBlocks = [...currentDoc.content];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    commitChange({ ...currentDoc, content: newBlocks });
    setBlockToFocus(newBlock.id);
  }, [currentDoc, commitChange, isEditing]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    if (!isEditing || currentDoc.content.length <= 1) return;
    const newBlocks = currentDoc.content.filter(b => b.id !== blockId);
    commitChange({ ...currentDoc, content: newBlocks });
  }, [currentDoc, commitChange, isEditing]);

  const handleChangeBlockType = useCallback((blockId: string, type: DocumentBlockType) => {
    if (!isEditing) return;
    let newContent: DocumentBlock['content'];
    const currentText = (currentDoc.content.find(b => b.id === blockId)?.content as string) || '';

    switch (type) {
        case 'table':
            newContent = { rows: [['', ''], ['', '']], columnWidths: [150, 150] };
            break;
        case 'checklist':
            newContent = { text: currentText.replace('/', ''), checked: false };
            break;
        case 'image':
            newContent = { src: '', caption: '' };
            break;
        case 'file':
            newContent = { name: '', size: '', url: '' };
            break;
        case 'date':
            newContent = { date: new Date().toISOString() };
            break;
        case 'mention':
            newContent = { userId: '' };
            break;
        case 'taskLink':
            newContent = { taskId: '' };
            break;
        case 'formLink':
            newContent = { formId: '' };
            break;
        case 'paragraph':
        case 'heading1':
        case 'numberedList':
        default:
            newContent = currentText.replace('/', '');
            break;
    }

    const newBlocks = currentDoc.content.map(b => (b.id === blockId ? { ...b, type, content: newContent } : b));
    commitChange({ ...currentDoc, content: newBlocks });
    setSlashMenuState(null);
    setBlockToFocus(blockId);
  }, [currentDoc, commitChange, isEditing]);

  const handleShowSlashMenu = (blockId: string, position: { top: number; left: number }, query: string) => {
    if (!isEditing || !blockId) {
        setSlashMenuState(null);
        return;
    }
    setSlashMenuState({ blockId, position, query });
  };
  
  const handleUpdateTitle = (newTitle: string) => {
      if (!isEditing) return;
      commitChange({...currentDoc, title: newTitle});
  }
  
   const handleUpdateIcon = (newIcon: string) => {
      if (!isEditing) return;
      commitChange({...currentDoc, icon: newIcon});
  }

  const handleFontChange = (newFont: string) => {
    if (!isEditing) return;
    commitChange({...currentDoc, fontFamily: newFont});
  }
  
  const handleFontSizeChange = (newSize: Document['fontSize']) => {
    if (!isEditing) return;
    commitChange({...currentDoc, fontSize: newSize});
  }

  const handleBlockAlignmentChange = (align: DocumentBlock['textAlign']) => {
      if (!isEditing || !activeBlockId) return;
      const newBlocks = currentDoc.content.map(b => b.id === activeBlockId ? {...b, textAlign: align} : b);
      commitChange({...currentDoc, content: newBlocks});
  };

  const handleStatusChange = (newStatusId: string) => {
    if (!isEditing) return;
    commitChange({...currentDoc, statusId: newStatusId});
    setIsStatusMenuOpen(false);
  }

  const activeBlock = currentDoc.content.find(b => b.id === activeBlockId);
  const creator = users.find(u => u.id === currentDoc.creatorId);
  const currentStatus = documentStatuses.find(s => s.id === currentDoc.statusId);
  
  const headingBlocks = useMemo(() => currentDoc.content.filter(b => b.type === 'heading1'), [currentDoc.content]);
  const showCheckmarks = forceReadOnly && taskContext && onUpdateTaskContext && headingBlocks.length > 0;

  const renderBlocks = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < currentDoc.content.length) {
        const block = currentDoc.content[i];

        if (block.type === 'numberedList') {
            const listItems = [];
            const olKey = `ol-${block.id}`;
            let j = i;
            while (j < currentDoc.content.length && currentDoc.content[j].type === 'numberedList') {
                const liBlock = currentDoc.content[j];
                listItems.push(
                    <li key={liBlock.id}>
                        <EditableBlock
                            key={liBlock.id}
                            block={liBlock}
                            onUpdate={handleUpdateBlock}
                            onAddBlock={handleAddNewBlock}
                            onDeleteBlock={handleDeleteBlock}
                            onChangeBlockType={handleChangeBlockType}
                            onShowSlashMenu={handleShowSlashMenu}
                            onFocus={setActiveBlockId}
                            isLastBlock={j === currentDoc.content.length - 1}
                            users={users}
                            tasks={tasks}
                            forms={forms}
                            onSelectTask={onSelectTask}
                            onOpenForm={onOpenForm}
                            shouldFocus={liBlock.id === blockToFocus}
                            onFocused={() => setBlockToFocus(null)}
                            readOnly={!isEditing}
                        />
                    </li>
                );
                j++;
            }
            elements.push(
                <ol key={olKey} className="list-decimal list-inside pr-4 space-y-1">
                    {listItems}
                </ol>
            );
            i = j;
        } else {
            elements.push(
                <EditableBlock
                    key={block.id}
                    block={block}
                    onUpdate={handleUpdateBlock}
                    onAddBlock={handleAddNewBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onChangeBlockType={handleChangeBlockType}
                    onShowSlashMenu={handleShowSlashMenu}
                    onFocus={setActiveBlockId}
                    isLastBlock={i === currentDoc.content.length - 1}
                    users={users}
                    tasks={tasks}
                    forms={forms}
                    onSelectTask={onSelectTask}
                    onOpenForm={onOpenForm}
                    shouldFocus={block.id === blockToFocus}
                    onFocused={() => setBlockToFocus(null)}
                    readOnly={!isEditing}
                />
            );
            i++;
        }
    }
    return elements;
};

const renderContentWithCheckmarks = () => {
    const elements: React.ReactNode[] = [];
    
    currentDoc.content.forEach((block, index) => {
        elements.push(
            <EditableBlock
                key={block.id}
                block={block}
                onUpdate={handleUpdateBlock}
                onAddBlock={handleAddNewBlock}
                onDeleteBlock={handleDeleteBlock}
                onChangeBlockType={handleChangeBlockType}
                onShowSlashMenu={handleShowSlashMenu}
                onFocus={setActiveBlockId}
                isLastBlock={index === currentDoc.content.length - 1}
                users={users}
                tasks={tasks}
                forms={forms}
                onSelectTask={onSelectTask}
                onOpenForm={onOpenForm}
                shouldFocus={block.id === blockToFocus}
                onFocused={() => setBlockToFocus(null)}
                readOnly={!isEditing}
            />
        );

        let owningHeading: DocumentBlock | undefined = undefined;
        for (let i = index; i >= 0; i--) {
            if (currentDoc.content[i].type === 'heading1') {
                owningHeading = currentDoc.content[i];
                break;
            }
        }
        
        if (owningHeading) {
            const isLastBlockOfDoc = index === currentDoc.content.length - 1;
            const nextBlockIsHeading = index + 1 < currentDoc.content.length && currentDoc.content[index + 1].type === 'heading1';
            
            if (isLastBlockOfDoc || nextBlockIsHeading) {
                elements.push(
                    <ReadConfirmation
                        key={`rc-${owningHeading.id}`}
                        headingBlockId={owningHeading.id}
                        taskContext={taskContext!}
                        onUpdateTaskContext={onUpdateTaskContext!}
                        documentId={currentDoc.id}
                    />
                );
            }
        }
    });

    return elements;
};


  return (
    <div className="flex flex-col h-full relative">
        <div className="flex-shrink-0 p-2 border-b flex items-center justify-between bg-white sticky top-0 z-10 h-[61px]">
          <div className="flex items-center">
            {isMobileView && (
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="truncate font-semibold text-brand-text ml-2 hidden sm:block">
              <span className="mr-1">{document.icon}</span>{document.title}
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {!forceReadOnly && (
              isEditing ? (
                <button onClick={() => setIsEditingInternal(false)} className="px-4 py-1.5 bg-blue-500 text-white rounded-md text-sm font-semibold">ذخیره و پایان</button>
              ) : (
                <button onClick={() => setIsEditingInternal(true)} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold flex items-center">
                  <EditIcon className="w-4 h-4 ml-2"/>
                  ویرایش
                </button>
              )
            )}
          </div>
        </div>

      {isEditing && toolbarPosition && (
          <DocumentToolbar
            position={toolbarPosition}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            fontOptions={FONT_OPTIONS}
            selectedFont={currentDoc.fontFamily || FONT_OPTIONS[0].value}
            onFontChange={handleFontChange}
            fontSizeOptions={FONT_SIZE_OPTIONS}
            selectedFontSize={currentDoc.fontSize || 'base'}
            onFontSizeChange={handleFontSizeChange}
            activeBlock={activeBlock}
            onAlignmentChange={handleBlockAlignmentChange}
          />
      )}
      <div 
        ref={editorContainerRef}
        className="flex-grow overflow-y-auto w-full"
      >
          <div 
            className={`max-w-4xl mx-auto w-full p-4 sm:p-8 md:p-12 ${getFontSizeClass(currentDoc.fontSize)}`}
            style={{ fontFamily: currentDoc.fontFamily || FONT_OPTIONS[0].value }}
          >
              <div className="mb-8">
                  <div className="relative group w-20">
                      <input 
                          type="text" 
                          value={currentDoc.icon} 
                          onChange={e => handleUpdateIcon(e.target.value)}
                          readOnly={!isEditing}
                          className={`text-6xl w-20 p-1 border-none bg-transparent rounded-lg focus:ring-2 focus:ring-blue-400 ${isEditing ? 'hover:bg-gray-100 cursor-text' : 'cursor-default'}`}
                      />
                      {isEditing && <EditIcon className="absolute top-0 right-0 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                  </div>
                  <div className="flex items-center mt-4">
                      <textarea
                          value={currentDoc.title}
                          onChange={e => handleUpdateTitle(e.target.value)}
                          readOnly={!isEditing}
                          onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = `${target.scrollHeight}px`;
                          }}
                          rows={1}
                          className={`w-full text-4xl font-bold border-none focus:ring-0 p-1 resize-none placeholder:text-gray-300 ${isEditing ? 'cursor-text' : 'cursor-default'}`}
                          placeholder="عنوان دستورالعمل"
                          dir="auto"
                      />
                  </div>
              </div>

            <div className="mb-8 border-y">
                <button
                    type="button"
                    onClick={() => setIsMetaVisible(prev => !prev)}
                    className="w-full flex justify-between items-center py-3 text-sm font-medium text-brand-subtext"
                    aria-expanded={isMetaVisible}
                    aria-controls="document-meta-section"
                >
                    <span>مشخصات دستورالعمل</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isMetaVisible ? 'rotate-180' : ''}`} />
                </button>
                {isMetaVisible && (
                    <div id="document-meta-section" className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-brand-subtext pb-3 px-1 animate-fade-in">
                        <div className="flex items-center">
                            <UserIcon className="w-4 h-4 ml-2 text-gray-400"/>
                            <span className="ml-2 font-medium">Creator</span>
                            {creator ? (
                                <div className="flex items-center font-semibold text-brand-text">
                                    <img src={creator.avatarUrl} alt={creator.name} className="w-5 h-5 rounded-full ml-1.5"/>
                                    <span>{creator.name}</span>
                                </div>
                            ) : ( <span className="font-semibold text-brand-text">Unknown</span> )}
                        </div>

                        <div className="flex items-center">
                            <SparklesIcon className="w-4 h-4 ml-2 text-gray-400"/>
                            <span className="ml-2 font-medium">Created</span>
                            <span className="font-semibold text-brand-text">
                                {toPersianDate(currentDoc.createdAt)}
                            </span>
                        </div>
                        
                        <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 ml-2 text-gray-400"/>
                            <span className="ml-2 font-medium">Last updated</span>
                            <span className="font-semibold text-brand-text">
                                {toPersianDate(currentDoc.lastUpdatedAt)}, {new Date(currentDoc.lastUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                        </div>

                        <div className="flex items-center relative" ref={statusMenuRef}>
                            <TagIcon className="w-4 h-4 ml-2 text-gray-400"/>
                            <span className="ml-2 font-medium">Status</span>
                            {currentStatus ? (
                                <button onClick={() => isEditing && setIsStatusMenuOpen(prev => !prev)} disabled={!isEditing} className={`flex items-center px-2 py-0.5 rounded-md text-sm font-semibold ${currentStatus.color} ${currentStatus.textColor} ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                                    {currentStatus.label}
                                    {isEditing && <ChevronDownIcon className="w-4 h-4 mr-1"/>}
                                </button>
                            ) : (
                                <button onClick={() => isEditing && setIsStatusMenuOpen(prev => !prev)} disabled={!isEditing} className="px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                                    تعیین وضعیت
                                </button>
                            )}
                            {isStatusMenuOpen && (
                                <div className="absolute top-full mt-2 right-0 bg-white rounded-md shadow-lg border z-10 w-48 py-1">
                                    <ul>
                                        {documentStatuses.map(status => (
                                            <li key={status.id}>
                                                <button onClick={() => handleStatusChange(status.id)} className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center">
                                                    <span className={`w-3 h-3 rounded-full ml-2 ${status.color}`}></span>
                                                    {status.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showCheckmarks ? renderContentWithCheckmarks() : renderBlocks()}
            <div className="h-[50vh]" />

            {slashMenuState && (
              <SlashCommandMenu
                position={slashMenuState.position}
                query={slashMenuState.query}
                onSelect={type => handleChangeBlockType(slashMenuState.blockId, type)}
                onClose={() => setSlashMenuState(null)}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;