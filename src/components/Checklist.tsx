import React, { useState, useCallback, FormEvent, KeyboardEvent } from 'react';
import type { ChecklistStateType, ChecklistItemType } from '../types';
import { ChecklistItem } from './ChecklistItem';
import { useKeystrokeSound } from '../hooks/useKeystrokeSound';
import { XIcon } from './icons/XIcon';

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
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full overflow-y-auto relative flex flex-col gap-2">
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
        className="text-lg font-bold w-full bg-transparent outline-none p-2 border border-gray-400 text-black checklist-title"
      />
      
      <div className="flex gap-2">
        <div className="flex-1">
            <label className="text-xs text-gray-600">Type</label>
            <select 
                value={checklist.checklistType} 
                onChange={e => handleFieldChange('checklistType', e.target.value as any)}
                className="w-full bg-transparent text-sm text-black outline-none border border-gray-400 p-2"
            >
                <option value=""></option>
                <option value="DO-CONFIRM">DO-CONFIRM</option>
                <option value="READ-DO">READ-DO</option>
            </select>
        </div>
        <div className="flex-1">
            <label className="text-xs text-gray-600">Context</label>
            <input
              type="text"
              value={checklist.context}
              onChange={(e) => handleFieldChange('context', e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Description of checklist"
              className="w-full bg-transparent text-sm text-black outline-none border border-gray-400 p-2"
            />
        </div>
      </div>
      
      <div className="flex-grow space-y-1 py-2">
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

      <div className="no-print flex flex-col gap-2">
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a new item..."
              className="flex-grow bg-white p-2 text-sm text-black border border-gray-400 outline-none"
            />
          </form>
          <div className="flex">
            <button onClick={handleAddSection} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 border border-gray-400 transition-colors">Add Section</button>
          </div>
      </div>
      
      <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-2 whitespace-nowrap">Checklist created by:</label>
            <input
                type="text"
                value={checklist.createdBy}
                onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="<Name>"
                className="w-full bg-transparent text-sm text-black outline-none border border-gray-400 p-2"
            />
          </div>
          <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2 whitespace-nowrap">Checklist completed by:</label>
              <input
                type="text"
                value={checklist.completedBy}
                onChange={(e) => handleFieldChange('completedBy', e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="<Name>"
                className="w-full bg-transparent text-sm text-black outline-none border border-gray-400 p-2"
              />
          </div>
      </div>
    </div>
  );
};