// IDOC minimal SPA with localStorage, bilingual UI, VAT/WHT calc, print-to-PDF
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const i18nDict = {
  th:{
    tagline:"การทำจ่าย เป็นเรื่องง่ายสำหรับทุกคน",
    documents:"เอกสาร",
    customers:"ลูกค้า",
    items:"สินค้า/บริการ",
    settings:"ตั้งค่า",
    newDocument:"ออกเอกสารใหม่",
    footer:"สร้างเพื่อฟรีแลนซ์ — Liquid Glass UI.",
    createDocs:"สร้างเอกสารทางบัญชี",
    easyGen:"สร้างใบแจ้งหนี้ ใบเสนอราคา ใบเสร็จ ได้ง่ายๆ",
    invoice:"ใบแจ้งหนี้",
    quote:"ใบเสนอราคา",
    receipt:"ใบเสร็จรับเงิน",
    creditNote:"ใบลดหนี้",
    recentDocs:"เอกสารล่าสุด",
    statusPaid:"ชำระแล้ว",
    statusSent:"ส่งแล้ว",
    statusUnpaid:"ค้างชำระ",
    addCustomer:"เพิ่มลูกค้า",
    addItem:"เพิ่มสินค้า/บริการ",
    name:"ชื่อ",
    taxId:"เลขผู้เสียภาษี",
    address:"ที่อยู่",
    email:"อีเมล",
    phone:"โทรศัพท์",
    save:"บันทึก",
    cancel:"ยกเลิก",
    create:"สร้าง",
    customer:"ลูกค้า",
    item:"สินค้า/บริการ",
    quantity:"จำนวน",
    unitPrice:"ราคาต่อหน่วย",
    vatable:"คิด VAT",
    whtRate:"หัก ณ ที่จ่าย (%)",
    vatMode:"โหมด VAT",
    exclusive:"ไม่รวม VAT",
    inclusive:"รวม VAT",
    none:"ไม่คิด VAT",
    discount:"ส่วนลด",
    shipping:"ค่าจัดส่ง/อื่นๆ",
    notes:"หมายเหตุ",
    preview:"พรีวิว",
    printPdf:"พิมพ์/บันทึก PDF",
    lang:"ภาษา",
    brand:"แบรนด์",
    defaultRates:"อัตราพื้นฐาน",
    vatRate:"VAT (%)",
    createNew:"สร้างเอกสารใหม่",
    issueDate:"วันที่ออก",
    dueDate:"ครบกำหนด",
    number:"เลขที่เอกสาร",
    currency:"สกุลเงิน",
  },
  en:{
    tagline:"Payments & paperwork, made easy",
    documents:"Documents",
    customers:"Customers",
    items:"Items/Services",
    settings:"Settings",
    newDocument:"New Document",
    footer:"Made for freelancers — Liquid Glass UI.",
    createDocs:"Create Accounting Documents",
    easyGen:"Easily generate invoices, quotes, receipts, and more",
    invoice:"Invoice",
    quote:"Quote",
    receipt:"Receipt",
    creditNote:"Credit Note",
    recentDocs:"Recent Documents",
    statusPaid:"Paid",
    statusSent:"Sent",
    statusUnpaid:"Unpaid",
    addCustomer:"Add Customer",
    addItem:"Add Item/Service",
    name:"Name",
    taxId:"Tax ID",
    address:"Address",
    email:"Email",
    phone:"Phone",
    save:"Save",
    cancel:"Cancel",
    create:"Create",
    customer:"Customer",
    item:"Item/Service",
    quantity:"Qty",
    unitPrice:"Unit Price",
    vatable:"Vatable",
    whtRate:"WHT (%)",
    vatMode:"VAT Mode",
    exclusive:"Exclusive",
    inclusive:"Inclusive",
    none:"None",
    discount:"Discount",
    shipping:"Shipping/Other",
    notes:"Notes",
    preview:"Preview",
    printPdf:"Print/Save PDF",
    lang:"Language",
    brand:"Brand",
    defaultRates:"Default Rates",
    vatRate:"VAT (%)",
    createNew:"Create New Document",
    issueDate:"Issue Date",
    dueDate:"Due Date",
    number:"Document No.",
    currency:"Currency",
  }
};

const state = {
  lang: localStorage.getItem("idoc_lang") || "th",
  settings: JSON.parse(localStorage.getItem("idoc_settings")||"{}"),
  customers: JSON.parse(localStorage.getItem("idoc_customers")||"[]"),
  items: JSON.parse(localStorage.getItem("idoc_items")||"[]"),
  documents: JSON.parse(localStorage.getItem("idoc_documents")||"[]")
};

// Defaults
if(state.settings.vatRate==null) state.settings.vatRate = 7;
if(!state.settings.numberPrefix) state.settings.numberPrefix = "INV-";
if(!state.settings.currency) state.settings.currency = "THB";

function saveAll(){
  localStorage.setItem("idoc_lang", state.lang);
  localStorage.setItem("idoc_settings", JSON.stringify(state.settings));
  localStorage.setItem("idoc_customers", JSON.stringify(state.customers));
  localStorage.setItem("idoc_items", JSON.stringify(state.items));
  localStorage.setItem("idoc_documents", JSON.stringify(state.documents));
}

function t(key){
  return i18nDict[state.lang][key] || key;
}

function applyI18n(){
  $$("#app [data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    const str = t(k);
    if(el.tagName==="INPUT" || el.tagName==="TEXTAREA") el.placeholder = str;
    else el.textContent = str;
  });
  document.title = state.lang==="th" ? "IDOC — การทำจ่าย เป็นเรื่องง่ายสำหรับทุกคน" : "IDOC — Payments & paperwork, made easy";
}

function route(view){
  location.hash = view;
  render();
}

function render(){
  $("#year").textContent = new Date().getFullYear();
  applyI18n();
  const hash = location.hash.replace("#","") || "dashboard";
  const root = $("#viewRoot");
  root.innerHTML = "";
  if(hash==="dashboard") return renderDashboard(root);
  if(hash==="documents") return renderDocuments(root);
  if(hash==="customers") return renderCustomers(root);
  if(hash==="items") return renderItems(root);
  if(hash==="settings") return renderSettings(root);
  if(hash==="create") return renderCreate(root);
}

function renderDashboard(root){
  const html = `
    <section class="text-center mb-8">
      <h1 class="text-3xl font-extrabold mb-2" data-i18n="createDocs">${t("createDocs")}</h1>
      <p class="text-slate-500 mb-6" data-i18n="easyGen">${t("easyGen")}</p>
      <a class="btn-primary" href="#create" data-i18n="newDocument">${t("newDocument")}</a>
    </section>
    <div class="grid-tiles mb-10">
      ${tile("invoice")} ${tile("quote")} ${tile("receipt")} ${tile("creditNote")}
    </div>
    <section class="card p-5">
      <h2 class="text-xl font-semibold mb-4" data-i18n="recentDocs">${t("recentDocs")}</h2>
      ${tableDocs(state.documents.slice(-5).reverse())}
    </section>
  `;
  root.innerHTML = html;
  applyI18n();
  $$(".tile").forEach(el=>el.addEventListener("click",()=>route("create")));
}

function tile(key){
  const icons = {invoice:"🧾", quote:"📄", receipt:"🧾", creditNote:"📃"};
  return `<div class="tile" data-type="${key}">
    <div class="icon text-3xl">${icons[key]}</div>
    <div class="font-medium" data-i18n="${key}">${t(key)}</div>
  </div>`;
}

function tableDocs(list){
  if(!list.length) return `<div class="text-slate-500 text-sm">—</div>`;
  return `<table class="table">
    <thead><tr><th>${t("number")}</th><th>${t("customer")}</th><th>${t("issueDate")}</th><th>Status</th></tr></thead>
    <tbody>
      ${list.map(d=>`<tr>
        <td>${d.number}</td>
        <td>${(state.customers.find(c=>c.id===d.customerId)||{}).name||"-"}</td>
        <td>${d.issueDate}</td>
        <td>${statusBadge(d.status)}</td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function statusBadge(s){
  const map = {Paid:"badge-green", Sent:"badge-yellow", Unpaid:"badge-red",
               "ชำระแล้ว":"badge-green","ส่งแล้ว":"badge-yellow","ค้างชำระ":"badge-red"};
  const cls = map[s]||"badge-yellow";
  return `<span class="badge ${cls}">${s}</span>`;
}

function renderDocuments(root){
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="documents">${t("documents")}</h1>
      <a class="btn-primary" href="#create" data-i18n="newDocument">${t("newDocument")}</a>
    </div>
    <div class="card p-5">${tableDocs(state.documents.slice().reverse())}</div>`;
  applyI18n();
}

function renderCustomers(root){
  const list = state.customers.slice().reverse();
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="customers">${t("customers")}</h1>
      <button class="btn-primary" id="addCBtn" data-i18n="addCustomer">${t("addCustomer")}</button>
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      ${list.map(c=>`<div class="card p-4">
        <div class="font-semibold">${c.name}</div>
        <div class="text-xs text-slate-500">${c.taxId||""}</div>
        <div class="text-sm">${c.address||""}</div>
        <div class="text-sm">${c.email||""} ${c.phone||""}</div>
      </div>`).join("")}
    </div>`;
  $("#addCBtn").onclick = ()=> openCustomerModal();
}

function renderItems(root){
  const list = state.items.slice().reverse();
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="items">${t("items")}</h1>
      <button class="btn-primary" id="addIBtn" data-i18n="addItem">${t("addItem")}</button>
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      ${list.map(it=>`<div class="card p-4">
        <div class="font-semibold">${it.name}</div>
        <div class="text-sm">${formatMoney(it.price)} • ${it.vatable? "VAT":"No VAT"}</div>
        <div class="text-xs text-slate-500">${t("whtRate")}: ${it.whtRate||0}%</div>
      </div>`).join("")}
    </div>`;
  $("#addIBtn").onclick = ()=> openItemModal();
}

function renderSettings(root){
  root.innerHTML = `<h1 class="text-2xl font-bold mb-4" data-i18n="settings">${t("settings")}</h1>
    <div class="card p-5 grid sm:grid-cols-2 gap-5">
      <div>
        <label class="label">${t("brand")}</label>
        <input class="input mt-1" placeholder="IDOC"/>
      </div>
      <div>
        <label class="label">${t("lang")}</label>
        <select id="langSetting" class="input mt-1">
          <option value="th">ไทย</option>
          <option value="en">English</option>
        </select>
      </div>
      <div>
        <label class="label">${t("vatRate")}</label>
        <input id="vatRate" type="number" class="input mt-1" value="${state.settings.vatRate}"/>
      </div>
      <div>
        <label class="label"># Prefix</label>
        <input id="numPrefix" class="input mt-1" value="${state.settings.numberPrefix}"/>
      </div>
      <div>
        <label class="label">${t("currency")}</label>
        <input id="currency" class="input mt-1" value="${state.settings.currency}"/>
      </div>
      <div class="flex items-end">
        <button id="saveSettings" class="btn-primary">${t("save")}</button>
      </div>
    </div>`;
  $("#langSetting").value = state.lang;
  $("#saveSettings").onclick = ()=>{
    state.lang = $("#langSetting").value;
    state.settings.vatRate = parseFloat($("#vatRate").value||"7");
    state.settings.numberPrefix = $("#numPrefix").value || "INV-";
    state.settings.currency = $("#currency").value || "THB";
    saveAll();
    applyI18n();
    alert(state.lang==="th"?"บันทึกแล้ว":"Saved");
  };
}

function renderCreate(root){
  const itemsOptions = state.items.map(it=>`<option value="${it.id}">${it.name}</option>`).join("");
  const custOptions = state.customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="createNew">${t("createNew")}</h1>
      <div class="flex gap-2">
        <a class="btn-primary" id="printBtn" data-i18n="printPdf">${t("printPdf")}</a>
      </div>
    </div>
    <div class="grid lg:grid-cols-3 gap-5">
      <div class="card p-5 lg:col-span-2">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">${t("customer")}</label>
            <select id="customer" class="input">
              <option value="">—</option>
              ${custOptions}
            </select>
          </div>
          <div>
            <label class="label">${t("number")}</label>
            <input id="docNo" class="input" value="${state.settings.numberPrefix}${String(state.documents.length+1).padStart(4,"0")}"/>
          </div>
          <div>
            <label class="label">${t("issueDate")}</label>
            <input id="issueDate" type="date" class="input" value="${new Date().toISOString().substring(0,10)}"/>
          </div>
          <div>
            <label class="label">${t("dueDate")}</label>
            <input id="dueDate" type="date" class="input" value="${new Date(Date.now()+14*864e5).toISOString().substring(0,10)}"/>
          </div>
          <div>
            <label class="label">${t("vatMode")}</label>
            <select id="vatMode" class="input">
              <option value="exclusive">${t("exclusive")}</option>
              <option value="inclusive">${t("inclusive")}</option>
              <option value="none">${t("none")}</option>
            </select>
          </div>
          <div>
            <label class="label">${t("vatRate")}</label>
            <input id="vatRateDoc" class="input" type="number" value="${state.settings.vatRate}"/>
          </div>
        </div>
        <div class="mt-6">
          <table class="table">
            <thead>
              <tr><th>${t("item")}</th><th>${t("quantity")}</th><th>${t("unitPrice")}</th><th>${t("vatRate")}</th><th>${t("whtRate")}</th><th>Total</th></tr>
            </thead>
            <tbody id="lineBody"></tbody>
          </table>
          <div class="mt-3">
            <button class="btn-primary" id="addLine">${t("addItem")}</button>
          </div>
        </div>
        <div class="grid sm:grid-cols-3 gap-4 mt-6">
          <div>
            <label class="label">${t("discount")}</label>
            <input id="discount" type="number" class="input" value="0"/>
          </div>
          <div>
            <label class="label">${t("shipping")}</label>
            <input id="shipping" type="number" class="input" value="0"/>
          </div>
          <div>
            <label class="label">${t("notes")}</label>
            <input id="notes" class="input" placeholder="${t("notes")}"/>
          </div>
        </div>
      </div>
      <div class="card p-5" id="previewCard">
        <h3 class="font-semibold mb-3" data-i18n="preview">${t("preview")}</h3>
        <div id="preview"></div>
      </div>
    </div>`;

  function addLineRow(){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>
        <select class="input itemSel">
          <option value="">—</option>${state.items.map(i=>`<option value="${i.id}">${i.name}</option>`).join("")}
        </select>
      </td>
      <td><input type="number" class="input qty" value="1"/></td>
      <td><input type="number" class="input price" value="0"/></td>
      <td><input type="number" class="input vat" value="${state.settings.vatRate}"/></td>
      <td><input type="number" class="input wht" value="0"/></td>
      <td class="lineTotal text-right">0.00</td>`;
    $("#lineBody").appendChild(tr);
    tr.querySelector(".itemSel").addEventListener("change", (e)=>{
      const it = state.items.find(x=>x.id===e.target.value);
      if(it){
        tr.querySelector(".price").value = it.price;
        tr.querySelector(".vat").value = it.vatable ? state.settings.vatRate : 0;
        tr.querySelector(".wht").value = it.whtRate||0;
        recalc();
      }
    });
    $$(".qty, .price, .vat, .wht, #vatMode, #vatRateDoc, #discount, #shipping").forEach(el=>{
      el.addEventListener("input", recalc);
    });
  }

  $("#addLine").onclick = ()=>{ addLineRow(); recalc(); };
  addLineRow();
  recalc();

  $("#printBtn").onclick = ()=>{
    // Save doc to storage, then print
    const doc = collectDoc();
    state.documents.push(doc);
    saveAll();
    window.print();
  };

  function collectDoc(){
    const rows = $$("#lineBody tr").map(tr=>{
      const nameSel = tr.querySelector(".itemSel");
      const item = state.items.find(i=>i.id===nameSel.value);
      return {
        itemId: nameSel.value || null,
        name: item? item.name : "Custom",
        qty: parseFloat(tr.querySelector(".qty").value||"1"),
        price: parseFloat(tr.querySelector(".price").value||"0"),
        vatRate: parseFloat(tr.querySelector(".vat").value||"0"),
        whtRate: parseFloat(tr.querySelector(".wht").value||"0"),
      };
    });
    const vatMode = $("#vatMode").value;
    const vatRate = parseFloat($("#vatRateDoc").value||"7")/100;
    const discount = parseFloat($("#discount").value||"0");
    const shipping = parseFloat($("#shipping").value||"0");

    // calculate
    let subtotal = rows.reduce((s,r)=> s + r.qty*r.price, 0);
    subtotal -= discount;
    if(subtotal<0) subtotal=0;

    // line-level VAT/WHT not separated; we use doc-level mode with average flag
    let vatBase = subtotal;
    let vat=0;
    if(vatMode==="exclusive"){
      vat = vatBase * vatRate;
    }else if(vatMode==="inclusive"){
      vat = vatBase - (vatBase/(1+vatRate));
    }else{
      vat = 0;
    }

    // Withholding tax (assume computed on subtotal before VAT) using avg of line wht weighted by line amount
    const whtBase = rows.reduce((s,r)=> s + r.qty*r.price*(r.whtRate?1:0), 0);
    const whtRateAvg = rows.length? (rows.reduce((s,r)=> s + (r.whtRate||0),0) / rows.length)/100 : 0;
    const wht = whtBase * whtRateAvg;

    const grand = subtotal + vat + shipping - wht;

    return {
      type: "INV",
      number: $("#docNo").value || genNumber(),
      issueDate: $("#issueDate").value,
      dueDate: $("#dueDate").value,
      customerId: $("#customer").value,
      status: state.lang==="th"?"ค้างชำระ":"Unpaid",
      vatMode, vatRate: vatRate*100,
      discount, shipping,
      subtotal: round2(subtotal), vat: round2(vat), wht: round2(wht), total: round2(grand),
      rows
    };
  }

  function recalc(){
    const doc = collectDoc();
    $("#preview").innerHTML = renderInvoicePreview(doc);
    // update per-line total
    $$("#lineBody tr").forEach((tr,i)=>{
      const qty = parseFloat(tr.querySelector(".qty").value||"1");
      const price = parseFloat(tr.querySelector(".price").value||"0");
      tr.querySelector(".lineTotal").textContent = formatMoney(qty*price);
    });
  }
}

function renderInvoicePreview(doc){
  const c = state.customers.find(x=>x.id===doc.customerId) || {};
  const lang = state.lang;
  const label = {
    th:{ invoice:"ใบแจ้งหนี้", to:"ลูกค้า", summary:"สรุปยอด", subtotal:"ยอดก่อนภาษี", vat:"ภาษีมูลค่าเพิ่ม", wht:"หัก ณ ที่จ่าย", shipping:"ค่าจัดส่ง/อื่นๆ", total:"ยอดสุทธิ", notes:"หมายเหตุ" },
    en:{ invoice:"INVOICE", to:"Bill To", summary:"Summary", subtotal:"Subtotal", vat:"VAT", wht:"WHT", shipping:"Shipping/Other", total:"Grand Total", notes:"Notes" }
  }[lang];

  return `<div class="card p-6">
    <div class="flex justify-between items-start gap-6">
      <div class="flex items-center gap-3">
        <img src="./assets/logo.svg" class="w-10 h-10"/>
        <div>
          <div class="font-extrabold text-xl">IDOC</div>
          <div class="text-xs text-slate-500">${lang==="th"?"การทำจ่าย เป็นเรื่องง่ายสำหรับทุกคน":"Payments & paperwork, made easy"}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-extrabold">${label.invoice}</div>
        <div class="text-sm text-slate-500">${doc.number}</div>
        <div class="text-sm">${(lang==="th"?"วันที่ออก: ":"Issue: ")}${doc.issueDate}</div>
        <div class="text-sm">${(lang==="th"?"ครบกำหนด: ":"Due: ")}${doc.dueDate}</div>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 gap-4 mt-6">
      <div>
        <div class="text-sm text-slate-500">${label.to}</div>
        <div class="font-semibold">${c.name||"-"}</div>
        <div class="text-sm">${c.address||""}</div>
        <div class="text-sm">${c.taxId||""}</div>
        <div class="text-sm">${c.email||""} ${c.phone||""}</div>
      </div>
      <div class="text-right">
        <span class="badge badge-yellow">${doc.status}</span>
      </div>
    </div>

    <table class="table mt-6">
      <thead><tr><th>${t("item")}</th><th class="w-20">${t("quantity")}</th><th class="w-28">${t("unitPrice")}</th><th class="w-28">Total</th></tr></thead>
      <tbody>
        ${doc.rows.map(r=>`<tr>
          <td>${r.name}</td>
          <td>${r.qty}</td>
          <td>${formatMoney(r.price)}</td>
          <td>${formatMoney(r.qty*r.price)}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="grid sm:grid-cols-2 gap-6 mt-6">
      <div>
        <div class="text-sm text-slate-500">${label.notes}</div>
        <div class="text-sm">${$("#notes")? $("#notes").value : ""}</div>
      </div>
      <div class="card p-4">
        <div class="flex justify-between"><span>${label.subtotal}</span><span>${formatMoney(doc.subtotal)}</span></div>
        <div class="flex justify-between"><span>${label.vat} (${doc.vatRate}%)</span><span>${formatMoney(doc.vat)}</span></div>
        <div class="flex justify-between"><span>${label.wht}</span><span>- ${formatMoney(doc.wht)}</span></div>
        <div class="flex justify-between"><span>${label.shipping}</span><span>${formatMoney(doc.shipping)}</span></div>
        <div class="border-t mt-2 pt-2 flex justify-between font-semibold">
          <span>${label.total}</span><span>${formatMoney(doc.total)}</span>
        </div>
      </div>
    </div>
  </div>`;
}

function genId(){ return Math.random().toString(36).slice(2,9); }
function genNumber(){ return (state.settings.numberPrefix||"INV-")+String(state.documents.length+1).padStart(4,"0"); }
function round2(n){ return Math.round(n*100)/100; }
function formatMoney(n){ return new Intl.NumberFormat(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}).format(n||0); }

function openCustomerModal(){
  const name = prompt(t("name"));
  if(!name) return;
  const c = { id: genId(), name,
    taxId: prompt(t("taxId"))||"", address: prompt(t("address"))||"",
    email: prompt(t("email"))||"", phone: prompt(t("phone"))||"" };
  state.customers.push(c); saveAll(); render();
}

function openItemModal(){
  const name = prompt(t("name"));
  if(!name) return;
  const price = parseFloat(prompt(t("unitPrice"))||"0");
  const vatable = confirm(t("vatable")+"?");
  const whtRate = parseFloat(prompt(t("whtRate"))||"0");
  state.items.push({ id: genId(), name, price, vatable, whtRate });
  saveAll(); render();
}

// Event bindings
window.addEventListener("hashchange", render);
$("#langSelect").value = state.lang;
$("#langSelect").addEventListener("change", (e)=>{
  state.lang = e.target.value; saveAll(); applyI18n(); render();
});
$("#newDocBtn").addEventListener("click", ()=> route("create"));
$$(".nav-btn").forEach(btn=> btn.addEventListener("click", ()=> route(btn.dataset.route)));

// initial
applyI18n();
render();
