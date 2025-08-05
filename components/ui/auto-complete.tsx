// @ts-nocheck
"use client";

import { Check, CheckIcon, ChevronsUpDown } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Normalize<T> = T extends undefined ? false : T;

type ObjectType<T, K> = Normalize<T> extends true
  ? K[]
  : Normalize<T> extends false
  ? K
  : K;

export function AutoComplete<
  T extends boolean | undefined,
  K extends { value: any; label: string }
>({
  value,
  onChange,
  multiple,
  options = [],
  isLoading = false,
  placeholder = "Tìm kiếm...",
  loadingText = "Đang tải...",
  noOptionsText = "Không tìm thấy kết quả",
  onInputChange,
  disabled,
  className,
}: {
  options: K[];
  placeholder?: string;
  multiple?: T;
  noOptionsText?: string;
  value?: ObjectType<T, K>;
  loadingText?: string;
  onChange: (value: ObjectType<T, K>) => void;
  isLoading?: boolean;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState<ObjectType<T, K>>(
    value as ObjectType<T, K>
  );

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (multiple) {
      if (Array.isArray(value)) {
        setInternalValue(value);
      } else {
        if (value) {
          setInternalValue([value!]);
        }
      }
    } else {
      setInternalValue(value);
    }
  }, [value, multiple]);

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between  font-normal flex overflow-hidden",
            className
          )}
        >
          {multiple ? (
            !!internalValue?.length ? (
              <p className="max-w-[80%] overflow-hidden overflow-ellipsis line-clamp-1">
                {options
                  ?.filter((option) =>
                    internalValue.some((v) => v?.value === option?.value)
                  )
                  .map((option) => option?.label)
                  .join(", ")}
              </p>
            ) : (
              placeholder
            )
          ) : value ? (
            options.find((option) => option?.value === internalValue?.value)
              ?.label
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-max p-0"
        style={{ width: "var(--radix-popper-anchor-width)" }}
      >
        <Command className="w-full">
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onInput={(e) => {
              onInputChange?.(e.target.value);
              setInputValue(e.target.value);
            }}
            className="h-9 font-normal border-0 border-transparent"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? loadingText : noOptionsText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = multiple
                  ? internalValue.some((v) => v.value === option.value)
                  : internalValue?.value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label + option.value}
                    className={cn(
                      "",
                      multiple
                        ? internalValue.some((v) => v.value === option.value)
                          ? "bg-neutral-100"
                          : ""
                        : internalValue?.value === option.value
                        ? "bg-neutral-100 "
                        : ""
                    )}
                    onSelect={(currentValue) => {
                      if (multiple) {
                        const newValue = internalValue.some(
                          (v) => v.value === option.value
                        )
                          ? internalValue.filter(
                              (v) => v.value !== option.value
                            )
                          : [...internalValue, option];
                        setInternalValue(newValue);
                        onChange?.(newValue);
                        return;
                      }
                      const newValue =
                        internalValue && option.value === internalValue.value
                          ? null
                          : options.find((o) => o.value === option.value);
                      setInternalValue(newValue);
                      onChange?.(newValue);
                      setOpen(false);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        multiple
                          ? internalValue.some((v) => v.value === option.value)
                            ? "opacity-100"
                            : "opacity-0"
                          : internalValue?.value === option.value
                          ? "opacity-100 "
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
