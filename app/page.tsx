import Header from "./components/layout/Header";
import Hero from "./components/Hero";
import PromoBar from "./components/PromoBar";
import Categories from "./components/Categories";
import BestSeller from "./components/BestSeller";
import BrandSection from "./components/BrandSection";
import BuildPC from "./components/BuildPC";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <PromoBar />
      <Categories />
      <BestSeller />
      <BrandSection />
      <BuildPC />
      <Footer />
    </>
  );
}