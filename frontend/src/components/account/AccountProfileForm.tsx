import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useVietnamAddress } from "../../hooks/useVietnamAddress";
import { API_BASE, getAxiosErrorMessage } from "../../utils/account.utils";

type UserLike = {
  address?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference?: "male" | "female" | "both";
};

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

type AccountProfileFormProps = {
  user: UserLike;
  token: string | null;
  avatarFile: File | null;
  avatarPreview: string;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  setAvatarPreview: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateProfile: (payload: UpdateProfilePayload) => Promise<unknown>;
};

export default function AccountProfileForm({
  user,
  token,
  avatarFile,
  avatarPreview,
  setAvatarFile,
  onUpdateProfile,
}: AccountProfileFormProps) {
  const {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    wardCode,
    detailAddress,
    fullAddress,
    loadingProvinceData,
    loadingDistrictData,
    loadingWardData,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
    setDetailAddress,
    resetAddressForm,
  } = useVietnamAddress();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    gender: (user?.gender ?? "prefer_not_to_say") as
      | "male"
      | "female"
      | "other"
      | "prefer_not_to_say",
    shoppingPreference: (user?.shoppingPreference ?? "both") as
      | "male"
      | "female"
      | "both",
  });

  useEffect(() => {
    setProfileForm({
      gender: (user?.gender ?? "prefer_not_to_say") as
        | "male"
        | "female"
        | "other"
        | "prefer_not_to_say",
      shoppingPreference: (user?.shoppingPreference ?? "both") as
        | "male"
        | "female"
        | "both",
    });
  }, [user?.gender, user?.shoppingPreference]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const hasProfileChanges = useMemo(() => {
    const avatarChanged = !!avatarFile;
    const addressChanged =
      !!fullAddress.trim() && fullAddress !== (user?.address ?? "");

    const genderChanged =
      profileForm.gender !== (user?.gender ?? "prefer_not_to_say");

    const shoppingPreferenceChanged =
      profileForm.shoppingPreference !== (user?.shoppingPreference ?? "both");

    return (
      avatarChanged ||
      addressChanged ||
      genderChanged ||
      shoppingPreferenceChanged
    );
  }, [
    avatarFile,
    fullAddress,
    user?.address,
    user?.gender,
    user?.shoppingPreference,
    profileForm.gender,
    profileForm.shoppingPreference,
  ]);

  const uploadAvatar = async () => {
    if (!avatarFile || !token) return null;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    setUploadingAvatar(true);

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData, {
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

  const handleChangeProfileField = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (
      (provinceCode || districtCode || wardCode || detailAddress.trim()) &&
      (!provinceCode || !districtCode || !wardCode || !detailAddress.trim())
    ) {
      toast.error(
        "Vui lòng chọn đầy đủ tỉnh, quận, phường và nhập số nhà/tên đường",
      );
      return;
    }

    try {
      setSavingProfile(true);

      const payload: UpdateProfilePayload = {};

      if (profileForm.gender !== (user?.gender ?? "prefer_not_to_say")) {
        payload.gender = profileForm.gender;
      }

      if (
        profileForm.shoppingPreference !== (user?.shoppingPreference ?? "both")
      ) {
        payload.shoppingPreference = profileForm.shoppingPreference;
      }

      if (fullAddress.trim() && fullAddress !== (user?.address ?? "")) {
        payload.address = fullAddress;
      }

      if (avatarFile) {
        const uploadedAvatar = await uploadAvatar();
        if (!uploadedAvatar) return;
        payload.avatar = uploadedAvatar;
      }

      if (
        !payload.address &&
        !payload.avatar &&
        !payload.gender &&
        !payload.shoppingPreference
      ) {
        toast.info("Bạn chưa thay đổi thông tin nào");
        return;
      }

      await onUpdateProfile(payload);

      toast.success("Cập nhật thông tin thành công 🎉");
      setAvatarFile(null);
      resetAddressForm();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lỗi cập nhật thông tin");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-semibold text-slate-800">
        Cập nhật thông tin khác
      </h3>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            name="gender"
            value={profileForm.gender}
            onChange={handleChangeProfileField}
            className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500"
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
            <option value="prefer_not_to_say">Không muốn tiết lộ</option>
          </select>

          <select
            name="shoppingPreference"
            value={profileForm.shoppingPreference}
            onChange={handleChangeProfileField}
            className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500"
          >
            <option value="male">Ưu tiên đồ nam</option>
            <option value="female">Ưu tiên đồ nữ</option>
            <option value="both">Xem cả đồ nam và đồ nữ</option>
          </select>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="mb-4 text-base font-semibold text-slate-800">
            Cập nhật địa chỉ
          </h4>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500"
            >
              <option value="">
                {loadingProvinceData
                  ? "Đang tải tỉnh/thành..."
                  : "Chọn Tỉnh / Thành phố"}
              </option>
              {provinces.map((p) => (
                <option key={p.code} value={String(p.code)}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500 disabled:bg-slate-100"
              disabled={!provinceCode || loadingDistrictData}
            >
              <option value="">
                {loadingDistrictData
                  ? "Đang tải quận/huyện..."
                  : "Chọn Quận / Huyện"}
              </option>
              {districts.map((d) => (
                <option key={d.code} value={String(d.code)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500 disabled:bg-slate-100"
              disabled={!districtCode || loadingWardData}
            >
              <option value="">
                {loadingWardData ? "Đang tải phường/xã..." : "Chọn Phường / Xã"}
              </option>
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
              className="h-14 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-orange-500"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-sm font-semibold text-orange-700">
              Địa chỉ đầy đủ
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {fullAddress || "Bạn chưa chọn/nhập địa chỉ mới"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploadingAvatar || savingProfile || !hasProfileChanges}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProfile || uploadingAvatar ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {uploadingAvatar ? "Đang tải ảnh..." : "Đang lưu..."}
            </>
          ) : (
            "Lưu thông tin"
          )}
        </button>
      </form>
    </div>
  );
}
