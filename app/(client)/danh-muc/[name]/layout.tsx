import { getCategory } from "@/client/category.client";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import ReadMore from "@/components/ui/read-more";
import { getGlobalConfig } from "@/lib/configs";
import { isMobileServer } from "@/lib/isMobileServer";
import { cn } from "@/lib/utils";
import { Metadata, ResolvingMetadata } from "next";

import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{
    name: string;
  }>;
  children: React.ReactNode;
  suggestions: React.ReactNode;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const res = await getCategory(params.name);
  const category = res.data;
  const previousImages = (await parent).openGraph?.images || [];

  if (category) {
    return {
      openGraph: {
        images:
          category?.desktopBanner || category.mobileBanner || previousImages,
      },
      title: category?.seo?.title || "R8ckie - Step on your way",
      description: category?.seo?.description || "R8ckie - Step on your way",
      keywords: category?.seo?.tags,
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "R8ckie - Step on your way",
    title: "R8ckie - Step on your way",
    keywords: "R8ckie, giay, dep",
  };
}

async function CategoryLayout(props: Props) {
  const configs = await getGlobalConfig();
  const params = await props.params;
  const isMobile = await isMobileServer();
  const res = await getCategory(params.name);
  const category = res.data;
  if (!category) {
    notFound();
  }

  const filter = (() => {
    try {
      const result = category.filterJSON
        ? JSON.parse(category.filterJSON?.trim())
        : configs?.["FILTER_JSON"];
      return Array.isArray(result) ? result : [];
    } catch (e) {
      const result = configs?.["FILTER_JSON"] || [];
      return Array.isArray(result) ? result : [];
    }
  })();

  return (
    <div className="container px-2 sm:px-4 sm:pt-2">
      <div
        className={cn(
          "relative w-screen sm:w-full h-[400px] -mx-2 sm:mx-0",
          !category.desktopBanner && "sm:hidden",
          !category.mobileBanner && "max-sm:hidden"
        )}
      >
        {!isMobile && category.desktopBanner && (
          <Image
            src={category.desktopBanner}
            fill
            alt={category.name}
            sizes="1200px"
            priority
            className="object-cover hidden sm:block"
          />
        )}
        {category.desktopBanner && (
          <Image
            src={category.mobileBanner}
            fill
            alt={category.name}
            sizes="400px"
            priority
            className="object-cover block sm:hidden"
          />
        )}
      </div>
      {props.children}
    </div>
  );
}

export default CategoryLayout;
