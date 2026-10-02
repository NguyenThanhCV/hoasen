import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Page, Btn, Danger, Money } from "../components/UI";
import { products, variants, categories, brands } from "../api";
import { unwrap, err, idOf } from "../utils/helpers";
import { loadPromotions, discountForProduct } from "../utils/promotions";
import Media from "../components/Media";

const PAGE_SIZE = 20;
const listOf = (r) => unwrap(r).items || [];
const money = (v) => Number(v || 0).toLocaleString("vi-VN");
const discountInfo = (price, compareAtPrice) => {
  const current = Number(price); const original = Number(compareAtPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current || original <= 0) return null;
  return Math.round(((original - current) / original) * 100);
};
const attrs = (v) => Object.entries(v?.attributes || {}).filter(([, x]) => String(x).trim());

function ProductImage({ src, name }) {
  return src ? <Media className="product-thumb" src={src} alt={name || ""} /> :
    <div className="product-thumb product-thumb-placeholder">{String(name || "SP").slice(0, 2).toUpperCase()}</div>;
}

function VariantPills({ items = [] }) {
  if (!items.length) return <span className="muted">Chưa có Variant</span>;
  return <div className="variant-pills">
    {items.slice(0, 5).map((v, i) => (
      <span className="variant-pill" key={idOf(v) || i}>
        {attrs(v).length ? attrs(v).map(([k, x]) => `${k}: ${x}`).join(" · ") : "Mặc định"}
      </span>
    ))}
    {items.length > 5 && <span className="variant-more">+{items.length - 5}</span>}
  </div>;
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [hasVariants, setHasVariants] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variantData, setVariantData] = useState({});
  const [promotions, setPromotions] = useState(loadPromotions);
  useEffect(() => { const sync = () => setPromotions(loadPromotions()); window.addEventListener('promotions-changed', sync); return () => window.removeEventListener('promotions-changed', sync); }, []);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadOptions = async () => {
    try {
      const [cr, br] = await Promise.all([
        categories.list({ page: 1, limit: 500 }),
        brands.list({ page: 1, limit: 500 }),
      ]);
      setCategoriesList(listOf(cr));
      setBrandsList(listOf(br));
    } catch (e) { setError(err(e)); }
  };

  const load = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const r = await products.list({
        page: targetPage, limit: PAGE_SIZE,
        search: q.trim() || undefined,
        category: category || undefined,
        brand: brand || undefined,
        status: status || undefined,
        hasVariants: hasVariants === "" ? undefined : hasVariants === "true",
      });
      const data = unwrap(r);
      const productItems = data.items || [];
      setItems(productItems);
      setTotal(Number(data.total || 0));
      setPage(targetPage);

      const next = {};
      await Promise.all(productItems.map(async (p) => {
        try {
          const vr = await variants.list({ product: idOf(p), page: 1, limit: 100 });
          const vdata = unwrap(vr);
          next[idOf(p)] = vdata.items || [];
        } catch { next[idOf(p)] = []; }
      }));
      setVariantData(next);
    } catch (e) {
      setError(err(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { load(1); }, [category, brand, status, hasVariants]);

  const reset = () => {
    setQ(""); setCategory(""); setBrand(""); setStatus(""); setHasVariants(""); setPage(1);
    setTimeout(() => load(1), 0);
  };

  const remove = async (p) => {
    const pid = idOf(p);
    const count = (variantData[pid] || []).length;
    if (!window.confirm(`Xóa sản phẩm "${p.name || "này"}"?`)) return;
    if (count > 0 && !window.confirm(`Sản phẩm đang có ${count} Variant. Bạn vẫn muốn xóa?`)) return;
    try {
      await products.remove(pid);
      await load(page > 1 && items.length === 1 ? page - 1 : page);
    } catch (e) { setError(err(e)); }
  };

  return <Page title="Sản phẩm" actions={<Link className="btn primary" to="/admin/products/new">+ Thêm sản phẩm</Link>}>
    {error && <div className="error product-list-error">{error}</div>}

    <div className="product-toolbar">
      <div className="product-search">
        <span>⌕</span>
        <input placeholder="Tìm tên, SKU hoặc slug…" value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load(1)} />
      </div>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Tất cả danh mục</option>
        {categoriesList.map(x => <option key={idOf(x)} value={idOf(x)}>{x.name}</option>)}
      </select>
      <select value={brand} onChange={e => setBrand(e.target.value)}>
        <option value="">Tất cả thương hiệu</option>
        {brandsList.map(x => <option key={idOf(x)} value={idOf(x)}>{x.name}</option>)}
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">Tất cả trạng thái</option>
        <option value="active">Đang bán</option>
        <option value="inactive">Ngừng bán</option>
        <option value="draft">Nháp</option>
      </select>
      <select value={hasVariants} onChange={e => setHasVariants(e.target.value)}>
        <option value="">Tất cả loại</option>
        <option value="true">Có phân loại</option>
        <option value="false">Không phân loại</option>
      </select>
      <Btn onClick={() => load(1)}>Tìm</Btn>
      <button className="btn" type="button" onClick={reset}>Đặt lại</button>
    </div>

    <div className="product-list-head">
      <div><b>{total}</b> sản phẩm <span className="muted">· Giá và tồn kho lấy theo Variant</span></div>
      <div className="muted">Trang {page}/{pages}</div>
    </div>

    {loading ? <div className="panel">Đang tải sản phẩm...</div> : <div className="product-table-wrap">
      <table className="product-table">
        <thead><tr>
          <th>Sản phẩm</th><th>Phân loại / Variant</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th></th>
        </tr></thead>
        <tbody>
          {items.map(p => {
            const pid = idOf(p);
            const vs = variantData[pid] || [];
            const prices = vs.map(v => Number(v.price)).filter(Number.isFinite);
            const stock = vs.reduce((n, v) => n + Number(v.stock || 0), 0);
            const available = vs.reduce((n, v) => n + Math.max(Number(v.stock || 0) - Number(v.reservedStock || 0), 0), 0);
            const thumb = p.thumbnail || p.images?.[0] || vs.find(v => v.thumbnail)?.thumbnail || p.video;
            const discounts = vs.map(v => discountInfo(v.price, v.compareAtPrice)).filter(v => v != null);
            const promo = discountForProduct(p, promotions);
            const saleMin = discounts.length ? Math.min(...discounts) : 0;
            const saleMax = discounts.length ? Math.max(...discounts) : 0;
            return <tr key={pid}>
              <td>
                <Link className="product-main-cell" to={`/admin/products/${pid}`}>
                  <ProductImage src={thumb} name={p.name} />
                  <div className="product-main-info">
                    <b>{p.name || "—"}</b>
                    <span>{p.sku ? `SKU: ${p.sku}` : "Chưa có SKU chung"}</span>
                    <small>{p.category?.name || "Chưa có danh mục"}{p.brand?.name ? ` · ${p.brand.name}` : ""}</small>
                  </div>
                </Link>
              </td>
              <td>
                <div className="variant-count"><strong>{vs.length}</strong><span>Variant</span></div>
                <VariantPills items={vs} />
              </td>
              <td>
                {prices.length ? <div className="price-range">
                  {prices.length === 1 ? `${money(prices[0])} ₫` : `${money(Math.min(...prices))} – ${money(Math.max(...prices))} ₫`}
                  {promo ? <div className="list-sale-line"><span className="discount-badge">KM -{promo.type === 'percent' ? `${promo.value}%` : `${money(promo.value)} ₫`}</span><small>{promo.scope === 'product' ? 'Theo sản phẩm' : promo.scope === 'category' ? 'Theo danh mục' : 'Theo thương hiệu'}</small></div> : discounts.length ? <div className="list-sale-line"><span className="discount-badge">-{saleMin === saleMax ? saleMin : `${saleMin}–${saleMax}`}%</span><small>{discounts.length}/{vs.length} Variant đang giảm</small></div> : <small className="muted">Không giảm giá</small>}
                </div> : <span className="muted">Chưa có giá</span>}
              </td>
              <td>
                <div className="stock-box"><b>{stock}</b><span>Có thể bán {available}</span></div>
              </td>
              <td><span className={`status-badge status-${p.status || "draft"}`}>{p.status === "active" ? "Đang bán" : p.status === "inactive" ? "Ngừng bán" : p.status === "out_of_stock" ? "Hết hàng" : "Nháp"}</span></td>
              <td><div className="actions">
                <Link className="btn small" to={`/admin/products/${pid}`}>Chi tiết</Link>
                <Link className="btn small" to={`/admin/products/${pid}/edit`}>Sửa</Link>
                <Danger onClick={() => remove(p)}>Xóa</Danger>
              </div></td>
            </tr>;
          })}
          {!items.length && <tr><td colSpan="6" className="empty">Không có sản phẩm phù hợp.</td></tr>}
        </tbody>
      </table>
    </div>}

    {!loading && <div className="product-pagination">
      <span className="muted">Trang {page}/{pages}</span>
      <div><button className="btn" disabled={page <= 1} onClick={() => load(page - 1)}>← Trước</button><button className="btn" disabled={page >= pages} onClick={() => load(page + 1)}>Sau →</button></div>
    </div>}
  </Page>;
}
