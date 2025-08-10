"use client";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center bg-background/10 backdrop-blur-sm">
      <div className="relative w-40 h-40">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-spin-slow">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2" />
        </div>

        {/* Middle spinning ring */}
        <div className="absolute inset-2 border-4 border-primary/20 rounded-full animate-spin-reverse">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary/60 rounded-full -translate-x-1/2" />
        </div>

        {/* Inner spinning ring */}
        <div className="absolute inset-4 border-4 border-primary/10 rounded-full animate-spin">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary/40 rounded-full -translate-x-1/2" />
        </div>

        {/* Static Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 relative flex items-center justify-center">
            <Image
              src={"/icons/logo.svg"}
              alt="R8CKIE"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Pulsing glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
      </div>
    </div>
  );
}
