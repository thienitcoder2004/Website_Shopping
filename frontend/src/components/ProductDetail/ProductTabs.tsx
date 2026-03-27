import type { ReactNode } from "react";
import type { TProduct } from "../../types/product.type";

export type TabKey = "info" | "how" | "policy";

type Props = {
  product: TProduct;
  tab: TabKey;
  setTab: React.Dispatch<React.SetStateAction<TabKey>>;
};

export default function ProductTabs({ product, tab, setTab }: Props) {
  return (
    <div className="mt-8 border-t">
      <div className="flex gap-0">
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Thông tin sản phẩm
        </TabButton>
        <TabButton active={tab === "how"} onClick={() => setTab("how")}>
          Cách mua hàng
        </TabButton>
        <TabButton active={tab === "policy"} onClick={() => setTab("policy")}>
          Điều khoản
        </TabButton>
      </div>

      <div className="border border-t-0 p-4 rounded-b-xl">
        {tab === "info" && (
          <div className="space-y-3 leading-7">
            <div className="font-bold text-lg">{product.name}</div>
            <div className="text-gray-700">
              {product.description?.trim()
                ? product.description
                : "Chưa có mô tả. Bạn có thể cập nhật mô tả trong trang quản trị."}
            </div>
          </div>
        )}

        {tab === "how" && (
          <div className="space-y-2 leading-7">
            <div className="font-bold text-lg">Cách mua hàng</div>
            <ol className="list-decimal pl-5 text-gray-700">
              <li>Chọn màu và size (nếu có).</li>
              <li>Chọn số lượng và nhấn “THÊM VÀO GIỎ”.</li>
              <li>Vào giỏ hàng, điền thông tin nhận hàng.</li>
              <li>Xác nhận đơn hàng và chờ giao.</li>
            </ol>
          </div>
        )}

        {tab === "policy" && (
          <div className="space-y-2 leading-7">
            <div className="font-bold text-lg">Điều khoản</div>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Đổi trả trong 7 ngày nếu sản phẩm lỗi do nhà sản xuất.</li>
              <li>Sản phẩm phải còn tem/mác, chưa sử dụng.</li>
              <li>Thời gian giao hàng 2-4 ngày tuỳ khu vực.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 border font-extrabold ${
        active ? "bg-white border-b-white" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}