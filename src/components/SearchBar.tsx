
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (searchTerm: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

const SearchBar = ({
  placeholder = "Search...",
  className = "",
  value,
  onChange,
  onSubmit,
  initialValue = "",
  autoFocus = false,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  
  // Use either controlled (from parent) or internal state
  const searchValue = value !== undefined ? value : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (onSubmit && searchValue.trim()) {
      onSubmit(searchValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className="zoo-text-field pl-10 pr-16 py-3 w-full rounded-full bg-secondary focus:bg-background"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      {onSubmit && (
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-3"
          onClick={handleSubmit}
          disabled={!searchValue.trim()}
        >
          Search
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
