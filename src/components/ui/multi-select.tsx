
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
  options = [],
  value = [], 
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

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
  const displayOptions = safeOptions.filter((option) => {
    const matchesInput = option.label
      .toLowerCase()
      .includes(inputValue.toLowerCase());
    return matchesInput;
  });

  // Create a ref for tracking dropdown state
  const commandRef = React.useRef<HTMLDivElement>(null);

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
            onBlur={(e) => {
              // Only close if the click is not within our dropdown
              if (!commandRef.current?.contains(e.relatedTarget as Node)) {
                setOpen(false);
              }
            }}
          />
        </div>
      </div>
      {open && (
        <div className="relative" ref={commandRef}>
          {displayOptions.length > 0 ? (
            <Command className="absolute top-0 w-full z-50 bg-popover shadow-md rounded-md border border-border mt-1">
              <CommandGroup className="max-h-[200px] overflow-auto">
                {displayOptions.map((option) => {
                  const isSelected = safeValue.some(
                    (item) => item.value === option.value
                  );
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option)}
                      className={`flex items-center ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                    >
                      <span
                        className={`mr-2 h-4 w-4 rounded-sm border ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted"
                        }`}
                      >
                        {isSelected && "✓"}
                      </span>
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          ) : (
            <Command className="absolute top-0 w-full z-50 bg-popover shadow-md rounded-md border border-border mt-1">
              <CommandGroup className="max-h-[200px] overflow-auto">
                <div className="py-2 px-4 text-sm text-muted-foreground">
                  No options found.
                </div>
              </CommandGroup>
            </Command>
          )}
        </div>
      )}
    </div>
  );
}
