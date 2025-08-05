import { useBreadcrumb } from "@/store/useBreadcrumb";
import { Fragment } from "react";
import { v4 } from "uuid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

function MainBreadCrumb() {
  const breadcrumbs = useBreadcrumb((s) => s.breadcrumb);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <Fragment key={v4()}>
            <BreadcrumbItem key={index}>
              <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default MainBreadCrumb;
