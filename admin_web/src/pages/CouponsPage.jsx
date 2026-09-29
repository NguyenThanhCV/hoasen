import React,{useEffect,useMemo,useState} from 'react';
import {Page,Btn,Danger,Modal} from '../components/UI';
import {coupons} from '../api';
import {fmtDate,fmtMoney} from '../utils/helpers';

const empty={code:'',name:'',type:'percentage',value:'',minOrderValue:'',maxDiscount:'',usageLimit:'',usageLimitPerUser:'',startDate:'',endDate:'',status:'active'};
const inputDate=v=>v?new Date(v).toISOString().slice(0,16):'';
const payload=f=>({code:String(f.code||'').trim().toUpperCase(),name:String(f.name||'').trim(),type:f.type,value:Number(f.value)||0,minOrderValue:Number(f.minOrderValue)||0,maxDiscount:Number(f.maxDiscount)||0,usageLimit:Number(f.usageLimit)||0,usageLimitPerUser:Number(f.usageLimitPerUser)||0,startDate:f.startDate||null,endDate:f.endDate||null,status:f.status||'active'});
const statusLabel={active:'Đang hoạt động',inactive:'Tắt',pending:'Chờ',expired:'Hết hạn'};
export default function CouponsPage(){
 const [rows,setRows]=useState([]),[open,setOpen]=useState(false),[editing,setEditing]=useState(null),[f,setF]=useState(empty),[q,setQ]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const r=await coupons.list({page:1,limit:200});const d=r?.data?.data??r?.data??{};setRows(Array.isArray(d)?d:(d.items||d.coupons||[]));}catch(e){setError(e?.response?.data?.message||e.message||'Không tải được mã giảm giá')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(x=>!q||String(x.code||'').toLowerCase().includes(q.toLowerCase())||String(x.name||'').toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const openAdd=()=>{setEditing(null);setF(empty);setError('');setOpen(true)};
 const openEdit=x=>{setEditing(x._id||x.id);setF({...empty,...x,startDate:inputDate(x.startDate),endDate:inputDate(x.endDate),value:x.value??'',minOrderValue:x.minOrderValue??'',maxDiscount:x.maxDiscount??'',usageLimit:x.usageLimit??'',usageLimitPerUser:x.usageLimitPerUser??''});setError('');setOpen(true)};
 const save=async()=>{const d=payload(f);if(!d.code)return setError('Vui lòng nhập mã giảm giá.');if(!/^[A-Z0-9_-]{3,30}$/.test(d.code))return setError('Mã chỉ gồm A-Z, 0-9, _ hoặc -, dài 3–30 ký tự.');if(!d.name)return setError('Vui lòng nhập tên chương trình.');if(d.value<=0)return setError('Giá trị giảm phải lớn hơn 0.');if(d.type==='percentage'&&d.value>100)return setError('Giảm theo % không được vượt quá 100%.');if(d.minOrderValue<0||d.maxDiscount<0)return setError('Giá trị tiền không được âm.');if(d.startDate&&d.endDate&&new Date(d.endDate)<new Date(d.startDate))return setError('Ngày kết thúc phải sau ngày bắt đầu.');setLoading(true);setError('');try{if(editing)await coupons.update(editing,d);else await coupons.create(d);setOpen(false);await load()}catch(e){setError(e?.response?.data?.message||e.message||'Không lưu được mã giảm giá')}finally{setLoading(false)}};
 const remove=async x=>{if(!confirm(`Xóa mã ${x.code}?`))return;try{await coupons.remove(x._id||x.id);await load()}catch(e){alert(e?.response?.data?.message||e.message||'Không xóa được mã')}};
 return <Page title="Mã giảm giá" actions={<Btn onClick={openAdd}>+ Tạo mã giảm giá</Btn>}>
  <div className="coupon-help"><b>Mã giảm giá</b> áp dụng khi khách nhập CODE. Đây là cơ chế riêng với khuyến mãi tự động theo <b>sản phẩm / danh mục / thương hiệu</b>. Backend vẫn được giữ nguyên.</div>
  <div className="toolbar coupon-toolbar"><input placeholder="Tìm theo mã hoặc tên…" value={q} onChange={e=>setQ(e.target.value)}/><Btn onClick={load}>Làm mới</Btn><span className="muted">{filtered.length} mã</span></div>
  {error&&!open&&<div className="error-box">{error}</div>}
  <div className="coupon-grid">{filtered.map(x=>{const expired=x.endDate&&new Date(x.endDate)<new Date();const val=x.type==='percentage'?`-${x.value}%`:`-${fmtMoney(x.value)}`;return <div className="coupon-card" key={x._id||x.id}><div className="coupon-card-top"><div className="coupon-code">{x.code}</div><span className={`coupon-status ${expired?'expired':x.status==='active'?'active':'off'}`}>{expired?'Hết hạn':statusLabel[x.status]||x.status||'—'}</span></div><h3>{x.name||'Không có tên'}</h3><div className="coupon-value">{val}</div><div className="coupon-meta"><span>Đơn tối thiểu: <b>{fmtMoney(x.minOrderValue||0)}</b></span><span>Giảm tối đa: <b>{x.maxDiscount?fmtMoney(x.maxDiscount):'Không giới hạn'}</b></span><span>Giới hạn: <b>{x.usageLimit||'Không giới hạn'}</b>{x.usageLimitPerUser?` · ${x.usageLimitPerUser}/user`:''}</span><span>{fmtDate(x.startDate)} → {fmtDate(x.endDate)}</span></div><div className="coupon-actions"><Btn onClick={()=>openEdit(x)}>Sửa</Btn><Danger onClick={()=>remove(x)}>Xóa</Danger></div></div>})}{!filtered.length&&!loading&&<div className="empty-panel">Chưa có mã giảm giá.</div>}</div>
  {open&&<Modal title={editing?'Sửa mã giảm giá':'Tạo mã giảm giá'} onClose={()=>setOpen(false)}><div className="formgrid coupon-form">
   <label>Mã giảm giá<input value={f.code} onChange={e=>setF({...f,code:e.target.value.toUpperCase()})} placeholder="VD: SALE20" maxLength={30}/></label>
   <label>Tên chương trình<input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Giảm 20% đơn hàng"/></label>
   <label>Kiểu giảm<select value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="percentage">Giảm theo %</option><option value="fixed">Giảm số tiền</option></select></label>
   <label>Giá trị giảm<input type="number" min="0" value={f.value} onChange={e=>setF({...f,value:e.target.value})}/>{f.type==='percentage'&&<small>Tối đa 100%</small>}</label>
   <label>Đơn tối thiểu<input type="number" min="0" value={f.minOrderValue} onChange={e=>setF({...f,minOrderValue:e.target.value})}/></label>
   <label>Giảm tối đa<input type="number" min="0" value={f.maxDiscount} onChange={e=>setF({...f,maxDiscount:e.target.value})}/></label>
   <label>Giới hạn tổng lượt<input type="number" min="0" value={f.usageLimit} onChange={e=>setF({...f,usageLimit:e.target.value})}/><small>0 = không giới hạn</small></label>
   <label>Giới hạn / khách<input type="number" min="0" value={f.usageLimitPerUser} onChange={e=>setF({...f,usageLimitPerUser:e.target.value})}/><small>0 = không giới hạn</small></label>
   <label>Bắt đầu<input type="datetime-local" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></label>
   <label>Kết thúc<input type="datetime-local" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></label>
   <label>Trạng thái<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="active">Đang hoạt động</option><option value="inactive">Tắt</option><option value="pending">Chờ</option></select></label>
   {error&&<div className="full error-box">{error}</div>}<div className="full"><Btn onClick={save} disabled={loading}>{loading?'Đang lưu…':'Lưu mã giảm giá'}</Btn></div>
  </div></Modal>}
 </Page>
}
