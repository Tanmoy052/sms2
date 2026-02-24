"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select or type item...",
  searchPlaceholder = "Type to search or add new...",
  emptyText = "No item found.",
  allowCustom = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Filter items based on input value
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={(val) => setInputValue(val)}
            className="h-9"
          />
          <CommandList>
            {filteredItems.length === 0 && (
              <CommandEmpty>
                {allowCustom && inputValue ? (
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      "{inputValue}" not found.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full h-8"
                      onClick={() => handleSelect(inputValue)}
                    >
                      Use "{inputValue}"
                    </Button>
                  </div>
                ) : (
                  emptyText
                )}
              </CommandEmpty>
            )}
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem key={item} value={item} onSelect={handleSelect}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
