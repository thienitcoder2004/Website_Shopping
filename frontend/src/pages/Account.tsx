import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../stores/authSlice";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import type { RootState, AppDispatch } from "../stores/store";

/** Types for provinces.open-api.vn */
type VNProvince = { code: number; name: string };
type VNDistrict = { code: number; name: string };
type VNWard = { code: number; name: string };

/** Re-use Auth user type from Redux */
type AuthUser = NonNullable<RootState["auth"]["user"]>;

/** API responses */
type UpdateProfileResponse = {
  user: AuthUser;
};

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim())
      return err.message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export default function Account() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // address data
  const [provinces, setProvinces] = useState<VNProvince[]>([]);
  const [districts, setDistricts] = useState<VNDistrict[]>([]);
  const [wards, setWards] = useState<VNWard[]>([]);

  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [detailAddress, setDetailAddress] = useState<string>("");

  // load provinces
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

  // load districts by province
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

  // load wards by district
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
    const province = provinces.find(
      (p) => String(p.code) === provinceCode,
    )?.name;
    const district = districts.find(
      (d) => String(d.code) === districtCode,
    )?.name;
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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    try {
      const res = await axios.put<UpdateProfileResponse>(
        "http://localhost:5000/api/auth/update-profile",
        { address: fullAddress },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Cập nhật địa chỉ thành công 🎉");

      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.reload();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Lỗi cập nhật địa chỉ"));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
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
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  };

  // ✅ không navigate trong render
  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="bg-gray-100 py-10 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold border-b pb-3">
          Tài khoản của bạn
        </h2>

        <div className="space-y-2">
          <p>
            <strong>Họ tên:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Địa chỉ hiện tại:</strong> {user.address || "Chưa cập nhật"}
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Cập nhật địa chỉ</h3>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <select
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              className="w-full border px-4 py-2"
              required
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
              className="w-full border px-4 py-2"
              required
              disabled={!provinceCode}
            >
              <option value="">Chọn Quận / Huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={String(d.code)}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              className="w-full border px-4 py-2"
              required
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
              className="w-full border px-4 py-2"
              required
            />

            <button className="bg-orange-600 text-white px-6 py-2">
              Lưu địa chỉ
            </button>
          </form>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Đổi mật khẩu</h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* MẬT KHẨU CŨ */}
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showOld ? "Hide old password" : "Show old password"}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* MẬT KHẨU MỚI */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showNew ? "Hide new password" : "Show new password"}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="bg-orange-600 text-white px-6 py-2">
              Đổi mật khẩu
            </button>
          </form>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </section>
  );
}
