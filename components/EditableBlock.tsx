import React, { useRef, useEffect, useState } from 'react';
import { DocumentBlock, DocumentBlockType, TableContent, ChecklistContent, ImageContent, FileContent, DateContent, MentionContent, TaskLinkContent, FormLinkContent, User, Task, Form } from '../types';
import { TABLE_COLOR_MAP, TEXT_COLOR_MAP } from '../constants';
import TableActionMenu from './TableToolbar';
import { DragHandleIcon, PaperClipIcon, CheckCircleIcon, DocumentTextIcon, AtSymbolIcon, TrashIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';

interface EditableBlockProps {
  block: DocumentBlock;
  onUpdate: (blockId: string, newContent: DocumentBlock['content']) => void;
  onAddBlock: (currentBlockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onChangeBlockType: (blockId: string, type: DocumentBlockType) => void;
  onShowSlashMenu: (blockId: string, position: { top: number; left: number }, query: string) => void;
  onFocus: (blockId: string) => void;
  isLastBlock: boolean;
  users: User[];
  tasks: Task[];
  forms: Form[];
  onSelectTask: (taskId: string) => void;
  onOpenForm: (formId: string) => void;
  shouldFocus?: boolean;
  onFocused?: () => void;
  readOnly?: boolean;
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const modifyArray = <T,>(arr: T[] | undefined, modification: (newArr: T[]) => void, numItems: number, defaultVal?: T): T[] => {
    const newArr: T[] = arr ? [...arr] : Array(numItems).fill(defaultVal as T);
    modification(newArr);
    return newArr;
};


const EditableBlock: React.FC<EditableBlockProps> = ({ block, onUpdate, onAddBlock, onDeleteBlock, onChangeBlockType, onShowSlashMenu, onFocus, isLastBlock, users, tasks, forms, onSelectTask, onOpenForm, shouldFocus, onFocused, readOnly = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resizingCol, setResizingCol] = useState<{ index: number, startX: number, startWidth: number } | null>(null);
  const [actionMenu, setActionMenu] = useState<{ type: 'row' | 'col'; index: number; element: HTMLElement } | null>(null);
  const [dragState, setDragState] = useState<{ type: 'row' | 'col'; index: number; } | null>(null);
  const [dragOver, setDragOver] = useState<{ type: 'row' | 'col'; index: number; position: 'before' | 'after' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((block.content === '' || (typeof block.content === 'object' && 'text' in block.content && block.content.text === '')) && isLastBlock && !shouldFocus) {
        if (!readOnly) ref.current?.focus();
    }
  }, [block.id, isLastBlock, shouldFocus, readOnly]);

  useEffect(() => {
    if (shouldFocus && ref.current) {
        ref.current.focus();
        
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNodeContents(ref.current);
            range.collapse(false); // false collapses to the end
            selection.removeAllRanges();
            selection.addRange(range);
        }

        onFocused?.();
    }
  }, [shouldFocus, onFocused]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingCol) return;
      const dx = e.clientX - resizingCol.startX;
      const newWidth = Math.max(50, resizingCol.startWidth + dx);
      
      const content = block.content as TableContent;
      const newWidths = [...(content.columnWidths || [])];
      newWidths[resizingCol.index] = newWidth;
      onUpdate(block.id, { ...content, columnWidths: newWidths });
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    if (resizingCol && !readOnly) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, block.id, block.content, onUpdate, readOnly]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
            setContextMenu(null);
        }
    };
    if (!readOnly) document.addEventListener('mousedown', handleClickOutside);
    return () => {
        if (!readOnly) document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [readOnly]);

  const handleContextMenu = (e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDeleteFromContext = () => {
      onDeleteBlock(block.id);
      setContextMenu(null);
  }

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const element = e.target as HTMLElement;
    const text = element.innerText;

    if (block.type === 'checklist') {
        onUpdate(block.id, { ...(block.content as ChecklistContent), text });
    } else {
        onUpdate(block.id, text);
    }
    
    if(text.startsWith('/')) {
        const rect = element.getBoundingClientRect();
        onShowSlashMenu(block.id, { top: rect.bottom, left: rect.left }, text);
    } else {
        onShowSlashMenu('', { top: 0, left: 0 }, ''); // Hide menu
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const text = (e.target as HTMLElement).innerText;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(block.id);
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && text === '') {
        e.preventDefault();
        if (block.type === 'checklist' || block.type === 'numberedList') {
            onChangeBlockType(block.id, 'paragraph');
        } else {
            onDeleteBlock(block.id);
        }
    }
  };
  
  const handleTableInput = (e: React.FormEvent<HTMLTableCellElement>, rowIndex: number, colIndex: number) => {
    const content = block.content as TableContent;
    const newRows = content.rows.map((row, rIdx) => 
        rIdx === rowIndex ? row.map((cell, cIdx) => 
            cIdx === colIndex ? (e.target as HTMLTableCellElement).innerText : cell
        ) : row
    );
    onUpdate(block.id, { ...content, rows: newRows });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (block.type === 'image') {
        const src = await fileToBase64(file);
        onUpdate(block.id, { ...(block.content as ImageContent), src });
    } else if (block.type === 'file') {
        const url = URL.createObjectURL(file);
        onUpdate(block.id, {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            url: url
        });
    }
  };

  const reorderArray = (arr: any[] | undefined, from: number, to: number) => {
    if (!arr) return undefined;
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  }
  
  const handleDragStart = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
    setDragState({ type, index });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
    if (readOnly || !dragState || dragState.type !== type) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = type === 'row' ? e.clientY - rect.top : e.clientX - rect.left;
    const threshold = (type === 'row' ? rect.height : rect.width) / 2;
    setDragOver({ type, index, position: pos < threshold ? 'before' : 'after' });
  };
  const handleDragLeave = () => setDragOver(null);
  const handleDrop = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
    if (readOnly || !dragState || !dragOver || dragState.type !== type) return;
    e.preventDefault();
    
    const fromIndex = dragState.index;
    let toIndex = dragOver.index;
    if (dragOver.position === 'after' && toIndex > fromIndex) toIndex--;
    if (dragOver.position === 'after') toIndex++;
    if (dragOver.position === 'before' && toIndex < fromIndex) toIndex++;
    if (fromIndex === toIndex) return;

    const content = block.content as TableContent;

    if (type === 'row') {
        onUpdate(block.id, {
            ...content,
            rows: reorderArray(content.rows, fromIndex, toIndex)!,
            rowColors: reorderArray(content.rowColors, fromIndex, toIndex),
            rowTextColors: reorderArray(content.rowTextColors, fromIndex, toIndex),
        });
    } else {
        const newRows = content.rows.map(row => reorderArray(row, fromIndex, toIndex)!);
        onUpdate(block.id, {
            ...content,
            rows: newRows,
            columnWidths: reorderArray(content.columnWidths, fromIndex, toIndex),
            columnColors: reorderArray(content.columnColors, fromIndex, toIndex),
            columnTextColors: reorderArray(content.columnTextColors, fromIndex, toIndex),
        });
    }

    setDragState(null);
    setDragOver(null);
  };
  
  const handleAction = (action: string) => {
      if (!actionMenu) return;
      const { index } = actionMenu;
      const content = block.content as TableContent;
      let newContent = { ...content };

      const numCols = newContent.rows[0]?.length || 1;
      const numRows = newContent.rows.length;
      
      switch (action) {
          case 'insert_above': {
            const newRow = Array(numCols).fill('');
            newContent.rows.splice(index, 0, newRow);
            newContent.rowColors = modifyArray(newContent.rowColors, arr => { arr.splice(index, 0, undefined) }, numRows, undefined);
            newContent.rowTextColors = modifyArray(newContent.rowTextColors, arr => { arr.splice(index, 0, undefined) }, numRows, undefined);
            break;
          }
          case 'insert_below': {
            const newRow = Array(numCols).fill('');
            newContent.rows.splice(index + 1, 0, newRow);
            newContent.rowColors = modifyArray(newContent.rowColors, arr => { arr.splice(index + 1, 0, undefined) }, numRows, undefined);
            newContent.rowTextColors = modifyArray(newContent.rowTextColors, arr => { arr.splice(index + 1, 0, undefined) }, numRows, undefined);
            break;
          }
          case 'insert_left': {
              newContent.rows = newContent.rows.map(row => { const newRow = [...row]; newRow.splice(index, 0, ''); return newRow; });
              newContent.columnWidths = modifyArray(newContent.columnWidths, arr => { arr.splice(index, 0, 150) }, numCols, 150);
              newContent.columnColors = modifyArray(newContent.columnColors, arr => { arr.splice(index, 0, undefined) }, numCols, undefined);
              newContent.columnTextColors = modifyArray(newContent.columnTextColors, arr => { arr.splice(index, 0, undefined) }, numCols, undefined);
              break;
          }
           case 'insert_right': {
              newContent.rows = newContent.rows.map(row => { const newRow = [...row]; newRow.splice(index + 1, 0, ''); return newRow; });
              newContent.columnWidths = modifyArray(newContent.columnWidths, arr => { arr.splice(index + 1, 0, 150) }, numCols, 150);
              newContent.columnColors = modifyArray(newContent.columnColors, arr => { arr.splice(index + 1, 0, undefined) }, numCols, undefined);
              newContent.columnTextColors = modifyArray(newContent.columnTextColors, arr => { arr.splice(index + 1, 0, undefined) }, numCols, undefined);
              break;
          }
          case 'delete':
              if (actionMenu.type === 'row') {
                  if (newContent.rows.length <= 1) break;
                  newContent.rows = newContent.rows.filter((_, i) => i !== index);
                  newContent.rowColors = modifyArray(newContent.rowColors, arr => { arr.splice(index, 1) }, numRows, undefined);
                  newContent.rowTextColors = modifyArray(newContent.rowTextColors, arr => { arr.splice(index, 1) }, numRows, undefined);
              } else {
                  if (newContent.rows[0]?.length <= 1) break;
                  newContent.rows = newContent.rows.map(row => row.filter((_, i) => i !== index));
                  newContent.columnWidths = modifyArray(newContent.columnWidths, arr => { arr.splice(index, 1) }, numCols, 150);
                  newContent.columnColors = modifyArray(newContent.columnColors, arr => { arr.splice(index, 1) }, numCols, undefined);
                  newContent.columnTextColors = modifyArray(newContent.columnTextColors, arr => { arr.splice(index, 1) }, numCols, undefined);
              }
              break;
          case 'delete_table':
              onDeleteBlock(block.id);
              setActionMenu(null);
              return;
          case 'duplicate':
                if (actionMenu.type === 'row') {
                    const rowToCopy = newContent.rows[index];
                    newContent.rows.splice(index + 1, 0, [...rowToCopy]);
                    newContent.rowColors = modifyArray(newContent.rowColors, arr => { arr.splice(index + 1, 0, arr[index]) }, newContent.rows.length, undefined);
                    newContent.rowTextColors = modifyArray(newContent.rowTextColors, arr => { arr.splice(index + 1, 0, arr[index]) }, newContent.rows.length, undefined);
                } else {
                    newContent.rows = newContent.rows.map(row => { const newRow = [...row]; newRow.splice(index + 1, 0, row[index]); return newRow; });
                    newContent.columnWidths = modifyArray(newContent.columnWidths, arr => { arr.splice(index + 1, 0, arr[index]) }, numCols, 150);
                    newContent.columnColors = modifyArray(newContent.columnColors, arr => { arr.splice(index + 1, 0, arr[index]) }, numCols, undefined);
                    newContent.columnTextColors = modifyArray(newContent.columnTextColors, arr => { arr.splice(index + 1, 0, arr[index]) }, numCols, undefined);
                }
                break;
          case 'clear_contents':
               if (actionMenu.type === 'row') {
                   newContent.rows[index] = newContent.rows[index].map(() => '');
               } else {
                   newContent.rows = newContent.rows.map(row => row.map((cell, i) => i === index ? '' : cell));
               }
               break;
          default:
              if (action.startsWith('bg_color:')) {
                  const color = action.split(':')[1] || undefined;
                  const colors = actionMenu.type === 'row' ? 'rowColors' : 'columnColors';
                  newContent[colors] = modifyArray(newContent[colors], arr => { arr[index] = color }, actionMenu.type === 'row' ? content.rows.length : content.rows[0].length, undefined);
              }
              if (action.startsWith('text_color:')) {
                  const color = action.split(':')[1] || undefined;
                  const colors = actionMenu.type === 'row' ? 'rowTextColors' : 'columnTextColors';
                  newContent[colors] = modifyArray(newContent[colors], arr => { arr[index] = color }, actionMenu.type === 'row' ? content.rows.length : content.rows[0].length, undefined);
              }
      }

      onUpdate(block.id, newContent);
      setActionMenu(null);
  };


  const renderBlock = () => {
    const commonProps: any = {
      ref: ref,
      contentEditable: !readOnly,
      suppressContentEditableWarning: true,
      onInput: !readOnly ? handleInput : undefined,
      onKeyDown: !readOnly ? handleKeyDown : undefined,
      onFocus: () => onFocus(block.id),
      className: `w-full focus:outline-none ${readOnly ? 'cursor-text' : ''}`,
      style: { textAlign: block.textAlign || 'right' },
      dir: "auto"
    };

    switch (block.type) {
      case 'heading1':
        return <h1 {...commonProps} className={`${commonProps.className} text-3xl font-bold`}>{block.content as string}</h1>;
      
      case 'numberedList':
          return <span {...commonProps}>{block.content as string}</span>;

      case 'checklist': {
        const content = block.content as ChecklistContent;
        return (
            <div className="flex items-start group">
                <div className="relative flex items-center pt-1 ml-2">
                    <input 
                        type="checkbox"
                        checked={content.checked} 
                        onChange={e => onUpdate(block.id, {...content, checked: e.target.checked})}
                        disabled={readOnly}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-brand-primary checked:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all cursor-pointer disabled:cursor-default"
                    />
                    <svg
                        className="absolute w-5 h-5 left-0 top-1 hidden peer-checked:block pointer-events-none text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span 
                    {...commonProps}
                    className={`${commonProps.className} ${content.checked ? 'line-through text-gray-400' : ''}`}
                >
                    {content.text}
                </span>
            </div>
        )
      }

      case 'image': {
        const content = block.content as ImageContent;
        return (
            <div className="my-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                {!content.src ? (
                    !readOnly && <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500">
                        افزودن عکس
                    </button>
                ) : (
                    <img src={content.src} alt={content.caption || 'Document image'} className="max-w-full rounded-lg mx-auto" />
                )}
                <input type="text" value={content.caption} onChange={e => onUpdate(block.id, {...content, caption: e.target.value})} placeholder="افزودن کپشن..." readOnly={readOnly} className="w-full text-center text-sm p-1 border-none focus:ring-1 focus:ring-blue-400 rounded-md mt-2" dir="auto" />
            </div>
        )
      }

       case 'file': {
        const content = block.content as FileContent;
        return (
             <div className="my-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                {!content.name ? (
                     !readOnly && <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500">
                        افزودن فایل
                    </button>
                ) : (
                    <a href={content.url} download={content.name} className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <PaperClipIcon className="w-6 h-6 text-gray-500 ml-3"/>
                        <div>
                            <p className="font-semibold text-brand-text">{content.name}</p>
                            <p className="text-xs text-brand-subtext">{content.size}</p>
                        </div>
                    </a>
                )}
            </div>
        )
       }

        case 'date': {
            const content = block.content as DateContent;
            return (
                <div className="my-2 p-2 inline-block bg-gray-100 rounded-lg border">
                    <input 
                        type="date"
                        value={content.date.split('T')[0]}
                        onChange={e => onUpdate(block.id, { date: new Date(e.target.value).toISOString() })}
                        readOnly={readOnly}
                        className="border-none bg-transparent focus:ring-0 font-medium"
                    />
                </div>
            )
        }
        
        case 'mention': {
            const content = block.content as MentionContent;
            const user = users.find(u => u.id === content.userId);
            if (user) {
                return <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-sm font-medium my-2">
                    <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full ml-1.5"/>
                    @{user.name}
                </div>
            }
            if (readOnly) return null;
            return <select onChange={e => onUpdate(block.id, {userId: e.target.value})} className="my-2 p-1 text-sm border-gray-300 rounded-md">
                <option>یک کاربر را انتخاب کنید...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
        }

        case 'taskLink': {
            const content = block.content as TaskLinkContent;
            const task = tasks.find(t => t.id === content.taskId);
            if (task) {
                 return <button onClick={() => onSelectTask(task.id)} className="flex items-center p-2 bg-gray-100 rounded-lg my-2 text-sm border hover:bg-gray-200 w-full text-right">
                    <CheckCircleIcon className="w-5 h-5 text-gray-500 ml-2" />
                    <span className="font-medium">{task.content}</span>
                </button>
            }
            if (readOnly) return null;
            return <select onChange={e => onUpdate(block.id, {taskId: e.target.value})} className="my-2 p-1 text-sm border-gray-300 rounded-md">
                <option>یک تسک را انتخاب کنید...</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.content}</option>)}
            </select>
        }

        case 'formLink': {
             const content = block.content as FormLinkContent;
            const form = forms.find(f => f.id === content.formId);
            if (form) {
                 return <button onClick={() => onOpenForm(form.id)} className="flex items-center p-2 bg-purple-100 rounded-lg my-2 text-sm border border-purple-200 hover:bg-purple-200 w-full text-right">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600 ml-2" />
                    <span className="font-medium text-purple-800">{form.title}</span>
                </button>
            }
            if (readOnly) return null;
            return <select onChange={e => onUpdate(block.id, {formId: e.target.value})} className="my-2 p-1 text-sm border-gray-300 rounded-md">
                <option>یک فرم را انتخاب کنید...</option>
                {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
        }


      case 'table':
        const content = block.content as TableContent;
        if (!content || !content.rows) return null;
        
        return (
            <div className="my-4 overflow-x-auto relative group/table" onDragLeave={!readOnly ? handleDragLeave : undefined}>
                <table className="w-full border-collapse border border-gray-300 table-fixed">
                    <colgroup>
                        {!readOnly && <col className="w-8"/>}
                        {content.columnWidths?.map((width, i) => <col key={i} style={{width: `${width}px`}} />)}
                    </colgroup>
                    <thead className="relative">
                        <tr>
                            {!readOnly && <th className="border border-gray-300"></th>}
                            {content.rows[0].map((_, cIdx) => (
                                <th key={cIdx} className="p-0 border border-gray-300 h-6 relative group/th" onDragOver={!readOnly ? e => handleDragOver(e, 'col', cIdx) : undefined} onDrop={!readOnly ? e => handleDrop(e, 'col', cIdx) : undefined}>
                                    {!readOnly && (
                                    <div className="absolute inset-0">
                                        <button draggable onDragStart={(e) => handleDragStart(e, 'col', cIdx)} onClick={(e) => setActionMenu({type: 'col', index: cIdx, element: e.currentTarget})} className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-6 h-4 flex items-center justify-center text-gray-400 rounded hover:bg-gray-200 opacity-0 group-hover/table:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                            <DragHandleIcon className="w-4 h-4"/>
                                        </button>
                                         <div className={`absolute top-0 right-0 h-full w-1 cursor-col-resize z-10`} onMouseDown={(e) => setResizingCol({ index: cIdx, startX: e.clientX, startWidth: content.columnWidths?.[cIdx] || 150 })}/>
                                        {dragOver?.type === 'col' && dragOver.index === cIdx && <div className={`absolute inset-y-0 w-1 bg-blue-500 rounded-full ${dragOver.position === 'before' ? 'left-0' : 'right-0'}`}/>}
                                    </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {content.rows.map((row, rIdx) => {
                            const isHeader = content.hasHeaderRow && rIdx === 0;
                            const rowBg = TABLE_COLOR_MAP[content.rowColors?.[rIdx] || '']?.bg;
                            const rowTextColor = TEXT_COLOR_MAP[content.rowTextColors?.[rIdx] || '']?.text;
                            return (
                                <tr key={rIdx} className={`relative group/tr ${isHeader ? 'bg-gray-100 font-bold' : ''} ${rowBg} ${rowTextColor}`} onDragOver={!readOnly ? e => handleDragOver(e, 'row', rIdx) : undefined} onDrop={!readOnly ? e => handleDrop(e, 'row', rIdx) : undefined}>
                                    {!readOnly && (
                                    <td className="p-1 border border-gray-300 w-8 text-center">
                                        <button draggable onDragStart={(e) => handleDragStart(e, 'row', rIdx)} onClick={(e) => setActionMenu({type: 'row', index: rIdx, element: e.currentTarget})} className="w-6 h-6 flex items-center justify-center text-gray-400 rounded hover:bg-gray-200 opacity-0 group-hover/tr:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                           <DragHandleIcon className="w-4 h-4"/>
                                        </button>
                                        {dragOver?.type === 'row' && dragOver.index === rIdx && <div className={`absolute inset-x-0 h-1 bg-blue-500 rounded-full ${dragOver.position === 'before' ? 'top-0' : 'bottom-0'}`}/>}
                                    </td>
                                    )}
                                    {row.map((cell, cIdx) => {
                                        const colBg = TABLE_COLOR_MAP[content.columnColors?.[cIdx] || '']?.bg;
                                        const colTextColor = TEXT_COLOR_MAP[content.columnTextColors?.[cIdx] || '']?.text;
                                        return (
                                            <td 
                                                key={cIdx} 
                                                contentEditable={!readOnly}
                                                suppressContentEditableWarning 
                                                onInput={!readOnly ? (e) => handleTableInput(e, rIdx, cIdx) : undefined}
                                                onFocus={() => onFocus(block.id)}
                                                className={`p-2 border border-gray-300 focus:outline-none focus:bg-blue-50/50 relative ${colBg} ${colTextColor}`}
                                                dir="auto"
                                            >
                                                {cell}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {!readOnly && actionMenu && (
                    <TableActionMenu
                        targetElement={actionMenu.element}
                        type={actionMenu.type}
                        onAction={handleAction}
                        onClose={() => setActionMenu(null)}
                    />
                )}
            </div>
        );
      case 'paragraph':
      default:
        return <p {...commonProps} className={`${commonProps.className} text-base leading-relaxed`}>{block.content as string}</p>;
    }
  };

  return (
    <div className="py-1 relative" onContextMenu={handleContextMenu}>
        {renderBlock()}
        {!readOnly && contextMenu && (
            <div
                ref={contextMenuRef}
                style={{ top: contextMenu.y, left: contextMenu.x }}
                className="fixed bg-white rounded-md shadow-lg border z-[60] py-1 animate-fade-in"
            >
                <button
                    onClick={handleDeleteFromContext}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                    <TrashIcon className="w-4 h-4 ml-2" />
                    حذف
                </button>
            </div>
        )}
    </div>
  );
};

export default EditableBlock;