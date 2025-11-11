import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { ChecklistItemType } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { useKeystrokeSound } from '../hooks/useKeystrokeSound';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateText: (id: number, newText: string) => void;
  onIndent: (id: number, direction: 'increase' | 'decrease') => void;
  isDragging: boolean;
  onDragStart: (id: number) => void;
  onDragEnter: (id: number) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = React.memo(({ 
  item, 
  onToggle, 
  onDelete,
  onUpdateText,
  onIndent,
  isDragging,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const playKeystrokeSound = useKeystrokeSound();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Update internal state if item text prop changes from outside
  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);


  const handleSave = () => {
    if (editText.trim() !== '' && editText !== item.text) {
      onUpdateText(item.id, editText);
    } else {
      setEditText(item.text); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    playKeystrokeSound();
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(item.text); // Revert changes
      setIsEditing(false);
    } else if (item.type === 'item' && e.key === 'Tab') {
      e.preventDefault();
      onIndent(item.id, e.shiftKey ? 'decrease' : 'increase');
    }
  };

  const handleDoubleClick = () => {
    if (item.type === 'item' && item.completed) return;
    setIsEditing(true);
  };
  
  const isSection = item.type === 'section';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragEnter={() => onDragEnter(item.id)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-center group rounded-sm transition-all duration-200 ${
        isDragging ? 'opacity-30 bg-gray-200' : 'opacity-100'
      }`}
      style={{ paddingLeft: isSection ? '0' : `${item.indentation * 1.5}rem` }}
    >
      <div className="cursor-move text-gray-400 mr-1 touch-none no-print" aria-label="Drag to reorder">
        <DragHandleIcon />
      </div>
      <div className="flex-shrink-0">
        <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle(item.id)}
            className={`h-4 w-4 mr-2 accent-gray-700 cursor-pointer ${isSection ? 'opacity-50 cursor-default' : ''}`}
            aria-label={`Mark "${item.text}" as ${item.completed ? 'incomplete' : 'complete'}`}
            disabled={isSection}
        />
      </div>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`flex-grow text-sm bg-gray-50 outline-none p-1 -m-1 border-b-2 border-blue-400 ${isSection ? 'font-bold section-title' : ''}`}
          aria-label="Edit item text"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`flex-grow text-sm text-gray-800 transition-all duration-300 py-1 ${
            item.completed && !isSection ? 'line-through text-gray-400' : 'cursor-text'
          } ${isSection ? 'font-bold text-base section-title' : ''}`}
          title={item.completed ? undefined : 'Double-click to edit'}
        >
          {item.text}
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-print"
        aria-label={`Delete item "${item.text}"`}
      >
        <TrashIcon />
      </button>
    </div>
  );
});