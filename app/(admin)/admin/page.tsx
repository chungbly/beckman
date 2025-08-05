"use client";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";

function Page() {
  const { toast } = useToast();
  redirect("/admin/products");
  return (
    <div>
      <ColorPicker />
      page
      <Button
        className="italic"
        onClick={() =>
          toast({
            title: "Title",
            description: "Description",
            duration: 500000,
          })
        }
      >
        Toast
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Title",
            description: "Description",
            duration: 500000,
            variant: "error",
          })
        }
      >
        Toast error
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Title",
            description: "Description",
            duration: 500000,
            variant: "warning",
          })
        }
      >
        Toast warning
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Title",
            description: "Description",
            duration: 500000,
            variant: "info",
          })
        }
      >
        Toast info
      </Button>
    </div>
  );
}

export default Page;
