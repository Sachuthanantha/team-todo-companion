
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

export type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Always ensure we have arrays to work with
  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value) ? value : [];

  const handleUnselect = (option: Option) => {
    onChange(safeValue.filter((item) => item.value !== option.value));
  };

  const handleSelect = (selectedOption: Option) => {
    const isSelected = safeValue.some((item) => item.value === selectedOption.value);
    if (isSelected) {
      onChange(safeValue.filter((item) => item.value !== selectedOption.value));
    } else {
      onChange([...safeValue, selectedOption]);
    }
    setInputValue("");
  };

  // Filter options based on input value
  const filteredOptions = safeOptions.filter((option) => {
    const matchesInput = option.label
      .toLowerCase()
      .includes(inputValue.toLowerCase());
    return matchesInput;
  });

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // The div that handles focus and displays the badges
  return (
    <div className="relative w-full">
      <div
        className={`flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <div className="flex flex-wrap gap-1">
          {safeValue.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="rounded-sm px-1 py-0 text-xs"
            >
              {item.label}
              <button
                type="button"
                className="ml-1 rounded-sm text-primary-foreground hover:text-primary-foreground/80"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnselect(item);
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {item.label}</span>
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={safeValue.length === 0 ? placeholder : ""}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay closing to allow click events to process
              setTimeout(() => {
                if (document.activeElement !== inputRef.current) {
                  setInputValue("");
                }
              }, 200);
            }}
          />
        </div>
      </div>
      
      {open && filteredOptions.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-1"
          ref={dropdownRef}
        >
          <div className="relative rounded-md border border-input bg-popover shadow-md overflow-hidden">
            <div className="max-h-[200px] overflow-auto p-1">
              {filteredOptions.map((option) => {
                const isSelected = safeValue.some(
                  (item) => item.value === option.value
                );
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-default select-none rounded-sm ${
                      isSelected ? "bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`mr-2 h-4 w-4 rounded-sm border flex items-center justify-center ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted"
                      }`}
                    >
                      {isSelected && "✓"}
                    </span>
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
