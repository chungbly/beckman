"use client";

import { useBreadcrumb } from "@/store/useBreadcrumb";
import { useEffect } from "react";

function PageBreadCrumb({
  breadcrumbs,
}: {
  breadcrumbs: { name: string; href?: string }[];
}) {
  const setBreadcrumb = useBreadcrumb((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb(breadcrumbs);
  }, [breadcrumbs]);
  return null;
}

export default PageBreadCrumb;
