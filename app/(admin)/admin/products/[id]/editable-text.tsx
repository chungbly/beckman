import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useState } from "react";

function EditableText({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onBlur?.(value);
          }}
          placeholder={placeholder}
        />
      ) : (
        <h3 className={cn("text-lg text-neutral-600", className)}>
          {value || placeholder}
        </h3>
      )}
      <Pencil
        className="h-4 w-4 cursor-pointer"
        onClick={() => setIsEditing(true)}
      />
    </div>
  );
}

export default EditableText;
