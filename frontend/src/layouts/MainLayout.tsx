import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      {children}
      <Outlet />
      <Footer />
    </>
  );
}
