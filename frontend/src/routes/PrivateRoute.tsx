import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../stores/store";

export default function PrivateRoute({ children }: any) {
  const user = useSelector((state: RootState) => state.auth.user);

  return user ? children : <Navigate to="/login" />;
}
