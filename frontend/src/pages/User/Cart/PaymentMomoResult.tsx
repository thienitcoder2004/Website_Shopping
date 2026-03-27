import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { orderApi } from "../../../api/order.api";
import { useCart } from "../../../context/cart.context";

type ConfirmState = "idle" | "loading" | "success" | "error";

type CheckoutStoredItem = {
  id?: string;
  variant?: {
    color?: string;
    size?: string;
  };
};

export default function PaymentMomoResult() {
  const { search } = useLocation();
  const { removePurchasedItems } = useCart();
  const hasConfirmedRef = useRef(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");
  const [confirmMessage, setConfirmMessage] = useState("");

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const resultCode = params.get("resultCode");
  const orderId = params.get("orderId");
  const requestId = params.get("requestId");
  const amount = params.get("amount");
  const orderInfo = params.get("orderInfo");
  const orderType = params.get("orderType");
  const transId = params.get("transId");
  const message = params.get("message");
  const payType = params.get("payType");
  const responseTime = params.get("responseTime");
  const extraData = params.get("extraData");
  const partnerCode = params.get("partnerCode");
  const signature = params.get("signature");

  const success = resultCode === "0";

  useEffect(() => {
    if (!orderId || hasConfirmedRef.current) return;

    hasConfirmedRef.current = true;

    const confirmMomoReturn = async () => {
      try {
        setConfirmState("loading");

        await orderApi.confirmMomoReturn({
          partnerCode: partnerCode || undefined,
          orderId: orderId || undefined,
          requestId: requestId || undefined,
          amount: amount || undefined,
          orderInfo: orderInfo || undefined,
          orderType: orderType || undefined,
          transId: transId || undefined,
          resultCode: resultCode || undefined,
          message: message || undefined,
          payType: payType || undefined,
          responseTime: responseTime || undefined,
          extraData: extraData || undefined,
          signature: signature || undefined,
        });

        if (success) {
          const savedCheckoutItems = localStorage.getItem("checkout_items");

          if (savedCheckoutItems) {
            try {
              const parsed: unknown = JSON.parse(savedCheckoutItems);

              if (Array.isArray(parsed)) {
                const purchasedItems = (parsed as CheckoutStoredItem[])
                  .filter((item) => item?.id)
                  .map((item) => ({
                    id: String(item.id),
                    variant: {
                      color: String(item.variant?.color || ""),
                      size: String(item.variant?.size || ""),
                    },
                  }));

                removePurchasedItems(purchasedItems);
              }
            } catch {
              // bỏ qua nếu localStorage bị lỗi format
            }
          }

          localStorage.removeItem("checkout_items");
        }

        setConfirmState("success");
        setConfirmMessage(
          success
            ? "Đơn hàng đã được cập nhật thanh toán thành công."
            : "Đơn hàng đã được cập nhật trạng thái thanh toán."
        );
      } catch (error: unknown) {
        setConfirmState("error");

        if (axios.isAxiosError(error)) {
          const serverMessage =
            typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : "";

          setConfirmMessage(
            serverMessage || "Không thể đồng bộ trạng thái thanh toán với hệ thống."
          );
        } else if (error instanceof Error) {
          setConfirmMessage(error.message);
        } else {
          setConfirmMessage("Không thể đồng bộ trạng thái thanh toán với hệ thống.");
        }
      }
    };

    void confirmMomoReturn();
  }, [
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    signature,
    success,
    transId,
    removePurchasedItems,
  ]);

  return (
    <section className="min-h-[70vh] bg-gradient-to-b from-orange-50 via-white to-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div
            className={`px-6 py-8 text-center ${
              success
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                : "bg-gradient-to-r from-rose-500 to-red-600 text-white"
            }`}
          >
            <div className="mb-4 text-5xl">{success ? "✓" : "✕"}</div>

            <h1 className="text-2xl font-bold md:text-3xl">
              {success ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
            </h1>

            <p className="mt-3 text-sm text-white/90 md:text-base">
              {success
                ? "Giao dịch MoMo đã hoàn tất và đơn hàng của bạn đang được xử lý."
                : message || "Giao dịch chưa hoàn tất. Vui lòng kiểm tra lại trạng thái thanh toán."}
            </p>
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="grid gap-4 rounded-2xl bg-gray-50 p-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="mt-1 break-all text-lg font-semibold text-gray-900">
                  {orderId || "---"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      success
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {success ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
              </div>

              {transId ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Mã giao dịch MoMo</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {transId}
                  </p>
                </div>
              ) : null}

              {amount ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Số tiền</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {Number(amount).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-800">
                Đồng bộ hệ thống
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {confirmState === "loading" && "Đang cập nhật trạng thái đơn hàng..."}
                {confirmState === "success" && (confirmMessage || "Cập nhật thành công.")}
                {confirmState === "error" && (confirmMessage || "Cập nhật thất bại.")}
                {confirmState === "idle" && "Đang chờ xử lý..."}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/account/orders"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Xem danh sách đơn hàng
              </Link>

              <Link
                to="/"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}