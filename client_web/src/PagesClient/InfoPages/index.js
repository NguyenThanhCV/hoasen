import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ShoppingOutlined, SafetyCertificateOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import "./style.css";

const STORE = {
  name: "Vật tư nhà kính Hoa Sen",
  phone: process.env.REACT_APP_STORE_PHONE || "098 357 1112",
  email: process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com",
  mapUrl: process.env.REACT_APP_MAP_URL || "",
};

const pages = {
  about: {
    eyebrow: "VỀ HOA SEN",
    title: "Vật tư thiết thực cho mỗi mùa vụ",
    intro: "Từ màng nhà kính, lưới che đến thiết bị tưới và vật tư trồng trọt — Hoa Sen giúp nhà vườn dễ tìm sản phẩm phù hợp.",
  },
  faq: {
    eyebrow: "HỖ TRỢ MUA SẮM",
    title: "Câu hỏi thường gặp",
    intro: "Thông tin nhanh về cách chọn sản phẩm, đặt hàng và quản lý tài khoản.",
  },
  privacy: {
    eyebrow: "THÔNG TIN KHÁCH HÀNG",
    title: "Quyền riêng tư",
    intro: "Trang mua sắm sử dụng thông tin tài khoản, địa chỉ và đơn hàng để vận hành các tính năng mua hàng bạn yêu cầu.",
  },
  terms: {
    eyebrow: "ĐIỀU KHOẢN SỬ DỤNG",
    title: "Mua sắm minh bạch",
    intro: "Các thông tin dưới đây mô tả cách đơn hàng và tài khoản hoạt động trên website hiện tại.",
  },
};

function ContactPage() {
  return <InfoShell variant="info-feature-page" eyebrow="LIÊN HỆ" title="Chúng tôi sẵn sàng hỗ trợ" intro="Liên hệ Hoa Sen để được tư vấn về sản phẩm, phiên bản phù hợp và thông tin đặt hàng.">
    <div className="info-contact-grid">
      <a href={`tel:${STORE.phone.replaceAll(" ", "")}`}><PhoneOutlined /><span><small>Hotline</small><b>{STORE.phone}</b><em>Gọi để trao đổi trực tiếp</em></span></a>
      <a href={`mailto:${STORE.email}`}><MailOutlined /><span><small>Email</small><b>{STORE.email}</b><em>Gửi câu hỏi hoặc yêu cầu tư vấn</em></span></a>
      <a href={STORE.mapUrl} target="_blank" rel="noreferrer"><EnvironmentOutlined /><span><small>Địa chỉ công ty</small><b>Xem vị trí trên Google Maps ↗</b><em>Vật tư nhà kính Hoa Sen</em></span></a>
    </div>
    <div className="info-note"><b>Đang tìm sản phẩm?</b><p>Xem danh mục hoặc gửi mã sản phẩm qua hotline/email để được hỗ trợ chọn đúng quy cách.</p><Link to="/categories">Khám phá danh mục →</Link></div>
  </InfoShell>;
}

function FaqPage() {
  const questions = [
    ["Làm sao để biết giá của sản phẩm?", "Một số sản phẩm có nhiều phiên bản. Mở trang chi tiết, chọn đầy đủ thuộc tính như kích thước hoặc màu sắc để xem giá và tồn kho của phiên bản đó."],
    ["Làm sao để đặt hàng?", "Đăng nhập, chọn sản phẩm và phiên bản, thêm vào giỏ, chọn hoặc tạo địa chỉ giao hàng rồi gửi đơn hàng."],
    ["Tôi có thể theo dõi đơn hàng ở đâu?", "Mở mục Đơn hàng trong tài khoản để xem trạng thái và chi tiết từng đơn."],
    ["Khi nào tôi có thể hủy đơn?", "Đơn ở trạng thái chờ xác nhận hoặc đã xác nhận có thể gửi yêu cầu hủy ngay trong trang đơn hàng."],
    ["Mã giảm giá được áp dụng thế nào?", "Nhập mã ở bước thanh toán. Hệ thống kiểm tra hạn dùng, giá trị tối thiểu và giới hạn sử dụng trước khi tạo đơn."],
    ["Phí giao hàng đã nằm trong tổng đơn chưa?", "Website hiện chưa tính phí giao hàng tự động. Vui lòng liên hệ Hoa Sen để xác nhận phí giao hàng trước khi thanh toán."],
    ["Tôi có thể gửi đánh giá sản phẩm không?", "Có. Đăng nhập và gửi đánh giá từ trang chi tiết sản phẩm. Đánh giá sẽ hiển thị sau khi được duyệt."],
  ];
  return <InfoShell eyebrow="HỖ TRỢ MUA SẮM" title="Câu hỏi thường gặp" intro="Nếu bạn chưa tìm thấy câu trả lời, đội ngũ Hoa Sen có thể hỗ trợ trực tiếp.">
    <div className="info-faq-list">{questions.map(([question, answer]) => <details key={question}><summary><QuestionCircleOutlined />{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
    <div className="info-note"><b>Cần tư vấn thêm?</b><p>Gọi {STORE.phone} hoặc gửi email đến {STORE.email}.</p><Link to="/contact">Trang liên hệ →</Link></div>
  </InfoShell>;
}

function PrivacyPage() {
  return <InfoShell eyebrow={pages.privacy.eyebrow} title={pages.privacy.title} intro={pages.privacy.intro}>
    <div className="info-article"><section><h2>Thông tin được sử dụng</h2><p>Khi bạn tạo tài khoản hoặc đặt hàng, website lưu thông tin hồ sơ, số điện thoại, địa chỉ giao hàng, nội dung đơn hàng và đánh giá bạn gửi.</p></section><section><h2>Mục đích sử dụng</h2><p>Thông tin được dùng để đăng nhập, lưu giỏ hàng, xử lý đơn hàng, hiển thị lịch sử mua sắm và phản hồi yêu cầu hỗ trợ.</p></section><section><h2>Bảo vệ tài khoản</h2><p>Mật khẩu được lưu dưới dạng mã hóa. Bạn có thể đổi mật khẩu trong tài khoản; thao tác này sẽ đăng xuất các phiên đăng nhập khác.</p></section><section><h2>Yêu cầu hỗ trợ</h2><p>Để cập nhật hoặc hỏi về thông tin tài khoản, liên hệ <a href={`mailto:${STORE.email}`}>{STORE.email}</a> hoặc gọi {STORE.phone}.</p></section></div>
  </InfoShell>;
}

function TermsPage() {
  return <InfoShell eyebrow={pages.terms.eyebrow} title={pages.terms.title} intro={pages.terms.intro}>
    <div className="info-article"><section><h2>Thông tin sản phẩm và giá</h2><p>Sản phẩm có thể có nhiều phiên bản. Giá được xác định theo phiên bản đã chọn và được hệ thống tính lại khi tạo đơn.</p></section><section><h2>Đặt hàng và tồn kho</h2><p>Đơn hàng chỉ được tạo khi sản phẩm còn hoạt động và đủ tồn kho. Trạng thái đơn hàng được cập nhật trong tài khoản của bạn.</p></section><section><h2>Thanh toán và giao hàng</h2><p>Website hiện hỗ trợ các phương thức hiển thị tại bước thanh toán. Phí giao hàng chưa được tính tự động; vui lòng liên hệ Hoa Sen để xác nhận trước khi thanh toán.</p></section><section><h2>Hủy đơn và đánh giá</h2><p>Bạn có thể hủy đơn khi trạng thái còn chờ xác nhận hoặc đã xác nhận. Đánh giá gửi lên sẽ được kiểm duyệt trước khi hiển thị công khai.</p></section><section><h2>Liên hệ</h2><p>Nếu có thông tin chưa rõ, liên hệ {STORE.phone} hoặc <a href={`mailto:${STORE.email}`}>{STORE.email}</a> trước khi đặt hàng.</p></section></div>
  </InfoShell>;
}

function InfoShell({ eyebrow, title, intro, children, variant = "" }) {
  return <main className={`info-page ${variant}`}><div className="info-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div className="info-hero-icon"><ShoppingOutlined /></div></div><div className="info-body">{children}<div className="info-safe-note"><SafetyCertificateOutlined /><span>{variant === "info-feature-page" ? "Hoa Sen sẵn sàng hỗ trợ bạn chọn vật tư phù hợp cho khu vườn." : "Thông tin và trạng thái đơn hàng được quản lý trong tài khoản của bạn."}</span></div></div></main>;
}

export default function InfoPages() {
  const { pathname } = useLocation();
  if (pathname === "/contact") return <ContactPage />;
  if (pathname === "/faq") return <FaqPage />;
  if (pathname === "/privacy") return <PrivacyPage />;
  if (pathname === "/terms") return <TermsPage />;
  const page = pages.about;
  return <InfoShell {...page} variant="info-feature-page"><div className="info-about-grid"><article><span>01</span><h2>Vật tư nhà kính</h2><p>Màng, lưới, khung và phụ kiện phục vụ nhà kính.</p></article><article><span>02</span><h2>Thiết bị tưới</h2><p>Ống, béc tưới và phụ kiện cho hệ thống tưới.</p></article><article><span>03</span><h2>Vật tư trồng trọt</h2><p>Sản phẩm hỗ trợ chăm sóc cây và công việc tại vườn.</p></article></div><div className="info-note"><b>{STORE.name}</b><p>Chọn vật tư phù hợp, chăm vườn thuận tiện hơn qua từng mùa vụ.</p><Link to="/contact">Liên hệ với chúng tôi →</Link></div></InfoShell>;
}
