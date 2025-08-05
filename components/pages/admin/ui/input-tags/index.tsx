import { Input } from "@/components/ui/input";

function InputTags<T>({
  tags,
  onChange,
}: {
  tags: T[];
  onChange: (tags: T[]) => void;
}) {
  return (
    <>
      <Input
        placeholder="Nhập tag mới vào đây và nhấn Enter"
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const newTag = e.currentTarget.value.trim();
            if (!newTag) return;

            const newTags = [...tags, newTag];
            onChange(newTags as unknown as T[]);
            e.currentTarget.value = "";
          }
        }}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-muted px-2 py-1 rounded-md text-sm flex items-center gap-1"
          >
            {tag as React.ReactNode}
            <button
              type="button"
              className="hover:text-red-500"
              onClick={() => {
                const newTags = tags.filter((_, i) => i !== index);
                onChange(newTags);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </>
  );
}

export default InputTags;
