import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function PaymentMomoResult() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const resultCode = params.get("resultCode");
  const orderId = params.get("orderId");
  const message = params.get("message");

  const success = resultCode === "0";

  useEffect(() => {
    if (success) {
      localStorage.removeItem("checkout_items");
    }
  }, [success]);

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-3">
              Thanh toán thành công
            </h1>
            <p className="text-gray-700 mb-2">Cảm ơn quý khách đã mua hàng.</p>
            <p className="text-gray-700 mb-4">Mã đơn: {orderId}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-3">
              Thanh toán chưa thành công
            </h1>
            <p className="text-gray-700 mb-4">
              {message || "Giao dịch thất bại"}
            </p>
          </>
        )}

        <div className="flex justify-center gap-3">
          <Link to="/account/orders" className="px-4 py-2 bg-orange-600 text-white rounded">
            Xem đơn hàng
          </Link>
          <Link to="/" className="px-4 py-2 bg-gray-200 rounded">
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}