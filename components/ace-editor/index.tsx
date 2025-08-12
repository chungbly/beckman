"use client";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import 'ace-builds/src-noconflict/ace';
function AceEmmetEditor({
  value,
  onChange,
  language = "json",
  theme = "github",
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}) {
  return (
    <AceEditor
      style={{
        height: "600px",
        width: "100%",
      }}
      placeholder="Placeholder Text"
      mode={language || "json"}
      theme={theme || "github"}
      name="blah2_1"
      value={value}
      onChange={(value) => onChange?.(value)}
      fontSize={14}
      lineHeight={19}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        enableMobileMenu: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
}

export default AceEmmetEditor;
