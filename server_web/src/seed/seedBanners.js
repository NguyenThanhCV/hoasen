require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Banner = require("../models/Banner");

const image = (photo) => `${process.env.ASSET_BASE_URL || ""}/${photo}?auto=format&fit=crop&w=1800&q=85`;
const rows = [
  { pageKey: "home", name: "Trang chủ · Giải pháp nhà kính", eyebrow: "VẬT TƯ NHÀ KÍNH HOA SEN", title: "Giải pháp vật tư cho nhà kính hiện đại", description: "Từ khung, màng phủ đến phụ kiện thi công – chọn đúng vật tư cho mùa vụ bền vững.", buttonText: "Khám phá sản phẩm", buttonLink: "/products", imageUrl: image("photo-1585320806297-9794b3e4eeae"), sortOrder: 1 },
  { pageKey: "home", name: "Trang chủ · Nhà kính", eyebrow: "THI CÔNG ĐỒNG BỘ", title: "Không gian trồng trọt chủ động quanh năm", description: "Khám phá vật tư giúp bảo vệ cây trồng trước nắng, mưa và côn trùng.", buttonText: "Xem danh mục", buttonLink: "/categories", imageUrl: image("photo-1530836369250-ef72a3f5cda8"), sortOrder: 2 },
  { pageKey: "home", name: "Trang chủ · Tưới thông minh", eyebrow: "TỐI ƯU TỪNG GIỌT NƯỚC", title: "Hệ thống tưới phù hợp với khu vườn", description: "Ống dẫn, béc tưới, bộ lọc và phụ kiện được chọn theo nhu cầu canh tác.", buttonText: "Xem thiết bị tưới", buttonLink: "/products", imageUrl: image("photo-1592982537447-7440770cbfc9"), sortOrder: 3 },
  { pageKey: "home", name: "Trang chủ · Đồng hành nhà vườn", eyebrow: "TƯ VẤN TẬN TÂM", title: "Cùng nhà vườn chuẩn bị mùa vụ mới", description: "Chia sẻ nhu cầu và quy mô vườn để nhận gợi ý vật tư phù hợp.", buttonText: "Liên hệ tư vấn", buttonLink: "/contact", imageUrl: image("photo-1464226184884-fa280b87c399"), sortOrder: 4 },
  { pageKey: "products", name: "Sản phẩm · Danh mục vật tư", eyebrow: "DANH MỤC VẬT TƯ", title: "Tìm vật tư phù hợp cho công trình", description: "Lọc theo nhóm sản phẩm, thương hiệu và quy cách bạn cần.", buttonText: "Xem danh mục", buttonLink: "/categories", imageUrl: image("photo-1500382017468-9049fed747ef"), sortOrder: 1 },
  { pageKey: "product-detail", name: "Chi tiết sản phẩm · Tư vấn quy cách", eyebrow: "CHỌN ĐÚNG QUY CÁCH", title: "Cần tư vấn sản phẩm cho khu vườn?", description: "Gửi kích thước và nhu cầu sử dụng để được hỗ trợ chọn phiên bản phù hợp.", buttonText: "Liên hệ Hoa Sen", buttonLink: "/contact", imageUrl: image("photo-1416879595882-3373a0480b5b"), sortOrder: 1 },
  { pageKey: "categories", name: "Danh mục · Khám phá vật tư", eyebrow: "TỔ CHỨC DỄ TÌM", title: "Khám phá đầy đủ nhóm vật tư", description: "Các nhóm sản phẩm cho nhà kính, hệ thống tưới và chăm sóc cây trồng.", buttonText: "Xem sản phẩm", buttonLink: "/products", imageUrl: image("photo-1499529112087-3cb3b73cec95"), sortOrder: 1 },
  { pageKey: "brands", name: "Thương hiệu · Đối tác", eyebrow: "THƯƠNG HIỆU ĐỒNG HÀNH", title: "Lựa chọn từ những thương hiệu uy tín", description: "Tìm hiểu thương hiệu và sản phẩm phù hợp với điều kiện sử dụng.", buttonText: "Mua sắm ngay", buttonLink: "/products", imageUrl: image("photo-1466692476868-aef1dfb1e735"), sortOrder: 1 },
  { pageKey: "news", name: "Tin tức · Góc nhà vườn", eyebrow: "GÓC NHÀ VƯỜN HOA SEN", title: "Kiến thức tốt, mùa vụ bền lâu", description: "Kinh nghiệm chọn vật tư, tưới tiêu và chăm sóc cây trồng.", buttonText: "Đọc tin mới", buttonLink: "/news", imageUrl: image("photo-1500382017468-9049fed747ef"), sortOrder: 1 },
  { pageKey: "news-detail", name: "Tin tức · Bài viết", eyebrow: "KIẾN THỨC NHÀ VƯỜN", title: "Cùng tìm giải pháp phù hợp cho khu vườn", description: "Tham khảo thêm sản phẩm và nhận tư vấn từ đội ngũ Hoa Sen.", buttonText: "Xem sản phẩm", buttonLink: "/products", imageUrl: image("photo-1416879595882-3373a0480b5b"), sortOrder: 1 },
  { pageKey: "about", name: "Giới thiệu · Hoa Sen", eyebrow: "VẬT TƯ NHÀ KÍNH HOA SEN", title: "Đồng hành cùng nhà vườn hiện đại", description: "Vật tư nhà kính và giải pháp canh tác được tư vấn theo nhu cầu thực tế.", buttonText: "Tìm hiểu sản phẩm", buttonLink: "/products", imageUrl: image("photo-1464226184884-fa280b87c399"), sortOrder: 1 },
  { pageKey: "contact", name: "Liên hệ · Tư vấn", eyebrow: "CHÚNG TÔI LUÔN SẴN SÀNG", title: "Trao đổi cùng chuyên viên Hoa Sen", description: "Chia sẻ thông tin công trình để được tư vấn vật tư và quy cách phù hợp.", buttonText: "Xem sản phẩm", buttonLink: "/products", imageUrl: image("photo-1499529112087-3cb3b73cec95"), sortOrder: 1 },
  { pageKey: "faq", name: "FAQ · Hỗ trợ mua hàng", eyebrow: "HỖ TRỢ MUA SẮM", title: "Thông tin cần biết trước khi đặt hàng", description: "Tìm hiểu cách chọn phiên bản, đặt hàng, giao nhận và quản lý tài khoản.", buttonText: "Liên hệ hỗ trợ", buttonLink: "/contact", imageUrl: image("photo-1530836369250-ef72a3f5cda8"), sortOrder: 1 },
  { pageKey: "privacy", name: "Quyền riêng tư", eyebrow: "THÔNG TIN KHÁCH HÀNG", title: "Mua sắm an tâm, thông tin minh bạch", description: "Tìm hiểu cách website sử dụng thông tin tài khoản và đơn hàng.", buttonText: "Xem chính sách", buttonLink: "/terms", imageUrl: image("photo-1466692476868-aef1dfb1e735"), sortOrder: 1 },
  { pageKey: "terms", name: "Điều khoản", eyebrow: "ĐIỀU KHOẢN SỬ DỤNG", title: "Thông tin rõ ràng cho mỗi đơn hàng", description: "Tham khảo quy định về sản phẩm, thanh toán và giao hàng.", buttonText: "Liên hệ tư vấn", buttonLink: "/contact", imageUrl: image("photo-1500382017468-9049fed747ef"), sortOrder: 1 },
  { pageKey: "cart", name: "Giỏ hàng · Hoàn tất lựa chọn", eyebrow: "GIỎ HÀNG CỦA BẠN", title: "Kiểm tra sản phẩm trước khi đặt hàng", description: "Xác nhận phiên bản, số lượng và tồn kho trước khi tiếp tục.", buttonText: "Tiếp tục mua sắm", buttonLink: "/products", imageUrl: image("photo-1592982537447-7440770cbfc9"), sortOrder: 1 },
  { pageKey: "checkout", name: "Thanh toán · Giao hàng", eyebrow: "HOÀN TẤT ĐƠN HÀNG", title: "Chuẩn bị thông tin nhận hàng", description: "Kiểm tra địa chỉ và phương thức thanh toán để cửa hàng xử lý đơn chính xác.", buttonText: "Xem hỗ trợ", buttonLink: "/faq", imageUrl: image("photo-1464226184884-fa280b87c399"), sortOrder: 1 },
  { pageKey: "orders", name: "Đơn hàng · Theo dõi", eyebrow: "ĐƠN HÀNG CỦA BẠN", title: "Theo dõi hành trình đơn hàng", description: "Cập nhật trạng thái và xem chi tiết các đơn hàng của bạn.", buttonText: "Mua thêm sản phẩm", buttonLink: "/products", imageUrl: image("photo-1500382017468-9049fed747ef"), sortOrder: 1 },
  { pageKey: "order-detail", name: "Chi tiết đơn hàng", eyebrow: "CẬP NHẬT ĐƠN HÀNG", title: "Cần hỗ trợ về đơn hàng?", description: "Liên hệ Hoa Sen nếu bạn cần trao đổi thêm về giao nhận hoặc sản phẩm.", buttonText: "Liên hệ hỗ trợ", buttonLink: "/contact", imageUrl: image("photo-1530836369250-ef72a3f5cda8"), sortOrder: 1 },
  { pageKey: "wishlist", name: "Yêu thích · Lưu sản phẩm", eyebrow: "BỘ SƯU TẬP CỦA BẠN", title: "Lưu lại sản phẩm bạn quan tâm", description: "Dễ dàng quay lại xem quy cách và tình trạng của sản phẩm yêu thích.", buttonText: "Khám phá sản phẩm", buttonLink: "/products", imageUrl: image("photo-1416879595882-3373a0480b5b"), sortOrder: 1 },
  { pageKey: "notifications", name: "Thông báo · Cập nhật", eyebrow: "CẬP NHẬT TỪ HOA SEN", title: "Không bỏ lỡ thông tin đơn hàng", description: "Theo dõi thông báo về đơn hàng và hoạt động tài khoản.", buttonText: "Xem đơn hàng", buttonLink: "/orders", imageUrl: image("photo-1499529112087-3cb3b73cec95"), sortOrder: 1 },
  { pageKey: "addresses", name: "Địa chỉ nhận hàng", eyebrow: "GIAO HÀNG THUẬN TIỆN", title: "Quản lý địa chỉ nhận hàng", description: "Lưu thông tin giao hàng để hoàn tất đơn nhanh và chính xác hơn.", buttonText: "Xem sản phẩm", buttonLink: "/products", imageUrl: image("photo-1466692476868-aef1dfb1e735"), sortOrder: 1 },
  { pageKey: "account", name: "Tài khoản · Thành viên", eyebrow: "TÀI KHOẢN HOA SEN", title: "Quản lý trải nghiệm mua sắm của bạn", description: "Cập nhật thông tin, địa chỉ và theo dõi hoạt động mua hàng.", buttonText: "Khám phá sản phẩm", buttonLink: "/products", imageUrl: image("photo-1464226184884-fa280b87c399"), sortOrder: 1 },
  { pageKey: "general", name: "Trang khác · Khám phá Hoa Sen", eyebrow: "VẬT TƯ NHÀ KÍNH HOA SEN", title: "Giải pháp cho khu vườn của bạn", description: "Khám phá sản phẩm và nhận tư vấn từ đội ngũ Hoa Sen.", buttonText: "Xem sản phẩm", buttonLink: "/products", imageUrl: image("photo-1530836369250-ef72a3f5cda8"), sortOrder: 1 },
];

// A second, distinct slide makes every non-home page banner a real carousel.
// Keep these records seeded so they can be reviewed and edited from the admin UI.
const secondSlidePhotos = [
  "photo-1464226184884-fa280b87c399", "photo-1530836369250-ef72a3f5cda8",
  "photo-1585320806297-9794b3e4eeae", "photo-1592982537447-7440770cbfc9",
  "photo-1416879595882-3373a0480b5b", "photo-1466692476868-aef1dfb1e735",
  "photo-1499529112087-3cb3b73cec95", "photo-1500382017468-9049fed747ef",
];
const nonHomeRows = rows.filter((row) => row.pageKey !== "home");
const secondSlides = nonHomeRows.map((row, index) => ({
  ...row,
  name: `${row.name} · Giải pháp nhà vườn`,
  eyebrow: "GIẢI PHÁP CHO NHÀ VƯỜN",
  title: "Chọn đúng vật tư, vững vàng mỗi mùa vụ",
  description: "Khám phá sản phẩm thiết thực và nhận tư vấn phù hợp với khu vườn của bạn.",
  buttonText: "Khám phá sản phẩm",
  buttonLink: "/products",
  imageUrl: image(secondSlidePhotos[index % secondSlidePhotos.length]),
  sortOrder: 2,
}));
const allRows = [...rows, ...secondSlides];
const englishBannerCopy = {
  home: ["Greenhouse Solutions for Modern Farming", "From frames and greenhouse film to installation accessories, choose suitable supplies for a productive growing season.", "Explore products"],
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

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed development banners into production.");
  await connectDB();
  for (const row of allRows) {
    const [titleEn, descriptionEn, buttonTextEn] = englishBannerCopy[row.pageKey] || englishBannerCopy.home;
    await Banner.findOneAndUpdate(
      { seedKey: `default-${row.pageKey}-${row.sortOrder}` },
      { $set: { ...row, nameEn: `${titleEn} | Hoa Sen`, eyebrowEn: "HOA SEN GREENHOUSE SUPPLIES", titleEn, descriptionEn, buttonTextEn, altText: row.title, altTextEn: titleEn, textPosition: "left", overlayOpacity: 0.48, status: "active", seedKey: `default-${row.pageKey}-${row.sortOrder}` } },
      { upsert: true, runValidators: true },
    );
  }
  console.log(JSON.stringify({ database: mongoose.connection.name, seeded: allRows.length, nonHomePagesWithSlides: nonHomeRows.length, totalBanners: await Banner.countDocuments() }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
