import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Page, Table, Btn, Danger, Money } from "../components/UI";
import { products, variants } from "../api";
import { one, unwrap, idOf } from "../utils/helpers";

const id = (v) => String(v?._id || v?.id || v || "");

const ATTRIBUTE_PRESETS = [
  { label: "Màu", key: "color" },
  { label: "Size", key: "size" },
  { label: "Dung lượng", key: "storage" },
  { label: "Chất liệu", key: "material" },
  { label: "Kiểu", key: "style" },
];

const money = (v) => Number(v || 0).toLocaleString("vi-VN");
const discountInfo = (price, compareAtPrice) => {
  const current = Number(price);
  const original = Number(compareAtPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current || original <= 0) return { active: false, percent: 0, saving: 0 };
  return { active: true, percent: Math.round(((original - current) / original) * 100), saving: original - current };
};
const slugKey = (label) => {
  const found = ATTRIBUTE_PRESETS.find((x) => x.label.toLowerCase() === label.trim().toLowerCase());
  if (found) return found.key;
  return label.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `attr_${Date.now()}`;
};
const normalizeValues = (values) => values.map((v) => String(v).trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
const attrs = (v) => Object.entries(v?.attributes || {}).filter(([, x]) => String(x).trim());
const comboKey = (attributes) => Object.entries(attributes || {}).filter(([, v]) => String(v).trim()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${String(v).trim().toLowerCase()}`).join("|");

function emptyRow(attrs = {}) {
  return {
    _id: "",
    sku: "",
    barcode: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    stock: "",
    reservedStock: "",
    thumbnail: "",
    images: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    active: true,
    attributes: attrs,
  };
}

function buildCombinations(groups) {
  if (!groups.length || groups.some((g) => !g.values.length)) return [];
  return groups.reduce((acc, group) => {
    if (!acc.length) return group.values.map((value) => ({ [group.key]: value }));
    const next = [];
    acc.forEach((base) => group.values.forEach((value) => next.push({ ...base, [group.key]: value })));
    return next;
  }, []);
}

export default function ProductDetail() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [vars, setVars] = useState([]);
  const [groups, setGroups] = useState([
    { label: "Màu", key: "color", values: [] },
    { label: "Size", key: "size", values: [] },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quick, setQuick] = useState({ sku: "", barcode: "", price: "", compareAtPrice: "", costPrice: "", stock: "", reservedStock: "", thumbnail: "", images: "", weight: "", length: "", width: "", height: "", active: true });
  const [quickSaving, setQuickSaving] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [pr, vr] = await Promise.all([
        products.get(productId),
        variants.list({ product: productId, page: 1, limit: 500 }),
      ]);
      setProduct(one(pr) || {});
      setVars(unwrap(vr).items || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Không tải được sản phẩm");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [productId]);

  const quickChange = (key, value) => setQuick((old) => ({ ...old, [key]: value }));

  const saveQuickVariant = async (e) => {
    e?.preventDefault();
    if (!String(quick.sku || "").trim()) return setError("SKU của variant phải có.");
    if (quick.price === "" || Number(quick.price) <= 0) return setError("Giá bán phải lớn hơn 0.");
    if (quick.compareAtPrice !== "" && Number(quick.compareAtPrice) <= Number(quick.price)) return setError("Giá gốc phải lớn hơn Giá bán nếu muốn áp dụng giảm giá.");
    setQuickSaving(true); setError(""); setMessage("");
    try {
      await variants.create({
        product: id(productId),
        sku: String(quick.sku).trim(),
        barcode: String(quick.barcode || "").trim(),
        attributes: {},
        price: Number(quick.price) || 0,
        compareAtPrice: Number(quick.compareAtPrice) || 0,
        costPrice: Number(quick.costPrice) || 0,
        stock: Number(quick.stock) || 0,
        reservedStock: Number(quick.reservedStock) || 0,
        thumbnail: String(quick.thumbnail || "").trim(),
        images: String(quick.images || "").split("\n").map(x => x.trim()).filter(Boolean),
        weight: Number(quick.weight) || 0,
        dimensions: { length: Number(quick.length) || 0, width: Number(quick.width) || 0, height: Number(quick.height) || 0 },
        active: Boolean(quick.active),
      });
      setQuick({ sku: "", barcode: "", price: "", compareAtPrice: "", costPrice: "", stock: "", reservedStock: "", thumbnail: "", images: "", weight: "", length: "", width: "", height: "", active: true });
      await load();
      const fresh = await variants.list({ product: productId, page: 1, limit: 500 });
      const freshItems = unwrap(fresh).items || [];
      await products.update(productId, { isOnSale: freshItems.some(v => discountInfo(v.price, v.compareAtPrice).active) });
      setMessage("Đã tạo variant nhanh cho sản phẩm.");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Tạo variant thất bại");
    } finally { setQuickSaving(false); }
  };

  const stats = useMemo(() => {
    const stock = vars.reduce((n, v) => n + Number(v.stock || 0), 0);
    const prices = vars.map(v => Number(v.price)).filter(Number.isFinite);
    const saleCount = vars.filter(v => discountInfo(v.price, v.compareAtPrice).active).length;
    return { stock, min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0, saleCount };
  }, [vars]);

  const generated = useMemo(() => buildCombinations(groups.filter(g => g.key && String(g.label || "").trim() && g.values.length)), [groups]);

  const updateGroup = (index, patch) => setGroups((old) => old.map((g, i) => i === index ? { ...g, ...patch } : g));
  const addGroup = () => {
    if (groups.length >= 3) return;
    const used = new Set(groups.map(g => g.key));
    const preset = ATTRIBUTE_PRESETS.find(x => !used.has(x.key));
    setGroups([...groups, { label: preset?.label || "Thuộc tính", key: preset?.key || `attr_${Date.now()}`, values: [] }]);
  };
  const removeGroup = (index) => {
    if (groups.length <= 1) return;
    setGroups(groups.filter((_, i) => i !== index));
  };
  const addValue = (index, raw) => {
    const values = normalizeValues(raw.split(","));
    if (!values.length) return;
    updateGroup(index, { values: normalizeValues([...groups[index].values, ...values]) });
  };
  const removeValue = (groupIndex, value) => updateGroup(groupIndex, { values: groups[groupIndex].values.filter(v => v !== value) });

  const makeRows = () => {
    setError(""); setMessage("");
    if (!generated.length) return setError("Hãy tạo ít nhất 1 thuộc tính và nhập giá trị trước.");
    const existingMap = new Map(vars.map(v => [comboKey(v.attributes), v]));
    const next = generated.map((attrs) => {
      const old = existingMap.get(comboKey(attrs));
      return old ? {
        ...emptyRow(attrs),
        ...old,
        _id: id(old),
        attributes: attrs,
        images: (old.images || []).join("\n"),
        length: old.dimensions?.length ?? "",
        width: old.dimensions?.width ?? "",
        height: old.dimensions?.height ?? "",
      } : emptyRow(attrs);
    });
    setRows(next);
    setMessage(`Đã tạo ${next.length} tổ hợp. Các variant đã có được tự động ghép lại theo thuộc tính.`);
  };

  const editExisting = (v) => {
    const attrs = v.attributes || {};
    const nextGroups = Object.entries(attrs).filter(([, value]) => String(value || "").trim()).map(([key, value]) => ({
      key,
      label: ATTRIBUTE_PRESETS.find(x => x.key === key)?.label || key,
      values: [String(value)],
    }));
    if (nextGroups.length) setGroups(nextGroups);
    setRows([{
      ...emptyRow(attrs), ...v, _id: id(v), attributes: attrs,
      images: (v.images || []).join("\n"),
      length: v.dimensions?.length ?? "", width: v.dimensions?.width ?? "", height: v.dimensions?.height ?? "",
    }]);
    setMessage("Đã đưa variant này vào bảng chỉnh sửa.");
  };

  const updateRow = (index, patch) => setRows((old) => old.map((r, i) => i === index ? { ...r, ...patch } : r));
  const deleteExisting = async (v) => {
    if (!v?._id && !id(v)) return;
    if (!window.confirm(`Xóa variant ${v.sku || Object.values(v.attributes || {}).join(" / ")}?`)) return;
    try { await variants.remove(id(v)); await load(); setMessage("Đã xóa variant."); }
    catch (e) { setError(e?.response?.data?.message || e.message || "Xóa variant thất bại"); }
  };

  const deleteRow = async (index) => {
    const row = rows[index];
    if (!row?._id) return setRows(rows.filter((_, i) => i !== index));
    if (!window.confirm(`Xóa variant ${row.sku || Object.values(row.attributes || {}).join(" / ")}?`)) return;
    try {
      await variants.remove(row._id);
      setRows(rows.filter((_, i) => i !== index));
      await load();
    } catch (e) { setError(e?.response?.data?.message || e.message || "Xóa variant thất bại"); }
  };

  const saveRows = async () => {
    if (!rows.length) return setError("Chưa có tổ hợp nào để lưu.");
    const invalid = rows.findIndex(r => !String(r.sku || "").trim());
    if (invalid >= 0) return setError(`Dòng ${invalid + 1} chưa có SKU.`);
    const invalidPrice = rows.findIndex(r => !Number.isFinite(Number(r.price)) || Number(r.price) <= 0);
    if (invalidPrice >= 0) return setError(`Dòng ${invalidPrice + 1}: Giá bán phải lớn hơn 0.`);
    const invalidCompare = rows.findIndex(r => String(r.compareAtPrice || "").trim() !== "" && Number(r.compareAtPrice) <= Number(r.price));
    if (invalidCompare >= 0) return setError(`Dòng ${invalidCompare + 1}: Giá gốc phải lớn hơn Giá bán.`);
    setSaving(true); setError(""); setMessage("");
    try {
      for (const r of rows) {
        const data = {
          product: id(productId),
          sku: String(r.sku).trim(),
          barcode: String(r.barcode || "").trim(),
          attributes: Object.fromEntries(Object.entries(r.attributes || {}).filter(([, value]) => String(value || "").trim()).map(([k, v]) => [k, String(v).trim()])),
          price: Number(r.price) || 0,
          compareAtPrice: Number(r.compareAtPrice) || 0,
          costPrice: Number(r.costPrice) || 0,
          stock: Number(r.stock) || 0,
          reservedStock: Number(r.reservedStock) || 0,
          thumbnail: String(r.thumbnail || "").trim(),
          images: String(r.images || "").split("\n").map(x => x.trim()).filter(Boolean),
          weight: Number(r.weight) || 0,
          dimensions: { length: Number(r.length) || 0, width: Number(r.width) || 0, height: Number(r.height) || 0 },
          active: Boolean(r.active),
        };
        if (r._id) await variants.update(r._id, data);
        else await variants.create(data);
      }
      const fresh = await variants.list({ product: productId, page: 1, limit: 500 });
      const freshItems = unwrap(fresh).items || [];
      setVars(freshItems);
      const existingMap = new Map(freshItems.map(v => [comboKey(v.attributes), v]));
      setRows(rows.map(r => ({ ...r, _id: r._id || id(existingMap.get(comboKey(r.attributes))) })));
      await products.update(productId, { isOnSale: freshItems.some(v => discountInfo(v.price, v.compareAtPrice).active) });
      setMessage(`Đã lưu ${rows.length} variant cho sản phẩm.`);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Lưu variant thất bại");
    } finally { setSaving(false); }
  };

  const allCurrentRows = useMemo(() => {
    const rowKeys = new Set(rows.map(r => comboKey(r.attributes)));
    return vars.filter(v => !rowKeys.has(comboKey(v.attributes)));
  }, [rows, vars]);

  const productThumb = product?.thumbnail || product?.images?.[0] || vars.find(v => v.thumbnail)?.thumbnail;
  const visibleVars = vars.filter(v => {
    const term = String(variantSearch || "").trim().toLowerCase();
    if (!term) return true;
    return String(v.sku || "").toLowerCase().includes(term) ||
      Object.values(v.attributes || {}).some(x => String(x).toLowerCase().includes(term));
  });

  return <Page title="Chi tiết sản phẩm" actions={<>
    <Link className="btn" to="/admin/products">← Danh sách</Link>
    <Link className="btn primary" to={`/admin/products/${productId}/edit`}>Sửa sản phẩm</Link>
  </>}>
    {error && <div className="error product-detail-error">{error}</div>}
    {message && <div className="success product-detail-success">{message}</div>}
    {loading ? <div className="panel">Đang tải sản phẩm...</div> : <>
      <section className="product-overview panel">
        <div className="product-hero">
          {productThumb ? <img className="product-hero-image" src={productThumb} alt="" /> : <div className="product-hero-image product-hero-placeholder">{String(product?.name || "SP").slice(0,2).toUpperCase()}</div>}
          <div className="product-hero-info">
            <div className="product-title-line">
              <h2>{product?.name || "Sản phẩm"}</h2>
              <span className={`status-badge status-${product?.status || "draft"}`}>{product?.status === "active" ? "Đang bán" : product?.status === "inactive" ? "Ngừng bán" : product?.status === "out_of_stock" ? "Hết hàng" : "Nháp"}</span>
            </div>
            <div className="product-meta-line">
              {product?.sku && <span>SKU: <b>{product.sku}</b></span>}
              <span>Danh mục: <b>{product?.category?.name || idOf(product?.category) || "—"}</b></span>
              {product?.brand?.name && <span>Thương hiệu: <b>{product.brand.name}</b></span>}
            </div>
            {product?.shortDescription && <p>{product.shortDescription}</p>}
          </div>
        </div>
        <div className="product-stats">
          <div><span>Variant</span><b>{vars.length}</b></div>
          <div><span>Tổng tồn</span><b>{stats.stock}</b></div>
          <div><span>Có thể bán</span><b>{vars.reduce((n,v) => n + Math.max(Number(v.stock||0)-Number(v.reservedStock||0),0),0)}</b></div>
          <div><span>Khoảng giá</span><b>{stats.min || stats.max ? `${money(stats.min)} – ${money(stats.max)} ₫` : "—"}</b></div>
          <div><span>Đang giảm</span><b>{stats.saleCount}/{vars.length}</b></div>
          <div><span>Đã bán</span><b>{Number(product?.soldCount || 0).toLocaleString("vi-VN")}</b></div>
        </div>
      </section>

      <section className="panel variant-overview">
        <div className="section-head">
          <div><h2>Danh sách Variant</h2><p className="muted">Mỗi Variant là một SKU bán hàng riêng, có giá và tồn kho riêng.</p></div>
          <div className="variant-tools">
            <div className="product-search compact"><span>⌕</span><input value={variantSearch} onChange={e => setVariantSearch(e.target.value)} placeholder="Tìm SKU / màu / size..." /></div>
            <button className="btn" onClick={() => document.getElementById("variant-builder")?.scrollIntoView({behavior:"smooth"})}>Quản lý Variant</button>
          </div>
        </div>
        <div className="variant-summary-bar">
          <span><b>{visibleVars.length}</b> đang hiển thị</span>
          <span>·</span><span>{vars.filter(v => v.active !== false).length} đang hoạt động</span>
        </div>
        {!visibleVars.length ? <div className="empty">Chưa có Variant phù hợp.</div> :
        <div className="variant-cards">
          {visibleVars.map((v, i) => {
            const available = Math.max(Number(v.stock||0) - Number(v.reservedStock||0), 0);
            const image = v.thumbnail || v.images?.[0];
            return <div className={`variant-card ${v.active === false ? "is-inactive" : ""}`} key={id(v) || i}>
              <div className="variant-card-top">
                {image ? <img src={image} alt="" /> : <div className="variant-image-placeholder">SP</div>}
                <div className="variant-card-title">
                  <div className="variant-attributes">{attrs(v).length ? attrs(v).map(([k,x]) => <span key={k}><b>{k}</b>{x}</span>) : <span>Mặc định</span>}</div>
                  <b className="variant-sku">{v.sku || "Chưa có SKU"}</b>
                </div>
                <span className={`active-dot ${v.active === false ? "off" : ""}`}>{v.active === false ? "Tắt" : "Bật"}</span>
              </div>
              {(() => { const sale = discountInfo(v.price, v.compareAtPrice); return <div className="variant-card-price-block">
                <div className="variant-card-price">{money(v.price)} ₫ {sale.active && <span className="discount-badge">-{sale.percent}%</span>}</div>
                {sale.active ? <div className="variant-card-old-price">Giá gốc: <s>{money(v.compareAtPrice)} ₫</s> · Tiết kiệm {money(sale.saving)} ₫</div> : <div className="variant-card-old-price muted">Không áp dụng giảm giá</div>}
              </div>; })()}
              <div className="variant-card-grid">
                <div><span>Tồn kho</span><b>{Number(v.stock||0)}</b></div>
                <div><span>Đã giữ</span><b>{Number(v.reservedStock||0)}</b></div>
                <div><span>Có thể bán</span><b className={available <= 0 ? "stock-zero" : ""}>{available}</b></div>
              </div>
              <div className="variant-card-footer">
                <span>{discountInfo(v.price, v.compareAtPrice).active ? "Đang áp dụng giá giảm" : "Giá bán thường"}</span>
                <button className="btn small" onClick={() => editExisting(v)}>Chỉnh sửa</button>
              </div>
            </div>;
          })}
        </div>}
      </section>

      {(!vars.length) && <div className="panel quick-variant-panel">
        <div className="section-head"><div><h2>Tạo Variant đầu tiên</h2><p className="muted">Backend yêu cầu Product luôn có ít nhất một Variant có giá bán.</p></div></div>
        <form className="formgrid" onSubmit={saveQuickVariant}>
          <label>SKU *<input value={quick.sku} onChange={e => quickChange("sku", e.target.value)} placeholder="VD: SP001" /></label>
          <label>Barcode<input value={quick.barcode} onChange={e => quickChange("barcode", e.target.value)} /></label>
          <label>Giá bán *<input type="number" min="0" value={quick.price} onChange={e => quickChange("price", e.target.value)} /></label>
          <label>Giá gốc (trước giảm)<input type="number" min="0" value={quick.compareAtPrice} onChange={e => quickChange("compareAtPrice", e.target.value)} /></label>
          <label>Giá vốn<input type="number" min="0" value={quick.costPrice} onChange={e => quickChange("costPrice", e.target.value)} /></label>
          <label>Tồn kho<input type="number" min="0" value={quick.stock} onChange={e => quickChange("stock", e.target.value)} /></label>
          <label>Tồn giữ<input type="number" min="0" value={quick.reservedStock} onChange={e => quickChange("reservedStock", e.target.value)} /></label>
          <label>Khối lượng<input type="number" min="0" value={quick.weight} onChange={e => quickChange("weight", e.target.value)} /></label>
          <label>Thumbnail<input value={quick.thumbnail} onChange={e => quickChange("thumbnail", e.target.value)} /></label>
          <label className="full">Ảnh Variant (mỗi URL một dòng)<textarea value={quick.images} onChange={e => quickChange("images", e.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={quick.active} onChange={e => quickChange("active", e.target.checked)} /> Hoạt động</label>
          <div className="full"><Btn type="submit" disabled={quickSaving}>{quickSaving ? "Đang tạo..." : "Tạo Variant"}</Btn></div>
        </form>
      </div>}

      <section id="variant-builder" className="panel variation-builder">
        <div className="section-head">
          <div><h2>Quản lý phân loại</h2><p className="muted">Tạo tổ hợp Màu / Size / Dung lượng... rồi nhập dữ liệu cho từng Variant.</p></div>
          <button className="btn" onClick={addGroup} disabled={groups.length >= 3}>+ Thêm thuộc tính</button>
        </div>
        {groups.map((g, i) => <div className="attribute-row" key={`${g.key}-${i}`}>
          <div className="attribute-title">
            <select value={ATTRIBUTE_PRESETS.some(x => x.key === g.key) ? g.key : "__custom__"} onChange={e => {
              const key = e.target.value;
              if (key === "__custom__") updateGroup(i, { key: `attr_${Date.now()}`, label: "", custom: true });
              else { const preset = ATTRIBUTE_PRESETS.find(x => x.key === key); updateGroup(i, { key, label: preset?.label || key, custom: false }); }
            }}>
              {ATTRIBUTE_PRESETS.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
              <option value="__custom__">+ Nhập tên mới...</option>
            </select>
            {(!ATTRIBUTE_PRESETS.some(x => x.key === g.key) || g.custom) && <input className="custom-attribute-name" value={g.label || ""} onChange={e => updateGroup(i, { label: e.target.value })} placeholder="Tên thuộc tính mới" />}
          </div>
          <div className="attribute-values">
            <div className="value-input"><input placeholder="Ví dụ: Đen, Trắng, Xanh" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addValue(i, e.currentTarget.value); e.currentTarget.value = ""; } }} /><button className="btn" onClick={e => { const input = e.currentTarget.previousSibling; addValue(i, input.value); input.value = ""; }}>Thêm</button></div>
            <div className="chips">{g.values.map(v => <span className="chip" key={v}>{v}<button onClick={() => removeValue(i, v)}>×</button></span>)}{!g.values.length && <span className="muted">Chưa có giá trị</span>}</div>
          </div>
          <button className="ghost remove-attr" onClick={() => removeGroup(i)} disabled={groups.length <= 1}>×</button>
        </div>)}
        <div className="builder-actions"><span className="muted">{generated.length ? `Sẽ tạo ${generated.length} tổ hợp` : "Chưa đủ dữ liệu để tạo tổ hợp"}</span><Btn onClick={makeRows}>Tạo các Variant</Btn></div>
      </section>

      <section className="panel variation-table">
        <div className="section-head"><div><h2>Chỉnh sửa Variant {rows.length ? `(${rows.length})` : ""}</h2><p className="muted">Có thể sửa trực tiếp giá, tồn, SKU và ảnh. Lưu một lần cho toàn bộ bảng.</p></div><Btn disabled={!rows.length || saving} onClick={saveRows}>{saving ? "Đang lưu..." : "Lưu tất cả"}</Btn></div>
        {!rows.length ? <div className="empty">Chưa có dòng chỉnh sửa. Chọn phân loại ở trên rồi bấm <b>Tạo các Variant</b>.</div> :
        <div className="variant-editor-wrap"><table className="variant-editor management-table"><thead><tr><th>Phân loại</th><th>SKU *</th><th>Giá bán</th><th>Giá gốc</th><th>Giảm</th><th>Tồn</th><th>Ảnh</th><th>Hoạt động</th><th></th></tr></thead><tbody>
          {rows.map((r, i) => <tr key={`${comboKey(r.attributes)}-${i}`}>
            <td><div className="attr-badges">{Object.entries(r.attributes || {}).map(([k,v]) => <span key={k}>{ATTRIBUTE_PRESETS.find(x => x.key === k)?.label || groups.find(g => g.key === k)?.label || k}: <b>{v}</b></span>)}</div></td>
            <td><input value={r.sku || ""} onChange={e => updateRow(i, { sku: e.target.value })} placeholder="SKU" /></td>
            <td><input type="number" min="0" value={r.price} onChange={e => updateRow(i, { price: e.target.value })} /></td>
            <td><input type="number" min="0" value={r.compareAtPrice} onChange={e => updateRow(i, { compareAtPrice: e.target.value })} /></td>
            <td>{(() => { const sale = discountInfo(r.price, r.compareAtPrice); return sale.active ? <div className="discount-preview"><b>-{sale.percent}%</b><span>Tiết kiệm {money(sale.saving)} ₫</span></div> : <span className="muted">—</span>; })()}</td>
            <td><input type="number" min="0" value={r.stock} onChange={e => updateRow(i, { stock: e.target.value })} /></td>
            <td><input value={r.thumbnail || ""} onChange={e => updateRow(i, { thumbnail: e.target.value })} placeholder="URL ảnh" /></td>
            <td><input type="checkbox" checked={Boolean(r.active)} onChange={e => updateRow(i, { active: e.target.checked })} /></td>
            <td><Danger onClick={() => deleteRow(i)}>Xóa</Danger></td>
          </tr>)}
        </tbody></table></div>}
      </section>

      {allCurrentRows.length > 0 && <section className="panel">
        <div className="section-head"><div><h2>Variant khác ({allCurrentRows.length})</h2><p className="muted">Những Variant hiện có nhưng chưa nằm trong bộ phân loại đang chỉnh. Chúng vẫn còn nguyên trong backend.</p></div></div>
        <div className="orphan-variants">{allCurrentRows.map(v => <div className="orphan-variant" key={id(v)}>
          <div><b>{v.sku}</b><span>{attrs(v).map(([k,x]) => `${k}: ${x}`).join(" / ") || "Mặc định"}</span></div>
          <strong>{money(v.price)} ₫</strong><span>Tồn {v.stock || 0}</span>
          <div><button className="btn small" onClick={() => editExisting(v)}>Đưa vào sửa</button><Danger onClick={() => deleteExisting(v)}>Xóa</Danger></div>
        </div>)}</div>
      </section>}
    </>}
  </Page>;
}
