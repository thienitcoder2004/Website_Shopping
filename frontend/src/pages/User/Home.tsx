import AccessoriesSection from "../../components/productsections/AccessoriesSection";
import BestSellerSection from "../../components/productsections/BestSellerSection";
import CategoryProductSection from "../../components/productsections/CategoryProductSection";
import Navbar from "../../components/common/Navbar";
import NewsSection from "../../components/news/NewsSection";

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
