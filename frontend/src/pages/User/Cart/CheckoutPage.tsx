import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { orderApi } from "../../../api/order.api";
import { validateCoupon } from "../../../api/coupon.api";
import { useCart } from "../../../context/cart.context";
import CheckoutCouponBox from "../../../components/CheckoutPage/CheckoutCouponBox";
import CheckoutForm from "../../../components/CheckoutPage/CheckoutForm";
import CheckoutSummary from "../../../components/CheckoutPage/CheckoutSummary";
import { getProfile, updateProfile } from "../../../stores/authSlice";
import type { AppDispatch, RootState } from "../../../stores/store";

type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    color?: string;
    size?: string;
  };
};

type PaymentMethod = "COD" | "MOMO";

type AppliedCoupon = {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
};

type SavedCheckoutInfo = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
};

type SavedAddressItem = {
  id: string;
  label: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
};

type FormErrors = {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

const COUPON_STORAGE_KEY = "checkout_coupon_code";
const CHECKOUT_INFO_STORAGE_KEY = "checkout_customer_info";
const CHECKOUT_SAVED_ADDRESSES_KEY = "checkout_saved_addresses";

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function isValidVietnamesePhone(value: string) {
  const phone = normalizePhone(value);
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone);
}

function getAccountFullName(user?: { firstName?: string; lastName?: string }) {
  return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
}

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function getSavedCheckoutInfo(): SavedCheckoutInfo | null {
  const raw = localStorage.getItem(CHECKOUT_INFO_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      "customerName" in parsed &&
      "customerPhone" in parsed &&
      "customerAddress" in parsed
    ) {
      const data = parsed as SavedCheckoutInfo;

      return {
        customerName: String(data.customerName || ""),
        customerPhone: String(data.customerPhone || ""),
        customerAddress: String(data.customerAddress || ""),
      };
    }
  } catch {
    localStorage.removeItem(CHECKOUT_INFO_STORAGE_KEY);
  }

  return null;
}

function getSavedAddresses(): SavedAddressItem[] {
  const items = safeParseArray<SavedAddressItem>(
    localStorage.getItem(CHECKOUT_SAVED_ADDRESSES_KEY),
  );

  return items.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.label === "string" &&
      typeof item.customerName === "string" &&
      typeof item.customerPhone === "string" &&
      typeof item.customerAddress === "string",
  );
}

function buildAddressLabel(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}) {
  const shortAddress =
    data.customerAddress.length > 40
      ? `${data.customerAddress.slice(0, 40)}...`
      : data.customerAddress;

  return `${data.customerName} • ${data.customerPhone} • ${shortAddress}`;
}

function saveAddressToHistory(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}) {
  const normalizedPhone = normalizePhone(data.customerPhone);
  const normalizedAddress = data.customerAddress.trim();
  const normalizedName = data.customerName.trim();

  const current = getSavedAddresses();

  const duplicatedIndex = current.findIndex(
    (item) =>
      item.customerName.trim().toLowerCase() === normalizedName.toLowerCase() &&
      normalizePhone(item.customerPhone) === normalizedPhone &&
      item.customerAddress.trim().toLowerCase() ===
        normalizedAddress.toLowerCase(),
  );

  let next = [...current];

  if (duplicatedIndex >= 0) {
    const duplicated = next[duplicatedIndex];

    next.splice(duplicatedIndex, 1);
    next.unshift({
      ...duplicated,
      label: buildAddressLabel({
        customerName: normalizedName,
        customerPhone: normalizedPhone,
        customerAddress: normalizedAddress,
      }),
      customerName: normalizedName,
      customerPhone: normalizedPhone,
      customerAddress: normalizedAddress,
      createdAt: new Date().toISOString(),
    });
  } else {
    next.unshift({
      id: `${Date.now()}`,
      label: buildAddressLabel({
        customerName: normalizedName,
        customerPhone: normalizedPhone,
        customerAddress: normalizedAddress,
      }),
      customerName: normalizedName,
      customerPhone: normalizedPhone,
      customerAddress: normalizedAddress,
      createdAt: new Date().toISOString(),
    });
  }

  next = next.slice(0, 5);

  localStorage.setItem(CHECKOUT_SAVED_ADDRESSES_KEY, JSON.stringify(next));
  return next;
}

function validateCheckoutData(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}) {
  const errors: FormErrors = {};

  const name = data.customerName.trim();
  const phone = data.customerPhone.trim();
  const address = data.customerAddress.trim();

  if (!name) {
    errors.customerName = "Vui lòng nhập họ và tên";
  } else if (name.length < 2) {
    errors.customerName = "Họ và tên quá ngắn";
  }

  if (!phone) {
    errors.customerPhone = "Vui lòng nhập số điện thoại";
  } else if (!isValidVietnamesePhone(phone)) {
    errors.customerPhone = "Số điện thoại không hợp lệ";
  }

  if (!address) {
    errors.customerAddress = "Vui lòng nhập địa chỉ nhận hàng";
  } else if (address.length < 8) {
    errors.customerAddress = "Địa chỉ nhận hàng quá ngắn";
  }

  return errors;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { removePurchasedItems } = useCart();

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const items = useMemo<CheckoutCartItem[]>(() => {
    const saved = localStorage.getItem("checkout_items");
    if (!saved) return [];

    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as CheckoutCartItem[]) : [];
    } catch {
      return [];
    }
  }, []);

  const accountName = useMemo(
    () =>
      getAccountFullName({
        firstName: user?.firstName,
        lastName: user?.lastName,
      }),
    [user?.firstName, user?.lastName],
  );

  const accountPhone = user?.phone ?? "";
  const accountAddress = user?.address ?? "";

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(false);

  const [saveForNextTime, setSaveForNextTime] = useState(true);
  const [saveAddressBook, setSaveAddressBook] = useState(true);
  const [updateAccountInfo, setUpdateAccountInfo] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [couponCode, setCouponCode] = useState(
    () => localStorage.getItem(COUPON_STORAGE_KEY) || "",
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );

  useEffect(() => {
    if (token) {
      void dispatch(getProfile());
    }
  }, [dispatch, token]);

  useEffect(() => {
    setSavedAddresses(getSavedAddresses());
  }, []);

  useEffect(() => {
    const savedInfo = getSavedCheckoutInfo();

    setCustomerName(accountName || savedInfo?.customerName || "");
    setCustomerPhone(accountPhone || savedInfo?.customerPhone || "");
    setCustomerAddress(accountAddress || savedInfo?.customerAddress || "");

    if (savedInfo) {
      setSaveForNextTime(true);
    }
  }, [accountName, accountPhone, accountAddress]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const finalTotal = useMemo(() => {
    return Math.max(0, total - discountAmount);
  }, [total, discountAmount]);

  const purchasedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        variant: {
          color: item.variant?.color || "",
          size: item.variant?.size || "",
        },
      })),
    [items],
  );

  const clearFieldError = (field: keyof FormErrors) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleUseAccountInfo = () => {
    setCustomerName(accountName);
    setCustomerPhone(accountPhone);
    setCustomerAddress(accountAddress);
    setSelectedSavedAddressId("");
    setFormErrors({});
    toast.success("Đã điền thông tin từ tài khoản");
  };

  const handleSelectSavedAddress = (id: string) => {
    setSelectedSavedAddressId(id);

    if (!id) return;

    const selected = savedAddresses.find((item) => item.id === id);
    if (!selected) return;

    setCustomerName(selected.customerName);
    setCustomerPhone(selected.customerPhone);
    setCustomerAddress(selected.customerAddress);
    setFormErrors({});
    toast.success("Đã áp dụng địa chỉ đã lưu");
  };

  const handleApplyCoupon = async () => {
    try {
      if (!items.length) {
        toast.error("Không có sản phẩm để áp mã");
        return;
      }

      const normalizedCode = couponCode.trim().toUpperCase();

      if (!normalizedCode) {
        toast.error("Vui lòng nhập mã giảm giá");
        return;
      }

      setApplyingCoupon(true);

      const res = await validateCoupon({
        code: normalizedCode,
        subtotal: total,
      });

      const data = res.data?.data;
      const coupon = data?.coupon;
      const discount = Number(data?.discount || 0);

      setCouponCode(normalizedCode);
      setDiscountAmount(discount);
      setAppliedCoupon({
        code: coupon?.code || normalizedCode,
        type: coupon?.type || "",
        value: Number(coupon?.value || 0),
        discountAmount: discount,
      });

      localStorage.setItem(COUPON_STORAGE_KEY, normalizedCode);
      toast.success("Áp mã giảm giá thành công");
    } catch (error: unknown) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      toast.error(getErrorMessage(error, "Áp mã giảm giá thất bại"));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem(COUPON_STORAGE_KEY);
    setCouponCode("");
    setDiscountAmount(0);
    setAppliedCoupon(null);
    toast.info("Đã bỏ mã giảm giá");
  };

  const handleCheckout = async () => {
    try {
      if (!items.length) {
        toast.error("Không có sản phẩm để thanh toán");
        return;
      }

      const errors = validateCheckoutData({
        customerName,
        customerPhone,
        customerAddress,
      });

      setFormErrors(errors);

      if (
        errors.customerName ||
        errors.customerPhone ||
        errors.customerAddress
      ) {
        toast.error("Vui lòng kiểm tra lại thông tin nhận hàng");
        return;
      }

      const trimmedName = customerName.trim();
      const trimmedPhone = normalizePhone(customerPhone);
      const trimmedAddress = customerAddress.trim();
      const trimmedNote = note.trim();

      if (saveForNextTime) {
        localStorage.setItem(
          CHECKOUT_INFO_STORAGE_KEY,
          JSON.stringify({
            customerName: trimmedName,
            customerPhone: trimmedPhone,
            customerAddress: trimmedAddress,
          }),
        );
      } else {
        localStorage.removeItem(CHECKOUT_INFO_STORAGE_KEY);
      }

      let latestSavedAddresses = savedAddresses;

      if (saveAddressBook) {
        latestSavedAddresses = saveAddressToHistory({
          customerName: trimmedName,
          customerPhone: trimmedPhone,
          customerAddress: trimmedAddress,
        });
        setSavedAddresses(latestSavedAddresses);
      }

      if (updateAccountInfo) {
        const nameParts = trimmedName.split(" ").filter(Boolean);
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        const firstName = nameParts.length > 0 ? nameParts[0] : "";

        await dispatch(
          updateProfile({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: trimmedPhone,
            address: trimmedAddress,
          }),
        ).unwrap();
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          color: item.variant?.color || "",
          size: item.variant?.size || "",
          image: item.image || "",
        })),
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerAddress: trimmedAddress,
        note: trimmedNote,
        couponCode: appliedCoupon?.code || "",
      };

      setLoading(true);

      if (paymentMethod === "COD") {
        await orderApi.createCashOrder(payload);

        removePurchasedItems(purchasedItems);
        localStorage.removeItem("checkout_items");
        localStorage.removeItem(COUPON_STORAGE_KEY);

        toast.success("Đặt hàng thành công");
        navigate("/account/orders");
        return;
      }

      const res = await orderApi.createMomoOrder(payload);
      const payUrl = res.data?.payUrl;

      if (!payUrl || typeof payUrl !== "string") {
        toast.error("Không lấy được link thanh toán MoMo");
        return;
      }

      window.location.href = payUrl;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Thanh toán thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Thanh toán</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <CheckoutForm
          customerName={customerName}
          setCustomerName={(value) => {
            setCustomerName(value);
            clearFieldError("customerName");
          }}
          customerPhone={customerPhone}
          setCustomerPhone={(value) => {
            setCustomerPhone(value);
            clearFieldError("customerPhone");
          }}
          customerAddress={customerAddress}
          setCustomerAddress={(value) => {
            setCustomerAddress(value);
            clearFieldError("customerAddress");
          }}
          note={note}
          setNote={setNote}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onUseAccountInfo={handleUseAccountInfo}
          saveForNextTime={saveForNextTime}
          setSaveForNextTime={setSaveForNextTime}
          saveAddressBook={saveAddressBook}
          setSaveAddressBook={setSaveAddressBook}
          updateAccountInfo={updateAccountInfo}
          setUpdateAccountInfo={setUpdateAccountInfo}
          hasAccountInfo={Boolean(
            accountName || accountPhone || accountAddress,
          )}
          formErrors={formErrors}
          savedAddresses={savedAddresses}
          selectedSavedAddressId={selectedSavedAddressId}
          onSelectSavedAddress={handleSelectSavedAddress}
        />

        <CheckoutSummary
          items={items}
          total={total}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
          loading={loading}
          handleCheckout={handleCheckout}
          formatPrice={formatPrice}
        >
          <CheckoutCouponBox
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyingCoupon={applyingCoupon}
            loading={loading}
            appliedCoupon={appliedCoupon}
            handleApplyCoupon={handleApplyCoupon}
            handleRemoveCoupon={handleRemoveCoupon}
            formatPrice={formatPrice}
          />
        </CheckoutSummary>
      </div>
    </section>
  );
}
