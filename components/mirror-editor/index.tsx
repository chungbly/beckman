"use client";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import CodeMirror from "@uiw/react-codemirror";

function MirrorEditor({
  value,
  onChange,
  readOnly = false,
  height = "500px",
  className = "",
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
}) {
  return (
    <CodeMirror
      value={value || ""}
      readOnly={readOnly}
      height={height}
      className={className}
      theme={tokyoNight}
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
    />
  );
}

export default MirrorEditor;
