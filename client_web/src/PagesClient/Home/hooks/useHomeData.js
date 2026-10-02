import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProductsService } from "../../../api/apiProduct";
import { getVariantsService } from "../../../api/apiVariant";
import { getCategoriesService } from "../../../api/apiCategory";
import { getBrandsService } from "../../../api/apiBrand";

const rowsOf = (response) => Array.isArray(response?.data?.data) ? response.data.data : [];

export default function useHomeData() {
  const { t } = useTranslation();
  const [data, setData] = useState({ products: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadHome() {
      setLoading(true);
      const [featuredResult, categoryResult, brandResult] = await Promise.allSettled([
        getProductsService({ page: 1, limit: 8, status: "active", featured: true }),
        getCategoriesService({ page: 1, limit: 8, status: "active" }),
        getBrandsService({ page: 1, limit: 8, status: "active" }),
      ]);
      try {
        let products = featuredResult.status === "fulfilled" ? rowsOf(featuredResult.value) : [];
        if (!products.length) products = rowsOf(await getProductsService({ page: 1, limit: 8, status: "active" }));
        products = await Promise.all(products.map(async (product) => {
          try {
            const variants = rowsOf(await getVariantsService({ product: product._id, page: 1, limit: 100 }));
            const prices = variants.filter((variant) => variant.active !== false).map((variant) => Number(variant.price)).filter(Number.isFinite);
            return { ...product, minPrice: prices.length ? Math.min(...prices) : null, maxPrice: prices.length ? Math.max(...prices) : null };
          } catch (_) {
            return { ...product, minPrice: null, maxPrice: null };
          }
        }));
        if (!mounted) return;
        setData({
          products,
          categories: categoryResult.status === "fulfilled" ? rowsOf(categoryResult.value) : [],
          brands: brandResult.status === "fulfilled" ? rowsOf(brandResult.value) : [],
        });
        if (featuredResult.status === "rejected" && !products.length) setError(t("StoreLoadError"));
      } catch (_) {
        if (mounted) setError(t("ProductsLoadError"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadHome();
    return () => { mounted = false; };
  }, [t]);

  return { ...data, loading, error };
}


