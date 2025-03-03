import React from 'react';
import { Exercise } from './indexdb_handler';

export const filterExercises = (exercises: Exercise[], searchTerm: string): Exercise[] => {
  if (searchTerm.trim() === '') {
    return exercises;
  }
  
  const lowercaseSearch = searchTerm.toLowerCase();
  return exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseSearch) || 
    exercise.type.toLowerCase().includes(lowercaseSearch)
  );
};

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Search exercises...' 
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}; 