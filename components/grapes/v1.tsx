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
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

export default function GrapesStudio() {
  return (
    <StudioEditor
      options={{
        licenseKey:
          "944d8864aeac48f98f0458e9c36e146f3311139b80934a59b69393eb75749b28",
        theme: "dark",
        project: {
          type: "web",
          default: {
            pages: [
              { name: "Home", component: "<h1>Home page</h1>" },
              { name: "About", component: "<h1>About page</h1>" },
              { name: "Contact", component: "<h1>Contact page</h1>" },
            ],
          },
        },
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
          onSave: async ({ project }) => {
            console.log("project", project);
            // throw new Error('Implement your "onSave"!');
            // const body = new FormData();
            // body.append("project", JSON.stringify(project));
            // await fetch("PROJECT_SAVE_URL", { method: "POST", body });
          },
          // Provide a custom handler for loading project data.
          onLoad: async () => {
            throw new Error('Implement your "onLoad"!');
            const response = await fetch("PROJECT_LOAD_URL");
            const project = await response.json();
            // The project JSON is expected to be returned inside an object.
            return { project };
          },
          autosaveChanges: 100,
          autosaveIntervalMs: 10000,
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
