import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import { getProducts } from "@/client/product.client";
import AdminLayoutHighLightsBuilder from "@/components/pages/admin/ui/highlights";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { HightlightCategoryLayout } from "@/types/admin-layout";

async function HightLightBuilderAdminPage() {
  const configs = await getGlobalConfig();
  const userId = await getUserId();
  const highlightCategories = (configs?.["CATEGORY_HIGHLIGHTS"] ||
    "[]") as HightlightCategoryLayout[];
  const workspaces = JSON.parse(
    JSON.stringify(highlightCategories || []) || "[]"
  ) as HightlightCategoryLayout[];
  const productIds = workspaces.reduce((acc: number[], workspace) => {
    workspace.items.forEach((item) => {
      if (item.type === "Product" && item.productId) {
        acc.push(item.productId);
      }
      if (item.type === "Scrollable" && item.productIds?.length) {
        item.productIds.forEach((id) => {
          if (id) {
            acc.push(+id);
          }
        });
      }
    });
    return acc;
  }, []);
  const magazineIds = workspaces.flatMap((w) =>
    w.items.flatMap((i) => i.magazineIds || [])
  );
  if (magazineIds.length) {
    const res = await getPosts(
      {
        ids: magazineIds,
        isShow: true,
      },
      magazineIds.length
    );
    const posts = res?.data || [];
    workspaces.forEach((workspace) => {
      workspace.items.forEach((item) => {
        item.magazines =
          item.magazineIds
            ?.map((id) => {
              const magazine = posts.find((p) => p._id === id);
              return magazine;
            })
            ?.filter((v) => !!v) || [];
      });
    });
  }
  if (productIds.length) {
    const res = await getProducts(
      {
        ids: productIds,
        status: true,
        userId,
      },
      productIds.length
    );
    if (res?.status == APIStatus.OK && res.data) {
      const products = res.data;
      workspaces.forEach((workspace) => {
        workspace.items.forEach((item) => {
          if (item.type === "Product" && item.productId) {
            const product = products.find(
              (product) => product.kvId === +item.productId!
            );
            if (product) {
              item.product = product;
            }
          }
          if (item.type === "Scrollable" && item.productIds?.length) {
            const list =
              item.productIds
                ?.map((id) => {
                  const prd = products.find((p) => p.kvId === id);
                  return prd;
                })
                ?.filter((v) => !!v) || [];
            if (list?.length) {
              item.products = list;
            }
          }
        });
      });
    }
  }

  return <AdminLayoutHighLightsBuilder highlightCategories={workspaces} />;
}

export default HightLightBuilderAdminPage;
