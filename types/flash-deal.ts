export interface FlashDeal {
    isActive: boolean;
    startTime: string;
    endTime: string;
    productIds: number[];
    backgroundColor?: string | null;
    className: string;
    showMoreImage: string;
    showMoreLink: string;
}