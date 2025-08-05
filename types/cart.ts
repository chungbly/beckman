import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  provinceCode: z.number().min(1, "Tỉnh/Thành phố là bắt buộc"),
  districtCode: z.number().min(1, "Quận/Huyện là bắt buộc"),
  wardCode: z.number().min(1, "Phường/Xã là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  note: z.string().optional(),
});

export type TOrderInfo = z.infer<typeof formSchema>
