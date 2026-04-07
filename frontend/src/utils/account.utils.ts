import axios from "axios";

export const API_BASE = "http://localhost:5000";
export const MAX_AVATAR_SIZE_MB = 5;

export function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) return err.message;
  }

  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").trim();
}

export function isValidVietnamesePhone(phone: string) {
  const normalized = normalizePhone(phone);

  const localPhone = normalized.startsWith("84")
    ? `0${normalized.slice(2)}`
    : normalized;

  return /^(03|05|07|08|09)\d{8}$/.test(localPhone);
}

export function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: "Yếu", color: "bg-red-500", width: "w-1/3" };
  }

  if (score <= 4) {
    return { label: "Trung bình", color: "bg-yellow-500", width: "w-2/3" };
  }

  return { label: "Mạnh", color: "bg-green-500", width: "w-full" };
}