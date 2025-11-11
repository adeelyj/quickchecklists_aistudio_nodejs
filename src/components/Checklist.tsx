import React, { useState, useCallback, FormEvent, KeyboardEvent } from 'react';
import type { ChecklistStateType, ChecklistItemType } from '../types';
import { ChecklistItem } from './ChecklistItem';
import { useKeystrokeSound } from '../hooks/useKeystrokeSound';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ChecklistProps {
  checklist: ChecklistStateType;
  onUpdate: (id: number, updatedData: Partial<ChecklistStateType>) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

export const Checklist: React.FC<ChecklistProps> = ({ checklist, onUpdate, onRemove, canRemove }) => {
  const [newItemText, setNewItemText] = useState<string>('');
  const playKeystrokeSound = useKeystrokeSound();

  const dragItemId = React.useRef<number | null>(null);
  const dragOverItemId = React.useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const handleFieldChange = (field: keyof ChecklistStateType, value: any) => {
    onUpdate(checklist.id, { [field]: value });
  };

  const handleItemsChange = useCallback((newItems: ChecklistItemType[]) => {
    onUpdate(checklist.id, { items: newItems });
  }, [onUpdate, checklist.id]);
  
  const handleAddItem = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() === '') return;
    const newItems = [
      ...checklist.items,
      { id: Date.now(), text: newItemText, type: 'item' as const, completed: false, indentation: 0 },
    ];
    handleItemsChange(newItems);
    setNewItemText('');
  }, [newItemText, checklist.items, handleItemsChange]);

  const handleAddSection = useCallback(() => {
    const newItems = [
        ...checklist.items,
        { id: Date.now(), text: 'New Section', type: 'section' as const, completed: false, indentation: 0 },
    ];
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);

  const handleToggleItem = useCallback((id: number) => {
    const newItems = checklist.items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);

  const handleDeleteItem = useCallback((id: number) => {
    const newItems = checklist.items.filter(item => item.id !== id);
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);

  const handleUpdateItemText = useCallback((id: number, newText: string) => {
    const newItems = checklist.items.map(item =>
        item.id === id ? { ...item, text: newText } : item
    );
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);
  
  const handleIndentItem = useCallback((id: number, direction: 'increase' | 'decrease') => {
    const newItems = checklist.items.map(item => {
      if (item.id === id && item.type === 'item') {
        const newIndentation = direction === 'increase'
          ? Math.min(item.indentation + 1, 5)
          : Math.max(item.indentation - 1, 0);
        return { ...item, indentation: newIndentation };
      }
      return item;
    });
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);

  const handleDragStart = useCallback((id: number) => {
    dragItemId.current = id;
    setDraggingId(id);
  }, []);

  const handleDragEnter = useCallback((id: number) => {
    dragOverItemId.current = id;
  }, []);

  const handleDrop = useCallback(() => {
    if (dragItemId.current === null || dragOverItemId.current === null) return;
    
    const draggedIndex = checklist.items.findIndex(item => item.id === dragItemId.current);
    const targetIndex = checklist.items.findIndex(item => item.id === dragOverItemId.current);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;
    
    const newItems = [...checklist.items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    handleItemsChange(newItems);
  }, [checklist.items, handleItemsChange]);

  const handleDragEnd = useCallback(() => {
    dragItemId.current = null;
    dragOverItemId.current = null;
    setDraggingId(null);
  }, []);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    playKeystrokeSound();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full overflow-y-auto relative flex flex-col gap-6 bg-white">
      {canRemove && (
        <button
          onClick={() => onRemove(checklist.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors no-print z-10"
          aria-label="Remove Checklist"
        >
          <XIcon />
        </button>
      )}
      <input
        type="text"
        value={checklist.title}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="Checklist Title"
        className="text-2xl font-black tracking-wider uppercase bg-transparent w-full border-0 border-b-4 border-black pb-2 focus:outline-none focus:ring-0 focus:border-black checklist-title"
      />
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1">
            <label className="text-xs text-gray-500">Type</label>
            <select 
                value={checklist.checklistType} 
                onChange={e => handleFieldChange('checklistType', e.target.value as any)}
                className="w-full bg-transparent text-sm text-black p-2 mt-1 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
            >
                <option value=""></option>
                <option value="DO-CONFIRM">DO-CONFIRM</option>
                <option value="READ-DO">READ-DO</option>
            </select>
        </div>
        <div className="flex-1">
            <label className="text-xs text-gray-500">Context</label>
            <input
              type="text"
              value={checklist.context}
              onChange={(e) => handleFieldChange('context', e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Description of checklist"
              className="w-full bg-transparent text-sm text-black p-2 mt-1 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
            />
        </div>
      </div>
      
       <div className="no-print flex flex-col gap-3 pt-2">
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a new item..."
              className="flex-grow bg-white p-2 text-sm text-black border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors shrink-0" aria-label="Add new item">
              <PlusIcon />
            </button>
          </form>
          <div className="flex">
            <button onClick={handleAddSection} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition-colors">Add Section</button>
          </div>
      </div>

      <div className="flex-grow space-y-1 py-2 min-h-[100px]">
        {checklist.items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
              onUpdateText={handleUpdateItemText}
              onIndent={handleIndentItem}
              isDragging={draggingId === item.id}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-auto pt-6 border-t border-gray-200">
          <div className="w-full md:flex-1">
            <label className="text-xs text-gray-500">Checklist created by:</label>
            <input
                type="text"
                value={checklist.createdBy}
                onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="<Name>"
                className="w-full bg-transparent text-sm text-black p-2 mt-1 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="w-full md:flex-1">
              <label className="text-xs text-gray-500">Checklist completed by:</label>
              <input
                type="text"
                value={checklist.completedBy}
                onChange={(e) => handleFieldChange('completedBy', e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="<Name>"
                className="w-full bg-transparent text-sm text-black p-2 mt-1 border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
              />
          </div>
      </div>
    </div>
  );
};