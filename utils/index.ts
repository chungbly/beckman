import { diff } from "deep-diff";

export const isNil = (val: any) => val === null || val === undefined;
export const bytesToSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};

export const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

export const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export function getDirtyData<T = any>(
  oldData: T,
  newData: Partial<T>,
  groupLevel = 1
): Partial<T> {
  const differences = diff(oldData, newData);
  if (!differences) return {} as Partial<T>;

  const result: any = {};

  for (const change of differences) {
    const path = change.path;
    if (!path) continue;

    // Lấy group path ở mức độ mong muốn (vd: groupLevel = 1 ⇒ chỉ cần `info`)
    const groupPath = path.slice(0, groupLevel);
    let curr = newData;

    for (const segment of groupPath) {
      curr = (curr as any)?.[segment];
    }

    // Đặt giá trị vào result theo groupPath
    let resPointer = result;
    for (let i = 0; i < groupPath.length - 1; i++) {
      const key = groupPath[i];
      resPointer[key] = resPointer[key] || {};
      resPointer = resPointer[key];
    }

    resPointer[groupPath[groupPath.length - 1]] = curr;
  }

  return result as Partial<T>;
}

export function escapeHtml(str: string = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}