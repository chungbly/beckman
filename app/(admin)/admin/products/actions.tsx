"use client";
import { APIStatus } from "@/client/callAPI";
import { getCategories } from "@/client/category.client";
import {
  GetProductQuery,
  getProducts,
  syncProductFromKiotViet,
  updateProducts,
} from "@/client/product.client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { escapeHtml } from "@/utils";
import { sanitizeObject } from "@/utils/object";
import { saveAs } from "file-saver";
import { FileDown, Loader, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

function Actions({
  children,
  query,
}: {
  children?: React.ReactNode;
  query: Partial<GetProductQuery>;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncProducts, setIsSyncProducts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const data = [] as Product[];
    let page = 1;

    const res = await getProducts(query, 100, page, true);
    if (res.status !== APIStatus.OK) {
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi tải dữ liệu, ${res.message}`,
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    const total = res.data?.meta.itemCount || 0;
    data.push(...res.data!.items);

    while (data.length < total) {
      page++;
      const res = await getProducts(query, 100, page, false);
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi tải dữ liệu, ${res.message}`,
          variant: "error",
        });
        setIsLoading(false);
        return;
      }
      data.push(...res.data!);
    }

    const rows = data.map((row, index) => {
      return {
        STT: index + 1,
        ID: row.kvId,
        SKU: row.kvCode,
        "Link sản phẩm": `www.Beckman.com/${row.seo.slug}`,
        "Trạng thái": row.isShow ? "Đang hoạt động" : "Ngừng hoạt động",
        "Giá gốc": row.basePrice,
        "Giá Sale": row.salePrice || "",
        "Link ảnh đại diện": row.seo.thumbnail,
        "Hình ảnh": row.images
          .map((d) => d.urls)
          .flat()
          .join(","),
        "Tên sản phẩm": row.name,
        "Danh mục": row.categories.map((c) => c.name).join(","),
        Tags: row.tags.join(","),
        "Tags sản phẩm liên quan": row.suggestionTags.join(","),
        "Số lượng tồn kho": row.stock,
        Màu: row.color,
        "Tên màu thay thế": row.images?.[0]?.altName || "",
        "Ảnh đại diện cho màu": row.images?.[0]?.thumbnail || "",
        Size: row.size,
        "Seo Description": row.seo.description,
        "Seo Keywords": row.seo.keywords,
        "Chi tiết sản phẩm":
          row.description?.length >= 32767
            ? row.description.slice(0, 32766)
            : row.description,
        "Chính sách bảo hành": row.warrantyPolicy,
        "Hướng dẫn bảo quản": row.careInstructions,
        "Mô tả phụ": row.subDescription,
        "Tên phụ": row.subName,
        "Tên phụ 2": row.secondSubName,
        "Chi tiết 1": `${row.discribles?.[0]?.title || ""} || ${
          row.discribles?.[0]?.content || ""
        }`,
        "Chi tiết 2": `${row.discribles?.[1]?.title || ""} || ${
          row.discribles?.[1]?.content || ""
        }`,
        "Chi tiết 3": `${row.discribles?.[2]?.title || ""} || ${
          row.discribles?.[2]?.content || ""
        }`,
        "Chi tiết 4": `${row.discribles?.[3]?.title || ""} || ${
          row.discribles?.[3]?.content || ""
        }`,
        "Chi tiết 5": `${row.discribles?.[4]?.title || ""} || ${
          row.discribles?.[4]?.content || ""
        }`,
        "Sản phẩm tương tự": row.similarProducts?.map((p) => p.kvId).join(","),
        "Sản phẩm mua kèm": row.recommendedProducts
          ?.map((p) => p.kvId)
          .join(","),
      };
    });

    // Tạo worksheet từ JSON
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

    // Ghi ra file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Danh sách sản phẩm Beckman.xlsx");
    setIsLoading(false);
  };

  function parseExcelProducts(file: File): Promise<Partial<Product>[] | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Đọc sheet đầu tiên
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Parse sheet thành JSON
          const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
          });

          const products: Record<string, unknown>[] = [];
          const resCatogies = await getCategories({}, 100, 1);
          const categories = resCatogies.data || [];
          for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const kvId = +row["ID"] as number;
            const basePrice = row["Giá gốc"] as number;
            const status = row["Trạng thái"] as string;
            const salePrice = row["Giá Sale"] as number;
            const sold = +row["Đã bán"] as number;
            const name = row["Tên sản phẩm"] as string;
            const tags = row["Tags"] as string;
            const categoryNames = row["Danh mục"] as string;
            const suggestionTags = row["Tags sản phẩm liên quan"] as string;
            const thumbnail = row["Link ảnh đại diện"] as string;
            const images = (row["Hình ảnh"] as string) || "";
            const slug = row["Link sản phẩm"] as string;
            const cates = categoryNames
              ? categoryNames
                  .split(",")
                  .map((name) => {
                    const cate = categories.find(
                      (c) => c.name.trim() === name.trim()
                    );
                    if (!cate) {
                      toast({
                        variant: "error",
                        title: "Có lỗi xảy ra",
                        description: `Danh mục ${name} không tồn tại ở dòng: ${
                          i + 1
                        }`,
                      });
                      reject(null);
                      return "";
                    }
                    return cate?._id;
                  })
                  .filter((c) => c)
              : [];
            const altColorName = row["Tên màu thay thế"] as string;
            const colorThumbnail = row["Ảnh đại diện cho màu"] as string;
            const careInstructions = row["Hướng dẫn bảo quản"] as string;
            const warrantyPolicy = row["Chính sách bảo hành"] as string;
            const subDescription = row["Mô tả phụ"] as string;
            const subName = row["Tên phụ"] as string;
            const secondSubName = row["Tên phụ 2"] as string;
            const discribles = [
              row["Chi tiết 1"],
              row["Chi tiết 2"],
              row["Chi tiết 3"],
              row["Chi tiết 4"],
              row["Chi tiết 5"],
            ];
            const discriblesObj = discribles.map((d) => {
              const [title, content] = d.split("||");
              return {
                title: title?.trim() || "",
                content: content?.trim() || "",
              };
            });
            const similarProducts =
              String((row["Sản phẩm tương tự"] as string) || "")
                ?.split(",")
                ?.filter(Boolean)
                ?.map((id) => +id.trim()) || [];
            const recommendedProducts =
              String((row["Sản phẩm mua kèm"] as string) || "")
                ?.split(",")
                ?.filter(Boolean)
                ?.map((id) => +id.trim()) || [];

            products.push(
              sanitizeObject({
                kvId,
                basePrice,
                slug: slug.replace("www.Beckman.com/", ""),
                salePrice: salePrice || undefined,
                isShow: status === "Đang hoạt động",
                name: escapeHtml(name.trim()),
                categories: cates,
                images: images
                  ?.split(",")
                  ?.map((i) => i.trim())
                  ?.filter((i) => i),
                thumbnail,
                tags: tags
                  ? tags
                      .split(",")
                      .filter((i) => i.trim())
                      .map((i) => i.trim())
                  : [],
                suggestionTags: suggestionTags
                  ? suggestionTags
                      .split(",")
                      .filter((i) => i.trim())
                      .map((i) => i.trim())
                  : [],
                sold: sold || undefined,
                altColorName: altColorName || undefined,
                colorThumbnail: colorThumbnail || undefined,
                careInstructions: careInstructions || undefined,
                warrantyPolicy: warrantyPolicy || undefined,
                subDescription: subDescription || undefined,
                subName: subName || undefined,
                secondSubName: secondSubName || undefined,
                discribles: discriblesObj,
                similarProducts: Array.from(new Set(similarProducts)),
                recommendedProducts: Array.from(new Set(recommendedProducts)),
              })
            );
          }
          resolve(products);
        } catch (e) {
          toast({
            variant: "error",
            title: "Có lỗi xảy ra",
            description: JSON.stringify(
              (e as unknown as { message: string }).message
            ),
          });
          resolve(null);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    console.log("file", file);
    if (!file) return;
    setIsUploading(true);
    const products = await parseExcelProducts(file);
    if (!products) {
      setIsUploading(false);
      return;
    }
    const res = await updateProducts(products);

    if (res.status !== APIStatus.OK) {
      setIsUploading(false);

      return toast({
        variant: "error",
        title: "Có lỗi xảy ra",
        description: res?.message || "Cập nhật sản phẩm không thành công",
      });
    }
    setIsUploading(false);

    toast({
      variant: "success",
      title: "Thành công",
      description: "Cập nhật sản phẩm thành công",
    });
  };
  const handleUploadClick = () => {
    inputRef.current?.click(); // Kích hoạt input
  };

  const handleSyncProducts = async () => {
    setIsSyncProducts(true);
    const res = await syncProductFromKiotViet();

    if (res.status !== APIStatus.OK) {
      setIsSyncProducts(false);

      return toast({
        variant: "error",
        title: "Có lỗi xảy ra",
        description: res?.message || "Cập nhật sản phẩm không thành công",
      });
    }
    setIsSyncProducts(false);

    toast({
      variant: "success",
      title: "Thành công",
      description: "Cập nhật sản phẩm thành công",
    });
  };

  return (
    <div className="flex justify-end gap-4 items-center">
      <Button onClick={handleUploadClick}>
        {isUploading ? (
          <LoaderCircle className="sm:mr-2 animate-spin" />
        ) : (
          <Upload className="sm:mr-2" />
        )}
        <span className="hidden sm:block">Cập nhật sản phẩm</span>
      </Button>
      <input
        id="upload-orders-input"
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button onClick={handleSyncProducts}>
        {isSyncProducts ? (
          <LoaderCircle className="sm:mr-2 animate-spin" />
        ) : (
          <Loader className="sm:mr-2" />
        )}
        <span className="hidden sm:block">Sync Kiotviets</span>
      </Button>
      <Button onClick={handleExport}>
        {isLoading ? (
          <LoaderCircle className="sm:mr-2 animate-spin" />
        ) : (
          <FileDown className="sm:mr-2" />
        )}
        <span className="hidden sm:block">Tải xuống</span>
      </Button>
      {children}
    </div>
  );
}

export default Actions;
