import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Page, Table, Btn, Danger, Modal } from '../components/UI';
import Media from '../components/Media';
import { banners } from '../api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const pageOptions = [
  ['home','Trang chủ'],['products','Danh sách sản phẩm'],['product-detail','Chi tiết sản phẩm'],['categories','Danh mục'],['brands','Thương hiệu'],
  ['news','Tin tức'],['news-detail','Chi tiết bài viết'],['about','Giới thiệu'],['contact','Liên hệ'],['faq','Câu hỏi thường gặp'],
  ['privacy','Quyền riêng tư'],['terms','Điều khoản'],['cart','Giỏ hàng'],['checkout','Thanh toán'],['orders','Đơn hàng'],
  ['order-detail','Chi tiết đơn hàng'],['wishlist','Sản phẩm yêu thích'],['notifications','Thông báo'],['addresses','Địa chỉ nhận hàng'],['account','Tài khoản'],['general','Trang khác'],
];
const empty = { name:'', nameEn:'', pageKey:'home', imageUrl:'', mobileImageUrl:'', altText:'', altTextEn:'', eyebrow:'', eyebrowEn:'', title:'', titleEn:'', description:'', descriptionEn:'', buttonText:'', buttonTextEn:'', buttonLink:'', status:'active', sortOrder:1, startsAt:'', endsAt:'', textPosition:'left', overlayOpacity:0.48 };
const dateInput = (value) => value ? new Date(value).toISOString().slice(0,16) : '';
const dateOut = (value) => value ? new Date(value).toISOString() : null;
const displayDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Không giới hạn';

export default function BannerManagement() {
  const [rows,setRows] = useState([]); const [loading,setLoading] = useState(true); const [saving,setSaving] = useState(false);
  const [error,setError] = useState(''); const [notice,setNotice] = useState(''); const [pageFilter,setPageFilter] = useState('all');
  const [statusFilter,setStatusFilter] = useState('all'); const [query,setQuery] = useState(''); const [open,setOpen] = useState(false);
  const [editingId,setEditingId] = useState(''); const [form,setForm] = useState(empty);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = unwrap(await banners.list({page:1,limit:500,sort:'newest'})); setRows(Array.isArray(result) ? result : result?.data || []); }
    catch (e) { setError(e?.response?.data?.message || 'Không tải được banner. Kiểm tra kết nối và quyền quản trị.'); }
    finally { setLoading(false); }
  },[]);
  useEffect(() => { load(); },[load]);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const term = `${row.name||''} ${row.title||''} ${row.pageKey||''}`.toLocaleLowerCase('vi');
    return (pageFilter === 'all' || row.pageKey === pageFilter) && (statusFilter === 'all' || row.status === statusFilter) && term.includes(query.trim().toLocaleLowerCase('vi'));
  }),[rows,pageFilter,statusFilter,query]);
  const openCreate = () => { setEditingId(''); setForm({...empty,pageKey:pageFilter === 'all' ? 'home' : pageFilter,sortOrder:1}); setError(''); setNotice(''); setOpen(true); };
  const openEdit = async (row) => {
    setEditingId(row._id); setError(''); setNotice(''); setOpen(true); setSaving(true);
    try { const data=unwrap(await banners.get(row._id)); setForm({...empty,...data,startsAt:dateInput(data.startsAt),endsAt:dateInput(data.endsAt)}); }
    catch(e) { setForm({...empty,...row,startsAt:dateInput(row.startsAt),endsAt:dateInput(row.endsAt)}); setError(e?.response?.data?.message || 'Không tải được banner.'); }
    finally { setSaving(false); }
  };
  const save = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true);
    const data={name:form.name,nameEn:form.nameEn||'',pageKey:form.pageKey,imageUrl:form.imageUrl,mobileImageUrl:form.mobileImageUrl||'',altText:form.altText||form.title||form.name,altTextEn:form.altTextEn||'',eyebrow:form.eyebrow||'',eyebrowEn:form.eyebrowEn||'',title:form.title||'',titleEn:form.titleEn||'',description:form.description||'',descriptionEn:form.descriptionEn||'',buttonText:form.buttonText||'',buttonTextEn:form.buttonTextEn||'',buttonLink:form.buttonLink||'',status:form.status,sortOrder:Math.max(0,Number(form.sortOrder)||0),startsAt:dateOut(form.startsAt),endsAt:dateOut(form.endsAt),textPosition:form.textPosition,overlayOpacity:Math.min(.9,Math.max(0,Number(form.overlayOpacity)||0))};
    if(data.buttonText && !data.buttonLink) { setError('Hãy nhập đường dẫn cho nút CTA.'); setSaving(false); return; }
    if(data.startsAt && data.endsAt && new Date(data.endsAt) < new Date(data.startsAt)) { setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); setSaving(false); return; }
    try { if(editingId) await banners.update(editingId,data); else await banners.create(data); setOpen(false); setNotice('Đã lưu banner vào cơ sở dữ liệu.'); await load(); }
    catch(e) { setError(e?.response?.data?.message || 'Không thể lưu banner.'); }
    finally { setSaving(false); }
  };
  const remove = async (row) => { if(!window.confirm(`Xóa banner “${row.name}”?`)) return; setError(''); try { await banners.remove(row._id); setNotice('Đã xóa banner.'); await load(); } catch(e) { setError(e?.response?.data?.message || 'Không xóa được banner.'); } };

  const columns=[
    {key:'imageUrl',label:'Xem trước',render:(row)=><Media className="banner-admin-thumb" src={row.imageUrl} alt={row.altText||row.name}/>},
    {key:'name',label:'Banner',render:(row)=><div><b>{row.name}</b><small className="muted">{row.title}</small></div>},
    {key:'pageKey',label:'Trang',render:(row)=>pageOptions.find(([key])=>key===row.pageKey)?.[1]||row.pageKey},
    {key:'sortOrder',label:'Vị trí'},
    {key:'status',label:'Trạng thái',render:(row)=><span className={`banner-admin-status ${row.status}`}>{row.status==='active'?'Đang hiển thị':'Đã ẩn'}</span>},
    {key:'schedule',label:'Lịch hiển thị',render:(row)=><small>Từ {displayDate(row.startsAt)}<br/>Đến {displayDate(row.endsAt)}</small>},
    {key:'actions',label:'Thao tác',render:(row)=><span className="actions"><Btn onClick={()=>openEdit(row)}>Sửa</Btn><Danger onClick={()=>remove(row)}>Xóa</Danger></span>},
  ];
  const activeCount=rows.filter((row)=>row.status==='active').length;
  const pageCount=new Set(rows.map((row)=>row.pageKey)).size;

  return <Page title="Quản lý Banner" actions={<Btn onClick={openCreate}>+ Tạo banner</Btn>}>
    <div className="banner-admin-stats"><div><span>Tổng banner</span><b>{rows.length}</b></div><div><span>Đang hiển thị</span><b>{activeCount}</b></div><div><span>Trang có banner</span><b>{pageCount}</b></div><div><span>Trang hỗ trợ</span><b>{pageOptions.length-1}</b></div></div>
    <div className="banner-admin-help">Mỗi banner gắn với một trang cụ thể. Banner có thể sắp xếp theo thứ tự và hẹn giờ bắt đầu/kết thúc; banner không hoạt động hoặc ngoài lịch sẽ không hiện ở cửa hàng.</div>
    {notice&&<div className="success banner-admin-alert">{notice}</div>}{error&&!open&&<div className="errorbox banner-admin-alert">{error}<Btn onClick={load}>Thử lại</Btn></div>}
    <div className="banner-admin-toolbar"><input placeholder="Tìm tên hoặc tiêu đề banner…" value={query} onChange={(e)=>setQuery(e.target.value)}/><select value={pageFilter} onChange={(e)=>setPageFilter(e.target.value)}><option value="all">Tất cả trang</option>{pageOptions.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}><option value="all">Mọi trạng thái</option><option value="active">Đang hiển thị</option><option value="inactive">Đã ẩn</option></select><Btn onClick={load}>Làm mới</Btn></div>
    {loading?<div className="panel">Đang tải banner…</div>:<Table rows={visibleRows} columns={columns}/>}
    {open&&<Modal title={`${editingId?'Sửa':'Tạo'} banner`} onClose={()=>!saving&&setOpen(false)}><form className="formgrid banner-admin-form" onSubmit={save}>
      {error&&<div className="errorbox full">{error}</div>}
      <label>Tên quản trị *<input required maxLength={120} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Ví dụ: Trang chủ · Bộ sưu tập hè"/></label>
      <label>Tên quản trị (English)<input maxLength={120} value={form.nameEn} onChange={(e)=>setForm({...form,nameEn:e.target.value})}/></label>
      <label>Hiển thị ở trang *<select required value={form.pageKey} onChange={(e)=>setForm({...form,pageKey:e.target.value})}>{pageOptions.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>
      <label className="full">Ảnh hoặc video desktop (URL) *<input required type="url" value={form.imageUrl} onChange={(e)=>setForm({...form,imageUrl:e.target.value})} placeholder="https://…"/></label>
      <label className="full">Ảnh hoặc video mobile (URL, tùy chọn)<input type="url" value={form.mobileImageUrl} onChange={(e)=>setForm({...form,mobileImageUrl:e.target.value})} placeholder="Để trống để dùng media desktop"/></label>
      {form.imageUrl&&<Media className="banner-admin-preview full" src={form.imageUrl} alt="Xem trước banner"/>}
      <label>Nhãn nhỏ<input maxLength={80} value={form.eyebrow} onChange={(e)=>setForm({...form,eyebrow:e.target.value})} placeholder="ƯU ĐÃI MÙA VỤ"/></label>
      <label>Nhãn nhỏ (English)<input maxLength={80} value={form.eyebrowEn} onChange={(e)=>setForm({...form,eyebrowEn:e.target.value})}/></label>
      <label>Alt ảnh<input maxLength={180} value={form.altText} onChange={(e)=>setForm({...form,altText:e.target.value})}/></label>
      <label>Alt ảnh (English)<input maxLength={180} value={form.altTextEn} onChange={(e)=>setForm({...form,altTextEn:e.target.value})}/></label>
      <label className="full">Tiêu đề chính<input maxLength={180} value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/></label>
      <label className="full">Tiêu đề chính (English)<input maxLength={180} value={form.titleEn} onChange={(e)=>setForm({...form,titleEn:e.target.value})}/></label>
      <label className="full">Mô tả<textarea rows={3} maxLength={360} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
      <label className="full">Mô tả (English)<textarea rows={3} maxLength={360} value={form.descriptionEn} onChange={(e)=>setForm({...form,descriptionEn:e.target.value})}/></label>
      <label>Chữ trên nút<input maxLength={60} value={form.buttonText} onChange={(e)=>setForm({...form,buttonText:e.target.value})} placeholder="Khám phá ngay"/></label>
      <label>Chữ trên nút (English)<input maxLength={60} value={form.buttonTextEn} onChange={(e)=>setForm({...form,buttonTextEn:e.target.value})}/></label>
      <label>Đường dẫn nút<input maxLength={500} value={form.buttonLink} onChange={(e)=>setForm({...form,buttonLink:e.target.value})} placeholder="/products hoặc https://…"/></label>
      <label>Trạng thái<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">Đang hiển thị</option><option value="inactive">Đã ẩn</option></select></label>
      <label>Thứ tự hiển thị<input type="number" min="0" value={form.sortOrder} onChange={(e)=>setForm({...form,sortOrder:e.target.value})}/></label>
      <label>Bắt đầu hiển thị<input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({...form,startsAt:e.target.value})}/></label>
      <label>Kết thúc hiển thị<input type="datetime-local" value={form.endsAt} onChange={(e)=>setForm({...form,endsAt:e.target.value})}/></label>
      <label>Vị trí nội dung<select value={form.textPosition} onChange={(e)=>setForm({...form,textPosition:e.target.value})}><option value="left">Bên trái</option><option value="center">Chính giữa</option><option value="right">Bên phải</option></select></label>
      <label>Độ tối lớp phủ (0–0.9)<input type="number" min="0" max="0.9" step="0.05" value={form.overlayOpacity} onChange={(e)=>setForm({...form,overlayOpacity:e.target.value})}/></label>
      <div className="full banner-admin-form-actions"><Btn type="button" onClick={()=>setOpen(false)}>Hủy</Btn><Btn className="primary" type="submit" disabled={saving}>{saving?'Đang lưu…':'Lưu banner'}</Btn></div>
    </form></Modal>}
  </Page>;
}
