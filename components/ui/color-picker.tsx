"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Paintbrush, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigs } from "@/store/useConfig";
import { useCallback, useEffect, useRef } from "react";

interface ColorPickerProps {
  value?: string | null;
  onChange?: (color?: string | null) => void;
  className?: string;
}

interface HSV {
  h: number;
  s: number;
  v: number;
  a: number;
}

interface Coordinate {
  x: number;
  y: number;
}

type ColorFormat = "hex" | "rgba";

export function SolidColorPicker({
  value = "#ff0000",
  onChange,
  className,
}: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100, a: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHueDragging, setIsHueDragging] = useState(false);
  const [isAlphaDragging, setIsAlphaDragging] = useState(false);
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex");
  const [hexValue, setHexValue] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<Coordinate>({ x: 0, y: 0 });

  // Convert HSV to RGB
  const hsvToRgb = useCallback((h: number, s: number, v: number) => {
    s = s / 100;
    v = v / 100;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r = 0,
      g = 0,
      b = 0;
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }, []);

  // Convert RGB to Hex
  const rgbToHex = useCallback(
    (r: number, g: number, b: number, a: number = 1) => {
      const hex = [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("");

      if (a < 1) {
        const alpha = Math.round(a * 255)
          .toString(16)
          .padStart(2, "0");
        return `#${hex}${alpha}`;
      }
      return `#${hex}`;
    },
    []
  );

  // Convert RGB to RGBA string
  const rgbToRgba = useCallback(
    (r: number, g: number, b: number, a: number = 1) => {
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    },
    []
  );

  // Draw the color picker gradient
  const drawGradient = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw saturation gradient
    const rgb = hsvToRgb(hsv.h, 100, 100);
    const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientH.addColorStop(0, "#fff");
    gradientH.addColorStop(1, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw value gradient
    const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientV.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradientV.addColorStop(1, "#000");
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [hsv.h, hsvToRgb]);

  // Update color values and trigger onChange
  const updateHexValue = useCallback(
    (hsv: HSV, colorFormat: ColorFormat) => {
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b, hsv.a);
      const rgba = rgbToRgba(rgb.r, rgb.g, rgb.b, hsv.a);
      setHexValue(hex);
      onChange?.(colorFormat === "hex" ? hex : rgba);
    },
    [hsvToRgb, onChange, rgbToHex, rgbToRgba]
  );

  // Update color based on canvas position
  const updateColor = useCallback(
    (e: MouseEvent | React.MouseEvent, colorFormat: ColorFormat) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      thumbRef.current = { x, y };
      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;

      setHsv((prev) => {
        const hsv = { ...prev, s, v };
        updateHexValue(hsv, colorFormat);
        return hsv;
      });
    },
    [updateHexValue]
  );

  // Update hue based on slider position
  const updateHue = useCallback(
    (e: MouseEvent | React.MouseEvent, colorFormat: ColorFormat) => {
      const hueBar = hueRef.current;
      if (!hueBar) return;

      const rect = hueBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const hue = x / rect.width;

      setHsv((prev) => {
        const hsv = { ...prev, h: hue };
        updateHexValue(hsv, colorFormat);
        return hsv;
      });
    },
    [updateHexValue]
  );

  // Update alpha based on slider position
  const updateAlpha = useCallback(
    (e: MouseEvent | React.MouseEvent, colorFormat: ColorFormat) => {
      const alphaBar = alphaRef.current;
      if (!alphaBar) return;

      const rect = alphaBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const alpha = x / rect.width;

      setHsv((prev) => {
        const hsv = { ...prev, a: alpha };
        updateHexValue(hsv, colorFormat);
        return hsv;
      });
    },
    [updateHexValue]
  );

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateColor(e, colorFormat);
      }
      if (isHueDragging) {
        updateHue(e, colorFormat);
      }
      if (isAlphaDragging) {
        updateAlpha(e, colorFormat);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsHueDragging(false);
      setIsAlphaDragging(false);
    };

    if (isDragging || isHueDragging || isAlphaDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isHueDragging,
    isAlphaDragging,
    updateColor,
    updateHue,
    updateAlpha,
    colorFormat,
  ]);

  // Draw gradient when hue changes
  useEffect(() => {
    drawGradient();
  }, [drawGradient]);

  // Add color to recent colors
  const addToRecentColors = useCallback((color?: string | null) => {
    setRecentColors((prev) => {
      if (!color) return prev;
      const newColors = prev.filter((c) => c !== color);
      return [color, ...newColors].slice(0, 24);
    });
  }, []);

  function hexToHsv(hex: string) {
    // Remove '#' if present
    hex = hex.replace(/^#/, "");

    let r,
      g,
      b,
      a = 1; // Default alpha is 1 (opaque)

    if (hex.length === 3) {
      // Shorthand format (e.g., #123 -> #112233)
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      // Format #RRGGBB
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      // Format #RRGGBBAA
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16) / 255; // Normalize alpha
    } else {
      throw new Error("Invalid HEX color format");
    }

    // Normalize RGB to [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    // Compute max and min values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Compute Hue
    let h;
    if (delta === 0) {
      h = 0; // Undefined hue
    } else if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    // Compute Saturation
    const s = max === 0 ? 0 : delta / max;

    // Compute Value
    const v = max;

    // Return HSV with Alpha
    return {
      h,
      s: +(s * 100).toFixed(2), // Saturation as percentage
      v: +(v * 100).toFixed(2), // Value as percentage
      a: +a.toFixed(2), // Alpha (transparency)
    };
  }
  const rgbaToHsv = (rgba: string) => {
    let isRGBA = rgba.startsWith("rgba");
    let [r, g, b, a = 1] = rgba
      .substring(isRGBA ? 5 : 4, rgba.length - 1)
      .split(",")
      .map((v) => +v.trim());

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Compute Hue
    let h;
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    // Compute Saturation
    const s = max === 0 ? 0 : delta / max;

    // Compute Value
    const v = max;

    // Return HSV and Alpha
    return {
      h,
      s: +(s * 100).toFixed(2), // Saturation as percentage
      v: +(v * 100).toFixed(2), // Value as percentage
      a: +a.toFixed(2), // Alpha (unchanged)
    };
  };

  useEffect(() => {
    // convert value to hsv
    if (value?.startsWith("#")) {
      return setHsv(hexToHsv(value));
    }
    if (value?.startsWith("rgb")) {
      setColorFormat("rgba");
      return setHsv(rgbaToHsv(value));
    }
    setHsv({ h: 0, s: 100, v: 100, a: 1 });
  }, [value]);

  return (
    <div className={cn("", className)}>
      <div className="space-y-4">
        {/* Color Picker Area */}
        <div
          ref={pickerRef}
          className="relative w-full h-[160px] rounded-lg overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={160}
            className="absolute inset-0 w-full h-full"
            onMouseDown={(e) => {
              setIsDragging(true);
              updateColor(e, colorFormat);
            }}
          />
          <div
            className="absolute w-4 h-4 -translate-x-2 -translate-y-2 border-2 border-white rounded-full shadow-sm pointer-events-none"
            style={{
              left: `${(hsv.s / 100) * 100}%`,
              top: `${(1 - hsv.v / 100) * 100}%`,
              backgroundColor: hexValue || "transparent",
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {/* Color Dropper and Preview */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border shadow-sm"
              style={{ backgroundColor: hexValue || "transparent" }}
            />
            {/* Hue Slider */}
            <div
              ref={hueRef}
              className="relative flex-1 h-8 rounded-lg overflow-hidden cursor-pointer"
              style={{
                background:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
              onMouseDown={(e) => {
                setIsHueDragging(true);
                updateHue(e, colorFormat);
              }}
            >
              <div
                className="absolute top-0 w-1 h-full bg-white border shadow-sm pointer-events-none"
                style={{ left: `${hsv.h * 100}%` }}
              />
            </div>
          </div>

          {/* Alpha Slider */}
          <div
            ref={alphaRef}
            className="relative h-8 rounded-lg overflow-hidden cursor-pointer"
            style={{
              background: `linear-gradient(to right, transparent, ${rgbToHex(
                hsvToRgb(hsv.h, hsv.s, hsv.v).r,
                hsvToRgb(hsv.h, hsv.s, hsv.v).g,
                hsvToRgb(hsv.h, hsv.s, hsv.v).b
              )}), url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==') left center`,
            }}
            onMouseDown={(e) => {
              setIsAlphaDragging(true);
              updateAlpha(e, colorFormat);
            }}
          >
            <div
              className="absolute top-0 w-[1px] h-full bg-white border shadow-sm pointer-events-none"
              style={{ left: `${hsv.a * 100}%` }}
            />
          </div>

          {/* Color Format Selector and Input */}
          <div className="flex gap-2">
            <Select
              value={colorFormat}
              onValueChange={(value: "hex" | "rgba") => setColorFormat(value)}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hex">HEX</SelectItem>
                <SelectItem value="rgba">RGBA</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={
                colorFormat === "hex"
                  ? hexValue || ""
                  : rgbToRgba(
                      hsvToRgb(hsv.h, hsv.s, hsv.v).r,
                      hsvToRgb(hsv.h, hsv.s, hsv.v).g,
                      hsvToRgb(hsv.h, hsv.s, hsv.v).b,
                      hsv.a
                    )
              }
              onChange={(e) => setHexValue(e.target.value)}
              onBlur={() => addToRecentColors(hexValue)}
              className="font-mono flex-1"
            />
          </div>

          {/* Recent Colors */}
          <div className="grid grid-cols-8 gap-1">
            {recentColors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                className="w-6 h-6 rounded-sm border shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => setHexValue(color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div
      className={cn(
        "preview  w-full rounded !bg-cover !bg-center transition-all",
        className
      )}
    >
      <ColorPickerDialog value={value} onChange={onChange} />
    </div>
  );
}

function ColorPickerDialog({
  value,
  onChange,
  className,
}: {
  value?: string | null;
  className?: string;
  onChange?: (color: string | null | undefined) => void;
}) {
  const configs = useConfigs((s) => s.configs);
  const imageFromConfigs = configs?.["COLOR_PICKER_IMAGES"] || [];
  const images = [
    "url(https://images.unsplash.com/photo-1688822863426-8c5f9b257090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90)",
    ...(imageFromConfigs as string[]),
  ];

  const [background, setBackground] = useState<string | null | undefined>(
    value
  );

  const [tab, setTab] = useState<"solid" | "gradient" | "image">(() => {
    if (background?.includes("url")) return "image";
    if (background?.includes("gradient")) return "gradient";
    return "solid";
  });
  const solids = [
    "#E2E2E2",
    "#ff75c3",
    "#ffa647",
    "#ffe83f",
    "#9fff5b",
    "#70e2ff",
    "#cd93ff",
    "#09203f",
  ];

  const gradients = [
    "linear-gradient(to bottom right,#accbee,#e7f0fd)",
    "linear-gradient(to bottom right,#d5d4d0,#d5d4d0,#eeeeec)",
    "linear-gradient(to bottom right,#000000,#434343)",
    "linear-gradient(to bottom right,#09203f,#537895)",
    "linear-gradient(to bottom right,#AC32E4,#7918F2,#4801FF)",
    "linear-gradient(to bottom right,#f953c6,#b91d73)",
    "linear-gradient(to bottom right,#ee0979,#ff6a00)",
    "linear-gradient(to bottom right,#F00000,#DC281E)",
    "linear-gradient(to bottom right,#00c6ff,#0072ff)",
    "linear-gradient(to bottom right,#4facfe,#00f2fe)",
    "linear-gradient(to bottom right,#0ba360,#3cba92)",
    "linear-gradient(to bottom right,#FDFC47,#24FE41)",
    "linear-gradient(to bottom right,#8a2be2,#0000cd,#228b22,#ccff00)",
    "linear-gradient(to bottom right,#40E0D0,#FF8C00,#FF0080)",
    "linear-gradient(to bottom right,#fcc5e4,#fda34b,#ff7882,#c8699e,#7046aa,#0c1db8,#020f75)",
    "linear-gradient(to bottom right,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)",
  ];

  useEffect(() => {
    setBackground(value);
  }, [value]);

  return (
    <Popover
      onOpenChange={() => {
        onChange?.(background);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !background && "text-muted-foreground",
            className
          )}
        >
          <div className="flex w-full items-center gap-2">
            {background ? (
              <div
                className="h-4 w-4 rounded !bg-cover !bg-center transition-all border border-gray-300"
                style={{ background }}
              ></div>
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="flex-1 truncate">
              {background ? background : "Chọn màu/nền"}
            </div>
            <X
              className="h-4 w-4"
              onClick={() => {
                setBackground(null);
                onChange?.(null);
              }}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="w-full"
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger className="flex-1" value="solid">
              Solid
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="gradient">
              Gradient
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="image">
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solid" className="mt-0 flex flex-wrap gap-1">
            <SolidColorPicker
              value={background}
              onChange={(v) => setBackground(v)}
            />
            {solids.map((s) => (
              <div
                key={s}
                style={{ background: s }}
                className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
                onClick={() => setBackground(s)}
              />
            ))}
          </TabsContent>

          <TabsContent value="gradient" className="mt-0">
            <div className="mb-2 flex flex-wrap gap-1">
              {gradients.map((s) => (
                <div
                  key={s}
                  style={{ background: s }}
                  className="h-6 w-6 cursor-pointer rounded-md active:scale-105"
                  onClick={() => setBackground(s)}
                />
              ))}
            </div>

            <GradientButton background={background || ""}>
              💡 Get more at{" "}
              <Link
                href="https://gradient.page/css/ui-gradients"
                className="font-bold hover:underline"
                target="_blank"
              >
                GradientPage
              </Link>
            </GradientButton>
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <div className="mb-2 grid grid-cols-2 gap-1">
              {images.map((s) => (
                <div
                  key={s}
                  style={{ backgroundImage: s }}
                  className="h-12 w-full cursor-pointer rounded-md bg-cover bg-center active:scale-105"
                  onClick={() => setBackground(s)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {tab !== "solid" && (
          <Input
            id="custom"
            value={background || ""}
            className="col-span-2 mt-4 h-8"
            onChange={(e) => setBackground(e.currentTarget.value)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

const GradientButton = ({
  background,
  children,
}: {
  background?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="relative rounded-md !bg-cover !bg-center p-0.5 transition-all"
      style={{ background }}
    >
      <div className="rounded-md bg-popover/80 p-1 text-center text-xs">
        {children}
      </div>
    </div>
  );
};
