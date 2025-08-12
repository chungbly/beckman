import { getCategory } from "@/client/category.client";
import RenderHTMLFromCMS from "@/components/app-layout/render-html-from-cms";
import { Metadata, ResolvingMetadata } from "next";

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
      title: category?.seo?.title || "Beckman - Be a Classic Gentleman",
      description:
        category?.seo?.description || "Beckman - Be a Classic Gentleman",
      keywords: category?.seo?.tags,
    };
  }
  return {
    openGraph: {
      images: [...previousImages],
    },
    description: "Beckman - Be a Classic Gentleman",
    title: "Beckman - Be a Classic Gentleman",
    keywords: "Beckman, giay, dep",
  };
}

async function CategoryLayout(props: Props) {
  const params = await props.params;
  const res = await getCategory(params.name);
  const category = res.data;
  if (!category) {
    notFound();
  }

  return (
    <>
      {category.header && (
        <>
          <style dangerouslySetInnerHTML={{ __html: category.header.css }} />
          <RenderHTMLFromCMS html={category.header.html} />
        </>
      )}
      <div className="container px-2 sm:px-4 sm:pt-2">{props.children}</div>
    </>
  );
}

export default CategoryLayout;
