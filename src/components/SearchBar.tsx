
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

const SearchBar = ({
  placeholder = "Search...",
  className = "",
  value,
  onChange,
  onSubmit,
}: SearchBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
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
          onClick={onSubmit}
        >
          Search
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
