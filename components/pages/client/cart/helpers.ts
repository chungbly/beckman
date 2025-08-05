import { getVouchers } from "@/client/voucher.client";

export const checkVoucher = async(voucher: string) => {
    try {
        const res = await getVouchers({
            codes: [voucher],
        });
    }
    catch (e) {
        return false;
    }
};