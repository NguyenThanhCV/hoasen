import React, { useEffect, useMemo, useState } from 'react';
import { Page, Table, Btn, Danger, Modal } from '../components/UI';
import { categories } from '../api';

const empty = {
  name: '', nameEn: '', slug: '', description: '', descriptionEn: '', image: '', homeImage: '', parent: '',
  level: 0, sortOrder: 1, status: 'active', orderMode: 'auto'
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

function levelOf(row, byId, guard = new Set()) {
  const id = idOf(row);
  if (!row || !id || guard.has(id)) return 0;
  const parentId = idOf(row.parent);
  if (!parentId) return 0;
  const parent = byId[parentId];
  if (!parent) return 0;
  const nextGuard = new Set(guard);
  nextGuard.add(id);
  return levelOf(parent, byId, nextGuard) + 1;
}

function childrenOf(rows, parentId) {
  return rows
    .filter((r) => idOf(r.parent) === parentId)
    .sort((a, b) => {
      const ao = Number(a.sortOrder ?? 0);
      const bo = Number(b.sortOrder ?? 0);
      return ao - bo || String(a.name || '').localeCompare(String(b.name || ''), 'vi');
    });
}

function isDescendant(rows, candidateId, ancestorId) {
  let current = rows.find((r) => idOf(r) === candidateId);
  const seen = new Set();
  while (current) {
    const parentId = idOf(current.parent);
    if (!parentId || seen.has(parentId)) return false;
    if (parentId === ancestorId) return true;
    seen.add(parentId);
    current = rows.find((r) => idOf(r) === parentId);
  }
  return false;
}

export default function CategoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // Load the complete category set. Filtering is done on the client so the
      // parent/child tree and sibling ordering are never broken by search pagination.
      const r = await categories.list({ page: 1, limit: 500 });
      const data = unwrap(r);
      const items = Array.isArray(data)
        ? data
        : (data?.items || data?.categories || []);
      setRows(items);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byId = useMemo(
    () => Object.fromEntries(rows.map((x) => [idOf(x), x])),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const parent = byId[idOf(r.parent)];
      return String(r.name || '').toLowerCase().includes(q)
        || String(r.slug || '').toLowerCase().includes(q)
        || String(parent?.name || '').toLowerCase().includes(q);
    });
  }, [rows, query, byId]);

  const parents = useMemo(() => rows.filter((r) => {
    const id = idOf(r);
    if (!id || id === editingId) return false;
    if (editingId && isDescendant(rows, id, editingId)) return false;
    return true;
  }).sort((a, b) => {
    const la = levelOf(a, byId);
    const lb = levelOf(b, byId);
    return la - lb || Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)
      || String(a.name || '').localeCompare(String(b.name || ''), 'vi');
  }), [rows, editingId, byId]);

  const parentName = (value) => {
    const id = idOf(value);
    return id ? (byId[id]?.name || '—') : 'Danh mục gốc';
  };

  const siblingCount = (parentId, excludeId = '') =>
    rows.filter((r) => idOf(r.parent) === parentId && idOf(r) !== excludeId).length;

  const maxSiblingOrder = (parentId, excludeId = '') => {
    const siblings = rows.filter((r) => idOf(r.parent) === parentId && idOf(r) !== excludeId);
    return siblings.reduce((max, r) => Math.max(max, Number(r.sortOrder) || 0), 0);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...empty, sortOrder: maxSiblingOrder('') + 1 });
    setError('');
    setOpen(true);
  };

  const openEdit = async (row) => {
    const id = idOf(row);
    setEditingId(id);
    setError('');
    setOpen(true);
    setSaving(false);
    try {
      const r = await categories.get(id);
      const z = unwrap(r) || row;
      const parentId = idOf(z.parent);
      setForm({
        name: z.name || '',
        nameEn: z.nameEn || '',
        slug: z.slug || '',
        description: z.description || '',
        descriptionEn: z.descriptionEn || '',
        image: z.image || '',
        homeImage: z.homeImage || '',
        parent: parentId,
        level: Number(z.level ?? 0),
        sortOrder: Math.max(1, Number(z.sortOrder ?? 1)),
        status: z.status || 'active',
        orderMode: 'manual'
      });
    } catch (e) {
      setForm({
        name: row.name || '',
        nameEn: row.nameEn || '',
        slug: row.slug || '',
        description: row.description || '',
        descriptionEn: row.descriptionEn || '',
        image: row.image || '',
        homeImage: row.homeImage || '',
        parent: idOf(row.parent),
        level: Number(row.level ?? 0),
        sortOrder: Math.max(1, Number(row.sortOrder ?? 1)),
        status: row.status || 'active',
        orderMode: 'manual'
      });
      setError(e?.response?.data?.message || 'Không lấy được dữ liệu mới nhất, đang dùng dữ liệu danh sách.');
    }
  };

  const change = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !editingId && !prev.slug) next.slug = slugify(value);
      if (key === 'parent') {
        const p = byId[value];
        next.level = p ? levelOf(p, byId) + 1 : 0;
        if (prev.orderMode === 'auto') {
          next.sortOrder = maxSiblingOrder(value, editingId || '') + 1;
        }
      }
      if (key === 'orderMode' && value === 'auto') {
        next.sortOrder = maxSiblingOrder(prev.parent || '', editingId || '') + 1;
      }
      return next;
    });
  };

  const reorderGroup = (items, movedId, desiredPosition) => {
    const list = [...items].filter(Boolean);
    const index = list.findIndex((x) => idOf(x) === movedId);
    if (index >= 0) list.splice(index, 1);
    const pos = Math.max(0, Math.min(Number(desiredPosition) - 1, list.length));
    const moved = items.find((x) => idOf(x) === movedId);
    if (moved) list.splice(pos, 0, moved);
    return list;
  };

  const persistOrder = async (groups) => {
    // Persist only records whose order/level/parent changed. The existing
    // PATCH endpoint is reused; no backend/API changes are required.
    const updates = [];
    for (const group of groups) {
      for (let i = 0; i < group.items.length; i += 1) {
        const item = group.items[i];
        const desiredOrder = i + 1;
        const desiredLevel = Number(item.level ?? levelOf(item, byId));
        const desiredParent = idOf(item.parent) || null;
        if (Number(item.sortOrder ?? 0) !== desiredOrder || Number(item.level ?? 0) !== desiredLevel) {
          updates.push({ id: idOf(item), data: { sortOrder: desiredOrder, level: desiredLevel, parent: desiredParent } });
        }
      }
    }
    for (const u of updates) await categories.update(u.id, u.data);
  };

  const save = async () => {
    setError('');
    if (!form.name.trim()) return setError('Tên danh mục là bắt buộc.');
    const slug = slugify(form.slug || form.name);
    if (!slug) return setError('Slug không hợp lệ.');

    const parent = form.parent || null;
    if (editingId && parent && (parent === editingId || isDescendant(rows, parent, editingId))) {
      return setError('Không thể chọn chính nó hoặc danh mục con làm danh mục cha.');
    }

    const parentObj = parent ? byId[parent] : null;
    const desiredLevel = parentObj ? levelOf(parentObj, byId) + 1 : 0;
    const oldRow = editingId ? byId[editingId] : null;
    const oldParent = oldRow ? idOf(oldRow.parent) : '';
    const sameParent = editingId && oldParent === (parent || '');

    setSaving(true);
    try {
      let savedId = editingId;
      if (!editingId) {
        const position = form.orderMode === 'auto'
          ? maxSiblingOrder(parent || '') + 1
          : Math.max(1, Math.min(Number(form.sortOrder) || 1, siblingCount(parent || '') + 1));
        const data = {
          name: form.name.trim(), nameEn: form.nameEn.trim(), slug,
          description: form.description.trim(), descriptionEn: form.descriptionEn.trim(), image: form.image.trim(), homeImage: form.homeImage.trim(),
          parent, level: desiredLevel, sortOrder: position, status: form.status
        };
        const response = await categories.create(data);
        const created = unwrap(response);
        savedId = idOf(created);
      } else {
        const data = {
          name: form.name.trim(), nameEn: form.nameEn.trim(), slug,
          description: form.description.trim(), descriptionEn: form.descriptionEn.trim(), image: form.image.trim(), homeImage: form.homeImage.trim(),
          parent, level: desiredLevel,
          // Temporary value; final sibling order is normalized below.
          sortOrder: Math.max(1, Number(form.sortOrder) || 1),
          status: form.status
        };
        await categories.update(editingId, data);
      }

      // Refresh after the write so reordering always works from database state.
      const latestResponse = await categories.list({ page: 1, limit: 500 });
      const latestData = unwrap(latestResponse);
      const latest = Array.isArray(latestData)
        ? latestData
        : (latestData?.items || latestData?.categories || []);
      if (!savedId) {
        const matched = latest.find((x) => slugify(x.slug || '') === slug && String(x.name || '').trim() === form.name.trim());
        savedId = idOf(matched);
      }
      const latestById = Object.fromEntries(latest.map((x) => [idOf(x), x]));

      if (savedId && latestById[savedId]) {
        const target = latestById[savedId];
        const targetParent = idOf(target.parent);
        const allGroups = [];

        const oldGroup = childrenOf(latest, oldParent).filter((x) => idOf(x) !== savedId);
        const newGroup = childrenOf(latest, targetParent).filter((x) => idOf(x) !== savedId);

        if (editingId && !sameParent && oldParent !== targetParent) {
          allGroups.push({ parentId: oldParent, items: oldGroup });
        }

        const base = (editingId && sameParent) ? oldGroup : newGroup;
        const position = form.orderMode === 'auto'
          ? base.length + 1
          : Math.max(1, Math.min(Number(form.sortOrder) || 1, base.length + 1));
        const targetWithCorrectParent = { ...target, parent: target.parent, level: desiredLevel };
        const ordered = reorderGroup([...base, targetWithCorrectParent], savedId, position);
        allGroups.push({ parentId: targetParent, items: ordered });

        // Recalculate levels for all categories. This also handles moving a
        // parent category together with its descendants without changing API shape.
        const levelUpdates = latest.map((item) => ({
          ...item,
          level: levelOf(item, latestById)
        }));
        const levelMap = Object.fromEntries(levelUpdates.map((x) => [idOf(x), x.level]));
        allGroups.forEach((g) => {
          g.items = g.items.map((x) => ({ ...x, level: levelMap[idOf(x)] ?? x.level }));
        });

        // Normalize all sibling groups so no duplicate STT remains.
        const parentKeys = new Set(latest.map((x) => idOf(x.parent)));
        parentKeys.add(targetParent);
        if (editingId) parentKeys.add(oldParent);
        const groups = [];
        for (const parentKey of parentKeys) {
          let items = childrenOf(latest, parentKey);
          if (parentKey === targetParent) items = ordered;
          groups.push({ parentId: parentKey, items });
        }
        await persistOrder(groups);
      }

      setOpen(false);
      setEditingId(null);
      setForm(empty);
      await load();
    } catch (e) {
      const d = e?.response?.data;
      setError(d?.message || d?.error || e?.message || 'Lưu danh mục thất bại');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const id = idOf(row);
    const hasChildren = rows.some((x) => idOf(x.parent) === id);
    if (hasChildren) {
      alert('Không thể xóa danh mục này vì còn danh mục con. Hãy chuyển/xóa danh mục con trước.');
      return;
    }
    if (!confirm(`Xóa danh mục "${row.name}"?`)) return;
    try {
      await categories.remove(id);
      // Re-normalize the sibling STT after deletion using the same existing PATCH API.
      const latestResponse = await categories.list({ page: 1, limit: 500 });
      const latestData = unwrap(latestResponse);
      const latest = Array.isArray(latestData) ? latestData : (latestData?.items || latestData?.categories || []);
      const parentsSet = new Set(latest.map((x) => idOf(x.parent)));
      for (const parentId of parentsSet) {
        const items = childrenOf(latest, parentId);
        for (let i = 0; i < items.length; i += 1) {
          if (Number(items[i].sortOrder ?? 0) !== i + 1) {
            await categories.update(idOf(items[i]), { sortOrder: i + 1, level: Number(items[i].level ?? 0), parent: idOf(items[i].parent) || null });
          }
        }
      }
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Xóa danh mục thất bại');
    }
  };

  const displayRows = useMemo(() => {
    const source = filteredRows;
    const byParent = new Map();
    source.forEach((r) => {
      const p = idOf(r.parent);
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(r);
    });
    byParent.forEach((items) => items.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)));

    const result = [];
    const walk = (parentId, prefix = '') => {
      const items = byParent.get(parentId) || [];
      items.forEach((item, index) => {
        const number = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        result.push({ ...item, __displayOrder: number, __displayLevel: prefix ? prefix.split('.').length : 0 });
        walk(idOf(item), number);
      });
    };
    walk('');

    // If search hides a parent, append unmatched rows instead of losing them.
    const seen = new Set(result.map((x) => idOf(x)));
    source.forEach((x) => { if (!seen.has(idOf(x))) result.push({ ...x, __displayOrder: '—', __displayLevel: Number(x.level || 0) }); });
    return result;
  }, [filteredRows]);

  return <Page title="Danh mục" actions={<Btn onClick={openAdd}>+ Thêm danh mục</Btn>}>
    <div className="toolbar">
      <input placeholder="Tìm tên, slug, danh mục cha..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <Btn onClick={load}>Làm mới</Btn>
    </div>
    {error && !open && <div className="errorbox">{error}</div>}
    {loading ? <div className="empty">Đang tải...</div> :
      <Table rows={displayRows} columns={[
        { key: '__displayOrder', label: 'STT', render: r => <b>{r.__displayOrder}</b> },
        { key: 'name', label: 'Danh mục', render: r => <span style={{ paddingLeft: `${Math.min(Number(r.__displayLevel || 0), 8) * 22}px`, fontWeight: Number(r.__displayLevel || 0) === 0 ? 700 : 400 }}>{Number(r.__displayLevel || 0) > 0 ? '↳ ' : ''}{r.name}</span> },
        { key: 'slug', label: 'Slug' },
        { key: 'parent', label: 'Danh mục cha', render: r => parentName(r.parent) },
        { key: 'level', label: 'Cấp', render: r => levelOf(r, byId) },
        { key: 'sortOrder', label: 'Thứ tự DB', render: r => r.sortOrder ?? 0 },
        { key: 'productCount', label: 'Số SP', render: r => r.productCount ?? 0 },
        { key: 'status', label: 'Trạng thái' },
        { key: 'actions', label: 'Thao tác', render: r => <span className="actions"><Btn onClick={() => openEdit(r)}>Sửa</Btn><Danger onClick={() => remove(r)}>Xóa</Danger></span> }
      ]} />
    }
    {open && <Modal title={editingId ? 'Sửa danh mục' : 'Thêm danh mục'} onClose={() => !saving && setOpen(false)}>
      <div className="formgrid">
        {error && <div className="full errorbox">{error}</div>}
        <label>Tên danh mục *<input autoFocus value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="Ví dụ: Áo nam" /></label>
        <label>Tên danh mục (English)<input value={form.nameEn} onChange={(e) => change('nameEn', e.target.value)} placeholder="Category name in English" /></label>
        <label>Slug *<input value={form.slug} onChange={(e) => change('slug', e.target.value)} placeholder="ao-nam" /></label>
        <label>Danh mục cha
          <select value={form.parent} onChange={(e) => change('parent', e.target.value)}>
            <option value="">— Danh mục gốc —</option>
            {parents.map((p) => <option key={idOf(p)} value={idOf(p)}>{'— '.repeat(levelOf(p, byId))}{p.name}</option>)}
          </select>
        </label>
        <label>Cấp danh mục<input value={form.parent ? levelOf(byId[form.parent], byId) + 1 : 0} readOnly /></label>
        <label>Kiểu thứ tự
          <select value={form.orderMode} onChange={(e) => change('orderMode', e.target.value)}>
            <option value="auto">Tự động — sau số lớn nhất</option>
            <option value="manual">Chọn vị trí</option>
          </select>
        </label>
        <label>Vị trí / STT
          <input type="number" min="1" value={form.sortOrder} disabled={form.orderMode === 'auto'} onChange={(e) => change('sortOrder', e.target.value)} />
          <small className="muted">{form.orderMode === 'auto' ? 'Hệ thống tự thêm sau danh mục cùng cấp.' : 'Nếu trùng vị trí, các mục cùng cấp từ vị trí này sẽ tự tăng +1.'}</small>
        </label>
        <label>Trạng thái<select value={form.status} onChange={(e) => change('status', e.target.value)}><option value="active">active</option><option value="inactive">inactive</option></select></label>
        <label className="full">Mô tả<textarea value={form.description} onChange={(e) => change('description', e.target.value)} rows="4" /></label>
        <label className="full">Mô tả (English)<textarea value={form.descriptionEn} onChange={(e) => change('descriptionEn', e.target.value)} rows="4" /></label>
        <label className="full">Ảnh danh mục<input value={form.image} onChange={(e) => change('image', e.target.value)} placeholder="https://..." /></label>
        <label className="full">Ảnh riêng trên trang chủ<input value={form.homeImage} onChange={(e) => change('homeImage', e.target.value)} placeholder="https://... ảnh cây trồng, nhà kính, vườn xanh..." /><small className="muted">Ưu tiên ảnh thiên nhiên và cây trồng; để trống sẽ dùng ảnh danh mục.</small></label>
        {editingId && <div className="full hint">Số sản phẩm: {byId[editingId]?.productCount ?? 0}. Giá trị này do backend quản lý và không cho nhập tay.</div>}
        <div className="full"><Btn disabled={saving} onClick={save}>{saving ? 'Đang lưu...' : 'Lưu danh mục'}</Btn></div>
      </div>
    </Modal>}
  </Page>;
}
