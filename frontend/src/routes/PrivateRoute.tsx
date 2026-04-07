import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../stores/store";

type PrivateRouteProps = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  return user ? children : <Navigate to="/login" />;
}
