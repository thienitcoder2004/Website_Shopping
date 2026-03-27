export default function Price({
  basePrice,
  salePrice,
}: {
  basePrice: number;
  salePrice: number;
}) {
  const hasSale = salePrice > 0 && salePrice < basePrice;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, color: "#ff6600" }}>
        {hasSale
          ? salePrice.toLocaleString("vi-VN")
          : basePrice.toLocaleString("vi-VN")}{" "}
        đ
      </span>
      {hasSale && (
        <span style={{ textDecoration: "line-through", color: "#999" }}>
          {basePrice.toLocaleString("vi-VN")} đ
        </span>
      )}
    </div>
  );
}
