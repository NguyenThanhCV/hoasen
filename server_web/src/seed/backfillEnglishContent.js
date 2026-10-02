require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const NewsArticle = require("../models/NewsArticle");
const NewsCategory = require("../models/NewsCategory");
const Coupon = require("../models/Coupon");
const Banner = require("../models/Banner");

const categoryEnglish = {
  "Màng nhà kính": ["Greenhouse Film", "Greenhouse covering film that helps retain heat and optimize light for crops."],
  "Máng xối": ["Greenhouse Gutters", "Water collection gutters and installation accessories for greenhouse structures."],
  "Bạt lót hồ HDPE": ["HDPE Pond Liners", "Waterproof liners for reservoirs and agricultural projects."],
  "Lưới": ["Nets", "Shade nets, insect screens, and protective netting for crops."],
  "Lưới cắt nắng": ["Shade Nets", "Shade nets that reduce sunlight according to the coverage level you need."],
  "Lưới chắn côn trùng": ["Insect Screens", "Fine mesh netting that protects growing areas from insects."],
  "Màng phủ luống": ["Crop Mulch Film", "Mulch film that retains moisture and suppresses weeds in crop beds."],
  "Khung và kết cấu nhà kính": ["Greenhouse Frames and Structures", "Steel pipes and materials for greenhouse and polytunnel frames."],
  "Ống thép mạ kẽm": ["Galvanized Steel Pipes", "Steel pipes for arched greenhouse frames and structural supports."],
  "Phụ kiện nhà kính": ["Greenhouse Accessories", "Profiles, springs, clips, and straps for greenhouse installations."],
  "Phụ kiện máng xối": ["Gutter Accessories", "Accessories and drainage gutters for greenhouse roofs."],
  "Hệ thống tưới": ["Irrigation Systems", "Water-efficient irrigation equipment for gardens and greenhouses."],
  "Ống tưới PE": ["PE Irrigation Pipes", "PE pipes that carry water through main and branch irrigation lines."],
  "Dây tưới nhỏ giọt": ["Drip Irrigation Lines", "Drip lines that deliver water evenly to crop roots."],
  "Béc tưới": ["Sprinklers and Misters", "Sprinklers and misting nozzles for gardens of different sizes."],
  "Bộ lọc nước tưới": ["Irrigation Water Filters", "Filters that protect irrigation pipes and emitters from debris."],
  "Van và phụ kiện tưới": ["Irrigation Valves and Accessories", "Shut-off valves, pipe connectors, and irrigation installation accessories."],
  "Khay ươm và vật tư vườn ươm": ["Seedling Trays and Nursery Supplies", "Seed trays and tools for caring for young plants."],
  "Giá thể trồng cây": ["Growing Media", "Growing media and supplies that support healthy root establishment."],
  "Vật tư chăm sóc cây": ["Plant Care Supplies", "Trellising and support supplies for crop care."],
  "Máng xối liền nẹp": ["Greenhouse Gutter with Integrated Profile", "A gutter and fixing profile combined for greenhouse roof drainage."],
  "Máng thường": ["Standard Greenhouse Gutters", "Standard gutters for collecting and directing rainwater from greenhouse roofs."],
  "lưới cắt nắng": ["Shade Nets", "Shade netting for reducing sunlight over crops and growing areas."],
};

const productTerms = [
  [/Màng nhà kính/g, "Greenhouse film"], [/Màng phủ luống/g, "Crop mulch film"],
  [/nông nghiệp/g, "agricultural"], [/màu bạc đen/g, "silver-black"],
  [/chống đọng sương/g, "anti-drip"], [/khuếch tán ánh sáng/g, "light-diffusing"],
  [/Lưới cắt nắng/g, "Shade net"], [/Lưới chắn côn trùng/g, "Insect screen"],
  [/Ống thép mạ kẽm/g, "Galvanized steel pipe"], [/làm khung vòm/g, "for arched greenhouse frames"],
  [/chịu lực/g, "heavy-duty"], [/Nẹp Z/g, "Z-profile"], [/Lò xo ziczac/g, "Wiggle wire"],
  [/Kẹp màng nhà kính/g, "Greenhouse film clip"], [/Dây chằng nhà kính/g, "Greenhouse tie-down strap"],
  [/Máng xối nhà kính/g, "Greenhouse gutter"], [/Bạt HDPE lót hồ/g, "HDPE pond liner"],
  [/Bộ tưới nhỏ giọt/g, "Drip irrigation kit"], [/Dây tưới nhỏ giọt/g, "Drip irrigation line"],
  [/Ống PE tưới/g, "PE irrigation pipe"], [/Béc tưới phun mưa/g, "Sprinkler"],
  [/Béc phun sương/g, "Misting nozzle"], [/Bộ lọc đĩa/g, "Disc filter"],
  [/Van khóa PVC/g, "PVC shut-off valve"], [/Khay ươm cây/g, "Seedling tray"],
  [/Giá thể xơ dừa/g, "Coco coir growing medium"], [/Lưới đỡ cây trồng/g, "Crop support net"],
  [/khổ/g, "width"], [/dày/g, "thick"], [/phi\s*/g, "Ø"], [/micron/g, "micron"], [/máng liền nẹp/g, "integrated gutter profile"],
];
const productNamesEnglish = {
  "Màng nhà kính PE 150 micron khổ 4m": "150 Micron PE Greenhouse Film, 4 m Wide",
  "Màng nhà kính PE 200 micron khổ 6m": "200 Micron PE Greenhouse Film, 6 m Wide",
  "Màng nhà kính EVA khuếch tán ánh sáng": "EVA Greenhouse Film with Diffused Light",
  "Màng nhà kính chống đọng sương": "Anti-Drip Greenhouse Film",
  "Màng phủ luống nông nghiệp màu bạc đen": "Silver-Black Agricultural Mulch Film",
  "Lưới cắt nắng 50% khổ 2m": "50% Shade Net, 2 m Wide",
  "Lưới cắt nắng 70% khổ 3m": "70% Shade Net, 3 m Wide",
  "Lưới cắt nắng 80% khổ 4m": "80% Shade Net, 4 m Wide",
  "Lưới chắn côn trùng 32 mesh": "32-Mesh Insect Screen",
  "Lưới chắn côn trùng 50 mesh": "50-Mesh Insect Screen",
  "Ống thép mạ kẽm phi 34 làm khung vòm": "34 mm Galvanized Steel Pipe for Arched Frames",
  "Ống thép mạ kẽm phi 42 chịu lực": "42 mm Heavy-Duty Galvanized Steel Pipe",
  "Ống thép mạ kẽm phi 27": "27 mm Galvanized Steel Pipe",
  "Nẹp Z cố định màng nhà kính": "Z-Profile for Greenhouse Film",
  "Lò xo ziczac giữ màng nhà kính": "Wiggle Wire for Securing Greenhouse Film",
  "Kẹp màng nhà kính chống tuột": "Anti-Slip Greenhouse Film Clips",
  "Dây chằng nhà kính chịu UV": "UV-Resistant Greenhouse Tie-Down Strap",
  "Máng xối nhà kính tôn mạ kẽm": "Galvanized Steel Greenhouse Gutter",
  "Máng xối liền nẹp thoát nước": "Greenhouse Gutter with Integrated Drainage Profile",
  "Bạt HDPE lót hồ dày 0.5mm": "0.5 mm HDPE Pond Liner",
  "Bạt HDPE lót hồ dày 1.0mm": "1.0 mm HDPE Pond Liner",
  "Ống PE tưới phi 16": "16 mm PE Irrigation Pipe",
  "Ống PE tưới phi 20": "20 mm PE Irrigation Pipe",
  "Dây tưới nhỏ giọt 16mm khoảng cách 20cm": "16 mm Drip Irrigation Line, 20 cm Emitter Spacing",
  "Dây tưới nhỏ giọt bù áp 16mm": "16 mm Pressure-Compensating Drip Line",
  "Béc tưới phun mưa 360 độ": "360-Degree Sprinkler",
  "Béc phun sương làm mát nhà kính": "Misting Nozzle for Greenhouse Cooling",
  "Bộ lọc đĩa 1 inch cho hệ thống tưới": "1-Inch Disc Filter for Irrigation Systems",
  "Van khóa PVC 21mm": "21 mm PVC Shut-Off Valve",
  "Khay ươm cây ươm": "Seedling Propagation Tray",
  "Giá thể xơ dừa đã xử lý": "Treated Coco Coir Growing Medium",
  "Lưới đỡ cây trồng khổ 2m": "Crop Support Net, 2 m Wide",
};
const specificationEnglish = {
  "4m × 100m": "4 m × 100 m", "6m × 100m": "6 m × 100 m", "7m × 100m": "7 m × 100 m", "8m × 100m": "8 m × 100 m",
  "1.2m × 400m": "1.2 m × 400 m", "2m × 50m": "2 m × 50 m", "3m × 50m": "3 m × 50 m", "4m × 50m": "4 m × 50 m",
  "2.5m × 50m": "2.5 m × 50 m", "Dài 6m": "6 m long", "Thanh 2m": "2 m bar", "Cái": "piece",
  "Cuộn 200m": "200 m roll", "Thanh 3m": "3 m bar", "m²": "square metre", "Cuộn 500m": "500 m roll",
  "Cuộn 400m": "400 m roll", "Béc": "nozzle", "Bộ": "set", "Khay nhựa ươm cây": "plastic seedling tray", "Bao 10kg": "10 kg bag", "Cuộn 50m": "50 m roll",
};
const articleTitles = {
  "Chọn màng nhà kính theo cây trồng và điều kiện vườn": "Choosing Greenhouse Film for Your Crops and Growing Conditions",
  "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?": "50%, 70%, or 80% Shade Net: How to Choose",
  "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ": "Set Up Drip Irrigation to Deliver Water to the Root Zone",
  "Vì sao nên lắp bộ lọc trước đường ống tưới?": "Why Install a Filter Before Your Irrigation Lines?",
  "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công": "Measure Netting and Film to Reduce Installation Waste",
  "Kiểm tra nhà kính trước mùa mưa gió": "Inspect Your Greenhouse Before the Rainy and Windy Season",
  "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính": "What to Prepare When Asking About Greenhouse Supplies",
  "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng": "HDPE Pond Liners: Preparing the Site",
  "Chọn ống và béc tưới cho nhà kính quy mô nhỏ": "Choosing Pipes and Sprinklers for a Small Greenhouse",
  "Bảo trì khung nhà kính trước mùa mưa gió": "Maintain Your Greenhouse Frame Before the Rainy and Windy Season",
};
const articleEnglishContent = {
  "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?": ["Choose a shade level that suits your crop, season, and installation location instead of relying on one fixed percentage.", "The shade percentage indicates how much sunlight is reduced as it passes through the net. Sun-loving crops and seedlings have different needs, so start with the crop and season.\n\nNetting can be installed permanently over a roof or used as an adjustable screen. The installation method affects ventilation and how easily light can be adjusted during the day.\n\nBefore ordering, check the net width, yarn durability, edge reinforcement, and wind conditions at your site."],
  "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ": ["A reliable irrigation system starts with a growing-area plan, a clean water source, and suitable pipe sizes.", "Divide the growing area into irrigation zones based on crop type and water needs. A clear plan helps estimate pipe lengths, emitter quantities, and required flow rates.\n\nA suitable filter helps keep debris out of drip lines. Place valves where they are easy to reach so each zone can be shut off and checked.\n\nAfter installation, test each line and observe whether water is distributed evenly. Regularly inspect emitters and pipes to keep the system running reliably."],
  "Vì sao nên lắp bộ lọc trước đường ống tưới?": ["Filtering debris protects sprinklers and drip lines and reduces time spent clearing blockages.", "Water sources may contain sand, algae, or fine debris. As these particles build up in sprinklers and irrigation lines, flow can become uneven.\n\nChoose a filter based on the system's designed flow rate and water quality. Install it where it can be removed and cleaned easily, and check pressure differences if the system has a pressure gauge.\n\nCleaning the filter on a schedule suited to your water source helps maintain steady flow."],
  "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công": ["Measure the structure and allow for overlaps before ordering to save material and installation time.", "Measure the length, width, and roof along the frame's curve. The dimensions on a plan may differ from the actual surface that needs to be covered.\n\nAllow for overlaps, fixing profiles, and extra material at the edges before confirming quantities. For structures with multiple bays, record each section separately to avoid cutting errors.\n\nShare a sketch and measurements with your supplier so the material specifications can be checked before purchase."],
  "Kiểm tra nhà kính trước mùa mưa gió": ["Check the frame, fixing profiles, cover, and drainage early to identify areas that need reinforcement.", "Before the windy and rainy season, inspect frame connections, posts, and bracing. Replace loose or corroded parts before wind loads increase.\n\nCheck the film edges, fixing profiles, and springs for sagging, tears, or slippage. Clear the gutters and inspect drainage around the structure.\n\nKeeping a maintenance record after each inspection makes it easier to prepare the right supplies in advance."],
  "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính": ["Project dimensions, crop type, and current photos help the team recommend suitable specifications.", "For faster advice, prepare the structure's length, width, and height; the crop type; the installation location; and photos of the frame or material to be replaced.\n\nIf you have a drawing, include the distance between posts and the roof curvature. These details help match film, netting, and accessories to the actual project.\n\nHoa Sen Greenhouse Supplies can help check product specifications and delivery information for your project."],
  "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng": ["Prepare the base, anchoring edge, and pond dimensions in advance for a smooth installation and less risk of damage.", "Before laying the liner, remove sharp objects, branches, and large stones from the base. A level surface helps prevent concentrated stress points.\n\nInclude the anchoring edge and pond depth when calculating liner size. Avoid dragging the liner across rough ground; use a handling method suited to the sheet size.\n\nChoose liner thickness and an installation method based on the intended use, ground conditions, and pond design."],
};
const articleCategoryEnglish = {
  "Kỹ thuật nhà kính": "Greenhouse Engineering", "Tưới và chăm sóc cây": "Irrigation and Plant Care",
  "Chọn vật tư": "Choosing Supplies", "Kinh nghiệm nhà vườn": "Grower Tips", "Tin tức Hoa Sen": "Hoa Sen News",
};
const articleTagEnglish = {
  "màng nhà kính": "greenhouse film", "nhà kính": "greenhouse", "lưới cắt nắng": "shade net", "ánh sáng": "light",
  "tưới nhỏ giọt": "drip irrigation", "tiết kiệm nước": "water conservation", "lọc nước": "water filtration",
  "hệ thống tưới": "irrigation system", "thi công": "installation", "đo đạc": "measurements", "bảo trì": "maintenance",
  "tư vấn": "advice", "Hoa Sen": "Hoa Sen", "bạt HDPE": "HDPE liner", "hồ chứa": "reservoir",
};
const couponEnglish = {
  "HS-SAMPLE-10": "New Customer Offer", "HS-SAMPLE-15": "Save on Supply Orders",
  "HS-SAMPLE-20": "Greenhouse Supplies Offer", "HS-SAMPLE-50K": "Save VND 50,000",
  "HS-SAMPLE-100K": "Save VND 100,000", "HS-SAMPLE-200K": "Save VND 200,000",
  "HS-SAMPLE-IRRIGATION": "Irrigation Equipment Offer", "HS-SAMPLE-GREENHOUSE": "Greenhouse Supplies Offer",
  "HS-SAMPLE-GARDEN": "Grower Offer", "HS-SAMPLE-SEASON": "New Growing Season Offer",
  SALE25USER: "New User Sale",
};
const otherBrandEnglish = {
  politiv: ["POLITIV", "Greenhouse film and agricultural materials from the POLITIV brand."],
  thaiphuonghoang: ["Thai Phoenix", "Insect screen and netting products for crop protection."],
};

const bannerEnglish = {
  home: ["Greenhouse Solutions for Modern Farming", "From frames and greenhouse film to installation accessories, choose suitable supplies for a productive growing season.", "Explore products"],
  cart: ["Review Your Cart", "Check selected variants, quantities, and stock before continuing to checkout.", "Continue shopping"],
  checkout: ["Prepare Your Delivery Details", "Confirm your delivery address and payment method so we can process your order accurately.", "View help"],
  orders: ["Track Your Orders", "Check order status and review the details of your purchases.", "Shop more"],
  "order-detail": ["Need Help with Your Order?", "Contact Hoa Sen if you need assistance with delivery or product details.", "Contact support"],
  wishlist: ["Save Products You Like", "Come back anytime to review specifications and availability for your favorite products.", "Explore products"],
  notifications: ["Stay Updated on Your Orders", "Follow order updates and important account activity.", "View orders"],
  addresses: ["Manage Delivery Addresses", "Save your delivery details to complete future orders more quickly and accurately.", "View products"],
  account: ["Manage Your Hoa Sen Account", "Update your profile and addresses, and keep track of your shopping activity.", "Explore products"],
  general: ["Solutions for Your Garden", "Explore practical products and get advice from the Hoa Sen team.", "View products"],
  products: ["Find Supplies for Your Project", "Browse greenhouse materials and growing supplies by category, brand, and specification.", "Browse categories"],
  "product-detail": ["Need Advice for Your Garden?", "Share your measurements and requirements so our team can recommend a suitable option.", "Contact Hoa Sen"],
  categories: ["Explore Greenhouse and Growing Supplies", "Find products for greenhouse structures, irrigation systems, and crop care.", "View products"],
  brands: ["Trusted Brands for Your Garden", "Explore brands and products suited to your growing conditions.", "Shop now"],
  news: ["Useful Knowledge for Every Growing Season", "Read practical advice on supplies, irrigation, and crop care.", "Read the latest"],
  "news-detail": ["Find the Right Solution for Your Garden", "Explore related products and get advice from the Hoa Sen team.", "View products"],
  about: ["Supporting Modern Growers", "Greenhouse supplies and growing solutions recommended for your needs.", "Explore products"],
  contact: ["Talk with a Hoa Sen Specialist", "Share your project details for advice on suitable supplies and specifications.", "View products"],
  faq: ["Shopping Help and Answers", "Learn how to choose products, place orders, and manage your account.", "Contact support"],
  privacy: ["Your Information and Privacy", "Learn how account, address, and order information is used on this store.", "Contact us"],
  terms: ["Clear Shopping Terms", "Review how products, orders, payment, and delivery work on this website.", "View products"],
};

const missing = (field) => ({
  $or: [
    { [field]: { $in: [null, ""] } },
    { $expr: { $eq: [{ $ifNull: [`$${field}`, []] }, []] } },
  ],
});
async function fill(Model, selector, fields) {
  let modified = 0;
  for (const [field, value] of Object.entries(fields)) {
    const result = await Model.updateMany({ ...selector, ...missing(field) }, { $set: { [field]: value } });
    modified += result.modifiedCount || 0;
  }
  return modified;
}

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to modify a production database.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  const expectedDatabase = process.env.ENGLISH_BACKFILL_DATABASE;
  if (!expectedDatabase) throw new Error("Set ENGLISH_BACKFILL_DATABASE to the exact target database name.");
  await connectDB();
  if (mongoose.connection.name !== expectedDatabase) throw new Error(`Connected to ${mongoose.connection.name}; expected ${expectedDatabase}.`);

  const modified = {};
  for (const [name, [nameEn, descriptionEn]] of Object.entries(categoryEnglish)) {
    modified.categories = (modified.categories || 0) + await fill(Category, { name }, { nameEn, descriptionEn });
  }
  modified.brands = await fill(Brand, { slug: "hoa-sen" }, {
    nameEn: "Hoa Sen",
    descriptionEn: "Greenhouse and agricultural supplies selected and distributed by Hoa Sen.",
  });
  for (const [slug, [nameEn, descriptionEn]] of Object.entries(otherBrandEnglish)) {
    modified.brands = (modified.brands || 0) + await fill(Brand, { slug }, { nameEn, descriptionEn });
  }

  const products = await Product.find({}).select("_id name description shortDescription attributes attributeTranslations").lean();
  for (const product of products) {
    let nameEn = productNamesEnglish[product.name] || product.name;
    if (!productNamesEnglish[product.name]) for (const [pattern, replacement] of productTerms) nameEn = nameEn.replace(pattern, replacement);
    if (nameEn === product.name && !/^[a-z0-9\s._-]+$/i.test(product.name)) continue;
    const attrs = product.attributes instanceof Map ? Object.fromEntries(product.attributes) : product.attributes || {};
    const specs = Object.entries(attrs).flatMap(([key, values]) => {
      const keyEn = ({ "Quy cách": "Specification", "Kích thước": "Dimensions", "Chất liệu": "Material", "Màu sắc": "Color", "Độ dày": "Thickness" })[key] || key;
      return (Array.isArray(values) ? values : [values]).map((value) => {
        const valueEn = specificationEnglish[value] || String(value).replace(/(\d+(?:\.\d+)?)\s*m(?=\s*[×x])/g, "$1 m").replace(/phi\s*/gi, "Ø");
        return `${keyEn}: ${valueEn}`;
      });
    });
    const specificDetail = specs.length ? ` Available specification: ${specs.join(", ")}.` : " Check the available dimensions, material, and application before ordering.";
    const descriptionEn = `${nameEn} is designed for greenhouse, irrigation, or crop-care applications. Review the product specifications and confirm current price and stock with Hoa Sen before ordering.${specificDetail} Contact our team if you need help matching it to your project.`;
    const shortDescriptionEn = `${nameEn}.${specificDetail} Confirm availability and price before ordering.`;
    const attributeTranslations = Object.entries(attrs).map(([key, values]) => ({
      name: key,
      nameEn: ({ "Quy cách": "Specification", "Kích thước": "Dimensions", "Chất liệu": "Material", "Màu sắc": "Color", "Độ dày": "Thickness" })[key] || key,
      values: (Array.isArray(values) ? values : [values]).map((value) => ({ value: String(value), valueEn: specificationEnglish[value] || String(value).replace(/(\d+(?:\.\d+)?)\s*m(?=\s*[×x])/g, "$1 m").replace(/phi\s*/gi, "Ø") })),
    }));
    const result = await Product.updateOne({ _id: product._id }, { $set: {
      nameEn: nameEn === product.name ? product.name.toUpperCase() : nameEn,
      shortDescriptionEn,
      descriptionEn,
      attributeTranslations,
    } });
    modified.products = (modified.products || 0) + (result.modifiedCount || 0);
  }

  const newsCategories = await NewsCategory.find({ $or: [{ nameEn: { $exists: false } }, { nameEn: null }, { nameEn: "" }] }).select("_id name").lean();
  for (const item of newsCategories) {
    const nameEn = articleCategoryEnglish[item.name];
    if (!nameEn) continue;
    modified.newsCategories = (modified.newsCategories || 0) + await fill(NewsCategory, { _id: item._id }, {
      nameEn, descriptionEn: "Practical information and guidance for greenhouse growers.",
    });
  }

  const articles = await NewsArticle.find({ title: { $in: Object.keys(articleTitles) } }).select("_id title tags").lean();
  for (const article of articles) {
    const titleEn = articleTitles[article.title];
    if (!titleEn) continue;
    const [excerptEn, contentEn] = articleEnglishContent[article.title] || [
      "Practical guidance to help growers choose supplies and plan greenhouse work with confidence.",
      "Start by reviewing your crop, site conditions, and project measurements. Check the required material specifications and installation method before purchasing. For help choosing a suitable option, share your project details with Hoa Sen.",
    ];
    modified.newsArticles = (modified.newsArticles || 0) + await fill(NewsArticle, { _id: article._id }, {
      titleEn,
      excerptEn,
      contentEn,
      tagsEn: (article.tags || []).map((tag) => articleTagEnglish[tag] || tag),
    });
    const generic = "Practical guidance to help growers choose supplies and plan greenhouse work with confidence.";
    if (articleEnglishContent[article.title]) {
      const [specificExcerpt, specificContent] = articleEnglishContent[article.title];
      const result = await NewsArticle.updateOne(
        { _id: article._id, excerptEn: generic },
        { $set: { excerptEn: specificExcerpt, contentEn: specificContent } },
      );
      modified.newsArticles = (modified.newsArticles || 0) + (result.modifiedCount || 0);
    }
  }
  for (const [code, nameEn] of Object.entries(couponEnglish)) {
    modified.coupons = (modified.coupons || 0) + await fill(Coupon, { code }, { nameEn });
  }
  for (const [pageKey, [titleEn, descriptionEn, buttonTextEn]] of Object.entries(bannerEnglish)) {
    modified.banners = (modified.banners || 0) + await fill(Banner, { pageKey }, {
      titleEn, descriptionEn, buttonTextEn,
      nameEn: `${titleEn} | Hoa Sen`,
      eyebrowEn: "HOA SEN GREENHOUSE SUPPLIES",
      altTextEn: titleEn,
    });
  }
  console.log(JSON.stringify({ database: mongoose.connection.name, modified }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
