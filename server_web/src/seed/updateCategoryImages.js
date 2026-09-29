require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");

const photo = (id) => `${process.env.ASSET_BASE_URL || ""}/${id}?auto=format&fit=crop&w=960&q=85`;
const asset = (key) => process.env[`CATEGORY_IMAGE_${key.toUpperCase().replace(/-/g, "_")}`];

// Curated category cover images, grouped by the closest visual subject.
const categoryImages = {
  mangnhakinh: asset("mangnhakinh"),
  mangxoi: asset("mangxoi"),
  batlothohdpe: asset("batlothohdpe"),
  mangxoiliennep: asset("mangxoiliennep"),
  luoi: asset("luoi"),
  mangthuong: asset("mangthuong"),
  luoichancontrung: asset("luoichancontrung"),
  luoicatnang: asset("luoicatnang"),
  "mang-phu-luong": asset("mang-phu-luong"),
  "khung-va-ket-cau-nha-kinh": asset("khung-va-ket-cau-nha-kinh"),
  "phu-kien-nha-kinh": asset("phu-kien-nha-kinh"),
  "he-thong-tuoi": asset("he-thong-tuoi"),
  "khay-uom-va-vat-tu-vuon-uom": asset("khay-uom-va-vat-tu-vuon-uom"),
  "gia-the-trong-cay": asset("gia-the-trong-cay"),
  "vat-tu-cham-soc-cay": photo("photo-1416879595882-3373a0480b5b"),
  "luoi-cat-nang": asset("luoi-cat-nang"),
  "ong-thep-ma-kem": asset("ong-thep-ma-kem"),
  "phu-kien-mang-xoi": asset("phu-kien-mang-xoi"),
  "ong-tuoi-pe": asset("ong-tuoi-pe"),
  "day-tuoi-nho-giot": asset("day-tuoi-nho-giot"),
  "bec-tuoi": asset("bec-tuoi"),
  "bo-loc-nuoc-tuoi": asset("bo-loc-nuoc-tuoi"),
  "van-va-phu-kien-tuoi": asset("van-va-phu-kien-tuoi"),
};

async function run() {
  const missingImages = Object.entries(categoryImages).filter(([, image]) => !image);
  if (missingImages.length)
    throw new Error(`Missing category image environment variables: ${missingImages.map(([slug]) => slug).join(", ")}`);
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
