import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Btn } from "../components/UI";
import { categories, brands, products, variants } from "../api";
import { one, unwrap, idOf, err } from "../utils/helpers";

const EMPTY_PRODUCT = {
  name: "", slug: "", shortDescription: "", description: "", category: "", brand: "",
  sku: "", barcode: "", thumbnail: "", images: "", video: "", status: "active",
  featured: false, isNew: true, isBestSeller: false, isOnSale: false,
  metaTitle: "", metaDescription: "", metaKeywords: ""
};

const ATTR_PRESETS = ["Màu sắc", "Kích thước", "Dung tích", "Mẫu mã", "Chất liệu", "Phiên bản"];

const emptyVariant = (i = 0) => ({
  key: `new-${Date.now()}-${i}`,
  attributes: {}, sku: "", barcode: "", price: "", compareAtPrice: "", costPrice: "",
  stock: 0, reservedStock: 0, weight: "", length: "", width: "", height: "",
  thumbnail: "", images: "", active: true
});

const slugify = (value) => String(value || "").trim().toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const skuBase = (name) => (slugify(name).replace(/-/g, "_").toUpperCase().slice(0, 20) || "PRODUCT");
const listFrom = (r) => unwrap(r).items || [];

// Tiền nhập từ giao diện có thể là 100000, 100.000 hoặc 100,000.
// Chuẩn hóa về Number trước khi validate/gửi API để tránh báo thiếu giá dù đã nhập.
const moneyNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return NaN;
  const raw = String(value).trim().replace(/\s/g, "");
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(raw)) return Number(raw.replace(/[.,]/g, ""));
  const normalized = raw.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
};

const discountInfo = (price, compareAtPrice) => {
  const current = moneyNumber(price);
  const original = moneyNumber(compareAtPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current || original <= 0) {
    return { active: false, percent: 0, saving: 0 };
  }
  return { active: true, percent: Math.round(((original - current) / original) * 100), saving: original - current };
};

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

function combinations(attributes) {
  const usable = attributes.filter(a => a.name.trim() && a.values.length);
  if (!usable.length) return [{}];
  return usable.reduce((rows, attr) => rows.flatMap(row => attr.values.map(value => ({ ...row, [attr.name.trim()]: value }))), [{}]);
}

function normalizeVariant(v, i) {
  return {
    key: String(v._id || v.id || `old-${i}`),
    _id: v._id || v.id,
    attributes: Object.fromEntries(Object.entries(v.attributes || {}).map(([k, val]) => [k, String(val)])),
    sku: v.sku || "", barcode: v.barcode || "", price: v.price ?? "", compareAtPrice: v.compareAtPrice ?? "",
    costPrice: v.costPrice ?? "", stock: v.stock ?? 0, reservedStock: v.reservedStock ?? 0,
    weight: v.weight ?? "", length: v.dimensions?.length ?? "", width: v.dimensions?.width ?? "", height: v.dimensions?.height ?? "",
    thumbnail: v.thumbnail || "", images: (v.images || []).join("\n"), active: v.active !== false
  };
}

export default function ProductForm() {
  const { id: productId } = useParams();
  const edit = Boolean(productId);
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [variantRows, setVariantRows] = useState([emptyVariant()]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cr, br] = await Promise.all([
          categories.list({ page: 1, limit: 500 }),
          brands.list({ page: 1, limit: 500 })
        ]);
        if (!mounted) return;
        setCategoriesList(listFrom(cr));
        setBrandsList(listFrom(br));
        if (edit) {
          const [pr, vr] = await Promise.all([
            products.get(productId),
            variants.list({ product: productId, page: 1, limit: 500 })
          ]);
          const p = one(pr) || {};
          const rows = listFrom(vr).map(normalizeVariant);
          const attrMap = new Map();
          rows.forEach(row => Object.entries(row.attributes).forEach(([name, value]) => {
            if (!attrMap.has(name)) attrMap.set(name, []);
            if (value && !attrMap.get(name).includes(value)) attrMap.get(name).push(value);
          }));
          const productAttrs = p.attributes || {};
          Object.entries(productAttrs).forEach(([name, values]) => {
            if (!attrMap.has(name)) attrMap.set(name, []);
            (Array.isArray(values) ? values : [values]).forEach(value => {
              if (value && !attrMap.get(name).includes(String(value))) attrMap.get(name).push(String(value));
            });
          });
          setAttributes([...attrMap.entries()].map(([name, values]) => ({ name, values, input: "" })));
          setVariantRows(rows.length ? rows : [emptyVariant()]);
          setForm({
            ...EMPTY_PRODUCT, ...p,
            category: idOf(p.category), brand: idOf(p.brand),
            images: (p.images || []).join("\n"),
            metaKeywords: (p.metaKeywords || []).join(",")
          });
          setSlugTouched(true);
        }
      } catch (e) { if (mounted) setError(err(e)); }
    })();
    return () => { mounted = false; };
  }, [edit, productId]);

  const set = (key, value) => setForm(x => ({ ...x, [key]: value }));

  const addAttribute = (name = "") => {
    const clean = name.trim();
    if (!clean || attributes.some(a => a.name.toLowerCase() === clean.toLowerCase())) return;
    setAttributes(x => [...x, { name: clean, values: [], input: "" }]);
  };
  const updateAttribute = (index, patch) => setAttributes(x => x.map((a, i) => i === index ? { ...a, ...patch } : a));
  const removeAttribute = (index) => {
    const name = attributes[index]?.name;
    setAttributes(x => x.filter((_, i) => i !== index));
    if (name) setVariantRows(rows => rows.map(r => { const next = { ...r.attributes }; delete next[name]; return { ...r, attributes: next }; }));
  };
  const addValue = (index) => {
    const a = attributes[index]; const value = a.input.trim();
    if (!value || a.values.includes(value)) return;
    updateAttribute(index, { values: [...a.values, value], input: "" });
  };
  const removeValue = (index, value) => updateAttribute(index, { values: attributes[index].values.filter(v => v !== value) });

  const generatedCombos = useMemo(() => combinations(attributes), [attributes]);

  const generateVariants = () => {
    const combos = generatedCombos;
    if (!combos.length) return;
    const oldBySignature = new Map(variantRows.map(v => [JSON.stringify(v.attributes), v]));
    setVariantRows(combos.map((attrs, i) => oldBySignature.get(JSON.stringify(attrs)) || { ...emptyVariant(i), attributes: attrs }));
  };

  const updateVariant = (index, patch) => setVariantRows(rows => rows.map((v, i) => i === index ? { ...v, ...patch } : v));
  const addBlankVariant = () => setVariantRows(rows => [...rows, { ...emptyVariant(rows.length), attributes: {} }]);
  const removeVariant = (index) => setVariantRows(rows => rows.length <= 1 ? rows : rows.filter((_, i) => i !== index));

  const autoSku = (row, index) => {
    const suffix = Object.values(row.attributes).filter(Boolean).join("-").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    return `${skuBase(form.name)}${suffix ? `-${slugify(suffix).replace(/-/g, "-").toUpperCase().slice(0, 22)}` : ""}-${String(index + 1).padStart(2, "0")}`;
  };

  const productData = () => {
    const data = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      category: form.category,
      status: form.status || "draft",
      hasVariants: true,
      attributes: Object.fromEntries(
        attributes
          .filter(a => a.name.trim() && a.values.length)
          .map(a => [a.name.trim(), a.values.map(v => String(v).trim()).filter(Boolean)])
      )
    };
    if (form.shortDescription.trim()) data.shortDescription = form.shortDescription.trim();
    if (form.description.trim()) data.description = form.description;
    if (form.brand) data.brand = form.brand;
    if (form.sku.trim()) data.sku = form.sku.trim();
    if (form.barcode.trim()) data.barcode = form.barcode.trim();
    if (form.thumbnail.trim()) data.thumbnail = form.thumbnail.trim();
    const images = form.images.split("\n").map(x => x.trim()).filter(Boolean);
    if (images.length) data.images = images;
    if (form.video.trim()) data.video = form.video.trim();
    data.featured = !!form.featured;
    data.isNew = !!form.isNew;
    data.isBestSeller = !!form.isBestSeller;
    // Trạng thái giảm giá được suy ra từ Variant: chỉ sale khi Giá gốc > Giá bán.
    data.isOnSale = variantRows.some(row => discountInfo(row.price, row.compareAtPrice).active);
    if (form.metaTitle.trim()) data.metaTitle = form.metaTitle.trim();
    if (form.metaDescription.trim()) data.metaDescription = form.metaDescription.trim();
    const keywords = form.metaKeywords.split(",").map(x => x.trim()).filter(Boolean);
    if (keywords.length) data.metaKeywords = keywords;
    return data;
  };

  const variantData = (row, savedId, index) => {
    const price = moneyNumber(row.price);
    const compare = String(row.compareAtPrice ?? "").trim() === "" ? undefined : moneyNumber(row.compareAtPrice);
    const cost = String(row.costPrice ?? "").trim() === "" ? undefined : moneyNumber(row.costPrice);
    const stock = moneyNumber(row.stock);
    const reserved = moneyNumber(row.reservedStock);
    const data = {
      sku: row.sku.trim() || autoSku(row, index),
      attributes: Object.fromEntries(Object.entries(row.attributes || {}).map(([k, v]) => [String(k).trim(), String(v).trim()]).filter(([k, v]) => k && v)),
      price,
      stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
      reservedStock: Number.isFinite(reserved) ? Math.max(0, reserved) : 0,
      active: row.active !== false
    };
    if (savedId) data.product = savedId;
    if (row.barcode.trim()) data.barcode = row.barcode.trim();
    if (Number.isFinite(compare)) data.compareAtPrice = compare;
    if (Number.isFinite(cost)) data.costPrice = cost;
    if (row.thumbnail.trim()) data.thumbnail = row.thumbnail.trim();
    const images = row.images.split("\n").map(x => x.trim()).filter(Boolean);
    if (images.length) data.images = images;
    if (String(row.weight).trim() !== "" && Number.isFinite(Number(row.weight))) data.weight = Number(row.weight);
    const dimensions = {
      length: Number(row.length) || 0,
      width: Number(row.width) || 0,
      height: Number(row.height) || 0
    };
    if (dimensions.length || dimensions.width || dimensions.height) data.dimensions = dimensions;
    return data;
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên sản phẩm.";
    if (!form.category) next.category = "Vui lòng chọn danh mục.";

    // Luôn phải có ít nhất một Variant.
    if (!Array.isArray(variantRows) || variantRows.length < 1) {
      next.variants = "Sản phẩm phải có ít nhất 1 Variant.";
    }

    const skus = new Map();
    variantRows.forEach((row, i) => {
      const rowErrors = {};
      const price = moneyNumber(row?.price);
      if (!Number.isFinite(price) || price <= 0) {
        rowErrors.price = "Bắt buộc nhập giá bán lớn hơn 0.";
      }

      const sku = String(row?.sku || "").trim() || autoSku(row, i);
      const normalizedSku = sku.toUpperCase();
      if (skus.has(normalizedSku)) {
        rowErrors.sku = `Trùng với Variant ${skus.get(normalizedSku) + 1}.`;
      } else {
        skus.set(normalizedSku, i);
      }

      const stock = moneyNumber(row?.stock);
      const reserved = moneyNumber(row?.reservedStock);
      if (Number.isFinite(reserved) && Number.isFinite(stock) && reserved > stock) {
        rowErrors.reservedStock = "Tồn giữ không được lớn hơn tồn kho.";
      }

      const compareRaw = String(row?.compareAtPrice ?? "").trim();
      const compare = moneyNumber(row?.compareAtPrice);
      if (compareRaw !== "" && !Number.isFinite(compare)) {
        rowErrors.compareAtPrice = "Giá gốc không hợp lệ.";
      } else if (compareRaw !== "" && Number.isFinite(compare) && Number.isFinite(price) && compare <= price) {
        rowErrors.compareAtPrice = "Muốn giảm giá, Giá gốc phải lớn hơn Giá bán.";
      }

      if (Object.keys(rowErrors).length) next[`variant-${i}`] = rowErrors;
    });

    setFieldErrors(next);
    if (next.name) return next.name;
    if (next.category) return next.category;
    if (next.variants) return next.variants;
    const firstVariant = Object.keys(next).find(k => k.startsWith("variant-"));
    if (firstVariant) return `Kiểm tra Variant ${Number(firstVariant.split("-")[1]) + 1}: ${Object.values(next[firstVariant])[0]}`;
    return "";
  };
  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 4200);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const validation = validate();
    if (validation) {
      showToast("error", validation);
      document.querySelector(".product-form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    const createdVariantIds = [];
    let createdProductId = null;
    try {
      let savedId = productId;
      if (edit) {
        const result = await products.update(productId, productData());
        savedId = idOf(one(result)) || productId;
      } else {
        // Backend hiện tại yêu cầu Variant đầu tiên nằm ngay trong POST /products.
        // Không được tạo Product riêng rồi mới tạo Variant, vì productService.create()
        // sẽ trả 400 nếu body không có `variant` hoặc variant không có giá bán.
        const payload = productData();
        payload.variant = variantData(variantRows[0], null, 0);
        const result = await products.create(payload);
        savedId = idOf(one(result));
        createdProductId = savedId;
        if (!savedId) throw new Error("API /products không trả về ID sản phẩm. Kiểm tra response của backend.");
      }

      // Khi tạo mới, Variant đầu tiên đã được backend tạo cùng Product.
      // Chỉ tạo các Variant còn lại qua /variants.
      const startIndex = edit ? 0 : 1;
      for (let i = startIndex; i < variantRows.length; i++) {
        const row = variantRows[i];
        try {
          const data = variantData(row, savedId, i);
          if (edit && row._id) {
            await variants.update(row._id, data);
          } else {
            const result = await variants.create(data);
            const newId = idOf(one(result));
            if (!newId) throw new Error("Backend không trả về ID Variant.");
            createdVariantIds.push(newId);
          }
        } catch (variantError) {
          const message = err(variantError);
          const status = variantError?.response?.status;
          const detail = status ? `HTTP ${status}: ${message}` : message;
          setFieldErrors(prev => ({ ...prev, [`variant-${i}`]: { server: detail } }));
          throw new Error(`Variant ${i + 1}: ${detail}`);
        }
      }

      showToast("success", edit ? "Đã cập nhật sản phẩm và toàn bộ Variant." : "Đã tạo sản phẩm và Variant thành công.");
      window.setTimeout(() => nav(`/admin/products/${savedId}`), 450);
    } catch (e) {
      if (!edit && createdProductId) {
        for (const variantId of createdVariantIds) { try { await variants.remove(variantId); } catch (_) {} }
        try { await products.remove(createdProductId); } catch (_) {}
      }
      const message = err(e);
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return <Page title={edit ? "Sửa sản phẩm" : "Tạo sản phẩm mới"}>
    {toast && <div className={`product-toast ${toast.type === "success" ? "toast-success" : "toast-error"}`} role="alert"><span>{toast.type === "success" ? "✓" : "!"}</span><div><b>{toast.type === "success" ? "Thành công" : "Chưa thể lưu"}</b><div>{toast.message}</div></div><button type="button" onClick={() => setToast(null)}>×</button></div>}
    {error && <div className="errorbox product-form-error"><b>Chưa thể lưu sản phẩm</b><div>{error}</div><div className="error-help">Kiểm tra các trường được đánh dấu đỏ bên dưới.</div></div>}

    {showGuide && <div className="panel product-guide">
      <div className="section-head"><div><h2>Hướng dẫn nhập sản phẩm</h2><p className="muted">Làm theo 4 bước, các trường không cần thiết có thể để trống.</p></div><button type="button" className="ghost" onClick={() => setShowGuide(false)}>Ẩn ×</button></div>
      <div className="guide-grid">
        <div><b>1. Thông tin chung</b><span>Tên, danh mục, thương hiệu và mô tả.</span></div>
        <div><b>2. Phân loại</b><span>Ví dụ Màu sắc + Kích thước. Không có phân loại thì giữ 1 Variant.</span></div>
        <div><b>3. Giá & kho</b><span>Mỗi Variant có giá bán, giá niêm yết, giá vốn và tồn riêng.</span></div>
        <div><b>4. Kiểm tra</b><span>Mỗi Variant phải có giá bán; SKU không được trùng.</span></div>
      </div>
    </div>}

    <form onSubmit={submit}>
      <div className="panel form-section">
        <div className="section-head"><div><h2>1. Thông tin sản phẩm</h2><p className="muted">Thông tin dùng chung cho toàn bộ sản phẩm.</p></div></div>
        <div className="formgrid">
          <label className={fieldErrors.name ? "has-error" : ""}>Tên sản phẩm *<input required value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value, slug: (!edit && !slugTouched) ? slugify(e.target.value) : x.slug }))} placeholder="Ví dụ: Áo thun nam cotton" />{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label>
          <label>Slug<input value={form.slug} onChange={e => { setSlugTouched(true); set("slug", e.target.value); }} placeholder="Tự tạo nếu bỏ trống" /></label>
          <label className={fieldErrors.category ? "has-error" : ""}>Danh mục *<select value={form.category} onChange={e => set("category", e.target.value)}><option value="">-- Chọn danh mục --</option>{categoriesList.map(c => <option key={idOf(c)} value={idOf(c)}>{c.name}</option>)}</select>{fieldErrors.category && <small className="field-error">{fieldErrors.category}</small>}</label>
          <label>Thương hiệu<select value={form.brand} onChange={e => set("brand", e.target.value)}><option value="">-- Không chọn --</option>{brandsList.map(b => <option key={idOf(b)} value={idOf(b)}>{b.name}</option>)}</select></label>
          <label>Mã sản phẩm (SKU chung)<input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="Không bắt buộc" /></label>
          <label>Barcode chung<input value={form.barcode} onChange={e => set("barcode", e.target.value)} placeholder="Không bắt buộc" /></label>
          <label className="full">Mô tả ngắn<textarea value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} rows="3" placeholder="Mô tả ngắn hiển thị trong danh sách/sàn" /></label>
          <label className="full">Mô tả chi tiết<textarea value={form.description} onChange={e => set("description", e.target.value)} rows="6" placeholder="Thông tin, công dụng, chất liệu, bảo hành..." /></label>
        </div>
      </div>

      <div className="panel form-section">
        <div className="section-head"><div><h2>2. Phân loại sản phẩm</h2><p className="muted">Tạo các lựa chọn như Shopee. Hệ thống tự sinh tất cả tổ hợp.</p></div></div>
        <div className="preset-row">{ATTR_PRESETS.map(name => <button type="button" className="preset" key={name} onClick={() => addAttribute(name)}>+ {name}</button>)}<button type="button" className="preset" onClick={() => { const name = window.prompt("Tên thuộc tính mới:"); if (name) addAttribute(name); }}>+ Thuộc tính khác</button></div>
        {!attributes.length && <div className="empty">Chưa có phân loại. Sản phẩm sẽ dùng 1 Variant mặc định.</div>}
        {attributes.map((a, i) => <div className="attribute-row" key={a.name}>
          <div className="attribute-title"><input value={a.name} onChange={e => updateAttribute(i, { name: e.target.value })} /></div>
          <div className="attribute-values"><div className="value-input"><input value={a.input} onChange={e => updateAttribute(i, { input: e.target.value })} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addValue(i); } }} placeholder="Nhập giá trị rồi Enter" /><Btn type="button" onClick={() => addValue(i)}>Thêm</Btn></div><div className="chips">{a.values.map(v => <span className="chip" key={v}>{v}<button type="button" onClick={() => removeValue(i, v)}>×</button></span>)}</div></div>
          <button type="button" className="ghost remove-attr" onClick={() => removeAttribute(i)}>×</button>
        </div>)}
        <div className="builder-actions"><span className="hint">{generatedCombos.length} tổ hợp Variant sẽ được tạo.</span><Btn type="button" onClick={generateVariants}>Tạo / cập nhật danh sách Variant</Btn></div>
      </div>

      <div className="panel form-section">
        <div className="section-head"><div><h2>3. Giá, kho & Variant</h2><p className="muted">Mỗi dòng là một SKU bán hàng. Giá và tồn kho được lưu riêng cho từng Variant.</p></div><Btn type="button" onClick={addBlankVariant}>+ Thêm Variant</Btn></div>
        <div className="variant-required"><b>⚠ Bắt buộc:</b> sản phẩm phải có ít nhất 1 Variant và mỗi Variant phải có <b>Giá bán</b>.</div><div className="variant-help">Sản phẩm đơn: chỉ cần 1 dòng. Có màu/size: tạo tổ hợp ở bước 2 rồi nhập giá và tồn cho từng dòng.</div><div className="sale-help"><b>Cách nhập giảm giá:</b> Giá bán là số tiền khách trả. Giá gốc là giá trước giảm và phải cao hơn Giá bán. Hệ thống tự tính % giảm.</div>
        <div className="variant-editor-wrap"><table className="variant-editor marketplace-table"><thead><tr>
          <th>Phân loại</th><th>Giá bán *</th><th>Giá gốc</th><th>Giảm</th><th>Giá vốn</th><th>Tồn kho</th><th>Tồn giữ</th><th>SKU</th><th>Barcode</th><th>Khối lượng</th><th>Kích thước D×R×C</th><th>Ảnh</th><th>Hoạt động</th><th></th>
        </tr></thead><tbody>{variantRows.map((row, i) => <tr key={row.key} className={fieldErrors[`variant-${i}`] ? "variant-row-error" : ""}>
          <td><div className="attr-badges">{Object.entries(row.attributes).length ? Object.entries(row.attributes).map(([k,v]) => <span key={k}><b>{k}:</b> {v}</span>) : <span>Variant mặc định</span>}</div>{fieldErrors[`variant-${i}`]?.server && <div className="variant-server-error">{fieldErrors[`variant-${i}`].server}</div>}</td>
          <td className={fieldErrors[`variant-${i}`]?.price ? "cell-error" : ""}><input type="text" inputMode="numeric" min="0" step="1" value={row.price} placeholder="Giá khách trả" onChange={e => { updateVariant(i, { price: e.target.value }); setFieldErrors(x => { const n = {...x}; if (n[`variant-${i}`]) { const r = {...n[`variant-${i}`]}; delete r.price; if (!Object.keys(r).length) delete n[`variant-${i}`]; else n[`variant-${i}`] = r; } return n; }); }} />{fieldErrors[`variant-${i}`]?.price && <small className="field-error">{fieldErrors[`variant-${i}`].price}</small>}</td>
          <td className={fieldErrors[`variant-${i}`]?.compareAtPrice ? "cell-error" : ""}><input type="text" inputMode="numeric" min="0" step="1" value={row.compareAtPrice} placeholder="Giá trước giảm" onChange={e => { updateVariant(i, { compareAtPrice: e.target.value }); setFieldErrors(x => { const n = {...x}; if (n[`variant-${i}`]) { const r = {...n[`variant-${i}`]}; delete r.compareAtPrice; if (!Object.keys(r).length) delete n[`variant-${i}`]; else n[`variant-${i}`] = r; } return n; }); }} />{fieldErrors[`variant-${i}`]?.compareAtPrice && <small className="field-error">{fieldErrors[`variant-${i}`].compareAtPrice}</small>}</td>
          <td><div className="discount-preview">{discountInfo(row.price, row.compareAtPrice).active ? <><b>-{discountInfo(row.price, row.compareAtPrice).percent}%</b><span>Tiết kiệm {formatMoney(discountInfo(row.price, row.compareAtPrice).saving)} ₫</span></> : <span>—</span>}</div></td>
          <td><input type="text" inputMode="numeric" min="0" step="1" value={row.costPrice} placeholder="Giá vốn" onChange={e => updateVariant(i, { costPrice: e.target.value })} /></td>
          <td><input type="number" min="0" value={row.stock} placeholder="0" onChange={e => updateVariant(i, { stock: e.target.value })} /></td>
          <td><input type="number" min="0" value={row.reservedStock} placeholder="0" onChange={e => updateVariant(i, { reservedStock: e.target.value })} /></td>
          <td className={fieldErrors[`variant-${i}`]?.sku ? "cell-error" : ""}><input value={row.sku} placeholder={autoSku(row, i)} onChange={e => updateVariant(i, { sku: e.target.value })} />{fieldErrors[`variant-${i}`]?.sku && <small className="field-error">{fieldErrors[`variant-${i}`].sku}</small>}</td>
          <td><input value={row.barcode} placeholder="Không bắt buộc" onChange={e => updateVariant(i, { barcode: e.target.value })} /></td>
          <td><input type="number" min="0" value={row.weight} placeholder="g" onChange={e => updateVariant(i, { weight: e.target.value })} /></td>
          <td><div className="dimension-inputs"><input type="number" min="0" placeholder="D" value={row.length} onChange={e => updateVariant(i, { length: e.target.value })}/><input type="number" min="0" placeholder="R" value={row.width} onChange={e => updateVariant(i, { width: e.target.value })}/><input type="number" min="0" placeholder="C" value={row.height} onChange={e => updateVariant(i, { height: e.target.value })}/></div></td>
          <td><input value={row.thumbnail} placeholder="URL ảnh" onChange={e => updateVariant(i, { thumbnail: e.target.value })} /></td>
          <td><input type="checkbox" checked={row.active} onChange={e => updateVariant(i, { active: e.target.checked })} /></td>
          <td><button type="button" className="ghost remove-attr" disabled={variantRows.length <= 1} onClick={() => removeVariant(i)}>×</button></td>
        </tr>)}</tbody></table></div>
        <div className={`variant-summary ${!variantRows.length ? "summary-error" : ""}`}><b>{variantRows.length}</b> Variant · <b>{variantRows.reduce((s,v) => s + (Number(v.stock)||0), 0)}</b> sản phẩm tồn · Giá bán được nhập riêng từng Variant.</div>
      </div>

      <div className="panel form-section">
        <div className="section-head"><div><h2>4. Hình ảnh, trạng thái & thông tin thêm</h2><p className="muted">Không bắt buộc, chỉ mở rộng khi cần.</p></div><Btn type="button" onClick={() => setShowAdvanced(x => !x)}>{showAdvanced ? "Thu gọn" : "Mở thông tin thêm"}</Btn></div>
        {showAdvanced && <div className="formgrid">
          <label>Thumbnail<input value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)} /></label>
          <label>Video URL<input value={form.video} onChange={e => set("video", e.target.value)} /></label>
          <label className="full">Ảnh sản phẩm (mỗi URL một dòng)<textarea value={form.images} onChange={e => set("images", e.target.value)} /></label>
          <label>Trạng thái<select value={form.status} onChange={e => set("status", e.target.value)}><option value="draft">Nháp</option><option value="active">Đang bán</option><option value="inactive">Tạm ngưng</option><option value="archived">Lưu trữ</option></select></label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} /> Nổi bật</label>
          <label className="check"><input type="checkbox" checked={form.isNew} onChange={e => set("isNew", e.target.checked)} /> Sản phẩm mới</label>
          <label className="check"><input type="checkbox" checked={form.isBestSeller} onChange={e => set("isBestSeller", e.target.checked)} /> Bán chạy</label>
          <div className="sale-auto-note"><b>Giảm giá:</b> Tự động theo Variant. Nhập <b>Giá gốc</b> cao hơn <b>Giá bán</b> để hệ thống tính % giảm và bật trạng thái sale.</div>
          <label>Meta title<input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} /></label>
          <label>Meta description<input value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)} /></label>
          <label className="full">Meta keywords<input value={form.metaKeywords} onChange={e => set("metaKeywords", e.target.value)} /></label>
        </div>}
      </div>

      <div className="form-actions-sticky"><Btn type="button" onClick={() => nav(-1)}>Hủy</Btn><Btn type="submit" className="primary save-product-btn" disabled={loading}>{loading ? "Đang lưu..." : edit ? "Lưu sản phẩm" : "Tạo sản phẩm"}</Btn></div>
    </form>
  </Page>;
}
