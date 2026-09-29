import React, { useEffect, useMemo, useState } from 'react';
import { Page, Table, Btn, Danger, Modal } from '../components/UI';
import { brands } from '../api';

const empty = {
  name: '',
  slug: '',
  logo: '',
  description: '',
  website: '',
  sortOrder: 1,
  status: 'active',
  orderMode: 'auto'
};

const idOf = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return String(v._id || v.id || v.$oid || '');
};

const slugify = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

function itemsFrom(res) {
  const data = unwrap(res);
  return Array.isArray(data) ? data : (data?.items || data?.brands || []);
}

export default function BrandsPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await brands.list({ page: 1, limit: 500 });
      setRows(itemsFrom(r));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Không tải được thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = q
      ? rows.filter(r =>
          String(r.name || '').toLowerCase().includes(q) ||
          String(r.slug || '').toLowerCase().includes(q) ||
          String(r.website || '').toLowerCase().includes(q))
      : rows;
    return [...source].sort((a, b) =>
      Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) ||
      String(a.name || '').localeCompare(String(b.name || ''), 'vi')
    );
  }, [rows, query]);

  const maxOrder = (excludeId = '') =>
    rows.filter(r => idOf(r) !== excludeId)
      .reduce((max, r) => Math.max(max, Number(r.sortOrder) || 0), 0);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...empty, sortOrder: maxOrder() + 1, orderMode: 'auto' });
    setError('');
    setOpen(true);
  };

  const openEdit = async (row) => {
    const id = idOf(row);
    setEditingId(id);
    setError('');
    setOpen(true);
    try {
      const r = await brands.get(id);
      const z = unwrap(r) || row;
      setForm({
        name: z.name || '',
        slug: z.slug || '',
        logo: z.logo || '',
        description: z.description || '',
        website: z.website || '',
        sortOrder: Math.max(1, Number(z.sortOrder ?? 1)),
        status: z.status || 'active',
        orderMode: 'manual'
      });
    } catch (e) {
      setForm({
        name: row.name || '',
        slug: row.slug || '',
        logo: row.logo || '',
        description: row.description || '',
        website: row.website || '',
        sortOrder: Math.max(1, Number(row.sortOrder ?? 1)),
        status: row.status || 'active',
        orderMode: 'manual'
      });
      setError(e?.response?.data?.message || 'Không lấy được dữ liệu mới nhất, đang dùng dữ liệu danh sách.');
    }
  };

  const change = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !editingId && !prev.slug) next.slug = slugify(value);
      if (key === 'orderMode' && value === 'auto') next.sortOrder = maxOrder(editingId || '') + 1;
      return next;
    });
  };

  const normalize = async (items) => {
    const ordered = [...items].sort((a, b) =>
      Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) ||
      String(a.name || '').localeCompare(String(b.name || ''), 'vi')
    );
    for (let i = 0; i < ordered.length; i += 1) {
      const id = idOf(ordered[i]);
      const desired = i + 1;
      if (Number(ordered[i].sortOrder ?? 0) !== desired) {
        await brands.update(id, { sortOrder: desired });
      }
    }
  };

  const save = async () => {
    setError('');
    if (!form.name.trim()) return setError('Tên thương hiệu là bắt buộc.');
    const slug = slugify(form.slug || form.name);
    if (!slug) return setError('Slug không hợp lệ.');

    setSaving(true);
    try {
      let savedId = editingId;
      if (!editingId) {
        const position = form.orderMode === 'auto'
          ? maxOrder() + 1
          : Math.max(1, Math.min(Number(form.sortOrder) || 1, rows.length + 1));

        const r = await brands.create({
          name: form.name.trim(),
          slug,
          logo: form.logo.trim(),
          description: form.description.trim(),
          website: form.website.trim(),
          sortOrder: position,
          status: form.status
        });
        savedId = idOf(unwrap(r));
      } else {
        await brands.update(editingId, {
          name: form.name.trim(),
          slug,
          logo: form.logo.trim(),
          description: form.description.trim(),
          website: form.website.trim(),
          sortOrder: Math.max(1, Number(form.sortOrder) || 1),
          status: form.status
        });
      }

      // Re-read the database after writing. This keeps the frontend in sync
      // without changing any backend endpoint.
      const latest = itemsFrom(await brands.list({ page: 1, limit: 500 }));
      if (!savedId) {
        const found = latest.find(x =>
          slugify(x.slug || '') === slug && String(x.name || '').trim() === form.name.trim()
        );
        savedId = idOf(found);
      }

      let ordered = latest.filter(x => idOf(x) !== savedId);
      const target = latest.find(x => idOf(x) === savedId);

      if (target) {
        const position = form.orderMode === 'auto'
          ? ordered.length + 1
          : Math.max(1, Math.min(Number(form.sortOrder) || 1, ordered.length + 1));
        ordered.splice(position - 1, 0, target);
      }

      await normalize(ordered);
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      await load();
    } catch (e) {
      const d = e?.response?.data;
      setError(d?.message || d?.error || e?.message || 'Lưu thương hiệu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!confirm(`Xóa thương hiệu "${row.name}"?`)) return;
    try {
      await brands.remove(idOf(row));
      const latest = itemsFrom(await brands.list({ page: 1, limit: 500 }));
      await normalize(latest);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Xóa thương hiệu thất bại');
    }
  };

  return <Page title="Thương hiệu" actions={<Btn onClick={openAdd}>+ Thêm thương hiệu</Btn>}>
    <div className="toolbar">
      <input
        placeholder="Tìm tên, slug, website..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Btn onClick={load}>Làm mới</Btn>
    </div>

    {error && !open && <div className="errorbox">{error}</div>}

    {loading ? <div className="empty">Đang tải...</div> :
      <Table rows={filtered} columns={[
        { key: 'sortOrder', label: 'STT', render: r => <b>{r.sortOrder ?? '—'}</b> },
        { key: 'logo', label: 'Logo', render: r => r.logo
          ? <img src={r.logo} alt={r.name || ''} style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 6 }} />
          : '—' },
        { key: 'name', label: 'Thương hiệu', render: r => <b>{r.name}</b> },
        { key: 'slug', label: 'Slug' },
        { key: 'website', label: 'Website', render: r => r.website || '—' },
        { key: 'status', label: 'Trạng thái' },
        { key: 'actions', label: 'Thao tác', render: r =>
          <span className="actions">
            <Btn onClick={() => openEdit(r)}>Sửa</Btn>
            <Danger onClick={() => remove(r)}>Xóa</Danger>
          </span> }
      ]} />
    }

    {open && <Modal title={editingId ? 'Sửa thương hiệu' : 'Thêm thương hiệu'} onClose={() => !saving && setOpen(false)}>
      {error && <div className="errorbox">{error}</div>}
      <div className="formgrid">
        <label>Tên thương hiệu *
          <input value={form.name} onChange={e => change('name', e.target.value)} />
        </label>

        <label>Slug
          <input value={form.slug} onChange={e => change('slug', e.target.value)} />
        </label>

        <label>Logo
          <input value={form.logo} placeholder="URL logo" onChange={e => change('logo', e.target.value)} />
        </label>

        <label>Website
          <input value={form.website} placeholder="https://..." onChange={e => change('website', e.target.value)} />
        </label>

        <label>Thứ tự
          <select value={form.orderMode} onChange={e => change('orderMode', e.target.value)}>
            <option value="auto">Tự động — cuối danh sách</option>
            <option value="manual">Chọn vị trí</option>
          </select>
        </label>

        <label>STT
          <input
            type="number"
            min="1"
            value={form.sortOrder}
            disabled={form.orderMode === 'auto'}
            onChange={e => change('sortOrder', e.target.value)}
          />
        </label>

        <label>Trạng thái
          <select value={form.status} onChange={e => change('status', e.target.value)}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>

        <label className="full">Mô tả
          <textarea value={form.description} onChange={e => change('description', e.target.value)} rows="4" />
        </label>

        <div className="full">
          <Btn onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thương hiệu'}</Btn>
        </div>
      </div>
    </Modal>}
  </Page>;
}
