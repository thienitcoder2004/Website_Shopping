import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { orderApi } from "../../../api/order.api";
import { useCart } from "../../../context/cart.context";

type ConfirmState =
  | "idle"
  | "loading"
  | "paid"
  | "pending"
  | "failed"
  | "error";

type CheckoutStoredItem = {
  id?: string;
  variant?: {
    color?: string;
    size?: string;
  };
};

type ReturnedOrder = {
  orderCode?: string;
  paymentStatus?: "PAID" | "UNPAID";
  paymentNote?: string;
  totalAmount?: number;
  momo?: {
    transId?: string;
  };
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PaymentMomoResult() {
  const { search } = useLocation();
  const { removePurchasedItems } = useCart();
  const hasConfirmedRef = useRef(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [returnedOrder, setReturnedOrder] = useState<ReturnedOrder | null>(
    null,
  );

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

  useEffect(() => {
    if (!orderId || hasConfirmedRef.current) return;

    hasConfirmedRef.current = true;

    const confirmMomoReturn = async () => {
      try {
        setConfirmState("loading");

        const payload = {
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
        };

        const shouldRetry = resultCode === "0";
        const maxAttempts = shouldRetry ? 5 : 1;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const res = await orderApi.confirmMomoReturn(payload);
          const order = (res.data?.order || null) as ReturnedOrder | null;

          setReturnedOrder(order);

          if (order?.paymentStatus === "PAID") {
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
                //
              }
            }

            localStorage.removeItem("checkout_items");
            localStorage.removeItem("checkout_coupon_code");

            setConfirmState("paid");
            setConfirmMessage(
              res.data?.message || "Thanh toán MoMo đã được xác nhận.",
            );
            return;
          }

          if (!shouldRetry) {
            setConfirmState("failed");
            setConfirmMessage(
              res.data?.message ||
                "Thanh toán MoMo chưa thành công. Vui lòng kiểm tra lại giao dịch.",
            );
            return;
          }

          if (attempt < maxAttempts - 1) {
            await wait(2000);
          }
        }

        setConfirmState("pending");
        setConfirmMessage(
          "Bạn đã hoàn tất thao tác trên MoMo, nhưng hệ thống vẫn đang chờ MoMo xác nhận giao dịch. Vui lòng kiểm tra lại trong mục đơn hàng sau ít phút.",
        );
      } catch (error: unknown) {
        setConfirmState("error");

        if (axios.isAxiosError(error)) {
          const serverMessage =
            typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : "";

          setConfirmMessage(
            serverMessage ||
              "Không thể đồng bộ trạng thái thanh toán với hệ thống.",
          );
        } else if (error instanceof Error) {
          setConfirmMessage(error.message);
        } else {
          setConfirmMessage(
            "Không thể đồng bộ trạng thái thanh toán với hệ thống.",
          );
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
    transId,
    removePurchasedItems,
  ]);

  const uiState = (() => {
    switch (confirmState) {
      case "paid":
        return {
          title: "Thanh toán thành công",
          desc:
            confirmMessage ||
            "Giao dịch MoMo đã được xác nhận và đơn hàng của bạn đang được xử lý.",
          badge: "Đã thanh toán",
          headerClass:
            "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
          badgeClass: "bg-emerald-100 text-emerald-700",
          icon: "✓",
        };

      case "pending":
        return {
          title: "Đang chờ xác nhận thanh toán",
          desc:
            confirmMessage ||
            "Hệ thống đang chờ MoMo xác nhận giao dịch của bạn.",
          badge: "Chờ xác nhận",
          headerClass:
            "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
          badgeClass: "bg-amber-100 text-amber-700",
          icon: "⏳",
        };

      case "failed":
        return {
          title: "Thanh toán chưa thành công",
          desc:
            confirmMessage ||
            message ||
            "Giao dịch chưa hoàn tất. Vui lòng kiểm tra lại trạng thái thanh toán.",
          badge: "Chưa thanh toán",
          headerClass: "bg-gradient-to-r from-rose-500 to-red-600 text-white",
          badgeClass: "bg-red-100 text-red-700",
          icon: "✕",
        };

      case "error":
        return {
          title: "Không thể xác minh thanh toán",
          desc:
            confirmMessage ||
            "Không thể đồng bộ trạng thái thanh toán với hệ thống.",
          badge: "Lỗi xác minh",
          headerClass:
            "bg-gradient-to-r from-slate-500 to-slate-700 text-white",
          badgeClass: "bg-slate-100 text-slate-700",
          icon: "!",
        };

      default:
        return {
          title: "Đang xử lý thanh toán",
          desc: "Hệ thống đang kiểm tra trạng thái giao dịch của bạn.",
          badge: "Đang xử lý",
          headerClass:
            "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
          badgeClass: "bg-blue-100 text-blue-700",
          icon: "…",
        };
    }
  })();

  return (
    <section className="min-h-[70vh] bg-gradient-to-b from-orange-50 via-white to-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className={`px-6 py-8 text-center ${uiState.headerClass}`}>
            <div className="mb-4 text-5xl">{uiState.icon}</div>

            <h1 className="text-2xl font-bold md:text-3xl">{uiState.title}</h1>

            <p className="mt-3 text-sm md:text-base">{uiState.desc}</p>
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="grid gap-4 rounded-2xl bg-gray-50 p-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="mt-1 break-all text-lg font-semibold text-gray-900">
                  {returnedOrder?.orderCode || orderId || "---"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${uiState.badgeClass}`}
                  >
                    {uiState.badge}
                  </span>
                </div>
              </div>

              {(returnedOrder?.momo?.transId || transId) && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Mã giao dịch MoMo</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {returnedOrder?.momo?.transId || transId}
                  </p>
                </div>
              )}

              {(returnedOrder?.totalAmount || amount) && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Số tiền</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {Number(
                      returnedOrder?.totalAmount || amount || 0,
                    ).toLocaleString("vi-VN")}
                    ₫
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-800">
                Ghi chú hệ thống
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {confirmState === "loading" &&
                  "Đang kiểm tra thanh toán với hệ thống..."}
                {confirmState !== "loading" &&
                  (returnedOrder?.paymentNote ||
                    confirmMessage ||
                    "Đang chờ xử lý...")}
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
