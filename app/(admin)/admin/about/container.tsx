"use client";
import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import GrapesStudio from "@/components/grapes/v1";
import SumbitButton from "@/components/submit-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { useForm } from "@tanstack/react-form";
import { notFound } from "next/navigation";

function AboutPageBuilder(props: { configs: Record<string, unknown> }) {
  const { toast } = useToast();
  const { configs } = props;
  const key = "ABOUT";
  const name = "Giới thiệu";

  const about = configs?.[key] as string;

  const form = useForm({
    defaultValues: {
      description: about || "",
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
    <Card className="shadow-lg h-full">
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
      <form.Field name="description">
        {/*@ts-ignore */}
        <div className="h-[calc(100%-88px)]">
          <GrapesStudio/>
          {/* <StudioEditor
            options={{
              // ...
              project: {
                type: "web",
                // The default project to use for new projects
                default: {
                  pages: [
                    { name: "Home", component: "<h1>Home page</h1>" },
                    { name: "About", component: "<h1>About page</h1>" },
                    { name: "Contact", component: "<h1>Contact page</h1>" },
                  ],
                },
              },
            }}
          /> */}
        </div>
      </form.Field>
    </Card>
  );
}

export default AboutPageBuilder;
