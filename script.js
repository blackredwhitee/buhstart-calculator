/* ═══════════════════════════════════════════════════
   КАЛЬКУЛЯТОР БУХГАЛТЕРСКИХ УСЛУГ
   Прайс: лист «Единый»
═══════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════
   ЮРЛИЦА ИСПОЛНИТЕЛЯ
═══════════════════════════════════════════════════ */
const EXECUTORS = [
  {
    name:     'ООО «Альфа Учёт»',
    inn:      '7701234567',
    kpp:      '770101001',
    ogrn:     '1197746123456',
    address:  '125009, г. Москва, ул. Тверская, д. 7, офис 301',
    phone:    '+7 (495) 111-22-33',
    email:    'info@alfa-uchet.ru',
    bank:     'ПАО «Сбербанк России»',
    rs:       '40702810338000012345',
    bik:      '044525225',
    ks:       '30101810400000000225',
    director: 'Козлова Анна Сергеевна',
    dirShort: 'Козлова А.С.',
  },
  {
    name:     'ООО «Бета Финанс»',
    inn:      '7702345678',
    kpp:      '770201001',
    ogrn:     '1187746234567',
    address:  '115035, г. Москва, ул. Пятницкая, д. 12, офис 5',
    phone:    '+7 (495) 222-33-44',
    email:    'office@beta-finance.ru',
    bank:     'АО «Альфа-Банк»',
    rs:       '40702810623000023456',
    bik:      '044525593',
    ks:       '30101810200000000593',
    director: 'Морозов Дмитрий Александрович',
    dirShort: 'Морозов Д.А.',
  },
  {
    name:     'ИП Смирнова Елена Владимировна',
    inn:      '770312345678',
    kpp:      '',
    ogrn:     '319774600034567',
    address:  '119019, г. Москва, ул. Арбат, д. 24, кв. 15',
    phone:    '+7 (916) 333-44-55',
    email:    'smirnova.buh@gmail.com',
    bank:     'АО «Тинькофф Банк»',
    rs:       '40802810500000034567',
    bik:      '044525974',
    ks:       '30101810145250000974',
    director: 'Смирнова Елена Владимировна',
    dirShort: 'Смирнова Е.В.',
  },
  {
    name:     'ООО «Гамма Консалт»',
    inn:      '7704567890',
    kpp:      '770401001',
    ogrn:     '1157746345678',
    address:  '107078, г. Москва, ул. Маши Порываевой, д. 34, офис 412',
    phone:    '+7 (495) 444-55-66',
    email:    'mail@gamma-consult.ru',
    bank:     'Банк ВТБ (ПАО)',
    rs:       '40702810943000045678',
    bik:      '044525187',
    ks:       '30101810700000000187',
    director: 'Новиков Павел Игоревич',
    dirShort: 'Новиков П.И.',
  },
  {
    name:     'ООО «Дельта Бухгалтерия»',
    inn:      '7705678901',
    kpp:      '770501001',
    ogrn:     '1137746456789',
    address:  '129090, г. Москва, Олимпийский просп., д. 16, стр. 1',
    phone:    '+7 (495) 555-66-77',
    email:    'delta@delta-buh.ru',
    bank:     'АО «Газпромбанк»',
    rs:       '40702810861000056789',
    bik:      '044525823',
    ks:       '30101810200000000823',
    director: 'Волкова Марина Петровна',
    dirShort: 'Волкова М.П.',
  },
];

// Текущее юрлицо — по умолчанию первое
let EX = Object.assign({}, EXECUTORS[0]);

function pickExec(idx) {
  EX = Object.assign({}, EXECUTORS[idx]);
}

let modalTarget = ''; // 'contract' | 'invoice'
/* ─── Состояние квиза ─────────────────────────────── */
const STEPS = 12;
let step = 1;
let back = false;

const A = {
  entity:'', isNull:false, tax:'', niche:'',
  mp:[], mpInventory:false,
  vat:'none',
  staffRf:'none', rfCount:4,
  staffForeign:'none', foreignCount:1,
  cashKassa:false, cashAvans:false,
  ved:false, reconcile:false, taxMgmt:false,
  military:false, militaryCount:1,
  licenses:false, mgmtAcc:false, officeBuh:false,
  inventory:false,
  urgent:'no',
  name:'', director:'',
  req:{ inn:'', kpp:'', address:'', phone:'', email:'', rs:'', bank:'', bik:'' }
};


/* ─── Утилиты ─────────────────────────────────── */
const fmt = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
const today = () => new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
const todayLong = () => new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
const todayFile = () => { const d=new Date(); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`; };
const todayShort = () => new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
const todayStr = todayLong;
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safeF = s => String(s||'').replace(/[\\/:*?"<>|«»]/g,'').replace(/\s+/g,'_').slice(0,40);

/* ─── Прайс (лист «Единый») ───────────────────────── */
const P = {
  null_ip:  2000,
  null_ooo: 3000,
  tax:   { patent:1000, ausn:3000, usn6:5000, usn15:20000, osno:30000 },
  vat:   { none:0, льготный:5000, основной:10000 },
  niche: {
    marketplace:20000, wb:20000, ozon:5000, ya:10000, mp_inventory:15000,
    wholesale:20000, wh_inventory:10000,
    retail:20000, rt_inventory:15000,
    production:60000, construction:40000, catering:30000,
    medicine:50000, services:20000,
  },
  staff: { none:0, rf_1_3:5000, rf_per:1500, foreign:20000 },
  cash:  { none:0, kassa:15000, avans:10000 },
  ved:8000, reconcile:15000, tax_mgmt:20000,
  military_per:2000, licenses:10000,
};

function nextNum(pfx){ const y=new Date().getFullYear(),k=`ctr_${pfx}_${y}`,n=parseInt(localStorage.getItem(k)||'0',10)+1; localStorage.setItem(k,String(n)); return `${pfx}-${y}-${String(n).padStart(4,'0')}`; }

/* ─── Расчёт ──────────────────────────────────── */
function calcTotal() {
  const lines = [];
  let total = 0;
  let hasIndividual = false;

  if (A.isNull) {
    const price = A.entity === 'ИП' ? P.null_ip : P.null_ooo;
    lines.push({ name:'Нулевая отчётность', price });
    total += price;
    return { total, lines, hasIndividual, urgent: A.urgent === 'yes' };
  }

  // База по нише
  const nichePrice = P.niche[A.niche] || 0;
  if (nichePrice) {
    const nicheNames = {
      marketplace:'Маркетплейс (база)', wholesale:'Оптовая торговля',
      retail:'Розничная торговля', production:'Производство',
      construction:'Строительство', catering:'Общепит',
      medicine:'Медицина / Стоматология', services:'Услуги / Прочее'
    };
    lines.push({ name: nicheNames[A.niche]||A.niche, price: nichePrice });
    total += nichePrice;
  }

  // Маркетплейсы
  if (A.niche === 'marketplace') {
    const mpNames = { wb:'Wildberries', ozon:'Ozon', ya:'Яндекс Маркет' };
    A.mp.forEach(m => {
      const pr = P.niche[m]||0;
      lines.push({ name: mpNames[m]||m, price: pr });
      total += pr;
    });
    if (A.mpInventory) {
      lines.push({ name:'Товарный учёт (маркетплейс)', price: P.niche.mp_inventory });
      total += P.niche.mp_inventory;
    }
  }

  // Товарный учёт для торговли
  if (A.inventory) {
    const invPrice = A.niche === 'wholesale' ? P.niche.wh_inventory : P.niche.rt_inventory;
    lines.push({ name:'Товарный учёт', price: invPrice });
    total += invPrice;
  }

  // Система налогообложения
  const taxPrice = P.tax[A.tax] || 0;
  if (taxPrice) {
    const taxNames = { patent:'Патент', ausn:'АУСН', usn6:'УСН 6%', usn15:'УСН 15%', osno:'ОСНО' };
    lines.push({ name:`Надбавка: ${taxNames[A.tax]||A.tax}`, price: taxPrice });
    total += taxPrice;
  }

  // НДС
  const vatPrice = P.vat[A.vat] || 0;
  if (vatPrice) {
    lines.push({ name:`НДС (${A.vat})`, price: vatPrice });
    total += vatPrice;
  }

  // Сотрудники РФ
  if (A.staffRf === 'rf_1_3') {
    lines.push({ name:'Сотрудники РФ (1–3 чел.)', price: P.staff.rf_1_3 });
    total += P.staff.rf_1_3;
  } else if (A.staffRf === 'rf_more') {
    const pr = P.staff.rf_per * A.rfCount;
    lines.push({ name:`Сотрудники РФ (${A.rfCount} чел. × 1 500 ₽)`, price: pr });
    total += pr;
  }

  // Иностранцы
  if (A.staffForeign === 'yes') {
    const pr = P.staff.foreign * A.foreignCount;
    lines.push({ name:`Иностранные сотрудники (${A.foreignCount} чел. × 20 000 ₽)`, price: pr });
    total += pr;
  }

  // Наличные
  if (A.cashKassa) { lines.push({ name:'Касса (ККМ)', price: P.cash.kassa }); total += P.cash.kassa; }
  if (A.cashAvans) { lines.push({ name:'Авансовые отчёты', price: P.cash.avans }); total += P.cash.avans; }

  // Доп. услуги
  if (A.ved)       { lines.push({ name:'ВЭД / Валютные расчёты', price: P.ved }); total += P.ved; }
  if (A.reconcile) { lines.push({ name:'Сверки с контрагентами', price: P.reconcile }); total += P.reconcile; }
  if (A.taxMgmt)   { lines.push({ name:'Налоговый менеджмент', price: P.tax_mgmt }); total += P.tax_mgmt; }
  if (A.military)  {
    const pr = P.military_per * A.militaryCount;
    lines.push({ name:`Воинский учёт (${A.militaryCount} чел. × 2 000 ₽)`, price: pr });
    total += pr;
  }
  if (A.licenses)  { lines.push({ name:'Лицензионная отчётность', price: P.licenses }); total += P.licenses; }
  if (A.mgmtAcc)   { lines.push({ name:'Управленческий учёт', price:0, individual:true }); hasIndividual = true; }
  if (A.officeBuh) { lines.push({ name:'Выделенный бухгалтер в офис', price:0, individual:true }); hasIndividual = true; }

  // Срочность × 2
  const urgent = A.urgent === 'yes';
  if (urgent) total *= 2;

  return { total, lines, hasIndividual, urgent };
}

/* ─── Обновление итога в реальном времени ─────── */
function updateTotal() {
  collectCurrent();
  const { total } = calcTotal();
  // Нет отдельного сайдбара — обновляем только если на шаге 12
  if (step === STEPS) buildSummary();
}

/* ─── Старт квиза ─────────────────────────────── */
function startQuiz() {
  document.getElementById('hero').style.display = 'none';
  showStep(1);
  document.getElementById('quiz-start').scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ─── Навигация ───────────────────────────────── */
function goNext() {
  if (!validateStep(step)) return;
  collectStep(step);
  back = false;
  const next = nextStepNum(step);
  if (next <= STEPS) showStep(next);
}

function goBack() {
  collectStep(step);
  back = true;
  const prev = prevStepNum(step);
  if (prev >= 1) showStep(prev);
}

// Логика пропуска шагов
function nextStepNum(n) {
  if (n === 2 && A.isNull) return 10; // нулёвка → пропустить 3-9, идти к срочности
  if (n === 4 && A.niche !== 'marketplace') return 6; // не маркетплейс → пропустить шаг 5
  return n + 1;
}

function prevStepNum(n) {
  if (n === 10 && A.isNull) return 2;
  if (n === 6 && A.niche !== 'marketplace') return 4;
  return n - 1;
}

function showStep(n) {
  document.querySelectorAll('.slide').forEach(el => { el.classList.remove('active','back'); el.style.display='none'; });
  const sl = document.querySelector(`.slide[data-step="${n}"]`);
  if (!sl) return;
  sl.style.display = 'block';
  sl.classList.add('active');
  if (back) sl.classList.add('back');

  // Прогресс — считаем визуально линейно
  const visual = visualStep(n);
  const total_visual = A.isNull ? 5 : (A.niche === 'marketplace' ? STEPS : STEPS - 1);
  document.getElementById('step-label').textContent = `Шаг ${visual} из ${A.isNull ? 4 : (A.niche==='marketplace'?STEPS:STEPS-1)}`;
  document.getElementById('prog-fill').style.width = `${(visual / (A.isNull?4:STEPS)) * 100}%`;

  document.getElementById('btn-back').style.display = n > 1 ? 'inline-flex' : 'none';
  const btnNext = document.getElementById('btn-next');
  btnNext.style.display = n === STEPS ? 'none' : 'inline-flex';
  btnNext.textContent = n === STEPS - 1 ? 'Посмотреть расчёт →' : 'Далее →';

  // Товарный учёт — показываем только для wholesale/retail
  if (n === 9) {
    const invBlock = document.getElementById('inventory-block');
    if (A.niche === 'wholesale' || A.niche === 'retail') {
      invBlock.style.display = 'block';
      const pr = A.niche === 'wholesale' ? P.niche.wh_inventory : P.niche.rt_inventory;
      document.getElementById('inventory-label').innerHTML = `Товарный учёт <strong>+${fmt(pr)}</strong>`;
    } else {
      invBlock.style.display = 'none';
    }
  }

  if (n === STEPS) buildSummary();
  restoreStep(n);
  step = n;
  back = false;
}

function visualStep(n) {
  // Маппинг реального шага в визуальный номер
  if (A.isNull) {
    const map = {1:1, 2:2, 10:3, 11:4, 12:5};
    return map[n] || n;
  }
  if (A.niche !== 'marketplace' && n >= 6) return n - 1;
  return n;
}

/* ─── Сбор данных ─────────────────────────────── */
function collectStep(n) {
  if (n===1)  { const s=document.querySelector('#g-entity .selected'); if(s) A.entity=s.dataset.val; }
  if (n===2)  { const s=document.querySelector('#g-null .selected'); if(s) A.isNull=s.dataset.val==='yes'; }
  if (n===3)  { const s=document.querySelector('#g-tax .selected'); if(s) A.tax=s.dataset.val; }
  if (n===4)  { const s=document.querySelector('#g-niche .selected'); if(s) A.niche=s.dataset.val; }
  if (n===5)  {
    A.mp = [...document.querySelectorAll('#g-mp .selected')].map(b=>b.dataset.val);
    A.mpInventory = document.getElementById('mp-inventory').checked;
  }
  if (n===6)  { const s=document.querySelector('#g-vat .selected'); if(s) A.vat=s.dataset.val; }
  if (n===7)  {
    const sr=document.querySelector('#g-staff-rf .selected'); if(sr) A.staffRf=sr.dataset.val;
    A.rfCount = parseInt(document.getElementById('rf-count').value)||4;
    const sf=document.querySelector('#g-staff-foreign .selected'); if(sf) A.staffForeign=sf.dataset.val;
    A.foreignCount = parseInt(document.getElementById('foreign-count').value)||1;
  }
  if (n===8)  {
    A.cashKassa = document.getElementById('cash-kassa').checked;
    A.cashAvans = document.getElementById('cash-avans').checked;
  }
  if (n===9)  {
    A.ved       = document.getElementById('add-ved').checked;
    A.reconcile = document.getElementById('add-reconcile').checked;
    A.taxMgmt   = document.getElementById('add-taxmgmt').checked;
    A.military  = document.getElementById('add-military').checked;
    A.militaryCount = parseInt(document.getElementById('military-count').value)||1;
    A.licenses  = document.getElementById('add-licenses').checked;
    A.mgmtAcc   = document.getElementById('add-mgmt-acc').checked;
    A.officeBuh = document.getElementById('add-office-buh').checked;
    A.inventory = document.getElementById('add-inventory') ? document.getElementById('add-inventory').checked : false;
  }
  if (n===10) { const s=document.querySelector('#g-urgent .selected'); if(s) A.urgent=s.dataset.val; }
  if (n===11) {
    A.name     = (document.getElementById('f-name').value||'').trim();
    A.director = (document.getElementById('f-director').value||'').trim();
  }
}

function collectCurrent() { collectStep(step); }

/* ─── Восстановление ─────────────────────────── */
function restoreStep(n) {
  const restorePick = (gid, val) => {
    document.querySelectorAll(`#${gid} .ccard`).forEach(b => b.classList.toggle('selected', b.dataset.val===val));
  };
  const restoreNiche = (val) => {
    document.querySelectorAll('#g-niche .ncard').forEach(b => b.classList.toggle('selected', b.dataset.val===val));
  };
  if (n===1)  restorePick('g-entity', A.entity);
  if (n===2)  restorePick('g-null', A.isNull?'yes':'no');
  if (n===3)  restorePick('g-tax', A.tax);
  if (n===4)  restoreNiche(A.niche);
  if (n===5)  {
    document.querySelectorAll('#g-mp .ccard').forEach(b => b.classList.toggle('selected', A.mp.includes(b.dataset.val)));
    document.getElementById('mp-inventory').checked = A.mpInventory;
  }
  if (n===6)  restorePick('g-vat', A.vat);
  if (n===7)  {
    restorePick('g-staff-rf', A.staffRf);
    restorePick('g-staff-foreign', A.staffForeign);
    document.getElementById('rf-count').value = A.rfCount;
    document.getElementById('foreign-count').value = A.foreignCount;
    document.getElementById('rf-count-row').style.display = A.staffRf==='rf_more'?'flex':'none';
    document.getElementById('foreign-count-row').style.display = A.staffForeign==='yes'?'flex':'none';
  }
  if (n===8)  {
    document.getElementById('cash-kassa').checked = A.cashKassa;
    document.getElementById('cash-avans').checked = A.cashAvans;
  }
  if (n===9)  {
    document.getElementById('add-ved').checked       = A.ved;
    document.getElementById('add-reconcile').checked = A.reconcile;
    document.getElementById('add-taxmgmt').checked   = A.taxMgmt;
    document.getElementById('add-military').checked  = A.military;
    document.getElementById('military-count').value  = A.militaryCount;
    document.getElementById('military-count-row').style.display = A.military?'flex':'none';
    document.getElementById('add-licenses').checked  = A.licenses;
    document.getElementById('add-mgmt-acc').checked  = A.mgmtAcc;
    document.getElementById('add-office-buh').checked = A.officeBuh;
    const inv = document.getElementById('add-inventory');
    if (inv) inv.checked = A.inventory;
  }
  if (n===10) restorePick('g-urgent', A.urgent);
  if (n===11) {
    document.getElementById('f-name').value     = A.name;
    document.getElementById('f-director').value = A.director;
  }
}

/* ─── Валидация ───────────────────────────────── */
function clearErrs() { document.querySelectorAll('.q-err').forEach(e=>e.textContent=''); document.querySelectorAll('.q-input').forEach(e=>e.classList.remove('input-err')); }
function setErr(id, msg) { const e=document.getElementById(id); if(e) e.textContent=msg; }

function validateStep(n) {
  clearErrs();
  if (n===1)  { if (!document.querySelector('#g-entity .selected')) { setErr('err-entity','Выберите вариант'); return false; } }
  if (n===2)  { if (!document.querySelector('#g-null .selected'))   { setErr('err-null','Выберите вариант'); return false; } }
  if (n===3)  { if (!document.querySelector('#g-tax .selected'))    { setErr('err-tax','Выберите систему налогообложения'); return false; } }
  if (n===4)  { if (!document.querySelector('#g-niche .selected'))  { setErr('err-niche','Выберите вид деятельности'); return false; } }
  if (n===5)  { if (A.mp.length===0 && !document.querySelectorAll('#g-mp .selected').length) { setErr('err-mp','Выберите хотя бы один маркетплейс'); return false; } }
  if (n===6)  { if (!document.querySelector('#g-vat .selected'))    { setErr('err-vat','Выберите вариант'); return false; } }
  if (n===7)  {
    if (!document.querySelector('#g-staff-rf .selected'))      { setErr('err-staff','Укажите сотрудников РФ'); return false; }
    if (!document.querySelector('#g-staff-foreign .selected')) { setErr('err-staff','Укажите иностранных сотрудников'); return false; }
  }
  if (n===10) { if (!document.querySelector('#g-urgent .selected')) { setErr('err-urgent','Выберите вариант'); return false; } }
  if (n===11) {
    const name=document.getElementById('f-name').value.trim();
    if (!name) { setErr('err-name','Введите название компании или ФИО'); document.getElementById('f-name').classList.add('input-err'); return false; }
  }
  return true;
}

/* ─── UI-хелперы ─────────────────────────────── */
function pick(btn, gid) {
  document.querySelectorAll(`#${gid} .ccard`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  collectCurrent();
  updateTotal();

  // Показать/скрыть количество сотрудников
  if (gid === 'g-staff-rf') {
    document.getElementById('rf-count-row').style.display = btn.dataset.val==='rf_more'?'flex':'none';
  }
  if (gid === 'g-staff-foreign') {
    document.getElementById('foreign-count-row').style.display = btn.dataset.val==='yes'?'flex':'none';
  }
}

function toggleMulti(btn) {
  btn.classList.toggle('selected');
  collectCurrent();
  updateTotal();
}

function cashNoneToggle() {
  const none = document.getElementById('cash-none');
  if (none.checked) {
    document.getElementById('cash-kassa').checked = false;
    document.getElementById('cash-avans').checked = false;
  }
  updateTotal();
}

function militaryToggle() {
  const checked = document.getElementById('add-military').checked;
  document.getElementById('military-count-row').style.display = checked ? 'flex' : 'none';
  updateTotal();
}

/* ─── Сводка (шаг 12) ────────────────────────── */
function buildSummary() {
  collectStep(11);
  const { total, lines, hasIndividual, urgent } = calcTotal();

  document.getElementById('sum-total').textContent = fmt(total) + (hasIndividual ? '+' : '');
  document.getElementById('sum-individual-note').style.display = hasIndividual ? 'block' : 'none';

  const linesEl = document.getElementById('sum-lines');
  linesEl.innerHTML = lines.map(l =>
    `<div class="sum-line">
      <span class="sum-line-name">${esc(l.name)}</span>
      <span class="sum-line-price ${l.individual?'individual':''}">${l.individual ? 'индивидуально' : fmt(l.price)}</span>
    </div>`
  ).join('') + (urgent ? `<div class="sum-modifier"><span>Срочность (× 2)</span><span>× 2</span></div>` : '');

  const taxNames = { patent:'Патент', ausn:'АУСН', usn6:'УСН 6%', usn15:'УСН 15%', osno:'ОСНО' };
  document.getElementById('sum-params').innerHTML = `
    <div class="sum-param"><span class="sum-param-k">Клиент</span><span class="sum-param-v">${esc(A.name||'—')}</span></div>
    <div class="sum-param"><span class="sum-param-k">Форма</span><span class="sum-param-v">${esc(A.entity)}</span></div>
    ${!A.isNull ? `<div class="sum-param"><span class="sum-param-k">Налогообложение</span><span class="sum-param-v">${esc(taxNames[A.tax]||A.tax)}</span></div>` : ''}
    <div class="sum-param"><span class="sum-param-k">Срочность</span><span class="sum-param-v">${urgent?'Да (× 2)':'Нет'}</span></div>
  `;
}

/* ─── Документы ──────────────────────────────── */
let lastKP = null, lastContract = null, lastInvoice = null;

function generateKP() {
  collectStep(11);
  clearErrs();
  const { total, lines, hasIndividual } = calcTotal();
  if (!A.name) {
    setErr('err-final','Введите название клиента — вернитесь на шаг 11');
    return;
  }
  const kpNum = nextNum('КП');
  const kpText = buildKPText(total, lines, hasIndividual, kpNum);
  lastKP = { text:kpText, kpNum, total, lines, hasIndividual };

  document.getElementById('kp-meta').textContent = `${kpNum} · ${todayLong()}`;
  document.getElementById('kp-preview').textContent = kpText;
  const sec = document.getElementById('kp-sec');
  sec.style.display = 'block';
  document.getElementById('quiz-wrap').style.display = 'none';
  sec.scrollIntoView({ behavior:'smooth', block:'start' });

  showToast('КП сформировано');
}

function generateContract() {
  if (!lastKP) { showToast('Сначала сформируйте КП'); return; }
  const cNum = nextNum('Д');
  const cText = buildContractText(lastKP.total, lastKP.lines, cNum);
  lastContract = { text:cText, cNum };

  document.getElementById('contract-meta').textContent = `${cNum} · ${todayLong()}`;
  document.getElementById('contract-preview').textContent = cText;
  const sec = document.getElementById('contract-sec');
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior:'smooth', block:'start' });

  const fname = `Договор_${safeF(A.name)}_${todayFile()}.docx`;
  buildContractDocx(EX, {name:A.name,inn:A.req.inn,kpp:A.req.kpp,address:A.req.address,phone:A.req.phone,email:A.req.email,rs:A.req.rs,bank:A.req.bank,bik:A.req.bik,ks:A.req.ks||''}, lastKP.lines, lastKP.total, cNum)
    .then(b => { downloadBlob(b, fname); showToast('Договор скачивается'); })
    .catch(e => { console.error('Contract docx error:', e); showToast('Ошибка формирования файла'); });
}

function downloadKP() {
  if (!lastKP) { showToast('КП не сформировано'); return; }
  showToast('Формируем файл...');
  buildKPDocx(EX, {name: A.name, inn: A.inn, director: A.director}, lastKP.lines, lastKP.total, lastKP.kpNum)
    .then(b => { downloadBlob(b, `КП_${safeF(A.name)}_${todayFile()}.docx`); showToast('КП скачивается'); })
    .catch(e => { console.error('KP docx error:', e); showToast('Ошибка формирования файла'); });
}
function downloadInvoice() {
  if (!lastKP) { showToast('КП не сформировано'); return; }
  const invNum = nextNum('СЧ');
  buildInvoiceDocx(EX, {name:A.name,inn:A.req.inn,kpp:A.req.kpp,address:A.req.address,phone:A.req.phone,email:A.req.email,rs:A.req.rs,bank:A.req.bank,bik:A.req.bik,ks:A.req.ks||''}, lastKP.lines, lastKP.total, invNum)
    .then(b => { downloadBlob(b, `Счёт_${safeF(A.name)}_${todayFile()}.docx`); showToast('Счёт скачивается'); })
    .catch(e => { console.error('Invoice docx error:', e); showToast('Ошибка формирования файла'); });
}
function downloadContract() {
  if (!lastContract) { showToast('Договор не сформирован'); return; }
  buildContractDocx(EX, {name:A.name,inn:A.req.inn,kpp:A.req.kpp,address:A.req.address,phone:A.req.phone,email:A.req.email,rs:A.req.rs,bank:A.req.bank,bik:A.req.bik,ks:A.req.ks||''}, lastKP.lines, lastKP.total, lastContract.cNum)
    .then(b => { downloadBlob(b, `Договор_${safeF(A.name)}_${todayFile()}.docx`); showToast('Договор скачивается'); })
    .catch(e => { console.error('Contract docx error:', e); showToast('Ошибка формирования файла'); });
}

function showFinal() {
  document.getElementById('final-sec').style.display = 'block';
  document.getElementById('final-sec').scrollIntoView({ behavior:'smooth', block:'start' });
}

function newQuiz() {
  Object.assign(A, {
    entity:'', isNull:false, tax:'', niche:'',
    mp:[], mpInventory:false, vat:'none',
    staffRf:'none', rfCount:4, staffForeign:'none', foreignCount:1,
    cashKassa:false, cashAvans:false,
    ved:false, reconcile:false, taxMgmt:false,
    military:false, militaryCount:1, licenses:false, mgmtAcc:false, officeBuh:false,
    inventory:false, urgent:'no',
    name:'', director:'',
    req:{ inn:'', kpp:'', address:'', phone:'', email:'', rs:'', bank:'', bik:'' }
  });
  EX = Object.assign({}, EXECUTORS[0]);
  lastKP = null; lastContract = null;
  document.getElementById('kp-sec').style.display      = 'none';
  document.getElementById('contract-sec').style.display = 'none';
  document.getElementById('final-sec').style.display   = 'none';
  document.getElementById('quiz-wrap').style.display   = 'block';
  document.getElementById('hero').style.display        = 'none';
  showStep(1);
  document.getElementById('quiz-start').scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ─── Тексты документов (предпросмотр) ────────── */
function buildKPText(total, lines, hasIndividual, kpNum) {
  const taxNames = { patent:'Патент', ausn:'АУСН', usn6:'УСН 6%', usn15:'УСН 15%', osno:'ОСНО' };
  const svcLines = lines.map(l => `  • ${l.name}${l.individual?' — рассчитывается индивидуально':' — '+fmt(l.price)}`).join('\n');
  return `${EX.name}
ИНН ${EX.inn} | ${EX.address}
${EX.phone} | ${EX.email}

КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ № ${kpNum}
Дата: ${today()}

Для: ${A.name}${A.director?'\nРуководитель: '+A.director:''}

Уважаемый клиент!

Подготовили для вас расчёт стоимости бухгалтерских услуг.

Состав услуг:
${svcLines}${A.urgent==='yes'?'\n  ⚡ Срочность (× 2 к стоимости)':''}

ИТОГО: ${fmt(total)}${hasIndividual?' + индивидуальные позиции':''}

Параметры:
  Клиент: ${A.entity}${!A.isNull?' | '+( taxNames[A.tax]||A.tax):''}
  ${A.isNull?'Нулевая отчётность':'Вид деятельности: см. состав'}
  Срочность: ${A.urgent==='yes'?'Да (× 2)':'Нет'}

Условия оплаты:
50% — предоплата до начала работы.
50% — после завершения / по итогам периода.

Срок начала работ:
1–3 рабочих дня после подписания договора.

С уважением,
${EX.name}
${EX.phone} | ${EX.email}`;
}

function buildContractText(total, lines, cNum) {
  const svcLines = lines.map((l,i) => `${i+1}. ${l.name}${l.individual?' — индивидуально':' — '+fmt(l.price)}`).join('\n');
  return `ДОГОВОР ОКАЗАНИЯ УСЛУГ № ${cNum}
г. Москва                    ${today()}

${EX.name} (Исполнитель) и ${A.name} (Заказчик) заключили настоящий договор.

1. ПРЕДМЕТ ДОГОВОРА
1.1. Перечень услуг:
${svcLines}

2. СТОИМОСТЬ И ОПЛАТА
2.1. Стоимость: ${fmt(total)}${lines.some(l=>l.individual)?' + индивидуальные позиции (согласуются отдельно)':''}
2.2. 50% предоплата, 50% по завершении.

3. СРОКИ
3.1. 1–3 рабочих дня с момента поступления предоплаты.

6. РЕКВИЗИТЫ
Исполнитель: ${EX.name}
ИНН: ${EX.inn} | КПП: ${EX.kpp} | ОГРН: ${EX.ogrn}
${EX.address}
Р/с: ${EX.rs} | Банк: ${EX.bank} | БИК: ${EX.bik} | К/с: ${EX.ks}

Заказчик: ${A.name}${A.req.inn?'\nИНН: '+A.req.inn:''}${A.req.kpp?'\nКПП: '+A.req.kpp:''}${A.req.address?'\n'+A.req.address:''}${A.req.phone?'\n'+A.req.phone:''}${A.req.email?'\n'+A.req.email:''}

Исполнитель: _______________ / ${EX.dirShort} /
Заказчик:    _______________ / ${A.contact||A.name} /`;
}


/* ─── Модальное окно реквизитов ──────────────── */
function openReqModal(target) {
  modalTarget = target;
  const titles = { contract:'Реквизиты для договора', invoice:'Реквизиты для счёта' };
  document.getElementById('modal-title').textContent = titles[target] || 'Реквизиты';
  document.getElementById('modal-confirm-btn').textContent = target==='contract' ? 'Сформировать договор →' : 'Сформировать счёт →';

  // Показываем инфо о выбранном юрлице
  const info = document.getElementById('modal-exec-info');
  if (info) {
    info.innerHTML = '<div class="exec-opt" style="cursor:default;background:var(--blue-50);border-color:var(--blue-600)">'
      +'<div class="exec-info">'
      +'<span class="exec-name">'+EX.name+'</span>'
      +'<span class="exec-inn">ИНН '+EX.inn+(EX.kpp?' · КПП '+EX.kpp:'')+'</span>'
      +'</div></div>';
  }

  // Восстановить реквизиты клиента
  document.getElementById('r-inn').value     = A.req.inn;
  document.getElementById('r-kpp').value     = A.req.kpp;
  document.getElementById('r-address').value = A.req.address;
  document.getElementById('r-phone').value   = A.req.phone;
  document.getElementById('r-email').value   = A.req.email;
  document.getElementById('r-rs').value      = A.req.rs;
  document.getElementById('r-bank').value    = A.req.bank;
  document.getElementById('r-bik').value     = A.req.bik;

  document.getElementById('req-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeReqModal(e) {
  if (e && e.target !== document.getElementById('req-modal')) return;
  document.getElementById('req-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function confirmReqModal() {
  // Валидация клиента — ИНН обязателен
  const rInn = document.getElementById('r-inn').value.trim();
  if (!rInn) { document.getElementById('err-r-inn').textContent = 'Введите ИНН клиента'; return; }
  document.getElementById('err-r-inn').textContent = '';

  // Сохранить реквизиты клиента
  A.req = {
    inn:     rInn,
    kpp:     document.getElementById('r-kpp').value.trim(),
    address: document.getElementById('r-address').value.trim(),
    phone:   document.getElementById('r-phone').value.trim(),
    email:   document.getElementById('r-email').value.trim(),
    rs:      document.getElementById('r-rs').value.trim(),
    bank:    document.getElementById('r-bank').value.trim(),
    bik:     document.getElementById('r-bik').value.trim(),
  };

  // Закрыть модал и выполнить действие
  document.getElementById('req-modal').style.display = 'none';
  document.body.style.overflow = '';

  if (modalTarget === 'contract') generateContract();
  else if (modalTarget === 'invoice') downloadInvoice();
}



/* ═══════════════════════════════════════════════════
   ГЕНЕРАТОРЫ ДОКУМЕНТОВ
   Все три функции самодостаточны — берут классы
   из window.docx напрямую без обёрток.
═══════════════════════════════════════════════════ */

/* ─── Общие хелперы для docx ────────────────────── */
function _d() { return window.docx; }

function _r(text, o) {
  o = o || {};
  return new (_d().TextRun)({
    text: String(text == null ? '' : text),
    font: 'Times New Roman',
    size: o.size || 22,
    bold: !!o.bold,
    italics: !!o.italics,
    color: o.color || '000000',
  });
}

function _p(children, o) {
  o = o || {};
  const d = _d();
  const runs = typeof children === 'string' ? [_r(children, o)] : children;
  return new d.Paragraph({
    children: runs,
    alignment: o.align || d.AlignmentType.LEFT,
    spacing: { before: o.before || 0, after: o.after !== undefined ? o.after : 60 },
    indent: o.indent ? { left: o.indent } : undefined,
  });
}

function _pC(ch, o) { return _p(ch, Object.assign({}, o, { align: _d().AlignmentType.CENTER })); }
function _pJ(ch, o) { return _p(ch, Object.assign({}, o, { align: _d().AlignmentType.BOTH })); }
function _pR(ch, o) { return _p(ch, Object.assign({}, o, { align: _d().AlignmentType.RIGHT })); }
function _E(n)      { return new (_d().Paragraph)({ children:[new (_d().TextRun)('')], spacing:{before:0,after:n||80} }); }

function _cell(content, o) {
  o = o || {};
  const d = _d();
  const THIN = { style: d.BorderStyle.SINGLE, size: 4, color: 'AAAAAA' };
  const NONE = { style: d.BorderStyle.NONE,   size: 0, color: 'FFFFFF' };
  const defBorders = o.noBorder
    ? { top:NONE, bottom:NONE, left:NONE, right:NONE }
    : (o.borders || { top:THIN, bottom:THIN, left:THIN, right:THIN });

  const children = Array.isArray(content) ? content : [
    new d.Paragraph({
      children: typeof content === 'string'
        ? [_r(content, { bold: o.bold, size: o.size || 22, color: o.color })]
        : [content],
      alignment: o.align || d.AlignmentType.LEFT,
      spacing: { before: 40, after: 40 },
    })
  ];
  return new d.TableCell({
    children,
    borders: defBorders,
    width: o.w ? { size: o.w, type: d.WidthType.DXA } : undefined,
    shading: o.bg ? { fill: o.bg, type: d.ShadingType.CLEAR } : undefined,
    verticalAlign: o.va || d.VerticalAlign.CENTER,
    margins: o.m || { top: 60, bottom: 60, left: 100, right: 100 },
    columnSpan: o.span,
  });
}

function _row(cells) { return new (_d().TableRow)({ children: cells }); }

function _tbl(colWidths, rows) {
  const d = _d();
  return new d.Table({
    width: { size: colWidths.reduce(function(a,b){return a+b;}, 0), type: d.WidthType.DXA },
    columnWidths: colWidths,
    rows: rows,
  });
}

function _fmt(n) { return new Intl.NumberFormat('ru-RU').format(Math.round(n||0)); }

/* ─── КП ────────────────────────────────────────── */
async function buildKPDocx(ex, client, services, total, kpNum) {
  const d = _d();
  const W_A4=11906, MRG=850, W=W_A4-MRG*2, HW=Math.floor(W/2);
  const today_s = new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});

  const NONE  = { style:d.BorderStyle.NONE,   size:0,  color:'FFFFFF' };
  const THIN  = { style:d.BorderStyle.SINGLE, size:4,  color:'AAAAAA' };
  const DARK  = { style:d.BorderStyle.SINGLE, size:6,  color:'333333' };
  const BLUE8 = { style:d.BorderStyle.SINGLE, size:8,  color:'2563EB' };
  const NO    = { top:NONE, bottom:NONE, left:NONE,  right:NONE  };

  const svcRows = services.map(function(s, i) {
    return _row([
      _cell(String(i+1), { w:480, align:d.AlignmentType.CENTER, bg:'F5F8FF' }),
      _cell(s.name || '', { w:5500 }),
      _cell(s.individual ? 'индивидуально' : _fmt(s.price||0)+' ₽', { w:1760, align:d.AlignmentType.RIGHT }),
    ]);
  });

  const totalCell = new d.TableCell({
    children: [new d.Paragraph({ children:[_r('ИТОГО:',{bold:true})], alignment:d.AlignmentType.RIGHT, spacing:{before:80,after:80} })],
    columnSpan: 2,
    borders: { top:DARK, bottom:DARK, left:THIN, right:NONE },
    shading: { fill:'EEF3FF', type:d.ShadingType.CLEAR },
    margins: { top:80, bottom:80, left:120, right:120 },
  });

  const LW=3800, RW=W-LW;
  const paramRows = [
    ['Наименование организации', client.name||''],
    ['Стоимость услуг',          _fmt(total)+' ₽'],
    ['Сроки начала работ',       '1–3 рабочих дня после подписания договора и получения предоплаты'],
    ['Условия оплаты',           '50% — предоплата до начала работ; 50% — по завершении / по итогам периода'],
    ['НДС',                      'Не облагается (УСН, ст. 346.11 НК РФ)'],
    ['Наличие скидок',           'При заключении договора от 6 мес. — скидка 5%'],
    ['Гарантийные условия',      'Ответственность в соответствии с условиями договора'],
    ['Дополнительные условия',   'Консультации по налогообложению — 1 раз в квартал бесплатно'],
  ].map(function(pair) {
    return _row([
      _cell(pair[0], { w:LW, bold:true, bg:'F5F8FF' }),
      _cell(pair[1], { w:RW }),
    ]);
  });

  const doc = new d.Document({
    styles: { default: { document: { run: { font:'Times New Roman', size:22 } } } },
    sections: [{ properties: { page: { size:{width:W_A4,height:16838}, margin:{top:1000,right:MRG,bottom:1000,left:MRG} } }, children: [

      // Шапка: Кому / от
      _tbl([HW,HW], [_row([
        _cell([
          _p([_r('Кому: ',{bold:true}), _r(client.name||'')], {after:40}),
          _p([_r('Руководитель: ',{bold:true,size:20,color:'555555'}), _r(client.director||'',{size:20})], {after:0}),
        ], { noBorder:true, w:HW, m:{top:0,bottom:0,left:0,right:40}, va:d.VerticalAlign.TOP }),
        _cell([
          _p([_r('от: ',{bold:true}), _r(ex.name||'')], {after:40}),
          _p([_r(ex.phone||'',{size:20,color:'555555'})], {after:20}),
          _p([_r(ex.email||'',{size:20,color:'2563EB'})], {after:0}),
        ], { noBorder:true, w:HW, m:{top:0,bottom:0,left:40,right:0}, va:d.VerticalAlign.TOP }),
      ])]),

      // Синяя линия-разделитель
      new d.Paragraph({ children:[new d.TextRun('')], border:{ bottom:BLUE8 }, spacing:{before:80,after:80} }),

      // Заголовок
      _pC([_r('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ',{bold:true,size:32})], {after:20}),
      _pC([_r('№ '+kpNum, {size:20,color:'555555'})], {after:60}),
      _tbl([W],[_row([_cell([_pR('«___» _____________ 2026 г.',{after:0})], {noBorder:true,w:W,m:{top:0,bottom:0,left:0,right:0}})])]),
      _E(120),

      // Таблица услуг
      _tbl([480,5500,1760], [
        _row([
          _cell('№',         { w:480,  bold:true, bg:'2563EB', color:'FFFFFF', align:d.AlignmentType.CENTER }),
          _cell('Наименование услуги', { w:5500, bold:true, bg:'2563EB', color:'FFFFFF' }),
          _cell('Стоимость', { w:1760, bold:true, bg:'2563EB', color:'FFFFFF', align:d.AlignmentType.RIGHT }),
        ]),
        ...svcRows,
        _row([
          totalCell,
          _cell(_fmt(total)+' ₽', { w:1760, bold:true, align:d.AlignmentType.RIGHT, bg:'EEF3FF', borders:{top:DARK,bottom:DARK,left:NONE,right:DARK} }),
        ]),
      ]),
      _E(120),

      // Параметры
      _tbl([LW,RW], paramRows),
      _E(120),

      // Срок действия
      _p([_r('Настоящее предложение действует до ',{size:20}), _r('«___» _____________ 2026 года.',{bold:true,size:20})], {after:40}),
      _p([_r('Настоящее предложение является офертой в соответствии со ст. 435 ГК РФ.',{size:20,italics:true,color:'555555'})], {after:160}),

      // Подпись
      _tbl([HW,HW],[_row([
        _cell([
          _p([_r('МП',{size:20,color:'AAAAAA'})], {after:60}),
          _p([_r('Подпись: _______________________  / '+(ex.dirShort||'')+' /')], {after:0}),
        ], { noBorder:true, w:HW, m:{top:0,bottom:0,left:0,right:40} }),
        _cell([
          _p([_r(ex.name||'',{bold:true,size:20})], {after:40}),
          _p([_r(ex.inn?'ИНН: '+ex.inn:'',{size:18,color:'555555'})], {after:40}),
          _p([_r(ex.address||'',{size:18,color:'555555'})], {after:40}),
          _p([_r(ex.phone||'',{size:18})], {after:20}),
          _p([_r(ex.email||'',{size:18,color:'2563EB'})], {after:0}),
        ], { noBorder:true, w:HW, m:{top:0,bottom:0,left:120,right:0},
             borders:{top:NONE,bottom:NONE,left:{style:d.BorderStyle.SINGLE,size:6,color:'333333'},right:NONE},
             va:d.VerticalAlign.TOP }),
      ])]),

    ]}]
  });
  return d.Packer.toBlob(doc);
}

/* ─── СЧЁТ (docx по шаблону) ─────────────────────── */
async function buildInvoiceDocx(ex, client, services, total, invNum) {
  const d = _d();
  const W_A4=11906, MRG_L=1080, MRG_R=720, W=W_A4-MRG_L-MRG_R;
  const today_s = new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  const filt = services.filter(function(s){ return !s.individual; });
  const filtTotal = filt.reduce(function(s,x){ return s+(x.price||0); }, 0);

  const NONE_B = {style:d.BorderStyle.NONE,   size:0, color:'FFFFFF'};
  const THIN_B = {style:d.BorderStyle.SINGLE, size:4, color:'000000'};
  const NO  = {top:NONE_B,bottom:NONE_B,left:NONE_B,right:NONE_B};
  const ALL = {top:THIN_B,bottom:THIN_B,left:THIN_B,right:THIN_B};
  const BOT = {top:NONE_B,bottom:THIN_B,left:NONE_B,right:NONE_B};

  function r(text, o) {
    o=o||{};
    return new d.TextRun({text:String(text??''),font:'Arial',size:o.size||18,
      bold:!!o.bold,italics:!!o.italic,color:o.color||'000000'});
  }
  function p(ch, o) {
    o=o||{};
    const runs=typeof ch==='string'?[r(ch,o)]:ch;
    return new d.Paragraph({children:runs,alignment:o.align||d.AlignmentType.LEFT,
      spacing:{before:o.before||0,after:o.after!==undefined?o.after:40}});
  }
  const pC=(ch,o)=>p(ch,Object.assign({},o,{align:d.AlignmentType.CENTER}));
  const E=(n)=>new d.Paragraph({children:[new d.TextRun('')],spacing:{before:0,after:n||60}});

  function cl(content, o) {
    o=o||{};
    const ch=Array.isArray(content)?content:[new d.Paragraph({
      children:typeof content==='string'?[r(content,{bold:o.bold,size:o.size||18})]:[content],
      alignment:o.align||d.AlignmentType.LEFT,spacing:{before:40,after:40}
    })];
    return new d.TableCell({children:ch,
      borders:o.borders!==undefined?o.borders:ALL,
      width:o.w?{size:o.w,type:d.WidthType.DXA}:undefined,
      shading:o.bg?{fill:o.bg,type:d.ShadingType.CLEAR}:undefined,
      verticalAlign:o.va||d.VerticalAlign.CENTER,
      margins:o.m||{top:40,bottom:40,left:80,right:80},
      columnSpan:o.span});
  }
  const rw=cells=>new d.TableRow({children:cells});
  const tb=(cw,rows)=>new d.Table({width:{size:cw.reduce((a,b)=>a+b,0),type:d.WidthType.DXA},columnWidths:cw,rows});
  const fmtN=n=>new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0);
  const fmtI=n=>new Intl.NumberFormat('ru-RU').format(Math.round(n||0));
  function amtWords(n){ return fmtI(Math.floor(n))+' руб. '+String(Math.round((n-Math.floor(n))*100)).padStart(2,'0')+' коп.'; }

  const BW1=5200, BW2=1100, BW3=W-BW1-BW2-20;
  const SW=[600,5200,800,800,1300,1406];

  const svcRows = filt.map(function(s,i){
    return rw([
      cl(String(i+1),{w:SW[0],align:d.AlignmentType.CENTER}),
      cl(s.name,{w:SW[1]}),
      cl(String(s.qty||1),{w:SW[2],align:d.AlignmentType.CENTER}),
      cl('усл.',{w:SW[3],align:d.AlignmentType.CENTER}),
      cl(fmtN(s.price||0),{w:SW[4],align:d.AlignmentType.RIGHT}),
      cl(fmtN(s.price||0),{w:SW[5],align:d.AlignmentType.RIGHT}),
    ]);
  });

  const spanCell=(label,bold,colSpan)=>new d.TableCell({
    children:[new d.Paragraph({children:[r(label,{bold:bold,size:18})],alignment:d.AlignmentType.RIGHT,spacing:{before:60,after:60}})],
    columnSpan:colSpan,borders:ALL,margins:{top:40,bottom:40,left:80,right:80}
  });

  const doc = new d.Document({
    styles:{default:{document:{run:{font:'Arial',size:18}}}},
    sections:[{properties:{page:{size:{width:W_A4,height:16838},margin:{top:720,right:MRG_R,bottom:720,left:MRG_L}}},children:[

      // Шапка исполнителя
      p([r(ex.name||'',{bold:true,size:20})],{after:20}),
      p(ex.address||'',{after:20,size:16}),
      p([r('Тел.: ',{size:16}),r(ex.phone||'',{size:16}),r('   E-mail: ',{size:16}),r(ex.email||'',{size:16})],{after:80}),

      // Банковская шапка
      tb([BW1,BW2,BW3+20],[
        rw([
          cl([p([r(ex.bank||'',{size:16})])],{w:BW1,borders:{top:THIN_B,bottom:NONE_B,left:THIN_B,right:THIN_B},m:{top:40,bottom:20,left:80,right:80}}),
          cl([p([r('БИК',{bold:true,size:16})])],{w:BW2,borders:{top:THIN_B,bottom:NONE_B,left:THIN_B,right:THIN_B},align:d.AlignmentType.CENTER}),
          cl([p([r(ex.bik||'',{size:16})])],{w:BW3+20,borders:{top:THIN_B,bottom:THIN_B,left:THIN_B,right:THIN_B},m:{top:40,bottom:40,left:80,right:80}}),
        ]),
        rw([
          cl([p([r('Банк получателя',{size:14,color:'666666'})])],{w:BW1,borders:{top:NONE_B,bottom:THIN_B,left:THIN_B,right:THIN_B},m:{top:20,bottom:40,left:80,right:80}}),
          cl([p([r('Сч. №',{bold:true,size:16})])],{w:BW2,borders:{top:NONE_B,bottom:THIN_B,left:THIN_B,right:THIN_B},align:d.AlignmentType.CENTER}),
          cl([p([r(ex.ks||'',{size:16})])],{w:BW3+20,borders:{top:THIN_B,bottom:THIN_B,left:THIN_B,right:THIN_B}}),
        ]),
        rw([
          cl([p([r('ИНН ',{bold:true,size:16}),r(ex.inn||'',{size:16}),r('   КПП ',{bold:true,size:16}),r(ex.kpp||'',{size:16})])],{w:BW1,borders:ALL}),
          cl([p([r('Сч. №',{bold:true,size:16})])],{w:BW2,borders:ALL,align:d.AlignmentType.CENTER}),
          cl([p([r(ex.rs||'',{size:16})])],{w:BW3+20,borders:ALL}),
        ]),
        rw([
          cl([p([r(ex.name||'',{bold:true,size:16})])],{w:BW1,borders:ALL}),
          cl([p([r('Получатель',{size:14,color:'666666'})])],{w:BW2,borders:ALL,align:d.AlignmentType.CENTER}),
          cl('',{w:BW3+20,borders:ALL}),
        ]),
      ]),

      E(120),
      p([r('Счёт № '+invNum+' от '+today_s,{bold:true,size:24})],{after:80}),

      // Поставщик / Покупатель
      tb([1800,W-1800],[
        rw([cl([p([r('Поставщик:',{bold:true,size:18})])],{w:1800,borders:NO}),cl([p([r((ex.name||'')+', ИНН '+(ex.inn||''),{size:18})])],{w:W-1800,borders:BOT})]),
        rw([cl([p([r('Покупатель:',{bold:true,size:18})])],{w:1800,borders:NO}),cl([p([r((client.name||'')+', ИНН '+(client.inn||'')+', КПП '+(client.kpp||''),{size:18})])],{w:W-1800,borders:BOT})]),
      ]),
      E(80),

      // Таблица услуг
      tb(SW,[
        rw([cl('№',{w:SW[0],bold:true,bg:'D9D9D9',align:d.AlignmentType.CENTER}),cl('Наименование товаров (работ, услуг)',{w:SW[1],bold:true,bg:'D9D9D9'}),cl('Кол-во',{w:SW[2],bold:true,bg:'D9D9D9',align:d.AlignmentType.CENTER}),cl('Ед.',{w:SW[3],bold:true,bg:'D9D9D9',align:d.AlignmentType.CENTER}),cl('Цена',{w:SW[4],bold:true,bg:'D9D9D9',align:d.AlignmentType.RIGHT}),cl('Сумма',{w:SW[5],bold:true,bg:'D9D9D9',align:d.AlignmentType.RIGHT})]),
        ...svcRows,
        rw([spanCell('Итого:',true,5),cl(fmtN(filtTotal),{w:SW[5],bold:true,align:d.AlignmentType.RIGHT})]),
        rw([spanCell('В том числе НДС:',false,5),cl('Без НДС',{w:SW[5],align:d.AlignmentType.RIGHT})]),
        rw([spanCell('Всего к оплате:',true,5),cl(fmtN(filtTotal),{w:SW[5],bold:true,align:d.AlignmentType.RIGHT})]),
      ]),
      E(80),

      p([r('Всего к оплате: ',{bold:true,size:18}),r(amtWords(filtTotal),{size:18})],{after:20}),
      p('НДС не облагается (ст. 346.11 НК РФ)',{size:16,after:100}),

      // Подпись
      tb([1800,3000,1600,W-1800-3000-1600],[
        rw([
          cl([p([r('Поставщик',{bold:true,size:18})])],{w:1800,borders:NO}),
          cl('',{w:3000,borders:{top:NONE_B,bottom:THIN_B,left:NONE_B,right:NONE_B}}),
          cl('',{w:1600,borders:NO}),
          cl([p([r(ex.dirShort||'',{size:18})])],{w:W-1800-3000-1600,borders:{top:NONE_B,bottom:THIN_B,left:NONE_B,right:NONE_B}}),
        ]),
        rw([
          cl('',{w:1800,borders:NO}),
          cl([pC([r('подпись',{size:14,color:'888888'})])],{w:3000,borders:NO}),
          cl('',{w:1600,borders:NO}),
          cl([pC([r('расшифровка подписи',{size:14,color:'888888'})])],{w:W-1800-3000-1600,borders:NO}),
        ]),
      ]),

    ]}]
  });
  return d.Packer.toBlob(doc);
}


/* ─── ДОГОВОР ───────────────────────────────────── */
async function buildContractDocx(ex, client, services, total, conNum) {
  const d = _d();
  const W_A4=11906, MRG=850, W=W_A4-MRG*2, HW=Math.floor(W/2);
  const today_s = new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  const fmtN = function(n){ return new Intl.NumberFormat('ru-RU').format(Math.round(n||0)); };

  const NONE = { style:d.BorderStyle.NONE,   size:0, color:'FFFFFF' };
  const THIN = { style:d.BorderStyle.SINGLE, size:4, color:'AAAAAA' };
  const NO   = { top:NONE, bottom:NONE, left:NONE, right:NONE };
  const ALL  = { top:THIN, bottom:THIN, left:THIN, right:THIN };

  const svcList = services.map(function(s,i){
    const price = s.individual ? 'стоимость определяется дополнительным соглашением' : fmtN(s.price||0)+' ₽ в месяц';
    return _pJ((i+1)+'. '+s.name+' — '+price+';', {indent:360, after:40});
  });

  const doc = new d.Document({
    styles:{default:{document:{run:{font:'Times New Roman',size:24}}}},
    sections:[{properties:{page:{size:{width:W_A4,height:16838},margin:{top:1134,right:MRG,bottom:1134,left:MRG}}},children:[

      _pC([_r('Договор на оказание профессиональных бухгалтерских услуг',{bold:true,size:26})],{after:80}),

      _tbl([HW,HW],[_row([
        _cell([_p('г. Москва',{after:0})],{noBorder:true,w:HW,m:{top:0,bottom:0,left:0,right:0}}),
        _cell([_pR('«___» _____________ 2026 г.',{after:0})],{noBorder:true,w:HW,m:{top:0,bottom:0,left:0,right:0}}),
      ])]),
      _E(120),

      _pJ([
        _r(client.name||'',{bold:true}),_r(' в лице '),_r(client.director||'________________________',{bold:true}),
        _r(', действующего на основании Устава, именуемый в дальнейшем '),_r('«Заказчик»',{bold:true}),
        _r(', с одной стороны, и '),_r(ex.name||'',{bold:true}),_r(' в лице '),_r(ex.director||'',{bold:true}),
        _r(', действующего на основании Устава, именуемый в дальнейшем '),_r('«Исполнитель»',{bold:true}),
        _r(', с другой стороны, именуемые «Стороны», заключили настоящий договор о нижеследующем:'),
      ],{after:160}),

      _p([_r('1. ПРЕДМЕТ ДОГОВОРА',{bold:true})],{after:80}),
      _pJ('1.1. Оказание услуг по ведению бухгалтерского и налогового учёта в объёме и на условиях, предусмотренных Договором:',{after:60}),
      _pJ('1.1.1. Ведение бухгалтерского учёта в системе «1С», ведение регистров налогового учёта;',{indent:360,after:40}),
      _pJ('1.1.2. Расчёт заработной платы, больничных, отпускных и начисление налогов с ФОТ;',{indent:360,after:40}),
      _pJ('1.1.3. Составление и сдача квартальной и годовой отчётности в налоговые органы и внебюджетные фонды;',{indent:360,after:40}),
      _pJ('1.1.4. Контроль за правильностью оформления первичных документов Заказчика;',{indent:360,after:40}),
      _pJ('1.1.5. Сопровождение налоговых и банковских проверок.',{indent:360,after:120}),

      _p([_r('2. ОБЯЗАННОСТИ СТОРОН',{bold:true})],{after:80}),
      _p([_r('2.1. Исполнитель обязан:',{bold:true})],{after:60}),
      _pJ('2.1.1. Своевременно оказывать услуги в соответствии с законодательством РФ.',{indent:360,after:40}),
      _pJ('2.1.2. Предупреждать Заказчика о возможных отрицательных последствиях хозяйственных операций.',{indent:360,after:40}),
      _pJ('2.1.3. Предоставлять отчётность для подписания не позже чем за 3 рабочих дня до окончания сроков.',{indent:360,after:120}),
      _p([_r('2.2. Заказчик обязан:',{bold:true})],{after:60}),
      _pJ('2.2.1. Своевременно предоставлять первичные документы Исполнителю.',{indent:360,after:40}),
      _pJ('2.2.2. Уведомлять об изменениях в документах и финансово-хозяйственной деятельности.',{indent:360,after:40}),
      _pJ('2.2.3. Оплатить услуги в порядке и сроки, установленные договором.',{indent:360,after:120}),

      _p([_r('3. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЁТОВ',{bold:true})],{after:80}),
      _pJ([
        _r('3.1. Стоимость услуг Исполнителя составляет '),
        _r(fmtN(total)+' ('+fmtN(total)+' рублей 00 копеек)',{bold:true}),
        _r(' рублей в месяц. В стоимость входят следующие услуги:'),
      ],{after:60}),
      ...svcList,
      _E(40),
      _pJ('3.2. Оплата производится не позднее 5 рабочих дней с момента получения счёта путём перечисления на расчётный счёт Исполнителя.',{after:60}),
      _pJ('3.3. Исполнитель выставляет Акт оказания услуг, подписываемый Заказчиком в течение 3 рабочих дней.',{after:120}),

      _p([_r('4. КОНФИДЕНЦИАЛЬНОСТЬ',{bold:true})],{after:80}),
      _pJ('4.1. Стороны обязуются хранить в тайне информацию, полученную в связи с исполнением Договора.',{after:60}),
      _pJ('4.2. Условия конфиденциальности действуют 3 года после окончания Договора.',{after:120}),

      _p([_r('5. ОТВЕТСТВЕННОСТЬ СТОРОН',{bold:true})],{after:80}),
      _pJ('5.1. При нарушении сроков оплаты Заказчик уплачивает пени 0,1% от неуплаченной суммы за каждый день просрочки.',{after:60}),
      _pJ('5.2. Предел ответственности Исполнителя — пятикратный размер ежемесячной оплаты по п.3.1.',{after:60}),
      _pJ('5.3. Исполнитель несёт ответственность за сохранность документов Заказчика.',{after:120}),

      _p([_r('6. СРОК ДЕЙСТВИЯ И РАСТОРЖЕНИЕ',{bold:true})],{after:80}),
      _pJ('6.1. Договор вступает в силу с момента подписания и действует до «___» _____________ 2027 года.',{after:60}),
      _pJ('6.2. При отсутствии заявления о расторжении за 30 дней до окончания — договор продлевается на год.',{after:60}),
      _pJ('6.3. Расторжение — с письменным уведомлением за 30 дней.',{after:120}),

      _p([_r('7. ПРОЧИЕ УСЛОВИЯ',{bold:true})],{after:80}),
      _pJ('7.1. Договор составлен в двух экземплярах — по одному для каждой Стороны.',{after:60}),
      _pJ('7.2. Изменения действительны только в письменной форме.',{after:60}),
      _pJ('7.3. Споры разрешаются в Арбитражном суде г. Москвы.',{after:120}),

      _p([_r('8. ЮРИДИЧЕСКИЕ АДРЕСА И БАНКОВСКИЕ РЕКВИЗИТЫ СТОРОН',{bold:true})],{after:80}),
      _tbl([HW,HW],[_row([
        _cell([
          _p([_r('Заказчик',{bold:true})],{after:60}),
          _p([_r('Юр. адрес: '),_r(client.address||'')],{after:40}),
          _p([_r('ИНН: '),_r(client.inn||'')],{after:40}),
          _p([_r('КПП: '),_r(client.kpp||'')],{after:40}),
          _p([_r('Банк: '),_r(client.bank||'')],{after:40}),
          _p([_r('Рас./счёт: '),_r(client.rs||'')],{after:40}),
          _p([_r('Корр./счёт: '),_r(client.ks||'')],{after:40}),
          _p([_r('БИК: '),_r(client.bik||'')],{after:0}),
        ],{borders:ALL,w:HW,va:d.VerticalAlign.TOP,m:{top:80,bottom:80,left:120,right:80}}),
        _cell([
          _p([_r('Исполнитель',{bold:true})],{after:60}),
          _p([_r('Юр. адрес: '),_r(ex.address||'')],{after:40}),
          _p([_r('ИНН: '),_r(ex.inn||'')],{after:40}),
          _p([_r('КПП: '),_r(ex.kpp||'')],{after:40}),
          _p([_r('Банк: '),_r(ex.bank||'')],{after:40}),
          _p([_r('Рас./счёт: '),_r(ex.rs||'')],{after:40}),
          _p([_r('Корр./счёт: '),_r(ex.ks||'')],{after:40}),
          _p([_r('БИК: '),_r(ex.bik||'')],{after:0}),
        ],{borders:ALL,w:HW,va:d.VerticalAlign.TOP,m:{top:80,bottom:80,left:80,right:120}}),
      ])]),
      _E(120),

      _p([_r('9. ПОДПИСИ СТОРОН',{bold:true})],{after:80}),
      _tbl([HW,HW],[_row([
        _cell([
          _p([_r('Заказчик',{bold:true})],{after:80}),
          _p([_r(client.name||'')],{after:40}),
          _p([_r('_______________ / '+(client.dirShort||client.name||'')+' /')],{after:40}),
          _p([_r('М.П.',{size:18,color:'888888'})],{after:0}),
        ],{noBorder:true,w:HW,m:{top:0,bottom:0,left:0,right:40}}),
        _cell([
          _p([_r('Исполнитель',{bold:true})],{after:80}),
          _p([_r(ex.name||'')],{after:40}),
          _p([_r('_______________ / '+(ex.dirShort||'')+' /')],{after:40}),
          _p([_r('М.П.',{size:18,color:'888888'})],{after:0}),
        ],{noBorder:true,w:HW,m:{top:0,bottom:0,left:40,right:0}}),
      ])]),

    ]}]
  });
  return d.Packer.toBlob(doc);
}

/* ─── Скачивание и утилиты ──────────────────────── */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
}

function copyEl(id) {
  const txt = (document.getElementById(id)||{}).textContent||'';
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(function(){ showToast('Скопировано'); }).catch(function(){ fbCopy(txt); });
  } else { fbCopy(txt); }
}
function fbCopy(txt) {
  const ta = document.createElement('textarea'); ta.value = txt;
  Object.assign(ta.style,{position:'fixed',opacity:'0',pointerEvents:'none'});
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); showToast('Скопировано'); }catch(e){ showToast('Не удалось скопировать'); }
  document.body.removeChild(ta);
}

function showToast(msg) {
  const old = document.querySelector('.toast-el'); if (old) old.remove();
  const t = document.createElement('div'); t.className='toast-el'; t.textContent=msg;
  Object.assign(t.style,{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',
    background:'#111827',color:'#fff',padding:'10px 22px',borderRadius:'100px',
    fontFamily:'Inter,sans-serif',fontSize:'13px',fontWeight:'500',zIndex:'9999',
    boxShadow:'0 8px 30px rgba(0,0,0,.22)',opacity:'0',transition:'opacity .2s ease',
    pointerEvents:'none',whiteSpace:'nowrap'});
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity='1'; });
  setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){ t.remove(); },300); },2200);
}

/* ─── Init ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // Маска телефона
  var ph = document.getElementById('f-phone');
  if (ph) ph.addEventListener('input', function() {
    var v = this.value.replace(/\D/g,'');
    if (v.startsWith('8')) v = '7'+v.slice(1);
    if (v.startsWith('7') && v.length > 1)
      v = '+7 ('+v.slice(1,4)+') '+v.slice(4,7)+'-'+v.slice(7,9)+'-'+v.slice(9,11);
    else if (v.length) v = '+'+v;
    this.value = v;
  });
  // ИНН — только цифры
  var inn = document.getElementById('f-inn');
  if (inn) inn.addEventListener('input', function(){ this.value=this.value.replace(/\D/g,'').slice(0,12); });
  // Enter
  document.addEventListener('keydown', function(e) {
    if (e.key==='Enter' && step < STEPS) goNext();
    if (e.key==='Enter' && step === STEPS) generateKP();
  });
  // Показываем первый шаг
  showStep(1);
});
