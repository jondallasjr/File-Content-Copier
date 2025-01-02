import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

interface SearchBoxProps {
  onSearch: (term: string) => void;
  disabled?: boolean;
}

export function SearchBox({ onSearch, disabled = false }: SearchBoxProps) {
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
        placeholder="Search files..."
        className="w-full pl-10 pr-4 py-2 border rounded bg-white disabled:bg-gray-100"
      />
    </div>
  );
}