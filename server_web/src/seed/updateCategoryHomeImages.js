require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

// Distinct greenhouses, crops, gardens, and plants. Cycle after 13 so every
// category image differs from its neighbors while the six homepage cards are
// all unique.
const photos = [
  "photo-1416879595882-3373a0480b5b",
  "photo-1464226184884-fa280b87c399",
  "photo-1466692476868-aef1dfb1e735",
  "photo-1497250681960-ef046c08a56e",
  "photo-1499529112087-3cb3b73cec95",
  "photo-1500382017468-9049fed747ef",
  "photo-1530836369250-ef72a3f5cda8",
  "photo-1585320806297-9794b3e4eeae",
  "photo-1592982537447-7440770cbfc9",
  "photo-1437482078695-73f5ca6c96e2",
  "photo-1501004318641-b39e6451bec6",
  "photo-1500651230702-0e2d8a49d4ad",
  "photo-1518531933037-91b2f5f229cc",
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  await mongoose.connect(process.env.MONGODB_URI);
  // The storefront requests newest categories first, so assign in that same
  // order to guarantee each category visible on the homepage has its own photo.
  const categories = await Category.find({}, { name: 1 }).sort({ createdAt: -1 }).lean();
  let updated = 0;
  for (const [index, category] of categories.entries()) {
    const image = `https://images.unsplash.com/${photos[index % photos.length]}?auto=format&fit=crop&w=1200&h=675&q=85`;
    await Category.updateOne({ _id: category._id }, { $set: { homeImage: image } });
    updated += 1;
  }
  console.log(`Updated homepage images for ${updated} categories (${categories.length} total).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
