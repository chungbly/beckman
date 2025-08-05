"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import SumbitButton from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "@tanstack/react-form";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
const JoditEditor = dynamic(() => import("@/components/jodit-editor"), {
  ssr: false,
});

export interface SupportPage {
  [url: string]: {
    name: string;
    key: string;
  };
}

function PolicyPage(props: { url: string; configs: Record<string, unknown> }) {
  const { toast } = useToast();
  const { url, configs } = props;
  const DYNAMIC_SUPPORT_PAGE_LIST = configs?.[
    "DYNAMIC_SUPPORT_PAGE_LIST"
  ] as SupportPage;
  const key = DYNAMIC_SUPPORT_PAGE_LIST[url].key;
  const name = DYNAMIC_SUPPORT_PAGE_LIST[url].name;
  const deliveryPolicy = configs?.[key] as string;
  const form = useForm({
    defaultValues: {
      description: deliveryPolicy || "",
    },
    onSubmit: async ({ value }) => {
      const res = await updateConfig(key, value.description);
      if (res.status === APIStatus.OK) {
        toast({
          title: "Cập nhật  thành công",
          variant: "success",
        });
      } else {
        toast({
          title: "Cập nhật thất bại",
          description: res.message,
          variant: "error",
        });
      }
    },
  });
  if (!key) return notFound();

  return (
    <Card className="shadow-lg mt-8">
      <PageBreadCrumb breadcrumbs={[{ name: name }]} />

      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center">
          {name}
          <form.Subscribe
            selector={(state) => state.isDirty}
            children={(isDirty) => (
              <SumbitButton
                isDirty={isDirty}
                handleSubmit={form.handleSubmit}
              />
            )}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form.Field name="description">
          {/*@ts-ignore */}
          {(field) => (
            <JoditEditor
              value={String(field.state.value)}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </CardContent>
    </Card>
  );
}

export default PolicyPage;
