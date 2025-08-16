"use client";
import QueryProvider from "@/app/providers";
import { useConfigs } from "@/store/useConfig";
import {
  accordionComponent,
  canvasFullSize,
  canvasGridMode,
  flexComponent,
  iconifyComponent,
  layoutSidebarButtons,
  lightGalleryComponent,
  listPagesComponent,
  swiperComponent,
  tableComponent,
  youtubeAssetProvider,
} from "@grapesjs/studio-sdk-plugins";
import StudioEditor, {
  PagesConfig,
  ProjectConfig,
  ProjectDataResult,
} from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { createRoot } from "react-dom/client";
import FileManager from "../file-manager";

export default function GrapesStudio({
  pages,
  onSave,
  value,
  project = {
    type: "web",
    default: {
      pages,
    },
  },
}: {
  value?: ProjectDataResult;
  pages?: false | PagesConfig | undefined;
  project: ProjectConfig;
  onSave?: (data: { html: string; css: string; project: string }) => void;
}) {
  const configs = useConfigs((s) => s.configs);

  function transformBodyToDiv(html: string) {
    return html
      .replace(/<body([^>]*)>/i, "<div$1>")
      .replace(/<\/body>/i, "</div>");
  }

  async function imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); // đây chính là base64
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return (
    <>
      <StudioEditor
        options={{
          onReady: (editor) => (window.editor = editor),
          gjsOptions: {
            storageManager: false,
            assetManager: {
              custom: {
                open(props) {
                  const el = document.createElement("div");
                  el.id = "inline-file-manager";
                  document.body.appendChild(el);

                  const root = createRoot(el);

                  const unmount = () => {
                    root.unmount();
                    el.remove();
                  };

                  root.render(
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 9999, // đảm bảo nổi lên trên editor
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 8,
                          padding: 16,
                          width: "80%",
                          height: "80%",
                          overflow: "auto",
                        }}
                      >
                        <QueryProvider configs={configs}>
                          <FileManager
                            singleSelect
                            onSelect={async (images) => {
                              const first = images?.[0];
                              if (!first) return;

                              const cleanUrl = `https://${first
                                .replace(/^https?:\/\//, "")
                                .replaceAll("//", "/")}`;

                              const base64 = await imageUrlToBase64(cleanUrl);

                              props.select?.({ src: cleanUrl });
                              props.close?.();

                              unmount();
                            }}
                          />
                        </QueryProvider>
                      </div>
                    </div>
                  );
                },
                close() {
                  const el = document.getElementById("inline-file-manager");
                  if (el) {
                    const root = createRoot(el);
                    root.unmount();
                    el.remove();
                  }
                },
              },
            },
          },

          licenseKey: process.env.NEXT_PUBLIC_GRAPES_API_KEY || "",
          theme: "dark",
          project,
          pages,
          storage: {
            type: "self",
            // Provide a custom handler for saving the project data.
            onSave: async (data) => {
              const { editor, project } = data;
              if (onSave) {
                onSave({
                  html: transformBodyToDiv(editor.editor.getHtml() || ""),
                  css: editor.editor.getCss() || "",
                  project: JSON.stringify(project),
                });
              }
              // throw new Error('Implement your "onSave"!');
              // const body = new FormData();
              // body.append("project", JSON.stringify(project));
              // await fetch("PROJECT_SAVE_URL", { method: "POST", body });
            },
            // Provide a custom handler for loading project data.
            onLoad: async () => {
              // throw new Error('Implement your "onLoad"!');
              // const response = await fetch("PROJECT_LOAD_URL");
              // const project = await response.json();
              // The project JSON is expected to be returned inside an object.
              if (!value) return { project: {} };
              return {
                project: value,
              };
            },
            autosaveChanges: 10000,
            autosaveIntervalMs: 6000000,
          },
          plugins: [
            tableComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/table */
            }),
            listPagesComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/listPages */
            }),
            lightGalleryComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/lightGallery */
            }),
            swiperComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/swiper */
            }),
            iconifyComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/iconify */
            }),
            accordionComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/accordion */
            }),
            flexComponent.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/components/flex */
            }),
            canvasFullSize.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/canvas/full-size */
            }),
            canvasGridMode.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/canvas/grid-mode */
            }),
            layoutSidebarButtons.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/layout/sidebar-buttons */
            }),
            youtubeAssetProvider.init({
              /* Plugin options: https://app.grapesjs.com/docs-sdk/plugins/asset-providers/youtube-asset-provider */
            }),
          ],
          fonts: {
            enableFontManager: true,
            default: ({ baseDefault }) => [
              // Add font objects with font files. This will be added to the project JSON automatically.
              {
                family: "Aboreto",
                variants: {
                  regular: {
                    source:
                      "https://fonts.gstatic.com/s/aboreto/v2/5DCXAKLhwDDQ4N8blKHeA2yuxSY.woff2",
                  },
                },
              },
              {
                family: "Oswald",
                variants: {
                  regular: {
                    source:
                      "https://fonts.gstatic.com/s/oswald/v49/TK3iWkUHHAIjg75cFRf3bXL8LICs1YRs.woff2",
                  },
                  bold: {
                    source:
                      "https://fonts.gstatic.com/s/oswald/v49/TK3iWkUHHAIjg75cFRf3bXL8LICs1ZxM.woff2",
                  },
                },
              },
              // Add fonts without font files that rely on system fonts with fallbacks.
              {
                id: '"Times New Roman", serif',
                label: "Times New Roman",
              },
              // Use parts of the base default fonts.
              ...baseDefault,
            ],
          },
          // assets: {
          //   storageType: "self",
          //   // Provide a custom upload handler for assets
          //   onUpload: async ({ files }) => {
          //     const body = new FormData();
          //     for (const file of files) {
          //       body.append("files", file);
          //     }
          //     const response = await fetch("ASSETS_UPLOAD_URL", {
          //       method: "POST",
          //       body,
          //     });
          //     const result = await response.json();
          //     // The expected result should be an array of assets, eg.
          //     // [{ src: 'ASSET_URL' }]
          //     return result;
          //   },
          //   // Provide a custom handler for deleting assets
          //   onDelete: async ({ assets }) => {
          //     const body = JSON.stringify(assets);
          //     await fetch("ASSETS_DELETE_URL", { method: "DELETE", body });
          //   },
          // },
        }}
      />
    </>
  );
}
