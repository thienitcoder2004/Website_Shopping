import type React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../stores/store";

type Props = {
  children: React.ReactNode;
  allow: string[];
};

export default function RoleRoute({ children, allow }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);

  const role = String(user?.role || "").toLowerCase();

  if (!allow.includes(role)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}