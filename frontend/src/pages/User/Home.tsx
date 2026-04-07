import AccessoriesSection from "../../components/AccessoriesSection";
import BestSellerSection from "../../components/BestSellerSection";
import CategoryProductSection from "../../components/CategoryProductSection";
import Navbar from "../../components/Navbar";
import NewsSection from "../../components/NewsSection";

export function Home() {
  return (
    <>
      <Navbar />
      <BestSellerSection />
      <CategoryProductSection />
      <AccessoriesSection />
      <NewsSection />
    </>
  );
}
