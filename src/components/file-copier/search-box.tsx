// src/components/file-copier/search-box.tsx
import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

interface SearchBoxProps {
  onSearch: (term: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchBox({ 
  onSearch, 
  disabled = false,
  placeholder = "Search files..." 
}: SearchBoxProps) {
  const [value, setValue] = useState('');
  
  const debouncedSearch = useCallback(
    debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-900"
      />
    </div>
  );
}