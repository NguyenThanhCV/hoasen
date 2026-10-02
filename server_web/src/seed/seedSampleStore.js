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
const Coupon = require("../models/Coupon");
const Banner = require("../models/Banner");

const slugify = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const assetBaseUrl = process.env.ASSET_BASE_URL;
if (!assetBaseUrl) throw new Error("ASSET_BASE_URL is not configured");

const categoryRows = [
  { key: "film", name: "Màng nhà kính", nameEn: "Greenhouse Film", description: "Màng phủ nhà kính, giữ nhiệt và tối ưu ánh sáng cho vườn trồng.", descriptionEn: "Greenhouse covering film that helps retain heat and optimize light for crops.", parent: null },
  { key: "gutter", name: "Máng xối", nameEn: "Greenhouse Gutters", description: "Máng thu nước và phụ kiện lắp đặt cho kết cấu nhà kính.", descriptionEn: "Water collection gutters and installation accessories for greenhouse structures.", parent: null },
  { key: "pond", name: "Bạt lót hồ HDPE", nameEn: "HDPE Pond Liners", description: "Bạt chống thấm cho hồ chứa nước và công trình nông nghiệp.", descriptionEn: "Waterproof liners for reservoirs and agricultural projects.", parent: null },
  { key: "net", name: "Lưới", nameEn: "Agricultural Netting", description: "Các loại lưới che nắng, chắn côn trùng và bảo vệ cây trồng.", descriptionEn: "Shade nets, insect screens, and protective netting for crops.", parent: null },
  { key: "shade", name: "Lưới cắt nắng", nameEn: "Shade Nets", description: "Lưới giảm cường độ nắng theo tỷ lệ che phủ phù hợp.", descriptionEn: "Shade nets that reduce sunlight according to the coverage level you need.", parent: "net" },
  { key: "insect", name: "Lưới chắn côn trùng", nameEn: "Insect Screens", description: "Lưới mắt nhỏ bảo vệ khu canh tác khỏi côn trùng.", descriptionEn: "Fine mesh netting that protects growing areas from insects.", parent: "net" },
  { key: "mulch", name: "Màng phủ luống", nameEn: "Crop Mulch Film", description: "Màng phủ giữ ẩm, hạn chế cỏ dại cho luống rau và cây trồng.", descriptionEn: "Mulch film that retains moisture and suppresses weeds in crop beds.", parent: null },
  { key: "frame", name: "Khung và kết cấu nhà kính", nameEn: "Greenhouse Frames and Structures", description: "Ống thép và vật tư tạo khung nhà kính, nhà màng.", descriptionEn: "Steel pipes and materials for greenhouse and polytunnel frames.", parent: null },
  { key: "pipe", name: "Ống thép mạ kẽm", nameEn: "Galvanized Steel Pipes", description: "Ống thép dùng cho khung vòm và kết cấu nhà kính.", descriptionEn: "Steel pipes for arched greenhouse frames and structural supports.", parent: "frame" },
  { key: "accessory", name: "Phụ kiện nhà kính", nameEn: "Greenhouse Accessories", description: "Nẹp, lò xo, kẹp và dây chằng hoàn thiện công trình.", descriptionEn: "Profiles, springs, clips, and straps for greenhouse installations.", parent: null },
  { key: "gutter-accessory", name: "Phụ kiện máng xối", nameEn: "Gutter Accessories", description: "Phụ kiện và máng thoát nước cho mái nhà kính.", descriptionEn: "Accessories and drainage gutters for greenhouse roofs.", parent: "gutter" },
  { key: "irrigation", name: "Hệ thống tưới", nameEn: "Irrigation Systems", description: "Thiết bị tưới tiết kiệm nước cho vườn và nhà màng.", descriptionEn: "Water-efficient irrigation equipment for gardens and greenhouses.", parent: null },
  { key: "pe-pipe", name: "Ống tưới PE", nameEn: "PE Irrigation Pipes", description: "Ống PE dẫn nước chính và nhánh cho hệ thống tưới.", descriptionEn: "PE pipes that carry water through main and branch irrigation lines.", parent: "irrigation" },
  { key: "drip", name: "Dây tưới nhỏ giọt", nameEn: "Drip Irrigation Lines", description: "Dây nhỏ giọt tưới gốc đồng đều cho hàng cây.", descriptionEn: "Drip lines that deliver water evenly to crop roots.", parent: "irrigation" },
  { key: "sprinkler", name: "Béc tưới", nameEn: "Sprinklers and Misters", description: "Béc phun mưa và phun sương cho nhiều quy mô vườn.", descriptionEn: "Sprinklers and misting nozzles for gardens of different sizes.", parent: "irrigation" },
  { key: "filter", name: "Bộ lọc nước tưới", nameEn: "Irrigation Water Filters", description: "Thiết bị lọc cặn giúp bảo vệ đường ống và đầu tưới.", descriptionEn: "Filters that protect irrigation pipes and emitters from debris.", parent: "irrigation" },
  { key: "valve", name: "Van và phụ kiện tưới", nameEn: "Irrigation Valves and Accessories", description: "Van khóa, nối ống và phụ kiện lắp đặt hệ thống tưới.", descriptionEn: "Shut-off valves, pipe connectors, and irrigation installation accessories.", parent: "irrigation" },
  { key: "nursery", name: "Khay ươm và vật tư vườn ươm", nameEn: "Seedling Trays and Nursery Supplies", description: "Khay gieo hạt và dụng cụ chăm sóc cây con.", descriptionEn: "Seed trays and tools for caring for young plants.", parent: null },
  { key: "substrate", name: "Giá thể trồng cây", nameEn: "Growing Media", description: "Giá thể và vật tư hỗ trợ cây bén rễ, phát triển khỏe.", descriptionEn: "Growing media and supplies that support healthy root establishment.", parent: null },
  { key: "crop-care", name: "Vật tư chăm sóc cây", nameEn: "Plant Care Supplies", description: "Dây treo, lưới đỡ và vật tư hỗ trợ chăm sóc cây trồng.", descriptionEn: "Trellising and support supplies for crop care.", parent: null },
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

const productEnglishTerms = [
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
  [/khổ/g, "width"], [/dày/g, "thick"], [/phi\s*/g, "Ø"], [/micron/g, "micron"],
];
const toEnglishProductName = (name) => productEnglishTerms.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), name);
const productEnglishNames = {
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
const productEnglishName = (name) => productEnglishNames[name] || toEnglishProductName(name);
const specificationEnglish = {
  "4m × 100m": "4 m × 100 m", "6m × 100m": "6 m × 100 m", "7m × 100m": "7 m × 100 m", "8m × 100m": "8 m × 100 m",
  "1.2m × 400m": "1.2 m × 400 m", "2m × 50m": "2 m × 50 m", "3m × 50m": "3 m × 50 m", "4m × 50m": "4 m × 50 m",
  "2.5m × 50m": "2.5 m × 50 m", "Dài 6m": "6 m long", "Thanh 2m": "2 m bar", "Cái": "piece",
  "Cuộn 200m": "200 m roll", "Thanh 3m": "3 m bar", "m²": "square metre", "Cuộn 500m": "500 m roll",
  "Cuộn 400m": "400 m roll", "Béc": "nozzle", "Bộ": "set", "Khay nhựa ươm cây": "plastic seedling tray", "Bao 10kg": "10 kg bag", "Cuộn 50m": "50 m roll",
};

const articleCategories = [
  { name: "Kỹ thuật nhà kính", nameEn: "Greenhouse Engineering", description: "Kiến thức thiết kế, lắp đặt và vận hành nhà kính.", descriptionEn: "Guidance on greenhouse design, installation, and operation.", sortOrder: 1 },
  { name: "Tưới và chăm sóc cây", nameEn: "Irrigation and Plant Care", description: "Giải pháp tưới, quản lý nước và chăm sóc vườn.", descriptionEn: "Irrigation, water management, and garden care solutions.", sortOrder: 2 },
  { name: "Chọn vật tư", nameEn: "Choosing Supplies", description: "Hướng dẫn chọn đúng vật tư, quy cách và độ bền.", descriptionEn: "Advice on choosing the right supplies, specifications, and durability.", sortOrder: 3 },
  { name: "Kinh nghiệm nhà vườn", nameEn: "Grower Tips", description: "Mẹo thực tế giúp công việc canh tác thuận tiện hơn.", descriptionEn: "Practical tips to make everyday growing work easier.", sortOrder: 4 },
  { name: "Tin tức Hoa Sen", nameEn: "Hoa Sen News", description: "Thông tin và cập nhật từ Vật tư nhà kính Hoa Sen.", descriptionEn: "Updates from Hoa Sen Greenhouse Supplies.", sortOrder: 5 },
].map((item) => ({ ...item, slug: slugify(item.name), status: "active" }));

const articles = [
  { title: "Chọn màng nhà kính theo cây trồng và điều kiện vườn", titleEn: "Choosing Greenhouse Film for Your Crops and Growing Conditions", category: "chon-vat-tu", excerpt: "Độ dày, khổ màng và khả năng khuếch tán ánh sáng là những yếu tố nên cân nhắc trước khi lợp nhà kính.", excerptEn: "Film thickness, width, and light diffusion are key factors to consider before covering a greenhouse.", tags: ["màng nhà kính", "nhà kính"], image: "photo-1500382017468-9049fed747ef", content: "Màng nhà kính ảnh hưởng trực tiếp đến ánh sáng, nhiệt độ và độ ẩm bên trong công trình. Trước khi chọn, hãy xác định chiều rộng mái, chiều dài nhà và phương án cố định màng để tính khổ phù hợp.\n\nĐộ dày màng nên được chọn theo thời gian sử dụng dự kiến, điều kiện gió và mức độ tiếp xúc với nắng. Với khu vực có gió mạnh, kết cấu khung và cách căng màng cũng quan trọng như thông số vật liệu.\n\nNếu chưa chắc quy cách, hãy gửi kích thước công trình và loại cây trồng để được tư vấn trước khi đặt hàng.", contentEn: "Greenhouse film directly affects light, temperature, and humidity inside the structure. Before choosing a roll, measure the roof width and greenhouse length, then plan how the film will be secured.\n\nChoose film thickness based on its expected service life, wind conditions, and sun exposure. In windy areas, the frame and installation method matter as much as the material specification.\n\nIf you are unsure about the right size, share your project measurements and crop type with Hoa Sen before ordering." },
  { title: "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?", category: "chon-vat-tu", excerpt: "Tỷ lệ che nắng cần phù hợp với cây trồng, mùa vụ và vị trí lắp đặt thay vì chọn theo một con số cố định.", tags: ["lưới cắt nắng", "ánh sáng"], image: "photo-1416879595882-3373a0480b5b", content: "Tỷ lệ che nắng thể hiện lượng ánh sáng bị giảm khi đi qua lưới. Cây ưa sáng và cây con thường cần điều kiện khác nhau, vì vậy hãy bắt đầu từ nhu cầu của cây và thời điểm sử dụng.\n\nLưới có thể được lắp cố định trên mái hoặc dùng làm màn che linh hoạt. Cách lắp ảnh hưởng đến độ thông thoáng và khả năng điều chỉnh ánh sáng trong ngày.\n\nKhi lựa chọn, hãy kiểm tra khổ lưới, độ bền sợi, cách gia cố mép và điều kiện gió tại vườn." },
  { title: "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ", category: "tuoi-va-cham-soc-cay", excerpt: "Một hệ thống tưới ổn định bắt đầu từ sơ đồ khu trồng, nguồn nước sạch và lựa chọn đường ống phù hợp.", tags: ["tưới nhỏ giọt", "tiết kiệm nước"], image: "photo-1466692476868-aef1dfb1e735", content: "Hãy chia vườn thành các khu tưới theo loại cây và nhu cầu nước. Sơ đồ rõ ràng giúp ước tính chiều dài ống, số đầu tưới và lưu lượng cần thiết.\n\nBộ lọc phù hợp giúp hạn chế cặn đi vào dây nhỏ giọt. Vị trí van nên thuận tiện để đóng mở và kiểm tra từng khu.\n\nSau khi lắp đặt, chạy thử từng tuyến để quan sát độ đồng đều. Kiểm tra định kỳ đầu tưới và đường ống sẽ giúp hệ thống vận hành ổn định hơn." },
  { title: "Vì sao nên lắp bộ lọc trước đường ống tưới?", category: "tuoi-va-cham-soc-cay", excerpt: "Lọc cặn là bước quan trọng để bảo vệ béc tưới, dây nhỏ giọt và giảm thời gian xử lý tắc nghẽn.", tags: ["lọc nước", "hệ thống tưới"], image: "photo-1499529112087-3cb3b73cec95", content: "Nguồn nước có thể mang theo cát, rong hoặc cặn nhỏ. Khi các hạt này tích tụ trong béc và dây tưới, lưu lượng giữa các vị trí có thể không đồng đều.\n\nBộ lọc nên được chọn theo lưu lượng thiết kế và đặc tính nguồn nước. Hãy bố trí ở vị trí dễ tháo vệ sinh, đồng thời kiểm tra chênh lệch áp lực nếu hệ thống có đồng hồ đo.\n\nVệ sinh lõi lọc theo lịch phù hợp với chất lượng nước tại vườn giúp duy trì dòng chảy ổn định." },
  { title: "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công", category: "kinh-nghiem-nha-vuon", excerpt: "Đo công trình và dự phòng phần chồng mí trước khi mua giúp tiết kiệm vật tư và thời gian lắp đặt.", tags: ["thi công", "đo đạc"], image: "photo-1500382017468-9049fed747ef", content: "Hãy đo chiều dài, chiều rộng và phần mái theo đúng đường cong của khung. Kích thước phủ trên bản vẽ thường khác với kích thước bề mặt cần bao phủ.\n\nTính thêm phần chồng mí, nẹp cố định và phần dư ở mép trước khi chốt số lượng. Nếu công trình có nhiều nhịp, hãy ghi chú từng khu riêng để hạn chế cắt nhầm.\n\nGửi sơ đồ và kích thước cho nhà cung cấp để được kiểm tra lại quy cách vật tư." },
  { title: "Kiểm tra nhà kính trước mùa mưa gió", category: "ky-thuat-nha-kinh", excerpt: "Rà soát khung, nẹp, màng phủ và đường thoát nước sớm giúp phát hiện điểm cần gia cố.", tags: ["bảo trì", "nhà kính"], image: "photo-1500382017468-9049fed747ef", content: "Trước mùa mưa gió, kiểm tra các điểm liên kết của khung, chân trụ và thanh giằng. Thay thế chi tiết lỏng hoặc ăn mòn trước khi tải trọng gió tăng.\n\nQuan sát mép màng, nẹp và lò xo để tìm vị trí bị chùng, rách hoặc tuột. Làm sạch máng xối và kiểm tra hướng thoát nước quanh công trình.\n\nGhi lại hạng mục bảo trì sau mỗi lần kiểm tra sẽ giúp chủ động chuẩn bị vật tư phù hợp." },
  { title: "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính", category: "tin-tuc-hoa-sen", excerpt: "Kích thước công trình, loại cây và hình ảnh hiện trạng giúp đội ngũ tư vấn đề xuất đúng quy cách hơn.", tags: ["tư vấn", "Hoa Sen"], image: "photo-1416879595882-3373a0480b5b", content: "Để được tư vấn nhanh, hãy chuẩn bị chiều dài, chiều rộng và chiều cao công trình; loại cây trồng; khu vực lắp đặt; cùng ảnh chụp khung hoặc vật tư cần thay.\n\nNếu đã có bản vẽ, hãy gửi thêm khoảng cách giữa các trụ và độ cong mái. Những thông tin này giúp chọn khổ màng, lưới và phụ kiện sát với thực tế hơn.\n\nVật tư nhà kính Hoa Sen hỗ trợ kiểm tra quy cách và thông tin giao hàng theo nhu cầu từng công trình." },
  { title: "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng", category: "chon-vat-tu", excerpt: "Bề mặt nền, mép neo và kích thước hồ cần được tính trước để bạt được trải phẳng, hạn chế hư hại.", tags: ["bạt HDPE", "hồ chứa"], image: "photo-1437482078695-73f5ca6c96e2", content: "Trước khi trải bạt, cần dọn vật sắc nhọn, cành cây và đá lớn khỏi mặt nền. Bề mặt bằng phẳng giúp giảm các điểm chịu lực tập trung.\n\nKích thước bạt nên tính cả phần neo ở mép hồ và độ sâu thành. Không kéo lê bạt trên nền thô ráp; dùng cách nâng và trải phù hợp với kích thước tấm.\n\nĐộ dày và phương án thi công nên được xác định theo mục đích sử dụng, nền đất và thiết kế hồ." },
];
const tagEnglish = {
  "màng nhà kính": "greenhouse film", "nhà kính": "greenhouse", "lưới cắt nắng": "shade net", "ánh sáng": "light",
  "tưới nhỏ giọt": "drip irrigation", "tiết kiệm nước": "water conservation", "lọc nước": "water filtration",
  "hệ thống tưới": "irrigation system", "thi công": "installation", "đo đạc": "measurements", "bảo trì": "maintenance",
  "tư vấn": "advice", "Hoa Sen": "Hoa Sen", "bạt HDPE": "HDPE liner", "hồ chứa": "reservoir",
};

const articleEnglishContent = {
  "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?": {
    titleEn: "50%, 70%, or 80% Shade Net: How to Choose",
    excerptEn: "Choose a shade level that suits your crop, season, and installation location instead of relying on one fixed percentage.",
    contentEn: "The shade percentage indicates how much sunlight is reduced as it passes through the net. Sun-loving crops and seedlings have different needs, so start with the crop and season.\n\nNetting can be installed permanently over a roof or used as an adjustable screen. The installation method affects ventilation and how easily light can be adjusted during the day.\n\nBefore ordering, check the net width, yarn durability, edge reinforcement, and wind conditions at your site.",
  },
  "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ": {
    titleEn: "Set Up Drip Irrigation to Deliver Water to the Root Zone",
    excerptEn: "A reliable irrigation system starts with a growing-area plan, a clean water source, and suitable pipe sizes.",
    contentEn: "Divide the growing area into irrigation zones based on crop type and water needs. A clear plan helps estimate pipe lengths, emitter quantities, and required flow rates.\n\nA suitable filter helps keep debris out of drip lines. Place valves where they are easy to reach so each zone can be shut off and checked.\n\nAfter installation, test each line and observe whether water is distributed evenly. Regularly inspect emitters and pipes to keep the system running reliably.",
  },
  "Vì sao nên lắp bộ lọc trước đường ống tưới?": {
    titleEn: "Why Install a Filter Before Your Irrigation Lines?",
    excerptEn: "Filtering debris protects sprinklers and drip lines and reduces time spent clearing blockages.",
    contentEn: "Water sources may contain sand, algae, or fine debris. As these particles build up in sprinklers and irrigation lines, flow can become uneven.\n\nChoose a filter based on the system's designed flow rate and water quality. Install it where it can be removed and cleaned easily, and check pressure differences if the system has a pressure gauge.\n\nCleaning the filter on a schedule suited to your water source helps maintain steady flow.",
  },
  "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công": {
    titleEn: "Measure Netting and Film to Reduce Installation Waste",
    excerptEn: "Measure the structure and allow for overlaps before ordering to save material and installation time.",
    contentEn: "Measure the length, width, and roof along the frame's curve. The dimensions on a plan may differ from the actual surface that needs to be covered.\n\nAllow for overlaps, fixing profiles, and extra material at the edges before confirming quantities. For structures with multiple bays, record each section separately to avoid cutting errors.\n\nShare a sketch and measurements with your supplier so the material specifications can be checked before purchase.",
  },
  "Kiểm tra nhà kính trước mùa mưa gió": {
    titleEn: "Inspect Your Greenhouse Before the Rainy and Windy Season",
    excerptEn: "Check the frame, fixing profiles, cover, and drainage early to identify areas that need reinforcement.",
    contentEn: "Before the windy and rainy season, inspect frame connections, posts, and bracing. Replace loose or corroded parts before wind loads increase.\n\nCheck the film edges, fixing profiles, and springs for sagging, tears, or slippage. Clear the gutters and inspect drainage around the structure.\n\nKeeping a maintenance record after each inspection makes it easier to prepare the right supplies in advance.",
  },
  "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính": {
    titleEn: "What to Prepare When Asking About Greenhouse Supplies",
    excerptEn: "Project dimensions, crop type, and current photos help the team recommend suitable specifications.",
    contentEn: "For faster advice, prepare the structure's length, width, and height; the crop type; the installation location; and photos of the frame or material to be replaced.\n\nIf you have a drawing, include the distance between posts and the roof curvature. These details help match film, netting, and accessories to the actual project.\n\nHoa Sen Greenhouse Supplies can help check product specifications and delivery information for your project.",
  },
  "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng": {
    titleEn: "HDPE Pond Liners: Preparing the Site",
    excerptEn: "Prepare the base, anchoring edge, and pond dimensions in advance for a smooth installation and less risk of damage.",
    contentEn: "Before laying the liner, remove sharp objects, branches, and large stones from the base. A level surface helps prevent concentrated stress points.\n\nInclude the anchoring edge and pond depth when calculating liner size. Avoid dragging the liner across rough ground; use a handling method suited to the sheet size.\n\nChoose liner thickness and an installation method based on the intended use, ground conditions, and pond design.",
  },
};

const sampleCoupons = [
  { code: "HS-SAMPLE-10", name: "Ưu đãi khách hàng mới", type: "percentage", value: 10, minOrderValue: 500000, maxDiscount: 150000 },
  { code: "HS-SAMPLE-15", name: "Tiết kiệm cho đơn vật tư", type: "percentage", value: 15, minOrderValue: 1500000, maxDiscount: 300000 },
  { code: "HS-SAMPLE-20", name: "Ưu đãi nhà kính xanh", type: "percentage", value: 20, minOrderValue: 3000000, maxDiscount: 600000 },
  { code: "HS-SAMPLE-50K", name: "Giảm ngay 50 nghìn", type: "fixed", value: 50000, minOrderValue: 500000 },
  { code: "HS-SAMPLE-100K", name: "Giảm ngay 100 nghìn", type: "fixed", value: 100000, minOrderValue: 1000000 },
  { code: "HS-SAMPLE-200K", name: "Giảm ngay 200 nghìn", type: "fixed", value: 200000, minOrderValue: 2500000 },
  { code: "HS-SAMPLE-IRRIGATION", name: "Ưu đãi thiết bị tưới", type: "percentage", value: 12, minOrderValue: 800000, maxDiscount: 250000 },
  { code: "HS-SAMPLE-GREENHOUSE", name: "Ưu đãi vật tư nhà kính", type: "percentage", value: 8, minOrderValue: 1200000, maxDiscount: 400000 },
  { code: "HS-SAMPLE-GARDEN", name: "Ưu đãi dành cho nhà vườn", type: "fixed", value: 75000, minOrderValue: 750000 },
  { code: "HS-SAMPLE-SEASON", name: "Chào mùa vụ mới", type: "percentage", value: 18, minOrderValue: 2000000, maxDiscount: 500000 },
];
const couponEnglishNames = {
  "HS-SAMPLE-10": "New Customer Offer", "HS-SAMPLE-15": "Save on Supply Orders",
  "HS-SAMPLE-20": "Greenhouse Supplies Offer", "HS-SAMPLE-50K": "Save VND 50,000",
  "HS-SAMPLE-100K": "Save VND 100,000", "HS-SAMPLE-200K": "Save VND 200,000",
  "HS-SAMPLE-IRRIGATION": "Irrigation Equipment Offer", "HS-SAMPLE-GREENHOUSE": "Greenhouse Supplies Offer",
  "HS-SAMPLE-GARDEN": "Grower Offer", "HS-SAMPLE-SEASON": "New Growing Season Offer",
};

async function upsertCategory(row, parentId) {
  let category = await Category.findOne({ name: row.name });
  const values = { description: row.description, nameEn: row.nameEn, descriptionEn: row.descriptionEn, status: "active", sortOrder: row.sortOrder || 0 };
  if (parentId !== undefined) values.parent = parentId;
  if (category) {
    if (String(category.slug || "") === slugify(row.name)) Object.assign(category, values);
    else {
      category.nameEn = category.nameEn || row.nameEn;
      category.descriptionEn = category.descriptionEn || row.descriptionEn;
    }
    await category.save();
  } else {
    category = await Category.create({ name: row.name, slug: slugify(row.name), ...values });
  }
  return category;
}

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed sample commerce data into production.");
  const expectedDatabase = process.env.SEED_SAMPLE_DATABASE;
  if (!expectedDatabase) throw new Error("Set SEED_SAMPLE_DATABASE to the exact target database name.");
  await connectDB();
  if (mongoose.connection.name !== expectedDatabase) throw new Error(`Connected to ${mongoose.connection.name}; expected ${expectedDatabase}.`);
  const admin = await User.findOne({ email: "son@gmail.com", role: "admin", status: "active" }).select("_id");
  if (!admin) throw new Error("Expected active admin son@gmail.com was not found; database left unchanged.");

  const before = { products: await Product.countDocuments(), categories: await Category.countDocuments() };
  const categoryMap = {};
  for (const row of categoryRows.filter((item) => !item.parent)) categoryMap[row.key] = await upsertCategory(row, null);
  for (const row of categoryRows.filter((item) => item.parent)) categoryMap[row.key] = await upsertCategory(row, categoryMap[row.parent]._id);

  const brand = await Brand.findOneAndUpdate(
    { slug: "hoa-sen" },
    { $set: { name: "Hoa Sen", nameEn: "Hoa Sen", description: "Sản phẩm được tư vấn và phân phối bởi Vật tư nhà kính Hoa Sen.", descriptionEn: "Greenhouse and agricultural supplies selected and distributed by Hoa Sen.", status: "active", sortOrder: 0 }, $setOnInsert: { slug: "hoa-sen" } },
    { new: true, upsert: true, runValidators: true },
  );

  for (let index = 0; index < products.length; index += 1) {
    const [name, categoryKey, price, spec, stock] = products[index];
    const slug = `mau-${String(index + 1).padStart(2, "0")}-${slugify(name)}`;
    const productData = {
      name, nameEn: productEnglishName(name), slug,
      shortDescription: `Vật tư nhà vườn Hoa Sen – quy cách mẫu ${spec}. Vui lòng xác nhận tồn kho và giá trước khi đặt hàng.`,
      shortDescriptionEn: `${productEnglishName(name)}. Available specification: ${specificationEnglish[spec] || spec}. Confirm current price and availability before ordering.`,
      description: `${name}. Sản phẩm mẫu để tham khảo quy cách cho công trình và vườn trồng. Giá, hình ảnh và tồn kho cần được cửa hàng xác nhận trước khi đặt hàng thực tế. Liên hệ Hoa Sen để được tư vấn phù hợp với kích thước và nhu cầu sử dụng.`,
      descriptionEn: `${productEnglishName(name)} is designed for greenhouse and growing applications. Review its specification (${specificationEnglish[spec] || spec}), confirm current price and stock with Hoa Sen, and contact our team if you need help matching it to your project dimensions and requirements.`,
      category: categoryMap[categoryKey]._id, brand: brand._id,
      thumbnail: `${assetBaseUrl}/${["photo-1500382017468-9049fed747ef", "photo-1416879595882-3373a0480b5b", "photo-1497250681960-ef046c08a56e"][index % 3]}?auto=format&fit=crop&w=1000&q=80`,
      images: [`${assetBaseUrl}/${["photo-1500382017468-9049fed747ef", "photo-1416879595882-3373a0480b5b", "photo-1497250681960-ef046c08a56e"][index % 3]}?auto=format&fit=crop&w=1400&q=85`],
      attributes: { "Quy cách": [spec], "Thương hiệu": ["Hoa Sen"] },
      attributeTranslations: [
        { name: "Quy cách", nameEn: "Specification", values: [{ value: spec, valueEn: specificationEnglish[spec] || spec }] },
        { name: "Thương hiệu", nameEn: "Brand", values: [{ value: "Hoa Sen", valueEn: "Hoa Sen" }] },
      ],
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
    const english = articleEnglishContent[article.title] || {};
    const data = {
      title: article.title, titleEn: article.titleEn || english.titleEn || article.title, slug,
      excerpt: article.excerpt, excerptEn: article.excerptEn || english.excerptEn || article.excerpt,
      content: article.content, contentEn: article.contentEn || english.contentEn || article.content,
      tags: article.tags, tagsEn: article.tags.map((tag) => tagEnglish[tag] || tag),
      category: newsCategoryMap[article.category]._id, author: admin._id,
      coverImage: `${assetBaseUrl}/${article.image}?auto=format&fit=crop&w=1400&q=85`,
      status: "published", publishedAt: new Date(Date.now() - articles.indexOf(article) * 86400000),
      readingMinutes: Math.max(2, Math.ceil(words / 180)),
    };
    await NewsArticle.findOneAndUpdate({ slug }, { $set: data }, { upsert: true, runValidators: true });
  }

  const now = new Date();
  for (const [index, coupon] of sampleCoupons.entries()) {
    await Coupon.findOneAndUpdate(
      { code: coupon.code },
      { $set: {
        ...coupon,
        nameEn: couponEnglishNames[coupon.code] || coupon.name,
        status: "active",
        minOrderValue: coupon.minOrderValue || 0,
        usageLimit: 100,
        usageLimitPerUser: 1,
        usedCount: 0,
        startDate: new Date(now.getTime() - 86400000),
        endDate: new Date(now.getTime() + (21 + index) * 86400000),
      } },
      { new: true, upsert: true, runValidators: true },
    );
  }

  const counts = {
    sampleProducts: await Product.countDocuments({ slug: /^mau-\d{2}-/ }),
    activeProducts: await Product.countDocuments({ status: "active" }),
    categories: await Category.countDocuments(),
    sampleVariants: await Variant.countDocuments({ sku: /^HS-MAU-/ }),
    newsCategories: await NewsCategory.countDocuments({ status: "active" }),
    publishedArticles: await NewsArticle.countDocuments({ status: "published" }),
    sampleCoupons: await Coupon.countDocuments({ code: /^HS-SAMPLE-/ }),
  };
  console.log(JSON.stringify({ database: mongoose.connection.name, before, counts }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
