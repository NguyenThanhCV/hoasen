import React,{useEffect,useState} from 'react';
import {Page,Btn,Danger,Modal} from '../components/UI';
import {products,categories,brands} from '../api';
import {unwrap,idOf,err} from '../utils/helpers';
import {promotions} from '../api';

const money=v=>Number(v||0).toLocaleString('vi-VN');
const empty={name:'',scope:'product',productIds:[],categoryIds:[],brandIds:[],type:'percent',value:'',startDate:'',endDate:'',status:'active'};
const listOf=r=>unwrap(r).items||[];
function dateText(v){return v?new Date(v).toLocaleString('vi-VN'):'Không giới hạn'}
export default function PromotionsPage(){
 const [rows,setRows]=useState([]);const [ps,setPs]=useState([]);const [cs,setCs]=useState([]);const [bs,setBs]=useState([]);const [open,setOpen]=useState(false);const [form,setForm]=useState(empty);const [edit,setEdit]=useState(null);const [q,setQ]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
 const load=async()=>{setLoading(true);setError('');try{const [pr,cr,br,pm]=await Promise.all([products.list({page:1,limit:500}),categories.list({page:1,limit:500}),brands.list({page:1,limit:500}),promotions.list({page:1,limit:100})]);setPs(listOf(pr));setCs(listOf(cr));setBs(listOf(br));const data=unwrap(pm);setRows(Array.isArray(data)?data:data.items||[]);}catch(e){setError(err(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);

 const openNew=()=>{setEdit(null);setForm({...empty});setError('');setOpen(true)};
 const openEdit=r=>{setEdit(r._id||r.id);setForm({...r,productIds:(r.productIds||[]).map(idOf),categoryIds:(r.categoryIds||[]).map(idOf),brandIds:(r.brandIds||[]).map(idOf),startDate:r.startDate?new Date(r.startDate).toISOString().slice(0,16):'',endDate:r.endDate?new Date(r.endDate).toISOString().slice(0,16):''});setError('');setOpen(true)};
 const toggle=(key,id)=>setForm(f=>({...f,[key]:(f[key]||[]).includes(id)?(f[key]||[]).filter(x=>x!==id):[...(f[key]||[]),id]}));
 const save=async()=>{
   setError(''); const value=Number(form.value); if(!form.name.trim())return setError('Vui lòng nhập tên chương trình.');
   if(!Number.isFinite(value)||value<=0)return setError('Giá trị giảm phải lớn hơn 0.');
   if(form.type==='percent'&&value>100)return setError('Giảm theo % không được vượt quá 100%.');
   if(form.scope==='product'&&!form.productIds.length)return setError('Hãy chọn ít nhất 1 sản phẩm.');
   if(form.scope==='category'&&!form.categoryIds.length)return setError('Hãy chọn ít nhất 1 danh mục.');
   if(form.scope==='brand'&&!form.brandIds.length)return setError('Hãy chọn ít nhất 1 thương hiệu.');
   if(form.startDate&&form.endDate&&new Date(form.endDate)<new Date(form.startDate))return setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
   setLoading(true);try{const item={name:form.name.trim(),scope:form.scope,productIds:form.scope==='product'?form.productIds:[],categoryIds:form.scope==='category'?form.categoryIds:[],brandIds:form.scope==='brand'?form.brandIds:[],type:form.type,value,startDate:form.startDate||null,endDate:form.endDate||null,status:form.status||'active'};if(edit)await promotions.update(edit,item);else await promotions.create(item);setOpen(false);await load();}catch(e){setError(err(e))}finally{setLoading(false)}
 };
 const remove=async id=>{if(confirm('Xóa chương trình giảm giá này?')){try{await promotions.remove(id);await load()}catch(e){setError(err(e))}}};
 const filtered=rows.filter(x=>String(x.name).toLowerCase().includes(q.toLowerCase()));
 return <Page title="Khuyến mãi" actions={<Btn onClick={openNew}>+ Tạo giảm giá</Btn>}>
  <div className="promotion-note"><b>Ưu tiên áp dụng:</b> Sản phẩm → Danh mục → Thương hiệu. Một sản phẩm chỉ nhận <b>1 chương trình</b>; nếu trùng, giảm giá theo sản phẩm được ưu tiên. Chương trình được lưu tập trung trong cơ sở dữ liệu.</div>
  {error&&<div className="error">{error}</div>}
  <div className="product-toolbar"><div className="product-search"><span>⌕</span><input placeholder="Tìm chương trình…" value={q} onChange={e=>setQ(e.target.value)}/></div><Btn onClick={load}>Tải lại sản phẩm/danh mục/brand</Btn></div>
  {loading?<div className="panel">Đang tải dữ liệu...</div>:<div className="tablewrap"><table><thead><tr><th>Chương trình</th><th>Phạm vi</th><th>Mức giảm</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead><tbody>{filtered.map(r=><tr key={r._id||r.id}><td><b>{r.name}</b></td><td>{r.scope==='product'?<>{(r.productIds||[]).length} sản phẩm</>:r.scope==='category'?<>{(r.categoryIds||[]).length} danh mục</>:<>{(r.brandIds||[]).length} thương hiệu</>}</td><td><b>{r.type==='percent'?`${r.value}%`:`${money(r.value)} ₫`}</b></td><td>{dateText(r.startDate)}<br/>→ {dateText(r.endDate)}</td><td><span className={`status-badge ${r.status==='active'?'status-active':'status-inactive'}`}>{r.status==='active'?'Đang bật':'Tắt'}</span></td><td><div className="actions"><Btn onClick={()=>openEdit(r)}>Sửa</Btn><Danger onClick={()=>remove(r._id||r.id)}>Xóa</Danger></div></td></tr>)}{!filtered.length&&<tr><td colSpan="6" className="empty">Chưa có chương trình giảm giá.</td></tr>}</tbody></table></div>}
  {open&&<Modal title={edit?'Sửa giảm giá':'Tạo giảm giá'} onClose={()=>setOpen(false)}><div className="formgrid promotion-form">
   <label className="full">Tên chương trình<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ví dụ: Sale tháng 10"/></label>
   <label>Áp dụng theo<select value={form.scope} onChange={e=>setForm({...form,scope:e.target.value,productIds:[],categoryIds:[],brandIds:[]})}><option value="product">Sản phẩm</option><option value="category">Danh mục</option><option value="brand">Thương hiệu</option></select></label>
   <label>Kiểu giảm<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="percent">Giảm theo %</option><option value="fixed">Giảm số tiền</option></select></label>
   <label>Mức giảm{form.type==='percent'?' (%)':' (₫)'}<input type="number" min="0" max={form.type==='percent'?100:undefined} value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></label>
   <label>Bắt đầu<input type="datetime-local" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label>
   <label>Kết thúc<input type="datetime-local" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></label>
   {form.scope==='product'?<label className="full"><span>Sản phẩm <b>({form.productIds.length} đã chọn)</b></span><div className="select-list">{ps.map(p=><label className="check-row" key={idOf(p)}><input type="checkbox" checked={form.productIds.includes(idOf(p))} onChange={()=>toggle('productIds',idOf(p))}/><span>{p.name||'—'}</span></label>)}</div></label>:form.scope==='category'?<label className="full"><span>Danh mục <b>({form.categoryIds.length} đã chọn)</b></span><div className="select-list">{cs.map(c=><label className="check-row" key={idOf(c)}><input type="checkbox" checked={form.categoryIds.includes(idOf(c))} onChange={()=>toggle('categoryIds',idOf(c))}/><span>{c.name||'—'}</span></label>)}</div></label>:<label className="full"><span>Thương hiệu <b>({(form.brandIds||[]).length} đã chọn)</b></span><div className="select-list">{bs.map(b=><label className="check-row" key={idOf(b)}><input type="checkbox" checked={(form.brandIds||[]).includes(idOf(b))} onChange={()=>toggle('brandIds',idOf(b))}/><span>{b.name||'—'}</span></label>)}</div></label>}
   <label>Trạng thái<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Đang bật</option><option value="inactive">Tắt</option></select></label>
   <div className="full promotion-rule"><b>Quy tắc:</b> nếu cùng lúc khớp nhiều chương trình thì ưu tiên Sản phẩm → Danh mục → Thương hiệu; cùng một mức ưu tiên thì lấy chương trình cập nhật sau.</div>
   <div className="full"><Btn onClick={save}>Lưu chương trình</Btn></div>
  </div></Modal>}
 </Page>
}
