export function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "₫";
}
