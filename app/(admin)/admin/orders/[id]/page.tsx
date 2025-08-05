"use client";
import { APIStatus } from "@/client/callAPI";
import { getOrderByCode, updateOrder } from "@/client/order.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useConfigs } from "@/store/useConfig";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/number";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  ImageOff,
  MapPinIcon,
  MoveRight,
  PhoneIcon,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, use, useState } from "react";
import OrderSkeleton from "./order-skeleton";
import { orderStages, OrderStatus, OrderTimeline } from "./order-timeline";

const ChangeStatusDialog = ({ order }: { order: Order }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await updateOrder(order.code, {
      status,
    });
    if (res.status === APIStatus.OK) {
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái đơn hàng thành công",
      });
      setOpen(false);
      window.location.reload();
    } else {
      toast({
        title: "Thất bại",
        description:
          res.message || "Cập nhật trạng thái đơn hàng không thành công",
        variant: "error",
      });
    }
    setIsLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>
        <Button variant="default">CẬP NHẬT</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn</DialogTitle>
          <DialogDescription>
            Chuyển đổi trạng thái đơn hàng #{order.code}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 items-center">
          <p className="col-span-2 min-w-max">
            {orderStages.find((o) => o.key === order.status)?.label}
          </p>
          <MoveRight className="col-span-1 w-full h-4 text-neutral-400" />
          <Select onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="w-full col-span-2">
              <SelectValue placeholder="Chọn trạng thái mới" />
            </SelectTrigger>
            <SelectContent>
              {orderStages.map((stage) => (
                <SelectItem key={stage.key} value={stage.key}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="secondary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProductItem = ({
  item,
  index,
}: {
  index: number;
  item: Product & {
    quantity: number;
    voucherCode?: string;
  };
}) => {
  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      {item.voucherCode ? (
        <TableCell>
          <Badge>{item.voucherCode}</Badge>
        </TableCell>
      ) : null}
      <TableCell>
        <Link
          className="text-primary underline"
          href={`/admin/products/${item.kvId}`}
        >
          {item.name}
        </Link>
        {!!item.gifts?.length && (
          <p className="mt-2">Quà tặng kèm: ${item.gifts.join(", ")}</p>
        )}
      </TableCell>
      <TableCell align="center">
        {item.seo?.thumbnail ? (
          <Image
            src={item.seo?.thumbnail}
            alt="Product image"
            width={60}
            height={60}
            className="rounded-md"
          />
        ) : (
          <ImageOff className="w-16 h-16 text-neutral-200" />
        )}
      </TableCell>
      <TableCell align="center">
        {item.size} - {item.color}
      </TableCell>
      <TableCell className="text-right">{item.quantity}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.basePrice)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.salePrice)}
      </TableCell>

      <TableCell className="text-right font-bold">
        {formatCurrency(item.quantity * item.finalPrice)}
      </TableCell>
    </TableRow>
  );
};

const DiscountByVoucherProducts = ({
  products,
}: {
  products: (Product & {
    quantity: number;
    voucherCode?: string;
  })[];
}) => {
  return (
    <TableRow>
      <TableCell colSpan={9}>
        <Table>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Voucher</TableHead>
            <TableHead>Sản phẩm giảm giá bởi voucher</TableHead>
            <TableHead className="text-center">Ảnh sản phẩm</TableHead>
            <TableHead className="text-center">Size/Màu sắc/Kiểu</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead className="text-right">Giá gốc</TableHead>
            <TableHead className="text-right">Giá sale</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
          </TableRow>
          <TableBody>
            {products.map((appliedProduct, index) => {
              return (
                <ProductItem
                  item={appliedProduct}
                  index={index}
                  key={appliedProduct._id}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableCell>
    </TableRow>
  );
};

const AddOnProducts = ({
  products,
}: {
  products: (Product & {
    quantity: number;
    voucherCode?: string;
  })[];
}) => {
  return (
    <TableRow>
      <TableCell colSpan={9}>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Sản phẩm giảm giá bởi voucher</TableHead>
              <TableHead>Sản phẩm mua kèm</TableHead>
              <TableHead className="text-center">Ảnh sản phẩm</TableHead>
              <TableHead className="text-center">Size/Màu sắc/Kiểu</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Giá gốc</TableHead>
              <TableHead className="text-right">Giá sale</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((appliedProduct, index) => {
              return (
                <ProductItem
                  item={appliedProduct}
                  index={index}
                  key={appliedProduct._id}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableCell>
    </TableRow>
  );
};

export default function OrderDetails(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = use(props.params);
  const { id } = params;
  const configs = useConfigs((s) => s.configs);

  const SHIPPING_FEE_DEFAULT = (configs?.["SHIPPING_FEE_DEFAULT"] ||
    35000) as number;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await getOrderByCode(id);
      if (res.status !== APIStatus.OK || !res.data) {
        notFound();
      }
      return res.data;
    },
  });
  if (isLoading) return <OrderSkeleton />;
  if (!order) return notFound();
  const {
    totalPrice,
    totalSalePrice,
    totalSaved,
    discount,
    shippingFee,
    finalPrice,
    shippingInfo,
    items,
    status,
    code,
    createdAt,
    note,
  } = order;

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách đơn hàng", href: "/admin/orders" },
          { name: `Đơn hàng #${id}` },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng #{code}</h1>
          <p className="text-muted-foreground">Chi tiết đơn hàng</p>
        </div>
        <ChangeStatusDialog order={order!} />
      </div>

      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách đơn hàng", href: "/admin/orders" },
          { name: `Đơn hàng #${id}` },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <OrderTimeline status={status as OrderStatus} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Thông tin liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Họ tên :</span>{" "}
              {shippingInfo.fullName}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span>{" "}
              {shippingInfo.phoneNumber}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <span className="font-medium">Địa chỉ:</span>{" "}
              {shippingInfo.address}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Ngày đặt hàng:</span>{" "}
              {moment(createdAt).format("DD/MM/YYYY hh:mm:ss")}
            </p>
            <p>
              <span className="font-medium">Phương thức thanh toán:</span>{" "}
              <Badge>COD</Badge>
            </p>
            <p>
              <span className="font-medium ">Khách hàng ghi chú:</span>{" "}
              <span className="text-red-500">{note}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Ảnh sản phẩm</TableHead>
                  <TableHead className="text-center">
                    Size/Màu sắc/Kiểu
                  </TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Giá gốc</TableHead>
                  <TableHead className="text-right">Giá sale</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <Fragment key={item._id}>
                    <ProductItem item={item} index={index} />
                    {!!item.addons.length && (
                      <AddOnProducts products={item.addons} />
                    )}
                    {!!item.appliedProducts.length && (
                      <DiscountByVoucherProducts
                        products={item.appliedProducts}
                      />
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Thành tiền:</span>
              <span>{formatCurrency(totalSalePrice - shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phí ship:</span>
              <span>{formatCurrency(SHIPPING_FEE_DEFAULT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Giảm Phí ship:</span>
              <span>{formatCurrency(shippingFee - SHIPPING_FEE_DEFAULT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Voucher:</span>
              <span>{formatCurrency(-discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Tổng thanh toán:</span>
              <span>{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
