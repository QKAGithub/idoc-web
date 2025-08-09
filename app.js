// IDOC Pro — polished SPA with bilingual UI and back button
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

const I18N = {
  th:{ tagline:"การทำจ่าย เป็นเรื่องง่ายสำหรับทุกคน", dashboard:"แดชบอร์ด", documents:"เอกสาร", customers:"ลูกค้า", items:"สินค้า/บริการ", settings:"ตั้งค่า", newDocument:"ออกเอกสารใหม่", recentDocs:"เอกสารล่าสุด", createDocs:"สร้างเอกสารทางบัญชี", easyGen:"สร้างใบแจ้งหนี้ ใบเสนอราคา ใบเสร็จ ได้ง่ายๆ", statusPaid:"ชำระแล้ว", statusSent:"ส่งแล้ว", statusUnpaid:"ค้างชำระ", addCustomer:"เพิ่มลูกค้า", addItem:"เพิ่มสินค้า/บริการ", name:"ชื่อ", taxId:"เลขผู้เสียภาษี", address:"ที่อยู่", email:"อีเมล", phone:"โทรศัพท์", save:"บันทึก", cancel:"ยกเลิก", create:"สร้าง", customer:"ลูกค้า", item:"สินค้า/บริการ", quantity:"จำนวน", unitPrice:"ราคาต่อหน่วย", vatMode:"โหมด VAT", exclusive:"ไม่รวม VAT", inclusive:"รวม VAT", none:"ไม่คิด VAT", vatRate:"VAT (%)", whtRate:"หัก ณ ที่จ่าย (%)", discount:"ส่วนลด", shipping:"ค่าจัดส่ง/อื่นๆ", notes:"หมายเหตุ", preview:"พรีวิว", printPdf:"พิมพ์/บันทึก PDF", createNew:"สร้างเอกสารใหม่", issueDate:"วันที่ออก", dueDate:"ครบกำหนด", number:"เลขที่เอกสาร", currency:"สกุลเงิน", stepCustomer:"เลือกลูกค้า", stepItems:"เพิ่มรายการ", stepReview:"ทบทวน", docTypeInvoice:"ใบแจ้งหนี้", billTo:"ลูกค้า", subtotal:"ยอดก่อนภาษี", vat:"ภาษีมูลค่าเพิ่ม", wht:"หัก ณ ที่จ่าย", total:"ยอดสุทธิ" },
  en:{ tagline:"Payments & paperwork, made easy", dashboard:"Dashboard", documents:"Documents", customers:"Customers", items:"Items/Services", settings:"Settings", newDocument:"New Document", recentDocs:"Recent Documents", createDocs:"Create Accounting Documents", easyGen:"Easily generate invoices, quotes, receipts, and more", statusPaid:"Paid", statusSent:"Sent", statusUnpaid:"Unpaid", addCustomer:"Add Customer", addItem:"Add Item/Service", name:"Name", taxId:"Tax ID", address:"Address", email:"Email", phone:"Phone", save:"Save", cancel:"Cancel", create:"Create", customer:"Customer", item:"Item/Service", quantity:"Qty", unitPrice:"Unit Price", vatMode:"VAT Mode", exclusive:"Exclusive", inclusive:"Inclusive", none:"None", vatRate:"VAT (%)", whtRate:"WHT (%)", discount:"Discount", shipping:"Shipping/Other", notes:"Notes", preview:"Preview", printPdf:"Print/Save PDF", createNew:"Create New Document", issueDate:"Issue Date", dueDate:"Due Date", number:"Document No.", currency:"Currency", stepCustomer:"Select Customer", stepItems:"Add Items", stepReview:"Review", docTypeInvoice:"INVOICE", billTo:"Bill To", subtotal:"Subtotal", vat:"VAT", wht:"WHT", total:"Grand Total" }
};

const state = {
  lang: localStorage.getItem("idoc_lang") || "th",
  settings: JSON.parse(localStorage.getItem("idoc_settings")||"{}"),
  customers: JSON.parse(localStorage.getItem("idoc_customers")||"[]"),
  items: JSON.parse(localStorage.getItem("idoc_items")||"[]"),
  documents: JSON.parse(localStorage.getItem("idoc_documents")||"[]"),
  route: location.hash.replace("#","") || "dashboard",
};
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

function t(k){ return (I18N[state.lang]||{})[k]||k; }
function setI18n(){
  $$("[data-i18n]").forEach(el=>{
    const key = el.dataset.i18n; const str = t(key);
    if(el.tagName==="INPUT"||el.tagName==="TEXTAREA") el.placeholder = str; else el.textContent = str;
  });
  document.title = state.lang==="th" ? "IDOC — การทำจ่าย เป็นเรื่องง่ายสำหรับทุกคน" : "IDOC — Payments & paperwork, made easy";
}

function navLinks(){
  const links = [
    {id:"dashboard", icon:icon("home"), label:t("dashboard")},
    {id:"documents", icon:icon("doc"), label:t("documents")},
    {id:"customers", icon:icon("user"), label:t("customers")},
    {id:"items", icon:icon("box"), label:t("items")},
    {id:"settings", icon:icon("gear"), label:t("settings")},
  ];
  const html = links.map(l=>`<button class="nav-item ${state.route===l.id ? "active":""}" data-route="${l.id}">${l.icon}<span>${l.label}</span></button>`).join("");
  $("#sideNav").innerHTML = html;
  $("#drawerNav").innerHTML = html;
  $$("#sideNav [data-route], #drawerNav [data-route]").forEach(b=> b.onclick = ()=> { route(b.dataset.route); $("#drawer").classList.add("hidden"); });
}

function icon(name){
  const stroke="#0f172a";
  const p = {
    home:`<path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="${stroke}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
    doc:`<rect x="5" y="3" width="10" height="14" rx="2" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M15 7h4v13a1 1 0 0 1-1 1H7" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M8 9h6M8 12h6" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>`,
    user:`<circle cx="12" cy="8" r="3.5" stroke="${stroke}" stroke-width="1.5" fill="none"/><path d="M4 20c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5" stroke="${stroke}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    box:`<path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7" stroke="${stroke}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
    gear:`<path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm7.5 4a7.5 7.5 0 0 0-.2-1.7l2-1.5-2-3.5-2.4.8a7.4 7.4 0 0 0-2.8-1.6L13.3 2h-2.6L9.9 3.5a7.4 7.4 0 0 0-2.8 1.6l-2.4-.8-2 3.5 2 1.5A7.5 7.5 0 0 0 4.5 12c0 .6.1 1.2.2 1.7l-2 1.5 2 3.5 2.4-.8c.8.7 1.8 1.2 2.8 1.6L10.7 22h2.6l.8-1.5c1-.4 2-.9 2.8-1.6l2.4.8 2-3.5-2-1.5c.1-.5.2-1.1.2-1.7z" stroke="${stroke}" stroke-width="1.2" fill="none"/>`
  }[name];
  return `<svg width="18" height="18" viewBox="0 0 24 24" class="shrink-0">${p}</svg>`;
}

function route(id){ state.route = id; location.hash = id; render(); }
function back(){ history.length>1 ? history.back() : route("dashboard"); }

function render(){
  $("#year").textContent = new Date().getFullYear();
  navLinks(); setI18n();
  $("#breadcrumb").textContent = (I18N[state.lang][state.route] || state.route);
  $("#primaryBtn").href = "#create";
  const root = $("#viewRoot"); root.innerHTML = "";
  if(state.route==="dashboard") return viewDashboard(root);
  if(state.route==="documents") return viewDocuments(root);
  if(state.route==="customers") return viewCustomers(root);
  if(state.route==="items") return viewItems(root);
  if(state.route==="settings") return viewSettings(root);
  if(state.route==="create") return viewCreate(root);
}

// ---- Views ----
function viewDashboard(root){
  root.innerHTML = `
    <div class="grid md:grid-cols-3 gap-4">
      <div class="tile"><div class="text-xs text-slate-500">${t("recentDocs")}</div><div class="text-2xl font-semibold">${state.documents.length}</div></div>
      <div class="tile"><div class="text-xs text-slate-500">Customers</div><div class="text-2xl font-semibold">${state.customers.length}</div></div>
      <div class="tile"><div class="text-xs text-slate-500">Items</div><div class="text-2xl font-semibold">${state.items.length}</div></div>
    </div>

    <section class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <div><h2 class="text-xl font-semibold" data-i18n="recentDocs">${t("recentDocs")}</h2><p class="text-slate-500 text-sm" data-i18n="easyGen">${t("easyGen")}</p></div>
        <a class="btn primary" href="#create" data-i18n="newDocument">${t("newDocument")}</a>
      </div>
      ${tableDocs(state.documents.slice(-8).reverse())}
    </section>
  `;
}

function tableDocs(list){
  if(!list.length) return `<div class="text-slate-500 text-sm">—</div>`;
  return `<table class="table">
    <thead><tr><th>${t("number")}</th><th>${t("customer")}</th><th>${t("issueDate")}</th><th>Status</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      ${list.map(d=>`<tr>
        <td>${d.number}</td>
        <td>${(state.customers.find(c=>c.id===d.customerId)||{}).name||"-"}</td>
        <td>${d.issueDate}</td>
        <td>${statusBadge(d.status)}</td>
        <td class="text-right">${money(d.total)}</td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function statusBadge(s){
  const cls = {Paid:"badge-green",Sent:"badge-yellow",Unpaid:"badge-red","ชำระแล้ว":"badge-green","ส่งแล้ว":"badge-yellow","ค้างชำระ":"badge-red"}[s]||"badge-yellow";
  return `<span class="badge ${cls}">${s}</span>`;
}

function viewDocuments(root){
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold" data-i18n="documents">${t("documents")}</h1>
    <a class="btn primary" href="#create" data-i18n="newDocument">${t("newDocument")}</a>
  </div>
  <div class="card p-6">${tableDocs(state.documents.slice().reverse())}</div>`;
}

function viewCustomers(root){
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="customers">${t("customers")}</h1>
      <button class="btn primary" id="addCBtn" data-i18n="addCustomer">${t("addCustomer")}</button>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${state.customers.slice().reverse().map(c=>cardCustomer(c)).join("")}
    </div>`;
  $("#addCBtn").onclick = ()=> openCustomerModal(()=> viewCustomers(root));
}

function cardCustomer(c){
  return `<div class="card p-4">
    <div class="font-semibold">${c.name}</div>
    <div class="text-xs text-slate-500">${c.taxId||""}</div>
    <div class="text-sm">${c.address||""}</div>
    <div class="text-sm">${c.email||""} ${c.phone||""}</div>
  </div>`;
}

function viewItems(root){
  root.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold" data-i18n="items">${t("items")}</h1>
      <button class="btn primary" id="addIBtn" data-i18n="addItem">${t("addItem")}</button>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${state.items.slice().reverse().map(it=>`<div class="card p-4">
        <div class="font-semibold">${it.name}</div>
        <div class="text-sm">${money(it.price)} • ${it.vatable? "VAT":"No VAT"}</div>
        <div class="text-xs text-slate-500">${t("whtRate")}: ${it.whtRate||0}%</div>
      </div>`).join("")}
    </div>`;
  $("#addIBtn").onclick = ()=> openItemModal(()=> viewItems(root));
}

function viewSettings(root){
  root.innerHTML = `<h1 class="text-2xl font-bold mb-4" data-i18n="settings">${t("settings")}</h1>
    <div class="card p-6 grid md:grid-cols-2 gap-5">
      <div><label class="label">${t("vatRate")}</label><input id="vatRate" type="number" class="input mt-1" value="${state.settings.vatRate}"/></div>
      <div><label class="label"># Prefix</label><input id="numPrefix" class="input mt-1" value="${state.settings.numberPrefix}"/></div>
      <div><label class="label">${t("currency")}</label><input id="currency" class="input mt-1" value="${state.settings.currency}"/></div>
      <div><label class="label">Brand</label><input class="input mt-1" value="IDOC"/></div>
      <div class="md:col-span-2 flex justify-end">
        <button id="saveSettings" class="btn primary">${t("save")}</button>
      </div>
    </div>`;
  $("#saveSettings").onclick = ()=>{
    state.settings.vatRate = parseFloat($("#vatRate").value||"7");
    state.settings.numberPrefix = $("#numPrefix").value || "INV-";
    state.settings.currency = $("#currency").value || "THB";
    saveAll(); toast(state.lang==="th"?"บันทึกแล้ว":"Saved");
  };
}

function viewCreate(root){
  root.innerHTML = `
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold" data-i18n="createNew">${t("createNew")}</h1>
    <div class="flex gap-2">
      <button class="btn ghost" id="backSoft">&larr; Back</button>
      <button class="btn primary" id="printBtn" data-i18n="printPdf">${t("printPdf")}</button>
    </div>
  </div>

  <div class="card p-5">
    <div class="flex flex-wrap items-center gap-4 mb-5">
      <div class="step active" data-step="1"><div class="dot">1</div><div class="label">${t("stepCustomer")}</div></div>
      <div class="h-px w-10 bg-slate-200"></div>
      <div class="step" data-step="2"><div class="dot">2</div><div class="label">${t("stepItems")}</div></div>
      <div class="h-px w-10 bg-slate-200"></div>
      <div class="step" data-step="3"><div class="dot">3</div><div class="label">${t("stepReview")}</div></div>
    </div>
    <div id="stepRoot" class="space-y-5"></div>
  </div>`;

  $("#backSoft").onclick = ()=> back();

  const steps = {1:()=> step1(), 2:()=> step2(), 3:()=> step3()};
  let curr = 1; steps[curr]();

  function next(){ curr = Math.min(3, curr+1); updateStep(); }
  function prev(){ curr = Math.max(1, curr-1); updateStep(); }
  function updateStep(){
    $$(".step").forEach((el,i)=>{
      el.classList.remove("active","done");
      if(i+1<curr) el.classList.add("done");
      if(i+1===curr) el.classList.add("active");
    });
    steps[curr]();
  }

  function step1(){
    $("#stepRoot").innerHTML = `
      <div class="grid md:grid-cols-2 gap-5">
        <div class="card p-4">
          <label class="label">${t("customer")}</label>
          <select id="customer" class="input mt-1">
            <option value="">—</option>
            ${state.customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}
          </select>
          <div class="mt-4 flex gap-2">
            <button class="btn secondary" id="newCustomer">${t("addCustomer")}</button>
            <button class="btn primary" id="goStep2">${t("create")}</button>
          </div>
        </div>
        <div class="card p-4 grid grid-cols-2 gap-4">
          <div><label class="label">${t("number")}</label><input id="docNo" class="input" value="${state.settings.numberPrefix}${String(state.documents.length+1).padStart(4,"0")}"/></div>
          <div><label class="label">${t("currency")}</label><input id="currencyDoc" class="input" value="${state.settings.currency}"/></div>
          <div><label class="label">${t("issueDate")}</label><input id="issueDate" type="date" class="input" value="${new Date().toISOString().substring(0,10)}"/></div>
          <div><label class="label">${t("dueDate")}</label><input id="dueDate" type="date" class="input" value="${new Date(Date.now()+14*864e5).toISOString().substring(0,10)}"/></div>
          <div><label class="label">${t("vatMode")}</label>
            <select id="vatMode" class="input"><option value="exclusive">${t("exclusive")}</option><option value="inclusive">${t("inclusive")}</option><option value="none">${t("none")}</option></select>
          </div>
          <div><label class="label">${t("vatRate")}</label><input id="vatRateDoc" type="number" class="input" value="${state.settings.vatRate}"/></div>
        </div>
      </div>
    `;
    $("#newCustomer").onclick = ()=> openCustomerModal(()=> step1());
    $("#goStep2").onclick = ()=>{
      if(!$("#customer").value) return toast(state.lang==="th"?"กรุณาเลือกลูกค้า":"Please choose a customer");
      next();
    };
  }

  function step2(){
    $("#stepRoot").innerHTML = `
      <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold">${t("items")}</div>
          <div class="flex gap-2">
            <button class="btn secondary" id="addNewItem">${t("addItem")}</button>
            <button class="btn primary" id="next3">${t("preview")}</button>
          </div>
        </div>
        <table class="table">
          <thead><tr><th>${t("item")}</th><th class="w-24">${t("quantity")}</th><th class="w-32">${t("unitPrice")}</th><th class="w-24">${t("whtRate")}</th><th class="w-28">Line</th></tr></thead>
          <tbody id="lineBody"></tbody>
        </table>
        <div class="mt-3"><button class="btn primary" id="addLine">${t("addItem")}</button></div>
      </div>
    `;
    $("#addNewItem").onclick = ()=> openItemModal(()=> step2());
    $("#addLine").onclick = ()=> addLine();
    $("#next3").onclick = ()=>{
      if(!$("#lineBody").children.length) return toast(state.lang==="th"?"กรุณาเพิ่มรายการ":"Please add at least one item");
      next();
    };
    addLine();

    function addLine(){
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><select class="input itemSel"><option value="">—</option>${state.items.map(i=>`<option value="${i.id}">${i.name}</option>`).join("")}</select></td>
        <td><input type="number" class="input qty" value="1"/></td>
        <td><input type="number" class="input price" value="0"/></td>
        <td><input type="number" class="input wht" value="0"/></td>
        <td class="text-right lineTotal">0.00</td>`;
      $("#lineBody").appendChild(tr);
      tr.querySelector(".itemSel").addEventListener("change", e=>{
        const it = state.items.find(x=>x.id===e.target.value);
        if(it){ tr.querySelector(".price").value = it.price; tr.querySelector(".wht").value = it.whtRate||0; recalcLines(); }
      });
      $$(".qty, .price, .wht").forEach(el=> el.addEventListener("input", recalcLines));
      recalcLines();
    }
    function recalcLines(){
      $$("#lineBody tr").forEach(tr=>{
        const qty = parseFloat(tr.querySelector(".qty").value||"1");
        const price = parseFloat(tr.querySelector(".price").value||"0");
        tr.querySelector(".lineTotal").textContent = money(qty*price);
      });
    }
  }

  function step3(){
    const doc = collectDocFromForm();
    $("#stepRoot").innerHTML = `
      <div class="grid lg:grid-cols-3 gap-5">
        <div class="card p-5 lg:col-span-2">${renderInvoicePreview(doc)}</div>
        <div class="card p-5 h-fit">
          <div class="font-semibold mb-3" data-i18n="preview">${t("preview")}</div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>${t("subtotal")}</span><span>${money(doc.subtotal)}</span></div>
            <div class="flex justify-between"><span>${t("vat")} (${doc.vatRate}%)</span><span>${money(doc.vat)}</span></div>
            <div class="flex justify-between"><span>${t("wht")}</span><span>- ${money(doc.wht)}</span></div>
            <div class="border-t pt-2 flex justify-between font-semibold"><span>${t("total")}</span><span>${money(doc.total)}</span></div>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="btn ghost" id="prev2">&larr; ${t("stepItems")}</button>
            <button class="btn primary" id="finish">${t("printPdf")}</button>
          </div>
        </div>
      </div>
    `;
    $("#prev2").onclick = ()=> prev();
    $("#finish").onclick = ()=>{
      state.documents.push(doc); saveAll();
      toast(state.lang==="th"?"บันทึกเอกสารแล้ว":"Document saved");
      setTimeout(()=> window.print(), 200);
    };
  }

  function collectDocFromForm(){
    const rows = $$("#lineBody tr").map(tr=>{
      const itemId = tr.querySelector(".itemSel")?.value||"";
      const it = state.items.find(i=>i.id===itemId);
      return { itemId, name: it? it.name : "Custom", qty: parseFloat(tr.querySelector(".qty").value||"1"), price: parseFloat(tr.querySelector(".price").value||"0"), whtRate: parseFloat(tr.querySelector(".wht").value||"0") };
    });
    const vatMode = $("#vatMode").value;
    const vatRate = parseFloat($("#vatRateDoc").value||"7")/100;
    let subtotal = rows.reduce((s,r)=> s + r.qty*r.price, 0);
    let vat = 0;
    if(vatMode==="exclusive") vat = subtotal*vatRate;
    else if(vatMode==="inclusive") vat = subtotal - (subtotal/(1+vatRate));
    const whtBase = rows.reduce((s,r)=> s + (r.whtRate>0 ? r.qty*r.price : 0), 0);
    const whtRateAvg = rows.length? (rows.reduce((s,r)=> s + (r.whtRate||0),0)/rows.length)/100 : 0;
    const wht = whtBase*whtRateAvg;
    const total = subtotal + vat - wht;

    return { type:"INV", number: $("#docNo").value || genNumber(), issueDate: $("#issueDate").value, dueDate: $("#dueDate").value, customerId: $("#customer").value, status: state.lang==="th"?"ค้างชำระ":"Unpaid", vatMode, vatRate: Math.round(vatRate*10000)/100, subtotal: round2(subtotal), vat: round2(vat), wht: round2(wht), total: round2(total), rows };
  }
}

function renderInvoicePreview(doc){
  const c = state.customers.find(x=>x.id===doc.customerId) || {};
  return `
    <div class="flex justify-between items-start gap-6">
      <div class="flex items-center gap-3">
        <img src="./assets/logo.svg" class="w-10 h-10"/>
        <div><div class="font-extrabold text-xl">IDOC</div><div class="text-xs text-slate-500">${t("tagline")}</div></div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-extrabold">${t("docTypeInvoice")}</div>
        <div class="text-sm text-slate-500">${doc.number}</div>
        <div class="text-sm">${(state.lang==="th"?"วันที่ออก: ":"Issue: ")}${doc.issueDate}</div>
        <div class="text-sm">${(state.lang==="th"?"ครบกำหนด: ":"Due: ")}${doc.dueDate}</div>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 gap-4 mt-6">
      <div>
        <div class="text-sm text-slate-500">${t("billTo")}</div>
        <div class="font-semibold">${c.name||"-"}</div>
        <div class="text-sm">${c.address||""}</div>
        <div class="text-sm">${c.taxId||""}</div>
        <div class="text-sm">${c.email||""} ${c.phone||""}</div>
      </div>
      <div class="text-right"><span class="badge badge-yellow">${doc.status}</span></div>
    </div>
    <table class="table mt-6">
      <thead><tr><th>${t("item")}</th><th class="w-20">${t("quantity")}</th><th class="w-28">${t("unitPrice")}</th><th class="w-28">Total</th></tr></thead>
      <tbody>${doc.rows.map(r=>`<tr><td>${r.name}</td><td>${r.qty}</td><td>${money(r.price)}</td><td>${money(r.qty*r.price)}</td></tr>`).join("")}</tbody>
    </table>
  `;
}

// ------- UI Helpers -------
function openCustomerModal(after){
  openModal(state.lang==="th"?"เพิ่มลูกค้า":"Add Customer", `
    <div class="grid gap-3">
      <div><label class="label">${t("name")}</label><input id="m_name" class="input"/></div>
      <div><label class="label">${t("taxId")}</label><input id="m_tax" class="input"/></div>
      <div><label class="label">${t("address")}</label><input id="m_addr" class="input"/></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="label">${t("email")}</label><input id="m_email" class="input"/></div><div><label class="label">${t("phone")}</label><input id="m_phone" class="input"/></div></div>
    </div>
  `, ()=>{
    const name = $("#m_name").value?.trim(); if(!name) return toast(state.lang==="th"?"กรอกชื่อ":"Enter name");
    state.customers.push({id:genId(), name, taxId:$("#m_tax").value, address:$("#m_addr").value, email:$("#m_email").value, phone:$("#m_phone").value});
    saveAll(); closeModal(); toast(state.lang==="th"?"บันทึกแล้ว":"Saved"); if(after) after();
  });
}

function openItemModal(after){
  openModal(state.lang==="th"?"เพิ่มสินค้า/บริการ":"Add Item/Service", `
    <div class="grid gap-3">
      <div><label class="label">${t("name")}</label><input id="i_name" class="input"/></div>
      <div class="grid grid-cols-3 gap-3">
        <div><label class="label">${t("unitPrice")}</label><input id="i_price" type="number" class="input" value="0"/></div>
        <div><label class="label">VAT?</label><select id="i_vat" class="input"><option value="1">Yes</option><option value="0">No</option></select></div>
        <div><label class="label">${t("whtRate")}</label><input id="i_wht" type="number" class="input" value="0"/></div>
      </div>
    </div>
  `, ()=>{
    const name = $("#i_name").value?.trim(); if(!name) return toast(state.lang==="th"?"กรอกชื่อ":"Enter name");
    state.items.push({id:genId(), name, price:parseFloat($("#i_price").value||"0"), vatable:$("#i_vat").value==="1", whtRate:parseFloat($("#i_wht").value||"0")});
    saveAll(); closeModal(); toast(state.lang==="th"?"บันทึกแล้ว":"Saved"); if(after) after();
  });
}

function openModal(title, body, onOk){
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modal").classList.remove("hidden");
  $("#modalCancel").onclick = ()=> closeModal();
  $("#modalOk").onclick = ()=> onOk && onOk();
}
function closeModal(){ $("#modal").classList.add("hidden"); }
function toast(msg){
  const host = $("#toast"); host.classList.remove("hidden");
  const el = document.createElement("div"); el.className="toast"; el.textContent = msg;
  host.appendChild(el); setTimeout(()=>{ el.remove(); if(!host.children.length) host.classList.add("hidden") }, 2000);
}

function genId(){ return Math.random().toString(36).slice(2,9); }
function genNumber(){ return (state.settings.numberPrefix||"INV-")+String(state.documents.length+1).padStart(4,"0"); }
function round2(n){ return Math.round(n*100)/100; }
function money(n){ return new Intl.NumberFormat(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}).format(n||0); }

// Events
window.addEventListener("hashchange", ()=>{ state.route = location.hash.replace("#","") || "dashboard"; render(); });
$("#langSelect").value = state.lang;
$("#langSelect").addEventListener("change", e=>{ state.lang = e.target.value; saveAll(); setI18n(); render(); });
$("#menuBtn").onclick = ()=> $("#drawer").classList.remove("hidden");
$("#drawer").onclick = (e)=>{ if(e.target.id==="drawer") $("#drawer").classList.add("hidden"); };
$("#backBtn").onclick = ()=> back();

// initial
setI18n(); navLinks(); render();
