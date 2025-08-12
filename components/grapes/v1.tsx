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
  function transformBodyToDiv(html: string) {
    return html
      .replace(/<body([^>]*)>/i, "<div$1>")
      .replace(/<\/body>/i, "</div>");
  }
  return (
    <StudioEditor
      options={{
        onReady: (editor) => (window.editor = editor),
        gjsOptions: { storageManager: false },
        licenseKey: process.env.NEXT_PUBLIC_GRAPES_API_KEY || "",
        theme: "dark",
        project,
        pages,
        assets: {
          storageType: "self",
          // Provide a custom upload handler for assets
          onUpload: async ({ files }) => {
            const body = new FormData();
            for (const file of files) {
              body.append("files", file);
            }
            const response = await fetch("ASSETS_UPLOAD_URL", {
              method: "POST",
              body,
            });
            const result = await response.json();
            // The expected result should be an array of assets, eg.
            // [{ src: 'ASSET_URL' }]
            return result;
          },
          // Provide a custom handler for deleting assets
          onDelete: async ({ assets }) => {
            const body = JSON.stringify(assets);
            await fetch("ASSETS_DELETE_URL", { method: "DELETE", body });
          },
        },
        storage: {
          type: "self",
          // Provide a custom handler for saving the project data.
          onSave: async (data) => {
            const { editor, project } = data;
            // console.log("data", data);
            console.log("editor", editor.editor.getHtml());
            console.log("editor", editor.editor.getCss());
            // console.log("editor", editor.editor.getCurrentPage());
            console.log("project", project);
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
            console.log("value", value);
            if (!value) return { project: {} };
            return {
              project: value,
            };
          },
          // autosaveChanges: 100,
          // autosaveIntervalMs: 10000,
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
      }}
    />
  );
}
