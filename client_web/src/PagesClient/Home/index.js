import React from "react";
import useHomeData from "./hooks/useHomeData";
import { AccountCallout, BrandSection, CategorySection, FeaturedSection, HomeBenefits, HomeHero, HomeNews } from "./components/HomeSections";
import "./style.css";
import "./home-redesign.css";

export default function Home() {
  const { products, categories, brands, loading, error } = useHomeData();

  return (
    <main className="home-page">
      <HomeHero />
      <HomeBenefits />
      <CategorySection categories={categories} loading={loading} />
      <FeaturedSection products={products} loading={loading} error={error} />
      <BrandSection brands={brands} />
      <HomeNews />
      <AccountCallout />
    </main>
  );
}
