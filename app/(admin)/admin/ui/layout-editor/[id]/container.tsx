"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
// import GrapesStudio from "@/components/grapes/v1";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { CustomPage } from "../container";

const GrapesStudio = dynamic(() => import("@/components/grapes/v1"), {
  ssr: false,
});

function AboutPageBuilder(props: {
  page: CustomPage;
  configs: Record<string, unknown>;
}) {
  const { toast } = useToast();
  const { page, configs } = props;
  const PAGE_MANAGER = configs["PAGE_MANAGER"] as CustomPage[];

  const handleSave = async (newPage: CustomPage) => {
    const res = await updateConfig(
      "PAGE_MANAGER",
      JSON.stringify(
        PAGE_MANAGER.map((p) => (p.id === newPage.id ? newPage : p))
      )
    );
    if (res.status === APIStatus.OK) {
      toast({
        title: "Lưu thành công",
        variant: "success",
      });
    } else {
      toast({
        title: "Lưu thất bại",
        variant: "error",
      });
    }
  };

  const value = (() => {
    try {
      return page?.project ? JSON.parse(page?.project) : {};
    } catch (error) {
      return {};
    }
  })();

  return (
    <div className="shadow-lg h-full [transform:none]">
      <PageBreadCrumb breadcrumbs={[{ name: page.title }]} />
      <div className="h-full [transform:none]">
        <GrapesStudio
          value={value}
          pages={{
            add: false,
            remove: false,
            duplicate: false,
          }}
          project={{
            type: "web",
            default: {
              pages: [{ name: page.title, compoment: "<div>New page</div>" }],
            },
          }}
          onSave={(data) => {
            handleSave({
              ...page,
              project: data.project,
              html: data.html,
              css: data.css,
            });
          }}
        />
      </div>
    </div>
  );
}

export default AboutPageBuilder;
