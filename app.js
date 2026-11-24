const groups = {
  wear: 'Домашняя одежда', satin: 'Постельное бельё',
  'polotenca-makhrovie': 'Полотенца', 'podushki-bambuk': 'Подушки',
  'kukhonnye-polotenca': 'Текстиль для кухни'
};
const kinds = {pizhama:'Пижамы','zhenskie-halaty':'Халаты','penyuary-sorochki':'Сорочки'};
const products = itemsRaw.map((row,id) => {
  const range = row.name.match(/р-ры: (\d+)-(\d+)/);
  const sizes = [];
  if(range) for(let size=+range[1];size<=+range[2];size+=2) sizes.push(String(size));
  return {...row,id,sizes,dept:kinds[row.group]?'wear':row.group,
    title:row.name.replace(/\s*\(р-ры:[^)]+\)/,'').replace(/женская |женский /,''),
    price:[1890,1990,2490,2290,2890,2890,3190,3290,1190,1290,1450,1490,4290,4590,690,790,1190,1490,490,990][id]};
});
const main=document.querySelector('#main');
const menu=document.querySelector('#menu');
const toggle=document.querySelector('.menu');
const search=document.querySelector('#search input');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>value.toLocaleString('ru-RU')+' ₽';
const url=(page,params={})=>'#'+page+'?'+new URLSearchParams(params);
const catalog=(dept,more={})=>url('catalog',{dept,...more});
const photo=(p,alt='')=>'<img src="'+p.img+'" alt="'+escapeHtml(alt)+'">';
function cards(list,back){
  return '<div class="grid">'+list.map(p=>'<a class="card" href="'+url('item',{id:p.id,back})+'">'+photo(p)+'<small>'+escapeHtml(kinds[p.group]||groups[p.dept])+'</small><b>'+escapeHtml(p.title)+'</b><strong>'+money(p.price)+'</strong></a>').join('')+'</div>';
}
menu.innerHTML=Object.entries(groups).map(([key,name])=>'<a href="'+catalog(key)+'">'+name+'</a>').join('');
function openMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open))}
toggle.onclick=()=>openMenu(menu.hidden);
menu.onclick=()=>openMenu(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){openMenu(false);toggle.focus()}});
document.querySelector('#search').onsubmit=e=>{e.preventDefault();location.hash=url('catalog',{q:search.value.trim()})};
function home(){
  const depts=Object.entries(groups).map(([key,name])=>{
    const p=products.find(x=>x.dept===key);
    return '<a class="department" href="'+catalog(key)+'">'+photo(p)+'<b>'+name+'</b></a>';
  }).join('');
  const wearSizes=[...new Set(products.filter(p=>p.dept==='wear').flatMap(p=>p.sizes))].sort((a,b)=>a-b);
  const sizeOptions=options([['','Все размеры'],...wearSizes.map(size=>[size,size])],'');
  main.innerHTML='<section class="hero"><div class="hero-copy"><h1>Текстиль центр</h1><p class="warehouse-offer">Огромный склад текстиля в центре Уфы</p><a class="action wholesale" href="tel:+73472164800"><span>Запросить оптовый прайс</span><strong>8 (347) 216-48-00</strong></a></div><div class="portraits">'+photo(products[2])+photo(products[6])+'</div></section><h2>Каталог товаров</h2><div class="departments">'+depts+'</div><div class="section-title"><h2>Домашняя одежда</h2><a href="'+catalog('wear')+'">Все модели</a></div><form id="wear-picker"><select aria-label="Ваш размер">'+sizeOptions+'</select><button class="action">Показать модели</button></form>'+cards([products[0],products[4],products[8],products[3]],'#home');
  const picker=main.querySelector('#wear-picker');
  picker.onsubmit=event=>{
    event.preventDefault();
    location.hash=catalog('wear',{size:picker.querySelector('select').value});
  };
}
function options(entries,current){return entries.map(([v,label])=>'<option value="'+v+'" '+(v===current?'selected':'')+'>'+label+'</option>').join('')}
function listing(params){
  const dept=params.get('dept'),q=params.get('q')||'';
  const base=products.filter(p=>(!dept||p.dept===dept)&&(!q||(p.title+' '+(kinds[p.group]||'')+' '+groups[p.dept]).toLocaleLowerCase('ru').includes(q.toLocaleLowerCase('ru'))));
  const kind=params.get('kind')||'',size=params.get('size')||'',price=params.get('price')||'',sort=params.get('sort')||'';
  const list=base.filter(p=>(!kind||kind===p.group)&&(!size||p.sizes.includes(size))&&(!price||p.price<=Number(price)));
  if(sort) list.sort((a,b)=>sort==='asc'?a.price-b.price:b.price-a.price);
  const sizes=[...new Set(base.flatMap(p=>p.sizes))].sort();
  const title=q?'Поиск по запросу «'+escapeHtml(q)+'»':groups[dept]||'Все товары';
  const chips=dept==='wear'?'<div class="chips">'+Object.entries({'':'Все модели',...kinds}).map(([key,name])=>{
    const next=new URLSearchParams(params);next.set('kind',key);
    return '<a class="'+(key===kind?'active':'')+'" href="'+url('catalog',next)+'">'+name+'</a>';
  }).join('')+'</div>':'';
  const field=(key,label,values,current)=>'<label>'+label+' <select data-filter="'+key+'">'+options(values,current)+'</select></label>';
  main.innerHTML='<a class="crumb" href="#home">Главная</a><h1>'+title+'</h1>'+chips+'<div class="tools"><button class="filters" aria-expanded="false">Фильтры и сортировка</button><div class="fields">'+(sizes.length?field('size','Размер',[['','Любой'],...sizes.map(v=>[v,v])],size):'')+field('price','Цена',[['','Любая'],['1500','До 1 500 ₽'],['2500','До 2 500 ₽'],['3500','До 3 500 ₽']],price)+field('sort','Сортировка',[['','По умолчанию'],['asc','Сначала дешевле'],['desc','Сначала дороже']],sort)+'<span class="count">Найдено: '+list.length+'</span></div></div>'+(list.length?cards(list,location.hash):'<div class="empty">По этим условиям товаров нет. <a class="crumb" href="'+catalog(dept||'')+'">Показать все модели</a></div>');
  const panel=main.querySelector('.tools');
  panel.querySelector('button').onclick=e=>e.target.setAttribute('aria-expanded',panel.classList.toggle('open'));
  for(const select of panel.querySelectorAll('select')) select.onchange=()=>{
    const field=select.dataset.filter;params.set(field,select.value);
    history.replaceState(null,'',url('catalog',params));listing(params);
    if(matchMedia('(max-width:740px)').matches) main.querySelector('.filters').click();
    main.querySelector('[data-filter="'+field+'"]').focus();
  };
}
function detail(params){
  const p=products.find(x=>String(x.id)===params.get('id'));
  if(!p){home();return}
  const back=params.get('back')||'';
  const href=back==='#home'||back.startsWith('#catalog?')?back:catalog(p.dept);
  main.innerHTML='<a class="crumb" href="'+escapeHtml(href)+'">← Назад к товарам</a><section class="detail">'+photo(p,p.title)+'<div><p class="muted">'+groups[p.dept]+'</p><h1>'+escapeHtml(p.title)+'</h1><strong>'+money(p.price)+'</strong>'+(p.sizes.length?'<label class="sizes">Размер　<select>'+options(p.sizes.map(s=>[s,s]),p.sizes[0])+'</select></label>':'<p>Размер и комплектацию можно уточнить в магазине.</p>')+'<button class="primary inquire">Уточнить наличие</button><p class="notice" role="status" hidden></p></div></section>';
  const notice=main.querySelector('.notice'),size=main.querySelector('.sizes select');
  if(size) size.onchange=()=>notice.hidden=true;
  main.querySelector('.inquire').onclick=()=>{notice.textContent='Пример обращения в магазин: «Подскажите, есть ли в наличии '+p.title+(size?', размер '+size.value:'')+'?» Это демонстрация. Сообщение не отправлено.';notice.hidden=false};
}
function render(){
  const [page,query]=location.hash.slice(1).split(/\?(.*)/s);
  const params=new URLSearchParams(query);openMenu(false);search.value=params.get('q')||'';
  if(page==='catalog') listing(params);else if(page==='item') detail(params);else home();
  document.title=(main.querySelector('h1')?.textContent||'Каталог')+' · Текстиль Центр · Уфа';window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);render();
