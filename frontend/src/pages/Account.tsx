import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout, updateProfile } from "../stores/authSlice";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Camera, SquarePen, Check, X } from "lucide-react";
import type { RootState, AppDispatch } from "../stores/store";

/** Types for provinces.open-api.vn */
type VNProvince = { code: number; name: string };
type VNDistrict = { code: number; name: string };
type VNWard = { code: number; name: string };

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").trim();
}

export default function Account() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const defaultAvatar = "http://localhost:5000/uploads/default-avatar.png";

  // password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // profile
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // inline edit
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingInline, setSavingInline] = useState(false);

  // avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // address data
  const [provinces, setProvinces] = useState<VNProvince[]>([]);
  const [districts, setDistricts] = useState<VNDistrict[]>([]);
  const [wards, setWards] = useState<VNWard[]>([]);

  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [detailAddress, setDetailAddress] = useState<string>("");

  useEffect(() => {
    const currentAvatar =
      user?.avatar && user.avatar.trim()
        ? user.avatar.startsWith("http")
          ? user.avatar
          : `http://localhost:5000${user.avatar}`
        : defaultAvatar;

    setAvatarPreview(currentAvatar);
    setPhone(user?.phone ?? "");
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get<VNProvince[]>(
          "https://provinces.open-api.vn/api/p/",
        );
        setProvinces(res.data ?? []);
      } catch {
        toast.error("Không tải được danh sách tỉnh/thành");
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (!provinceCode) return;

    const run = async () => {
      try {
        const res = await axios.get<{ districts: VNDistrict[] }>(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
        );
        setDistricts(res.data?.districts ?? []);
      } catch {
        toast.error("Không tải được danh sách quận/huyện");
        setDistricts([]);
      } finally {
        setDistrictCode("");
        setWardCode("");
        setWards([]);
      }
    };

    void run();
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) return;

    const run = async () => {
      try {
        const res = await axios.get<{ wards: VNWard[] }>(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
        );
        setWards(res.data?.wards ?? []);
      } catch {
        toast.error("Không tải được danh sách phường/xã");
        setWards([]);
      } finally {
        setWardCode("");
      }
    };

    void run();
  }, [districtCode]);

  const fullAddress = useMemo(() => {
    const province = provinces.find((p) => String(p.code) === provinceCode)?.name;
    const district = districts.find((d) => String(d.code) === districtCode)?.name;
    const ward = wards.find((w) => String(w.code) === wardCode)?.name;

    const parts = [detailAddress, ward, district, province].filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0,
    );

    return parts.join(", ");
  }, [
    detailAddress,
    wardCode,
    districtCode,
    provinceCode,
    provinces,
    districts,
    wards,
  ]);

  const handleChooseAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !token) return null;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    setUploadingAvatar(true);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data?.url || null;
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Upload ảnh thất bại"));
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelEditName = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEditingName(false);
  };

  const handleCancelEditPhone = () => {
    setPhone(user?.phone ?? "");
    setEditingPhone(false);
  };

  const handleQuickSave = async (type: "name" | "phone") => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    try {
      const payload: {
        firstName?: string;
        lastName?: string;
        phone?: string;
      } = {};

      if (type === "name") {
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (!trimmedFirstName || !trimmedLastName) {
          toast.error("Vui lòng nhập đầy đủ họ và tên");
          return;
        }

        if (trimmedFirstName !== (user?.firstName ?? "")) {
          payload.firstName = trimmedFirstName;
        }

        if (trimmedLastName !== (user?.lastName ?? "")) {
          payload.lastName = trimmedLastName;
        }

        if (!payload.firstName && !payload.lastName) {
          setEditingName(false);
          return;
        }
      }

      if (type === "phone") {
        const normalized = normalizePhone(phone);

        if (phone.trim() && normalized.length < 9) {
          toast.error("Số điện thoại không hợp lệ");
          return;
        }

        if (normalized !== normalizePhone(user?.phone ?? "")) {
          payload.phone = normalized;
        }

        if (!payload.phone) {
          setEditingPhone(false);
          return;
        }
      }

      setSavingInline(true);
      await dispatch(updateProfile(payload)).unwrap();
      toast.success("Đã lưu thành công 🎉");

      if (type === "name") setEditingName(false);
      if (type === "phone") setEditingPhone(false);
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lưu thất bại");
    } finally {
      setSavingInline(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    try {
      const payload: {
        address?: string;
        avatar?: string;
      } = {};

      if (fullAddress.trim() && fullAddress !== (user?.address ?? "")) {
        payload.address = fullAddress;
      }

      if (avatarFile) {
        const uploadedAvatar = await uploadAvatar();
        if (!uploadedAvatar) return;
        payload.avatar = uploadedAvatar;
      }

      if (!payload.address && !payload.avatar) {
        toast.info("Bạn chưa thay đổi thông tin nào");
        return;
      }

      await dispatch(updateProfile(payload)).unwrap();

      toast.success("Cập nhật thông tin thành công 🎉");
      setAvatarFile(null);
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lỗi cập nhật thông tin");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Lỗi đổi mật khẩu"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("checkout_items");
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold">Tài khoản của bạn</h2>
            <p className="mt-1 text-sm text-orange-100">
              Quản lý thông tin cá nhân, ảnh đại diện và mật khẩu
            </p>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[320px_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <label className="group relative cursor-pointer">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-44 w-44 rounded-full border-4 border-orange-100 object-cover shadow-md transition duration-200 group-hover:opacity-85"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition duration-200 group-hover:opacity-100">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Camera size={20} />
                        <span className="text-sm font-medium">Đổi ảnh</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChooseAvatar}
                      className="hidden"
                    />
                  </label>

                  <h3 className="mt-4 text-xl font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>

                  <div className="mt-4 w-full rounded-xl bg-slate-50 p-4 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <span className="shrink-0 font-semibold text-slate-700">
                          Họ tên:
                        </span>

                        {editingName ? (
                          <div className="flex flex-1 gap-2">
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Họ"
                              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                              disabled={savingInline}
                            />
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Tên"
                              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                              disabled={savingInline}
                            />
                          </div>
                        ) : (
                          <span className="truncate text-slate-900">
                            {user.firstName} {user.lastName}
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {editingName ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleQuickSave("name")}
                              disabled={savingInline}
                              className="rounded-full p-1.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                              title="Lưu"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditName}
                              disabled={savingInline}
                              className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                              title="Huỷ"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            className="rounded-full p-1.5 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                            title="Sửa họ tên"
                          >
                            <SquarePen size={18} strokeWidth={2.4} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-slate-700">Email:</span>{" "}
                      {user.email}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <span className="shrink-0 font-semibold text-slate-700">
                          Số điện thoại:
                        </span>

                        {editingPhone ? (
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                            disabled={savingInline}
                          />
                        ) : (
                          <span className="truncate text-slate-900">
                            {user.phone || "Chưa cập nhật"}
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {editingPhone ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleQuickSave("phone")}
                              disabled={savingInline}
                              className="rounded-full p-1.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                              title="Lưu"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditPhone}
                              disabled={savingInline}
                              className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                              title="Huỷ"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingPhone(true)}
                            className="rounded-full p-1.5 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                            title="Sửa số điện thoại"
                          >
                            <SquarePen size={18} strokeWidth={2.4} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-slate-700">
                        Địa chỉ hiện tại:
                      </span>{" "}
                      {user.address || "Chưa cập nhật"}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Nhấn vào ảnh để chọn avatar mới
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-800">
                  Cập nhật thông tin khác
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={provinceCode}
                      onChange={(e) => setProvinceCode(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500"
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={String(p.code)}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={districtCode}
                      onChange={(e) => setDistrictCode(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500 disabled:bg-slate-100"
                      disabled={!provinceCode}
                    >
                      <option value="">Chọn Quận / Huyện</option>
                      {districts.map((d) => (
                        <option key={d.code} value={String(d.code)}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                    <select
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500 disabled:bg-slate-100"
                      disabled={!districtCode}
                    >
                      <option value="">Chọn Phường / Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={String(w.code)}>
                          {w.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Số nhà, tên đường..."
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingAvatar}
                    className="rounded-xl bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
                  >
                    {uploadingAvatar ? "Đang tải ảnh..." : "Lưu thông tin"}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-800">
                  Đổi mật khẩu
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      placeholder="Mật khẩu cũ"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800">
                    Đổi mật khẩu
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}