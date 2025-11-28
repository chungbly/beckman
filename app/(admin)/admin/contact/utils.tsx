import { cn } from "@/lib/utils";
import { IconBrandTiktok } from "@tabler/icons-react";
import {
  Facebook,
  InstagramIcon,
  LinkedinIcon,
  LinkIcon,
  TwitterIcon,
} from "lucide-react";

export const getSociaLinkIcon = (name: string, className?: string) => {
  switch (name.toLowerCase()) {
    case "facebook":
      return <Facebook className={cn("h-4 w-4", className)} />;
    case "twitter":
      return <TwitterIcon className={cn("h-4 w-4", className)} />;
    case "instagram":
      return <InstagramIcon className={cn("h-4 w-4", className)} />;
    case "linkedin":
      return <LinkedinIcon className={cn("h-4 w-4", className)} />;
    case "tiktok":
      return <IconBrandTiktok className={cn("h-4 w-4", className)} />;
    default:
      return <LinkIcon className={cn("h-4 w-4", className)} />;
  }
};
