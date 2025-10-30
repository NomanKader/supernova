import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Combobox = React.forwardRef(
  (
    {
      value,
      onChange,
      options = [],
      placeholder = "Search and select…",
      searchPlaceholder = "Search…",
      emptyMessage = "No results found.",
      disabled = false,
      loading = false,
      className,
      buttonProps,
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const buttonRef = React.useRef(null);

    const mergedRef = React.useCallback(
      (node) => {
        buttonRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const selected = options.find((option) => option.value === value) || null;

    const handleSelect = (selectedValue) => {
      if (disabled) return;
      if (selectedValue === value) {
        setOpen(false);
        return;
      }
      onChange?.(selectedValue);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <Button
            ref={mergedRef}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full justify-between",
              !selected && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-60",
              className,
            )}
            disabled={disabled}
            {...buttonProps}
            {...rest}
          >
            <span className="flex min-h-[1.5rem] flex-1 flex-col items-start truncate text-left">
              {selected ? (
                <>
                  <span>{selected.label}</span>
                  {selected.description ? (
                    <span className="text-xs text-muted-foreground">{selected.description}</span>
                  ) : null}
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[180px] p-0"
          align="start"
          sideOffset={4}
          style={{ width: buttonRef.current?.offsetWidth }}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={[option.label, option.description].filter(Boolean).join(" ")}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", option.value === value ? "opacity-100" : "opacity-0")} />
                    <span className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description ? (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
