"use client";

import { APIStatus } from "@/client/callAPI";
import { bulkCreateCustomers } from "@/client/customer.client";
import { bulkCreateExternalOrder } from "@/client/external-order.client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types/customer";
import { ExternalOrderDto } from "@/types/external-order";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

function BulkUploadCustomer() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderUpLoading, setIsOrderUpLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);
  const handleUploadOrderClick = () => {
    orderInputRef.current?.click(); // Kích hoạt input
  };
  const { toast } = useToast();
  const handleUploadClick = () => {
    inputRef.current?.click(); // Kích hoạt input
  };
  function excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }
  function formatDate(date: Date): string {
    return date.toLocaleDateString("vi-VN");
  }
  function parseExcelCustomers(file: File): Promise<Partial<Customer>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Đọc sheet đầu tiên
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse sheet thành JSON
        const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Chuẩn hóa dữ liệu
        const customers: Partial<Customer>[] = rawData.map((row) => {
          const rawDate = row["Ngày sinh"];
          const birthday =
            typeof rawDate === "number"
              ? formatDate(excelDateToJSDate(rawDate))
              : rawDate;
          return {
            code: row["Mã KH"] as string,
            name: row["Khách hàng"] as string,
            phoneNumbers: String(row["Sốđiệnthoại"] || row["Số điện thoại"])
              .split("-")
              .map((sdt) => sdt.trim())
              .filter((sdt) => sdt) as string[],
            birthday,
            tier: row["Tier"] || row["tier"],
            voucherCodes: ((row["Mã voucher"] as string) || "")
              .split(",")
              .map((code) => code.trim())
              .filter((code) => code),
          };
        });

        resolve(customers);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function parseExcelOrders(file: File): Promise<ExternalOrderDto[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Đọc sheet đầu tiên
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse sheet thành JSON
        const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const orders: ExternalOrderDto[] = [];
        for (let i = 0; i < rawData.length; i++) {
          const row = rawData[i];
          const quantity = row["Số lượng"] as number;
          if (!quantity || quantity <= 0 || !Number.isInteger(quantity))
            continue;
          const code = row["Mã đơn hàng"] as string;
          const existingOrder = orders.find((order) => order.code === code);
          const customerCode = row["Mã khách hàng"] as string;
          const productCode = row["Mã sản phẩm"] as string;
          const basePrice = row["Giá"] as number;
          const salePrice = row["Giá giảm"] as number;
          const totalPrice = row["Tổng giá trị đơn"] as number;
          const finalPrice = row["Tổng đã giảm"] as number;
          const discount = row["Tổng giảm giá"] as number;
          const item = {
            productCode,
            quantity,
            basePrice,
            salePrice,
          };
          if (existingOrder) {
            existingOrder.items.push(item);
          } else {
            const data = {
              code,
              customerCode,
              items: [item],
              totalPrice,
              finalPrice,
              discount,
            } as ExternalOrderDto;
            orders.push(data);
          }
        }

        resolve(orders);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  const handleFileCustomersUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    const customers = await parseExcelCustomers(file);
    const res = await bulkCreateCustomers(customers);

    setIsLoading(false);
    if (res.status !== APIStatus.OK || !res?.data) {
      return toast({
        variant: "error",
        title: "Có lỗi xảy ra",
        description: res?.message || "Không thể tải lên danh sách khách hàng",
      });
    }
    toast({
      variant: "success",
      title: "Thành công",
      description: "Tải lên danh sách khách hàng thành công",
    });
  };
  const handleFileOrdersUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOrderUpLoading(true);

    const orders = await parseExcelOrders(file);
    const res = await bulkCreateExternalOrder(orders);

    setIsOrderUpLoading(false);
    if (res.status !== APIStatus.OK) {
      return toast({
        variant: "error",
        title: "Có lỗi xảy ra",
        description: res?.message || "Không thể tải lên danh sách đơn hàng",
      });
    }
    toast({
      variant: "success",
      title: "Thành công",
      description: "Tải lên danh sách đơn hàng thành công",
    });
  };

  return (
    <div className="flex flex-col items-end justify-end">
      <div className="flex gap-2 items-center">
        <div>
          <Button onClick={handleUploadOrderClick} disabled={isOrderUpLoading}>
            <Upload className="w-4 h-4 mr-2" />
            {isOrderUpLoading ? "Đang tải lên..." : "Upload đơn hàng ngoài"}
          </Button>
          <input
            id="upload-orders-input"
            type="file"
            ref={orderInputRef}
            className="hidden"
            onChange={handleFileOrdersUpload}
          />
        </div>
        <div>
          <Button onClick={handleUploadClick} disabled={isLoading}>
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Đang tải lên..." : "Upload danh sách khách hàng"}
          </Button>
          <input
            id="upload-customers-input"
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={handleFileCustomersUpload}
          />
        </div>
      </div>

      <p className="text-xs mt-2 text-muted-foreground">
        <b className="text-yellow-500">Lưu ý:</b> Thời gian để hoàn thành việc
        tải lên có thể kéo dài tuỳ vào độ dài của danh sách
      </p>
    </div>
  );
}

export default BulkUploadCustomer;
