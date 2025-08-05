import { APIStatus } from "@/client/callAPI";
import { getProducts } from "@/client/product.client";
import { getGlobalConfig } from "@/lib/configs";
import { SubMenuLayout } from "@/types/admin-layout";
import AdminLayoutSubMenuBuilder from "../../../../../components/pages/admin/ui/sub-menu";
import { getUserId } from "@/lib/cookies";

async function SubMenuBuilderAdminPage() {
  const configs = await getGlobalConfig();
  const userId = await getUserId();

  const SUB_MENU_HOME_PAGE = (configs?.["SUB_MENU_HOME_PAGE"] ||
    "{}") as string;
  const submenu = JSON.parse(
    JSON.stringify(SUB_MENU_HOME_PAGE || {}) || "{}"
  ) as SubMenuLayout;
  const productIds = submenu.items?.reduce((acc: number[], item) => {
    if (item.type === "Product" && item.productId) {
      acc.push(item.productId);
    }
    return acc;
  }, []);
  if (productIds?.length) {
    const res = await getProducts(
      {
        ids: productIds,
        status: true,
        userId
      },
      productIds.length
    );
    if (res?.status == APIStatus.OK && res.data) {
      const products = res.data;
      submenu.items.forEach((item) => {
        if (item.type === "Product" && item.productId) {
          const product = products.find(
            (product) => product.kvId === +item.productId!
          );
          if (product) {
            item.product = product;
          }
        }
      });
    }
  }
  return <AdminLayoutSubMenuBuilder submenu={submenu} />;
}

export default SubMenuBuilderAdminPage;
