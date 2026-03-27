import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Loader2,
  SquarePen,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  isValidVietnamesePhone,
  normalizePhone,
  MAX_AVATAR_SIZE_MB,
} from "../../utils/account.utils";

type UserLike = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: string;
};

type UpdateProfilePayload = {
  address?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
};

type AccountSidebarProps = {
  user: UserLike;
  avatarPreview: string;
  onLogout: () => void;
  onUpdateProfile: (payload: UpdateProfilePayload) => Promise<unknown>;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  setAvatarPreview: React.Dispatch<React.SetStateAction<string | null>>;
};

function toDateInputValue(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function formatDate(date?: string) {
  if (!date) return "Chưa cập nhật";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Chưa cập nhật";
  return d.toLocaleDateString("vi-VN");
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

function getMaxBirthDate() {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );

  return maxDate.toISOString().split("T")[0];
}

export default function AccountSidebar({
  user,
  avatarPreview,
  onUpdateProfile,
  setAvatarFile,
  setAvatarPreview,
}: AccountSidebarProps) {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingDateOfBirth, setEditingDateOfBirth] = useState(false);
  const [savingInline, setSavingInline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maxBirthDate = getMaxBirthDate();

  useEffect(() => {
    setPhone(user?.phone ?? "");
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setDateOfBirth(toDateInputValue(user?.dateOfBirth));
  }, [user]);

  const handleChooseAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Ảnh không được vượt quá ${MAX_AVATAR_SIZE_MB}MB`);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    toast.success("Đã chọn ảnh mới");
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

  const handleCancelEditDateOfBirth = () => {
    setDateOfBirth(toDateInputValue(user?.dateOfBirth));
    setEditingDateOfBirth(false);
  };

  const handleQuickSave = async (type: "name" | "phone" | "dateOfBirth") => {
    try {
      const payload: UpdateProfilePayload = {};

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
          toast.info("Họ tên chưa thay đổi");
          return;
        }
      }

      if (type === "phone") {
        const raw = phone.trim();
        const normalized = normalizePhone(raw);

        if (!raw) {
          toast.error("Vui lòng nhập số điện thoại");
          return;
        }

        if (!isValidVietnamesePhone(raw)) {
          toast.error("Số điện thoại không hợp lệ");
          return;
        }

        if (normalized !== normalizePhone(user?.phone ?? "")) {
          payload.phone = normalized;
        }

        if (!payload.phone) {
          setEditingPhone(false);
          toast.info("Số điện thoại chưa thay đổi");
          return;
        }
      }

      if (type === "dateOfBirth") {
        if (!dateOfBirth) {
          toast.error("Vui lòng chọn ngày sinh");
          return;
        }

        if (calculateAge(dateOfBirth) < 16) {
          toast.error("Bạn phải đủ 16 tuổi để sử dụng tài khoản");
          return;
        }

        if (dateOfBirth !== toDateInputValue(user?.dateOfBirth)) {
          payload.dateOfBirth = dateOfBirth;
        }

        if (!payload.dateOfBirth) {
          setEditingDateOfBirth(false);
          toast.info("Ngày sinh chưa thay đổi");
          return;
        }
      }

      setSavingInline(true);
      await onUpdateProfile(payload);
      toast.success("Đã lưu thành công 🎉");

      if (type === "name") setEditingName(false);
      if (type === "phone") setEditingPhone(false);
      if (type === "dateOfBirth") setEditingDateOfBirth(false);
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Lưu thất bại");
    } finally {
      setSavingInline(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <label className="group relative cursor-pointer">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="h-44 w-44 rounded-full border-4 border-orange-100 object-cover shadow-lg transition duration-200 group-hover:scale-[1.02] group-hover:opacity-90"
            />

            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition duration-200 group-hover:opacity-100">
              <div className="flex flex-col items-center gap-1 text-white">
                <Camera size={20} />
                <span className="text-sm font-medium">Đổi ảnh</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChooseAvatar}
              className="hidden"
            />
          </label>

          <h3 className="mt-4 text-2xl font-bold uppercase text-slate-800">
            {user.firstName} {user.lastName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>

          <div className="mt-5 w-full rounded-2xl bg-slate-50 p-5 text-left">
            <div className="space-y-4 text-sm text-slate-800">
              <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-white">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-700">Họ tên: </span>

                  {editingName ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Họ"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                        disabled={savingInline}
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Tên"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                        disabled={savingInline}
                      />
                    </div>
                  ) : (
                    <span className="break-words text-slate-900">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {editingName ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleQuickSave("name")}
                        disabled={savingInline}
                        className="rounded-full p-2 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                        title="Lưu"
                      >
                        {savingInline ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEditName}
                        disabled={savingInline}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Huỷ"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="rounded-full p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                      title="Sửa họ tên"
                    >
                      <SquarePen size={16} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-white">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-700">Ngày sinh: </span>

                  {editingDateOfBirth ? (
                    <div className="mt-2">
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={maxBirthDate}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                        disabled={savingInline}
                      />
                    </div>
                  ) : (
                    <span className="text-slate-900">
                      {formatDate(user.dateOfBirth)}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {editingDateOfBirth ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleQuickSave("dateOfBirth")}
                        disabled={savingInline}
                        className="rounded-full p-2 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                        title="Lưu"
                      >
                        {savingInline ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEditDateOfBirth}
                        disabled={savingInline}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Huỷ"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingDateOfBirth(true)}
                      className="rounded-full p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                      title="Sửa ngày sinh"
                    >
                      <SquarePen size={16} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-white">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-700">
                    Số điện thoại:{" "}
                  </span>

                  {editingPhone ? (
                    <div className="mt-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                        disabled={savingInline}
                      />
                    </div>
                  ) : (
                    <span className="break-words text-slate-900">
                      {user.phone || "Chưa cập nhật"}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {editingPhone ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleQuickSave("phone")}
                        disabled={savingInline}
                        className="rounded-full p-2 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                        title="Lưu"
                      >
                        {savingInline ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEditPhone}
                        disabled={savingInline}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Huỷ"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingPhone(true)}
                      className="rounded-full p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                      title="Sửa số điện thoại"
                    >
                      <SquarePen size={16} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl px-2 py-2">
                <p className="font-semibold text-slate-700">Địa chỉ:</p>
                <p className="mt-1 leading-7 text-slate-700">
                  {user.address || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Nhấn vào ảnh để chọn avatar mới
          </p>
        </div>
      </div>
    </div>
  );
}