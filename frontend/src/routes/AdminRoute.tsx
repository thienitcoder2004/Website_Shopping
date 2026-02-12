import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../stores/store";

export default function AdminRoute({ children }: any) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
}
