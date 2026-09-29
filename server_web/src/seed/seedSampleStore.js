require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Variant = require("../models/ProductVariant");
const NewsCategory = require("../models/NewsCategory");
const NewsArticle = require("../models/NewsArticle");

const slugify = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const assetBaseUrl = process.env.ASSET_BASE_URL;
if (!assetBaseUrl) throw new Error("ASSET_BASE_URL is not configured");

const categoryRows = [
  { key: "film", name: "Màng nhà kính", description: "Màng phủ nhà kính, giữ nhiệt và tối ưu ánh sáng cho vườn trồng.", parent: null },
  { key: "gutter", name: "Máng xối", description: "Máng thu nước và phụ kiện lắp đặt cho kết cấu nhà kính.", parent: null },
  { key: "pond", name: "Bạt lót hồ HDPE", description: "Bạt chống thấm cho hồ chứa nước và công trình nông nghiệp.", parent: null },
  { key: "net", name: "Lưới", description: "Các loại lưới che nắng, chắn côn trùng và bảo vệ cây trồng.", parent: null },
  { key: "shade", name: "Lưới cắt nắng", description: "Lưới giảm cường độ nắng theo tỷ lệ che phủ phù hợp.", parent: "net" },
  { key: "insect", name: "Lưới chắn côn trùng", description: "Lưới mắt nhỏ bảo vệ khu canh tác khỏi côn trùng.", parent: "net" },
  { key: "mulch", name: "Màng phủ luống", description: "Màng phủ giữ ẩm, hạn chế cỏ dại cho luống rau và cây trồng.", parent: null },
  { key: "frame", name: "Khung và kết cấu nhà kính", description: "Ống thép và vật tư tạo khung nhà kính, nhà màng.", parent: null },
  { key: "pipe", name: "Ống thép mạ kẽm", description: "Ống thép dùng cho khung vòm và kết cấu nhà kính.", parent: "frame" },
  { key: "accessory", name: "Phụ kiện nhà kính", description: "Nẹp, lò xo, kẹp và dây chằng hoàn thiện công trình.", parent: null },
  { key: "gutter-accessory", name: "Phụ kiện máng xối", description: "Phụ kiện và máng thoát nước cho mái nhà kính.", parent: "gutter" },
  { key: "irrigation", name: "Hệ thống tưới", description: "Thiết bị tưới tiết kiệm nước cho vườn và nhà màng.", parent: null },
  { key: "pe-pipe", name: "Ống tưới PE", description: "Ống PE dẫn nước chính và nhánh cho hệ thống tưới.", parent: "irrigation" },
  { key: "drip", name: "Dây tưới nhỏ giọt", description: "Dây nhỏ giọt tưới gốc đồng đều cho hàng cây.", parent: "irrigation" },
  { key: "sprinkler", name: "Béc tưới", description: "Béc phun mưa và phun sương cho nhiều quy mô vườn.", parent: "irrigation" },
  { key: "filter", name: "Bộ lọc nước tưới", description: "Thiết bị lọc cặn giúp bảo vệ đường ống và đầu tưới.", parent: "irrigation" },
  { key: "valve", name: "Van và phụ kiện tưới", description: "Van khóa, nối ống và phụ kiện lắp đặt hệ thống tưới.", parent: "irrigation" },
  { key: "nursery", name: "Khay ươm và vật tư vườn ươm", description: "Khay gieo hạt và dụng cụ chăm sóc cây con.", parent: null },
  { key: "substrate", name: "Giá thể trồng cây", description: "Giá thể và vật tư hỗ trợ cây bén rễ, phát triển khỏe.", parent: null },
  { key: "crop-care", name: "Vật tư chăm sóc cây", description: "Dây treo, lưới đỡ và vật tư hỗ trợ chăm sóc cây trồng.", parent: null },
];

const products = [
  ["Màng nhà kính PE 150 micron khổ 4m", "film", 1490000, "4m × 100m", 32],
  ["Màng nhà kính PE 200 micron khổ 6m", "film", 2190000, "6m × 100m", 26],
  ["Màng nhà kính EVA khuếch tán ánh sáng", "film", 2890000, "7m × 100m", 18],
  ["Màng nhà kính chống đọng sương", "film", 3190000, "8m × 100m", 14],
  ["Màng phủ luống nông nghiệp màu bạc đen", "mulch", 285000, "1.2m × 400m", 70],
  ["Lưới cắt nắng 50% khổ 2m", "shade", 390000, "2m × 50m", 65],
  ["Lưới cắt nắng 70% khổ 3m", "shade", 680000, "3m × 50m", 48],
  ["Lưới cắt nắng 80% khổ 4m", "shade", 990000, "4m × 50m", 36],
  ["Lưới chắn côn trùng 32 mesh", "insect", 1250000, "2.5m × 50m", 40],
  ["Lưới chắn côn trùng 50 mesh", "insect", 1690000, "2.5m × 50m", 32],
  ["Ống thép mạ kẽm phi 34 làm khung vòm", "pipe", 178000, "Dài 6m", 120],
  ["Ống thép mạ kẽm phi 42 chịu lực", "pipe", 239000, "Dài 6m", 90],
  ["Ống thép mạ kẽm phi 27", "pipe", 139000, "Dài 6m", 110],
  ["Nẹp Z cố định màng nhà kính", "accessory", 24500, "Thanh 2m", 350],
  ["Lò xo ziczac giữ màng nhà kính", "accessory", 11500, "Thanh 2m", 500],
  ["Kẹp màng nhà kính chống tuột", "accessory", 3500, "Cái", 1000],
  ["Dây chằng nhà kính chịu UV", "accessory", 185000, "Cuộn 200m", 80],
  ["Máng xối nhà kính tôn mạ kẽm", "gutter", 295000, "Thanh 3m", 75],
  ["Máng xối liền nẹp thoát nước", "gutter-accessory", 365000, "Thanh 3m", 60],
  ["Bạt HDPE lót hồ dày 0.5mm", "pond", 28500, "m²", 800],
  ["Bạt HDPE lót hồ dày 1.0mm", "pond", 49500, "m²", 600],
  ["Ống PE tưới phi 16", "pe-pipe", 780000, "Cuộn 200m", 50],
  ["Ống PE tưới phi 20", "pe-pipe", 1190000, "Cuộn 200m", 42],
  ["Dây tưới nhỏ giọt 16mm khoảng cách 20cm", "drip", 1290000, "Cuộn 500m", 34],
  ["Dây tưới nhỏ giọt bù áp 16mm", "drip", 1890000, "Cuộn 400m", 28],
  ["Béc tưới phun mưa 360 độ", "sprinkler", 12500, "Béc", 600],
  ["Béc phun sương làm mát nhà kính", "sprinkler", 8900, "Béc", 800],
  ["Bộ lọc đĩa 1 inch cho hệ thống tưới", "filter", 385000, "Bộ", 55],
  ["Van khóa PVC 21mm", "valve", 19000, "Cái", 250],
  ["Khay ươm cây ươm", "nursery", 45000, "Khay nhựa ươm cây", 180],
  ["Giá thể xơ dừa đã xử lý", "substrate", 85000, "Bao 10kg", 140],
  ["Lưới đỡ cây trồng khổ 2m", "crop-care", 275000, "Cuộn 50m", 75],
];

const articleCategories = [
  { name: "Kỹ thuật nhà kính", description: "Kiến thức thiết kế, lắp đặt và vận hành nhà kính.", sortOrder: 1 },
  { name: "Tưới và chăm sóc cây", description: "Giải pháp tưới, quản lý nước và chăm sóc vườn.", sortOrder: 2 },
  { name: "Chọn vật tư", description: "Hướng dẫn chọn đúng vật tư, quy cách và độ bền.", sortOrder: 3 },
  { name: "Kinh nghiệm nhà vườn", description: "Mẹo thực tế giúp công việc canh tác thuận tiện hơn.", sortOrder: 4 },
  { name: "Tin tức Hoa Sen", description: "Thông tin và cập nhật từ Vật tư nhà kính Hoa Sen.", sortOrder: 5 },
].map((item) => ({ ...item, slug: slugify(item.name), status: "active" }));

const articles = [
  { title: "Chọn màng nhà kính theo cây trồng và điều kiện vườn", category: "chon-vat-tu", excerpt: "Độ dày, khổ màng và khả năng khuếch tán ánh sáng là những yếu tố nên cân nhắc trước khi lợp nhà kính.", tags: ["màng nhà kính", "nhà kính"], image: "photo-1500382017468-9049fed747ef", content: "Màng nhà kính ảnh hưởng trực tiếp đến ánh sáng, nhiệt độ và độ ẩm bên trong công trình. Trước khi chọn, hãy xác định chiều rộng mái, chiều dài nhà và phương án cố định màng để tính khổ phù hợp.\n\nĐộ dày màng nên được chọn theo thời gian sử dụng dự kiến, điều kiện gió và mức độ tiếp xúc với nắng. Với khu vực có gió mạnh, kết cấu khung và cách căng màng cũng quan trọng như thông số vật liệu.\n\nNếu chưa chắc quy cách, hãy gửi kích thước công trình và loại cây trồng để được tư vấn trước khi đặt hàng." },
  { title: "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?", category: "chon-vat-tu", excerpt: "Tỷ lệ che nắng cần phù hợp với cây trồng, mùa vụ và vị trí lắp đặt thay vì chọn theo một con số cố định.", tags: ["lưới cắt nắng", "ánh sáng"], image: "photo-1416879595882-3373a0480b5b", content: "Tỷ lệ che nắng thể hiện lượng ánh sáng bị giảm khi đi qua lưới. Cây ưa sáng và cây con thường cần điều kiện khác nhau, vì vậy hãy bắt đầu từ nhu cầu của cây và thời điểm sử dụng.\n\nLưới có thể được lắp cố định trên mái hoặc dùng làm màn che linh hoạt. Cách lắp ảnh hưởng đến độ thông thoáng và khả năng điều chỉnh ánh sáng trong ngày.\n\nKhi lựa chọn, hãy kiểm tra khổ lưới, độ bền sợi, cách gia cố mép và điều kiện gió tại vườn." },
  { title: "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ", category: "tuoi-va-cham-soc-cay", excerpt: "Một hệ thống tưới ổn định bắt đầu từ sơ đồ khu trồng, nguồn nước sạch và lựa chọn đường ống phù hợp.", tags: ["tưới nhỏ giọt", "tiết kiệm nước"], image: "photo-1466692476868-aef1dfb1e735", content: "Hãy chia vườn thành các khu tưới theo loại cây và nhu cầu nước. Sơ đồ rõ ràng giúp ước tính chiều dài ống, số đầu tưới và lưu lượng cần thiết.\n\nBộ lọc phù hợp giúp hạn chế cặn đi vào dây nhỏ giọt. Vị trí van nên thuận tiện để đóng mở và kiểm tra từng khu.\n\nSau khi lắp đặt, chạy thử từng tuyến để quan sát độ đồng đều. Kiểm tra định kỳ đầu tưới và đường ống sẽ giúp hệ thống vận hành ổn định hơn." },
  { title: "Vì sao nên lắp bộ lọc trước đường ống tưới?", category: "tuoi-va-cham-soc-cay", excerpt: "Lọc cặn là bước quan trọng để bảo vệ béc tưới, dây nhỏ giọt và giảm thời gian xử lý tắc nghẽn.", tags: ["lọc nước", "hệ thống tưới"], image: "photo-1499529112087-3cb3b73cec95", content: "Nguồn nước có thể mang theo cát, rong hoặc cặn nhỏ. Khi các hạt này tích tụ trong béc và dây tưới, lưu lượng giữa các vị trí có thể không đồng đều.\n\nBộ lọc nên được chọn theo lưu lượng thiết kế và đặc tính nguồn nước. Hãy bố trí ở vị trí dễ tháo vệ sinh, đồng thời kiểm tra chênh lệch áp lực nếu hệ thống có đồng hồ đo.\n\nVệ sinh lõi lọc theo lịch phù hợp với chất lượng nước tại vườn giúp duy trì dòng chảy ổn định." },
  { title: "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công", category: "kinh-nghiem-nha-vuon", excerpt: "Đo công trình và dự phòng phần chồng mí trước khi mua giúp tiết kiệm vật tư và thời gian lắp đặt.", tags: ["thi công", "đo đạc"], image: "photo-1500382017468-9049fed747ef", content: "Hãy đo chiều dài, chiều rộng và phần mái theo đúng đường cong của khung. Kích thước phủ trên bản vẽ thường khác với kích thước bề mặt cần bao phủ.\n\nTính thêm phần chồng mí, nẹp cố định và phần dư ở mép trước khi chốt số lượng. Nếu công trình có nhiều nhịp, hãy ghi chú từng khu riêng để hạn chế cắt nhầm.\n\nGửi sơ đồ và kích thước cho nhà cung cấp để được kiểm tra lại quy cách vật tư." },
  { title: "Kiểm tra nhà kính trước mùa mưa gió", category: "ky-thuat-nha-kinh", excerpt: "Rà soát khung, nẹp, màng phủ và đường thoát nước sớm giúp phát hiện điểm cần gia cố.", tags: ["bảo trì", "nhà kính"], image: "photo-1500382017468-9049fed747ef", content: "Trước mùa mưa gió, kiểm tra các điểm liên kết của khung, chân trụ và thanh giằng. Thay thế chi tiết lỏng hoặc ăn mòn trước khi tải trọng gió tăng.\n\nQuan sát mép màng, nẹp và lò xo để tìm vị trí bị chùng, rách hoặc tuột. Làm sạch máng xối và kiểm tra hướng thoát nước quanh công trình.\n\nGhi lại hạng mục bảo trì sau mỗi lần kiểm tra sẽ giúp chủ động chuẩn bị vật tư phù hợp." },
  { title: "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính", category: "tin-tuc-hoa-sen", excerpt: "Kích thước công trình, loại cây và hình ảnh hiện trạng giúp đội ngũ tư vấn đề xuất đúng quy cách hơn.", tags: ["tư vấn", "Hoa Sen"], image: "photo-1416879595882-3373a0480b5b", content: "Để được tư vấn nhanh, hãy chuẩn bị chiều dài, chiều rộng và chiều cao công trình; loại cây trồng; khu vực lắp đặt; cùng ảnh chụp khung hoặc vật tư cần thay.\n\nNếu đã có bản vẽ, hãy gửi thêm khoảng cách giữa các trụ và độ cong mái. Những thông tin này giúp chọn khổ màng, lưới và phụ kiện sát với thực tế hơn.\n\nVật tư nhà kính Hoa Sen hỗ trợ kiểm tra quy cách và thông tin giao hàng theo nhu cầu từng công trình." },
  { title: "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng", category: "chon-vat-tu", excerpt: "Bề mặt nền, mép neo và kích thước hồ cần được tính trước để bạt được trải phẳng, hạn chế hư hại.", tags: ["bạt HDPE", "hồ chứa"], image: "photo-1437482078695-73f5ca6c96e2", content: "Trước khi trải bạt, cần dọn vật sắc nhọn, cành cây và đá lớn khỏi mặt nền. Bề mặt bằng phẳng giúp giảm các điểm chịu lực tập trung.\n\nKích thước bạt nên tính cả phần neo ở mép hồ và độ sâu thành. Không kéo lê bạt trên nền thô ráp; dùng cách nâng và trải phù hợp với kích thước tấm.\n\nĐộ dày và phương án thi công nên được xác định theo mục đích sử dụng, nền đất và thiết kế hồ." },
];

async function upsertCategory(row, parentId) {
  let category = await Category.findOne({ name: row.name });
  const values = { description: row.description, status: "active", sortOrder: row.sortOrder || 0 };
  if (parentId !== undefined) values.parent = parentId;
  if (category) {
    if (String(category.slug || "") === slugify(row.name)) Object.assign(category, values);
    await category.save();
  } else {
    category = await Category.create({ name: row.name, slug: slugify(row.name), ...values });
  }
  return category;
}

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed sample commerce data into production.");
  await connectDB();
  const admin = await User.findOne({ email: "son@gmail.com", role: "admin", status: "active" }).select("_id");
  if (!admin) throw new Error("Expected active admin son@gmail.com was not found; database left unchanged.");

  const before = { products: await Product.countDocuments(), categories: await Category.countDocuments() };
  const categoryMap = {};
  for (const row of categoryRows.filter((item) => !item.parent)) categoryMap[row.key] = await upsertCategory(row, null);
  for (const row of categoryRows.filter((item) => item.parent)) categoryMap[row.key] = await upsertCategory(row, categoryMap[row.parent]._id);

  const brand = await Brand.findOneAndUpdate(
    { slug: "hoa-sen" },
    { $set: { name: "Hoa Sen", description: "Sản phẩm được tư vấn và phân phối bởi Vật tư nhà kính Hoa Sen.", status: "active", sortOrder: 0 }, $setOnInsert: { slug: "hoa-sen" } },
    { new: true, upsert: true, runValidators: true },
  );

  for (let index = 0; index < products.length; index += 1) {
    const [name, categoryKey, price, spec, stock] = products[index];
    const slug = `mau-${String(index + 1).padStart(2, "0")}-${slugify(name)}`;
    const productData = {
      name, slug,
      shortDescription: `Vật tư nhà vườn Hoa Sen – quy cách mẫu ${spec}. Vui lòng xác nhận tồn kho và giá trước khi đặt hàng.`,
      description: `${name}. Sản phẩm mẫu để tham khảo quy cách cho công trình và vườn trồng. Giá, hình ảnh và tồn kho cần được cửa hàng xác nhận trước khi đặt hàng thực tế. Liên hệ Hoa Sen để được tư vấn phù hợp với kích thước và nhu cầu sử dụng.`,
      category: categoryMap[categoryKey]._id, brand: brand._id,
      thumbnail: `${assetBaseUrl}/${["photo-1500382017468-9049fed747ef", "photo-1416879595882-3373a0480b5b", "photo-1497250681960-ef046c08a56e"][index % 3]}?auto=format&fit=crop&w=1000&q=80`,
      images: [`${assetBaseUrl}/${["photo-1500382017468-9049fed747ef", "photo-1416879595882-3373a0480b5b", "photo-1497250681960-ef046c08a56e"][index % 3]}?auto=format&fit=crop&w=1400&q=85`],
      attributes: { "Quy cách": [spec], "Thương hiệu": ["Hoa Sen"] },
      hasVariants: true, status: "active", featured: index < 8,
      isNew: index < 10, isBestSeller: index >= 10 && index < 16, isOnSale: index % 7 === 0,
      metaTitle: `${name} | Vật tư nhà kính Hoa Sen`,
      metaDescription: `Tham khảo ${name}, xem quy cách và liên hệ Hoa Sen để xác nhận giá, tồn kho.`,
      metaKeywords: ["vật tư nhà kính", "nông nghiệp", categoryRows.find((item) => item.key === categoryKey).name],
      publishedAt: new Date(),
    };
    const product = await Product.findOneAndUpdate({ slug }, { $set: productData }, { new: true, upsert: true, runValidators: true });
    const variantSku = `HS-MAU-${String(index + 1).padStart(3, "0")}`;
    const variantData = { product: product._id, sku: variantSku, attributes: { "Quy cách": spec }, price, costPrice: Math.round(price * 0.65), stock, reservedStock: 0, active: true, thumbnail: productData.thumbnail };
    if (index % 7 === 0) variantData.compareAtPrice = Math.round(price * 1.1);
    await Variant.findOneAndUpdate(
      { sku: variantSku },
      { $setOnInsert: variantData },
      { upsert: true, runValidators: true },
    );
  }

  const newsCategoryMap = {};
  for (const row of articleCategories) {
    newsCategoryMap[row.slug] = await NewsCategory.findOneAndUpdate(
      { slug: row.slug }, { $set: row }, { new: true, upsert: true, runValidators: true },
    );
  }
  for (const article of articles) {
    const slug = slugify(article.title);
    const words = article.content.split(/\s+/).length;
    const data = {
      title: article.title, slug, excerpt: article.excerpt, content: article.content,
      category: newsCategoryMap[article.category]._id, author: admin._id, tags: article.tags,
      coverImage: `${assetBaseUrl}/${article.image}?auto=format&fit=crop&w=1400&q=85`,
      status: "published", publishedAt: new Date(Date.now() - articles.indexOf(article) * 86400000),
      readingMinutes: Math.max(2, Math.ceil(words / 180)),
    };
    await NewsArticle.findOneAndUpdate({ slug }, { $set: data }, { upsert: true, runValidators: true });
  }

  const counts = {
    sampleProducts: await Product.countDocuments({ slug: /^mau-\d{2}-/ }),
    activeProducts: await Product.countDocuments({ status: "active" }),
    categories: await Category.countDocuments(),
    sampleVariants: await Variant.countDocuments({ sku: /^HS-MAU-/ }),
    newsCategories: await NewsCategory.countDocuments({ status: "active" }),
    publishedArticles: await NewsArticle.countDocuments({ status: "published" }),
  };
  console.log(JSON.stringify({ database: mongoose.connection.name, before, counts }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
