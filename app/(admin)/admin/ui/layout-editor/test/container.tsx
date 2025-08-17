"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import GrapesStudio from "@/components/grapes/v1";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CustomPage } from "../container";
import DefaultEditor from "@/components/grapes";

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
  return (
    <Card className="shadow-lg h-full">
      <PageBreadCrumb breadcrumbs={[{ name: page.title }]} />
      <div className="h-full">
        <DefaultEditor
          // value={page.project ? JSON.parse(page.project) : {}}
          // pages={{
          //   add: false,
          //   remove: false,
          //   duplicate: false,
          // }}
          // project={{
          //   type: "web",
          //   default: {
          //     pages: [{ name: page.title, compoment: "<div>New page</div>" }],
          //   },
          // }}
          // onSave={(data) => {
          //   handleSave({
          //     ...page,
          //     project: data.project,
          //     html: data.html,
          //     css: data.css,
          //   });
          // }}
        />
      </div>
    </Card>
  );
}

export default AboutPageBuilder;
