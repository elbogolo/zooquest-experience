
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({
  placeholder = "Search...",
  className = "",
  value,
  onChange,
}: SearchBarProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="zoo-text-field pl-10 pr-4 py-3 w-full rounded-full bg-gray-100 focus:bg-white"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
    </div>
  );
};

export default SearchBar;
