import GjsEditor from "@grapesjs/react";
import grapesjs, { Editor } from "grapesjs";

import basicBlocks from "grapesjs-blocks-basic";
import formsPlugin from "grapesjs-plugin-forms";
import presetWebpage from "grapesjs-preset-webpage";
import pluginSwiper from "./swiper";

export default function DefaultEditor() {
  const onEditor = (editor: Editor) => {
    console.log("Editor loaded", { editor });
    editor.on("load", () => {
      const iframeDoc = editor.Canvas.getDocument();
      let link = iframeDoc.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Roboto:wght@400;700&display=swap";
      iframeDoc.head.appendChild(link);

      // inject CSS
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
      iframeDoc.head.appendChild(link);

      // inject JS
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
      iframeDoc.head.appendChild(script);
    });
    editor.on("component:add", (model) => {
      if (model.is("text") || model.get("type") === "text") {
        if (!model.getStyle()["font-family"]) {
          model.addStyle({ "font-family": "Oswald, sans-serif" });
        }
      }
    });
    const fontProp = editor.StyleManager.getProperty(
      "typography",
      "font-family"
    );

    if (fontProp) {
      const oldOptions = fontProp.get("options") || [];
      const newFonts = [
        { id: "Roboto, sans-serif", name: "Roboto" },
        { id: "Oswald, sans-serif", name: "Oswald" },
      ];

      // Chỉ thêm nếu chưa có
      const mergedOptions = [
        ...oldOptions,
        ...newFonts.filter(
          (nf) => !oldOptions.some((of: any) => of.id === nf.id)
        ),
      ];

      fontProp.set("options", mergedOptions);
    }
  };

  return (
    <GjsEditor
      // Pass the core GrapesJS library to the wrapper (required).
      // You can also pass the CDN url (eg. "https://unpkg.com/grapesjs")
      grapesjs={grapesjs}
      // Load the GrapesJS CSS file asynchronously from URL.
      // This is an optional prop, you can always import the CSS directly in your JS if you wish.
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      // GrapesJS init options
      options={{
        height: "100%",
        storageManager: false,
      }}
      plugins={[
        basicBlocks,
        presetWebpage,
        formsPlugin,
        pluginSwiper,
        // swiperComponent?.init({
        //   block: false, // Skip default block
        // }),
        // Add custom blocks for the swiper
        // (editor) => {
        //   editor.Blocks.add("swiper", {
        //     label: "Swiper Slider",
        //     category: "Swiper example",
        //     media:
        //       '<svg viewBox="0 0 24 24"><path d="M22 7.6c0-1-.5-1.6-1.3-1.6H3.4C2.5 6 2 6.7 2 7.6v9.8c0 1 .5 1.6 1.3 1.6h17.4c.8 0 1.3-.6 1.3-1.6V7.6zM21 18H3V7h18v11z" fill-rule="nonzero"/><path d="M4 12.5L6 14v-3zM20 12.5L18 14v-3z"/></svg>',
        //     content: `<div class="swiper" style="height: 200px">
        //       <div class="swiper-wrapper">
        //         <div class="swiper-slide"><div>Slide 1</div></div>
        //         <div class="swiper-slide"><div>Slide 2</div></div>
        //         <div class="swiper-slide"><div>Slide 3</div></div>
        //       </div>
        //       <div class="swiper-button-next"></div>
        //       <div class="swiper-button-prev"></div>
        //     </div>`,
        //   });
        //   editor.StyleManager.removeProperty("typography", "font-family");

        //   editor.StyleManager.addProperty("typography", {
        //     property: "font-family",
        //     name: "Font Family",
        //     type: "select",
        //     defaults: "Roboto, sans-serif",
        //     options: [
        //       { id: "Roboto, sans-serif", name: "Roboto" },
        //       { id: "Oswald, sans-serif", name: "Oswald" },
        //       { id: "Arial, sans-serif", name: "Arial" },
        //       { id: "'Times New Roman', serif", name: "Times New Roman" },
        //     ],
        //   });
        // },
      ]}
      onEditor={onEditor}
    />
  );
}
