export const formatCurrency = (value: number = 0) => {
  if (Number.isNaN(value)) value = 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};
