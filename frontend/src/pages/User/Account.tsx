import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AccountProfileForm from "../../components/account/AccountProfileForm";
import AccountSidebar from "../../components/account/AccountSidebar";
import ChangePasswordForm from "../../components/account/ChangePasswordForm";
import { logout, updateProfile } from "../../stores/authSlice";
import type { AppDispatch, RootState } from "../../stores/store";
import { API_BASE } from "../../utils/account.utils";

type UpdateProfilePayload = {
  address?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference?: "male" | "female" | "both";
};

export default function Account() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const defaultAvatar = `${API_BASE}/uploads/default-avatar.png`;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewOverride, setAvatarPreviewOverride] = useState<string | null>(null);

  const avatarPreview = useMemo(() => {
    if (avatarPreviewOverride) return avatarPreviewOverride;

    if (user?.avatar && user.avatar.trim()) {
      return user.avatar.startsWith("http")
        ? user.avatar
        : `${API_BASE}${user.avatar}`;
    }

    return defaultAvatar;
  }, [avatarPreviewOverride, user, defaultAvatar]);

  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (!confirmed) return;

    localStorage.removeItem("checkout_items");
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  };

  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    const result = await dispatch(updateProfile(payload)).unwrap();

    if (payload.avatar) {
      setAvatarPreviewOverride(null);
    }

    return result;
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-7 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tài khoản của bạn</h2>
              <p className="mt-1 text-sm text-orange-100">
                Quản lý thông tin cá nhân, địa chỉ, ảnh đại diện, đơn hàng và bảo mật tài khoản
              </p>
            </div>

            <Link
              to="/account/orders"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-bold text-orange-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-700"
            >
              Đơn hàng của tôi
            </Link>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[340px_1fr] lg:p-8">
            <AccountSidebar
              user={user}
              avatarPreview={avatarPreview}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              setAvatarFile={setAvatarFile}
              setAvatarPreview={setAvatarPreviewOverride}
            />

            <div className="space-y-8">
              <AccountProfileForm
                user={user}
                token={token}
                avatarFile={avatarFile}
                avatarPreview={avatarPreview}
                setAvatarFile={setAvatarFile}
                setAvatarPreview={setAvatarPreviewOverride}
                onUpdateProfile={handleUpdateProfile}
              />

              <ChangePasswordForm token={token} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}