import React from 'react';

export const AddChecklistIcon: React.FC = () => (
  <div className="w-20 h-20 bg-gray-200 border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-gray-800"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  </div>
);