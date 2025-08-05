"use client";

import { logError } from "@/client/log.client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  function generateErrorCodeFromText(text: string) {
    // Simple hash function (FNV-1a) to convert the text to a number
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i); // FNV-1a hash
      hash |= 0; // Convert to 32-bit integer
    }

    // Convert hash to a positive hexadecimal string
    const hexCode = (hash & 0xffffffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    return `0xC${hexCode}`;
  }

  useEffect(() => {
    //Log the error to an error reporting service

    if (process.env.NODE_ENV === "production") {
      logError(
        JSON.stringify({
          errorCode: generateErrorCodeFromText(error.message || error.name),
          url: window.location.href,
          message: error.message,
          stack: error.stack,
        })
      );
    }
  }, [error]);

  if (process.env.NODE_ENV !== "production") {
    // Cho crash luôn để Next.js hiển thị overlay lỗi mặc định
    throw error;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center">
            <Image
              src="/illustrations/bug.svg"
              width={300}
              height={300}
              alt="error"
            />
          </div>
          <CardTitle className="text-2xl text-center text-destructive">
            Ooos! Có gì đó không đúng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Chúng tôi xin lỗi vì sự bất tiện này. Đã xảy ra lỗi trong quá trình
            xử lý yêu cầu của bạn. Chúng tôi đã ghi nhận lỗi và sẽ khắc phục nó
            sớm nhất có thể.
          </p>
          <div className="p-4 bg-muted rounded-lg">
            {process.env.NODE_ENV !== "production" && (
              <p className="font-mono text-sm break-words">
                {error.message || error.name}
              </p>
            )}
            <p className="font-mono text-xs text-muted-foreground mt-2">
              Error Code:{" "}
              {generateErrorCodeFromText(error.message || error.name)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => reset()}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button className="w-full sm:w-auto" asChild>
            <Link href={pathname.includes("/admin") ? "/admin/products" : "/"}>
              <Home className="w-4 h-4 mr-2" />
              Return home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
