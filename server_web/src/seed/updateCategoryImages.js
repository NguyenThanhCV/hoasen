require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=85`;

// Curated category cover images, grouped by the closest visual subject.
const categoryImages = {
  mangnhakinh: "https://horden.ee/cdn/shop/products/kilekasvuhoone-1.jpg?v=1705615474",
  mangxoi: "https://vietnamese.stainlessmetalsteel.com/photo/pl141088801-greenhouse_galvanized_steel_rain_gutter_connected_commercial_2_0mm.jpg",
  batlothohdpe: "https://cpimg.tistatic.com/9543063/b/6/hdpe-climex-brand-500-micron-geomembrane-farm-pond-liner-sheet.jpeg",
  mangxoiliennep: "https://vietnamese.stainlessmetalsteel.com/photo/pl141088801-greenhouse_galvanized_steel_rain_gutter_connected_commercial_2_0mm.jpg",
  luoi: "https://www.nettarp.com/upload/6947/111-1839963.jpg",
  mangthuong: "https://vietnamese.stainlessmetalsteel.com/photo/pl141088801-greenhouse_galvanized_steel_rain_gutter_connected_commercial_2_0mm.jpg",
  luoichancontrung: "https://www.nettarp.com/upload/6947/111-1839963.jpg",
  luoicatnang: "https://www.nettarp.com/upload/6947/111-1839963.jpg",
  "mang-phu-luong": "https://image.made-in-china.com/2f0j00TceoHPRImGua/Hot-Sale-Silver-Black-Plastic-Mulching-Polyethylene-Plastic-Agricultural-Mulching-Film-Roll-Price.jpg",
  "khung-va-ket-cau-nha-kinh": "https://cdnus.globalso.com/minjiesteel/pre-galvanized-steel-pipe-hot-dipped-galvanized1.jpg",
  "phu-kien-nha-kinh": "https://hoz-agro.com/uploads/product/000/96/4a31b4ffa831f8d25ec91280e7ad6777_2023-10-19_13-14-26.jpeg",
  "he-thong-tuoi": "https://cdn.goodao.net/wiremeshsupplier/H08ee0771115044b78e5705fb18749ef2i.jpg",
  "khay-uom-va-vat-tu-vuon-uom": "https://www.greenhousemegastore.com/cdn/shop/files/BUMS105-135-100_1800x1800.jpg?v=1696441696",
  "gia-the-trong-cay": "https://i.ebayimg.com/00/s/MTYwMFgxNjAw/z/VwUAAOSw2NZiqWQW/%24_57.JPG?set_id=8800005007",
  "vat-tu-cham-soc-cay": photo("photo-1416879595882-3373a0480b5b"),
  "luoi-cat-nang": "https://www.nettarp.com/upload/6947/111-1839963.jpg",
  "ong-thep-ma-kem": "https://cdnus.globalso.com/minjiesteel/pre-galvanized-steel-pipe-hot-dipped-galvanized1.jpg",
  "phu-kien-mang-xoi": "https://vietnamese.stainlessmetalsteel.com/photo/pl141088801-greenhouse_galvanized_steel_rain_gutter_connected_commercial_2_0mm.jpg",
  "ong-tuoi-pe": "https://chodansinh.net/assets/upload/chodansinh/res/product/45752/pe-plastic-pipe-BqcVkiGbgw.jpg",
  "day-tuoi-nho-giot": "https://cdn.goodao.net/wiremeshsupplier/H08ee0771115044b78e5705fb18749ef2i.jpg",
  "bec-tuoi": "https://5.imimg.com/data5/SELLER/Default/2023/9/341853001/ZI/EB/BT/8020987/mini-compact-micro-sprinkler-1000x1000.jpg",
  "bo-loc-nuoc-tuoi": "https://www.nuleaf.com.au/cdn/shop/products/Amiadsuperdiscfilter130um0_2_700x700.png?v=1639456044",
  "van-va-phu-kien-tuoi": "https://www.evergreen-irrigation.co.uk/cdn/shop/files/16mm_Barbed_Inline_Manual_Valve.png?v=1730127074&width=1024",
};

async function run() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to update category images in production.");
  }
  await connectDB();
  const slugs = Object.keys(categoryImages);
  const categories = await Category.find({ slug: { $in: slugs } }).select("slug name image").lean();
  const found = new Set(categories.map((category) => category.slug));
  const missing = slugs.filter((slug) => !found.has(slug));
  if (missing.length) {
    throw new Error(`No category records found for: ${missing.join(", ")}. Database was left unchanged.`);
  }

  const result = await Category.bulkWrite(slugs.map((slug) => ({
    updateOne: { filter: { slug }, update: { $set: { image: categoryImages[slug] } } },
  })));
  const verified = await Category.countDocuments({ slug: { $in: slugs }, image: { $regex: /^https:\/\// } });
  if (verified !== slugs.length) throw new Error(`Image verification failed: ${verified}/${slugs.length} categories updated.`);
  console.log(JSON.stringify({ database: mongoose.connection.name, matched: result.matchedCount, updated: result.modifiedCount, verified }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
