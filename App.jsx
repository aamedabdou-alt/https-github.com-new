import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Factory, Package, ShoppingCart, Users, Wallet,
  Receipt, UserCog, Truck, Plus, Pencil, Trash2, X, Search,
  AlertTriangle, Menu, ChevronRight, ChevronLeft
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { storage } from "./lib/storage.js";

/* ---------------------------------------------------------------------- */
/*  Theme                                                                  */
/* ---------------------------------------------------------------------- */

const THEME = {
  bg: "#12100E",
  panel: "#1C1815",
  panelAlt: "#241F1B",
  border: "#332B24",
  cream: "#F3EBDD",
  creamDim: "#B7AA97",
  red: "#A8293C",
  redDim: "#7A1F2C",
  amber: "#CB8A3B",
  amberSoft: "#E4B876",
  green: "#5C8A5A",
  warn: "#C97B3D",
  danger: "#B84B3F",
};

const CHART_COLORS = [THEME.red, THEME.amber, THEME.green, THEME.creamDim, THEME.warn, "#7C6A55"];

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
`;

/* ---------------------------------------------------------------------- */
/*  Storage helpers                                                        */
/* ---------------------------------------------------------------------- */

const KEY = (name) => `cola-factory:${name}`;

async function loadCollection(name, seed) {
  try {
    const res = await storage.get(KEY(name));
    if (res && res.value) return JSON.parse(res.value);
    return seed;
  } catch (e) {
    return seed;
  }
}

async function saveCollection(name, data) {
  try {
    await storage.set(KEY(name), JSON.stringify(data));
  } catch (e) {
    console.error("storage error", e);
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fmtMoney(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("ar-EG", { maximumFractionDigits: 0 }) + " ج.م";
}

function fmtNum(n) {
  return (Number(n) || 0).toLocaleString("ar-EG");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------------- */
/*  Seed data                                                               */
/* ---------------------------------------------------------------------- */

const SEED = {
  production: [
    { id: uid(), product: "كولا عادية 330 مل", batch: "B-1042", line: "خط 1", quantity: 18000, date: "2026-08-25", status: "مكتمل" },
    { id: uid(), product: "كولا دايت 330 مل", batch: "B-1043", line: "خط 2", quantity: 9500, date: "2026-08-27", status: "قيد الإنتاج" },
    { id: uid(), product: "كولا بالليمون 500 مل", batch: "B-1044", line: "خط 3", quantity: 6200, date: "2026-08-29", status: "متوقف" },
    { id: uid(), product: "كولا عادية 1 لتر", batch: "B-1045", line: "خط 1", quantity: 12300, date: "2026-08-31", status: "مكتمل" },
    { id: uid(), product: "كولا دايت 330 مل", batch: "B-1046", line: "خط 2", quantity: 14000, date: "2026-09-01", status: "قيد الإنتاج" },
  ],
  inventory: [
    { id: uid(), name: "سكر أبيض", category: "مادة خام", quantity: 4200, unit: "كجم", minStock: 3000, location: "مخزن أ" },
    { id: uid(), name: "خلاصة الكولا", category: "مادة خام", quantity: 380, unit: "لتر", minStock: 500, location: "مخزن ب" },
    { id: uid(), name: "غاز CO2", category: "مادة خام", quantity: 1200, unit: "كجم", minStock: 800, location: "مخزن ج" },
    { id: uid(), name: "زجاجات بلاستيك 330 مل", category: "تعبئة", quantity: 52000, unit: "قطعة", minStock: 20000, location: "مخزن التعبئة" },
    { id: uid(), name: "كولا عادية 330 مل", category: "منتج نهائي", quantity: 15600, unit: "قطعة", minStock: 5000, location: "مستودع التوزيع" },
    { id: uid(), name: "كولا دايت 330 مل", category: "منتج نهائي", quantity: 3100, unit: "قطعة", minStock: 4000, location: "مستودع التوزيع" },
  ],
  orders: [
    { id: uid(), client: "سوبر ماركت الأمانة", product: "كولا عادية 330 مل", quantity: 4000, unitPrice: 6, orderDate: "2026-08-20", deliveryDate: "2026-08-26", status: "تم التسليم" },
    { id: uid(), client: "مجموعة الفا للتجزئة", product: "كولا دايت 330 مل", quantity: 2500, unitPrice: 6.5, orderDate: "2026-08-24", deliveryDate: "2026-08-30", status: "تم الشحن" },
    { id: uid(), client: "موزع النيل", product: "كولا عادية 1 لتر", quantity: 1800, unitPrice: 11, orderDate: "2026-08-28", deliveryDate: "2026-09-03", status: "قيد التجهيز" },
    { id: uid(), client: "بقالة المدينة", product: "كولا بالليمون 500 مل", quantity: 900, unitPrice: 8, orderDate: "2026-09-01", deliveryDate: "2026-09-06", status: "جديد" },
  ],
  clients: [
    { id: uid(), name: "سوبر ماركت الأمانة", phone: "01012345678", address: "القاهرة - مدينة نصر", type: "سوبر ماركت", balance: 0 },
    { id: uid(), name: "مجموعة الفا للتجزئة", phone: "01123456789", address: "الجيزة - الدقي", type: "جملة", balance: 4200 },
    { id: uid(), name: "موزع النيل", phone: "01234567890", address: "الشرقية - الزقازيق", type: "جملة", balance: 12500 },
    { id: uid(), name: "بقالة المدينة", phone: "01098765432", address: "القاهرة - المعادي", type: "تجزئة", balance: 0 },
  ],
  accounting: [
    { id: uid(), date: "2026-08-26", description: "تحصيل فاتورة سوبر ماركت الأمانة", type: "وارد", category: "مبيعات", amount: 24000 },
    { id: uid(), date: "2026-08-30", description: "دفعة من موزع النيل", type: "وارد", category: "مبيعات", amount: 8000 },
    { id: uid(), date: "2026-08-22", description: "شراء خامات - سكر وخلاصة", type: "صادر", category: "مشتريات", amount: 32000 },
    { id: uid(), date: "2026-08-31", description: "رواتب شهر أغسطس", type: "صادر", category: "رواتب", amount: 96000 },
  ],
  expenses: [
    { id: uid(), date: "2026-08-15", category: "كهرباء", amount: 18500, paidTo: "شركة الكهرباء", description: "فاتورة كهرباء المصنع" },
    { id: uid(), date: "2026-08-18", category: "صيانة", amount: 7200, paidTo: "ورشة الصيانة المركزية", description: "صيانة خط الإنتاج 2" },
    { id: uid(), date: "2026-08-22", category: "نقل", amount: 5400, paidTo: "شركة النقل السريع", description: "نقل شحنات للموزعين" },
    { id: uid(), date: "2026-08-27", category: "مواد خام", amount: 32000, paidTo: "مورد السكر المتحدة", description: "توريد سكر أبيض" },
  ],
  employees: [
    { id: uid(), name: "أحمد فتحي", position: "مشرف إنتاج", department: "الإنتاج", salary: 9500, hireDate: "2021-03-01", phone: "01011122233", status: "نشط" },
    { id: uid(), name: "منى شريف", position: "محاسبة", department: "المحاسبة", salary: 8200, hireDate: "2022-06-15", phone: "01022233344", status: "نشط" },
    { id: uid(), name: "كريم عادل", position: "فني صيانة", department: "الصيانة", salary: 6800, hireDate: "2023-01-10", phone: "01033344455", status: "إجازة" },
    { id: uid(), name: "هبة الطيب", position: "مسؤولة مخزون", department: "المخزون", salary: 7000, hireDate: "2020-11-20", phone: "01044455566", status: "نشط" },
  ],
  suppliers: [
    { id: uid(), name: "مورد السكر المتحدة", material: "سكر أبيض", phone: "01055566677", address: "المنيا", rating: 4, lastOrderDate: "2026-08-27" },
    { id: uid(), name: "الخليج للغازات الصناعية", material: "غاز CO2", phone: "01066677788", address: "السويس", rating: 5, lastOrderDate: "2026-08-20" },
    { id: uid(), name: "مصنع التعبئة الحديث", material: "زجاجات بلاستيك", phone: "01077788899", address: "العاشر من رمضان", rating: 4, lastOrderDate: "2026-08-24" },
  ],
};

/* ---------------------------------------------------------------------- */
/*  Module field configs                                                   */
/* ---------------------------------------------------------------------- */

const STATUS_COLORS = {
  "مكتمل": THEME.green, "قيد الإنتاج": THEME.amber, "متوقف": THEME.danger,
  "تم التسليم": THEME.green, "تم الشحن": THEME.amber, "قيد التجهيز": THEME.creamDim, "جديد": THEME.red, "ملغي": THEME.danger,
  "نشط": THEME.green, "إجازة": THEME.amber, "منتهي": THEME.danger,
  "وارد": THEME.green, "صادر": THEME.danger,
};

const MODULES = {
  production: {
    title: "الإنتاج", icon: Factory, seedKey: "production",
    fields: [
      { key: "product", label: "المنتج", type: "text", required: true },
      { key: "batch", label: "رقم التشغيلة", type: "text", required: true },
      { key: "line", label: "خط الإنتاج", type: "select", options: ["خط 1", "خط 2", "خط 3"] },
      { key: "quantity", label: "الكمية (قطعة)", type: "number", required: true },
      { key: "date", label: "التاريخ", type: "date" },
      { key: "status", label: "الحالة", type: "select", options: ["قيد الإنتاج", "مكتمل", "متوقف"], badge: true },
    ],
  },
  inventory: {
    title: "المخزون", icon: Package, seedKey: "inventory",
    fields: [
      { key: "name", label: "الصنف", type: "text", required: true },
      { key: "category", label: "التصنيف", type: "select", options: ["مادة خام", "تعبئة", "منتج نهائي"] },
      { key: "quantity", label: "الكمية", type: "number", required: true },
      { key: "unit", label: "الوحدة", type: "text" },
      { key: "minStock", label: "حد إعادة الطلب", type: "number" },
      { key: "location", label: "الموقع", type: "text" },
    ],
  },
  orders: {
    title: "الطلبات", icon: ShoppingCart, seedKey: "orders",
    fields: [
      { key: "client", label: "العميل", type: "text", required: true },
      { key: "product", label: "المنتج", type: "text", required: true },
      { key: "quantity", label: "الكمية", type: "number", required: true },
      { key: "unitPrice", label: "سعر الوحدة (ج.م)", type: "number" },
      { key: "orderDate", label: "تاريخ الطلب", type: "date" },
      { key: "deliveryDate", label: "تاريخ التسليم", type: "date" },
      { key: "status", label: "الحالة", type: "select", options: ["جديد", "قيد التجهيز", "تم الشحن", "تم التسليم", "ملغي"], badge: true },
    ],
  },
  clients: {
    title: "العملاء", icon: Users, seedKey: "clients",
    fields: [
      { key: "name", label: "اسم العميل", type: "text", required: true },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "address", label: "العنوان", type: "text" },
      { key: "type", label: "النوع", type: "select", options: ["تجزئة", "جملة", "سوبر ماركت"] },
      { key: "balance", label: "الرصيد المستحق (ج.م)", type: "number" },
    ],
  },
  accounting: {
    title: "الحسابات", icon: Wallet, seedKey: "accounting",
    fields: [
      { key: "date", label: "التاريخ", type: "date" },
      { key: "description", label: "البيان", type: "text", required: true },
      { key: "type", label: "النوع", type: "select", options: ["وارد", "صادر"], badge: true },
      { key: "category", label: "التصنيف", type: "text" },
      { key: "amount", label: "المبلغ (ج.م)", type: "number", required: true },
    ],
  },
  expenses: {
    title: "المصروفات", icon: Receipt, seedKey: "expenses",
    fields: [
      { key: "date", label: "التاريخ", type: "date" },
      { key: "category", label: "التصنيف", type: "select", options: ["كهرباء", "صيانة", "رواتب", "مواد خام", "نقل", "أخرى"] },
      { key: "amount", label: "المبلغ (ج.م)", type: "number", required: true },
      { key: "paidTo", label: "المستفيد", type: "text" },
      { key: "description", label: "البيان", type: "text" },
    ],
  },
  employees: {
    title: "الموظفين", icon: UserCog, seedKey: "employees",
    fields: [
      { key: "name", label: "الاسم", type: "text", required: true },
      { key: "position", label: "الوظيفة", type: "text" },
      { key: "department", label: "القسم", type: "select", options: ["الإنتاج", "المخزون", "المبيعات", "المحاسبة", "الصيانة", "الإدارة"] },
      { key: "salary", label: "الراتب (ج.م)", type: "number" },
      { key: "hireDate", label: "تاريخ التعيين", type: "date" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "status", label: "الحالة", type: "select", options: ["نشط", "إجازة", "منتهي"], badge: true },
    ],
  },
  suppliers: {
    title: "الموردين", icon: Truck, seedKey: "suppliers",
    fields: [
      { key: "name", label: "اسم المورد", type: "text", required: true },
      { key: "material", label: "الخامة الموردة", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "address", label: "العنوان", type: "text" },
      { key: "rating", label: "التقييم (1-5)", type: "number" },
      { key: "lastOrderDate", label: "آخر توريد", type: "date" },
    ],
  },
};

/* ---------------------------------------------------------------------- */
/*  Small UI primitives                                                    */
/* ---------------------------------------------------------------------- */

function Badge({ text }) {
  const color = STATUS_COLORS[text] || THEME.creamDim;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "3px 10px", borderRadius: 20, fontSize: 12.5, fontWeight: 500,
        background: color + "22", color: color, border: `1px solid ${color}55`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {text}
    </span>
  );
}

function IconButton({ onClick, title, children, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 8, border: `1px solid ${THEME.border}`,
        background: "transparent", color: danger ? THEME.danger : THEME.creamDim,
        cursor: "pointer", transition: "all .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? THEME.danger + "18" : THEME.amber + "18"; e.currentTarget.style.color = danger ? THEME.danger : THEME.amberSoft; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = danger ? THEME.danger : THEME.creamDim; }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "9px 16px", borderRadius: 10, border: "none",
        background: THEME.red, color: THEME.cream, fontFamily: "'Tajawal', sans-serif",
        fontWeight: 600, fontSize: 14.5, cursor: "pointer",
        boxShadow: `0 4px 14px ${THEME.red}33`, transition: "transform .15s, background .15s",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = THEME.redDim; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = THEME.red; }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div style={{
      background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16,
      padding: "18px 20px", flex: "1 1 200px", minWidth: 200, position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: THEME.creamDim, fontSize: 13, marginBottom: 8 }}>{label}</div>
          <div style={{ color: THEME.cream, fontSize: 25, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>{value}</div>
          {sub && <div style={{ color: accent || THEME.creamDim, fontSize: 12.5, marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: (accent || THEME.amber) + "1c",
          display: "flex", alignItems: "center", justifyContent: "center", color: accent || THEME.amber,
        }}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const common = {
    style: {
      width: "100%", padding: "9px 12px", borderRadius: 9,
      border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.cream,
      fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 14, outline: "none",
    },
  };
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: THEME.creamDim }}>
      {field.label}{field.required && <span style={{ color: THEME.red }}> *</span>}
      {field.type === "select" ? (
        <select {...common} value={value ?? ""} onChange={(e) => onChange(field.key, e.target.value)}>
          <option value="" disabled>اختر...</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          {...common}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      )}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(8,6,5,0.6)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18,
          width: "100%", maxWidth: 520, maxHeight: "88vh", overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${THEME.border}`, position: "sticky", top: 0,
          background: THEME.panel,
        }}>
          <h3 style={{ margin: 0, color: THEME.cream, fontFamily: "'Tajawal', sans-serif", fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <IconButton onClick={onClose} title="إغلاق"><X size={17} /></IconButton>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ text, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(8,6,5,0.6)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 110, padding: 16,
      }}
      onClick={onCancel}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16,
        padding: 22, maxWidth: 380, width: "100%", textAlign: "center",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 999, background: THEME.danger + "22", color: THEME.danger,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
        }}>
          <AlertTriangle size={20} />
        </div>
        <p style={{ color: THEME.cream, fontSize: 14.5, marginBottom: 18 }}>{text}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} style={{
            padding: "8px 18px", borderRadius: 9, border: `1px solid ${THEME.border}`,
            background: "transparent", color: THEME.creamDim, cursor: "pointer", fontFamily: "'Tajawal', sans-serif",
          }}>إلغاء</button>
          <button onClick={onConfirm} style={{
            padding: "8px 18px", borderRadius: 9, border: "none",
            background: THEME.danger, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "'Tajawal', sans-serif",
          }}>حذف</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Generic module screen                                                  */
/* ---------------------------------------------------------------------- */

function ModuleScreen({ moduleKey, data, onAdd, onUpdate, onDelete }) {
  const config = MODULES[moduleKey];
  const [query, setQuery] = useState("");
  const [modalItem, setModalItem] = useState(null); // {} = new, {...item} = edit, null = closed
  const [confirmId, setConfirmId] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) =>
      config.fields.some((f) => String(row[f.key] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, config.fields]);

  const openNew = () => {
    const blank = {};
    config.fields.forEach((f) => { blank[f.key] = f.type === "date" ? todayISO() : ""; });
    setModalItem(blank);
  };

  const handleFieldChange = (key, value) => setModalItem((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const missing = config.fields.some((f) => f.required && !String(modalItem[f.key] ?? "").trim());
    if (missing) return;
    if (modalItem.id) onUpdate(modalItem);
    else onAdd({ ...modalItem, id: uid() });
    setModalItem(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 11, padding: "8px 14px", flex: "1 1 260px", maxWidth: 340 }}>
          <Search size={16} color={THEME.creamDim} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث..."
            style={{ background: "transparent", border: "none", outline: "none", color: THEME.cream, fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 14, width: "100%" }}
          />
        </div>
        <PrimaryButton onClick={openNew}><Plus size={17} /> إضافة {config.title.slice(0, -1) || config.title}</PrimaryButton>
      </div>

      <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: THEME.panelAlt }}>
                {config.fields.map((f) => (
                  <th key={f.key} style={{ textAlign: "right", padding: "12px 16px", color: THEME.creamDim, fontWeight: 500, whiteSpace: "nowrap" }}>{f.label}</th>
                ))}
                <th style={{ padding: "12px 16px" }} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={config.fields.length + 1} style={{ padding: 30, textAlign: "center", color: THEME.creamDim }}>لا توجد بيانات مطابقة</td></tr>
              )}
              {filtered.map((row, i) => {
                const low = moduleKey === "inventory" && Number(row.quantity) < Number(row.minStock);
                return (
                  <tr key={row.id} style={{ borderTop: `1px solid ${THEME.border}`, background: i % 2 === 1 ? THEME.panelAlt + "55" : "transparent" }}>
                    {config.fields.map((f) => (
                      <td key={f.key} style={{ padding: "11px 16px", color: THEME.cream, whiteSpace: "nowrap" }}>
                        {f.badge ? <Badge text={row[f.key]} /> :
                          f.type === "number" && (f.key === "salary" || f.key === "amount" || f.key === "balance" || f.key === "unitPrice") ? fmtMoney(row[f.key]) :
                          f.type === "number" ? fmtNum(row[f.key]) :
                          row[f.key]}
                        {f.key === "quantity" && low && (
                          <span style={{ marginRight: 8, color: THEME.danger, fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <AlertTriangle size={11} /> منخفض
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <IconButton title="تعديل" onClick={() => setModalItem(row)}><Pencil size={15} /></IconButton>
                        <IconButton title="حذف" danger onClick={() => setConfirmId(row.id)}><Trash2 size={15} /></IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalItem && (
        <Modal title={modalItem.id ? `تعديل — ${config.title}` : `إضافة — ${config.title}`} onClose={() => setModalItem(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {config.fields.map((f) => (
              <div key={f.key} style={{ gridColumn: f.type === "text" && (f.key === "description" || f.key === "address") ? "1 / -1" : "auto" }}>
                <Field field={f} value={modalItem[f.key]} onChange={handleFieldChange} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
            <button onClick={() => setModalItem(null)} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${THEME.border}`, background: "transparent", color: THEME.creamDim, cursor: "pointer", fontFamily: "'Tajawal', sans-serif" }}>إلغاء</button>
            <PrimaryButton onClick={handleSave}>حفظ</PrimaryButton>
          </div>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          text="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Dashboard                                                               */
/* ---------------------------------------------------------------------- */

function Dashboard({ store }) {
  const { production, inventory, orders, accounting, expenses, employees, suppliers } = store;

  const totalProductionQty = production.reduce((s, p) => s + (Number(p.quantity) || 0), 0);
  const lowStockCount = inventory.filter((i) => Number(i.quantity) < Number(i.minStock)).length;
  const pendingOrders = orders.filter((o) => !["تم التسليم", "ملغي"].includes(o.status)).length;
  const totalRevenue = accounting.filter((a) => a.type === "وارد").reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalOutflow = accounting.filter((a) => a.type === "صادر").reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalOutflow - totalExpenses;
  const activeEmployees = employees.filter((e) => e.status === "نشط").length;

  const productionByLine = useMemo(() => {
    const map = {};
    production.forEach((p) => { map[p.line] = (map[p.line] || 0) + (Number(p.quantity) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [production]);

  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const expensesByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const tooltipStyle = { background: THEME.panelAlt, border: `1px solid ${THEME.border}`, borderRadius: 10, color: THEME.cream, fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 12.5 };

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <StatCard label="إجمالي الإنتاج (قطعة)" value={fmtNum(totalProductionQty)} icon={Factory} accent={THEME.amber} sub={`${production.length} تشغيلة مسجلة`} />
        <StatCard label="أصناف منخفضة المخزون" value={fmtNum(lowStockCount)} icon={Package} accent={lowStockCount > 0 ? THEME.danger : THEME.green} sub={lowStockCount > 0 ? "تحتاج إعادة طلب" : "المخزون سليم"} />
        <StatCard label="طلبات قيد التنفيذ" value={fmtNum(pendingOrders)} icon={ShoppingCart} accent={THEME.amber} sub={`${orders.length} إجمالي الطلبات`} />
        <StatCard label="صافي الربح" value={fmtMoney(netProfit)} icon={Wallet} accent={netProfit >= 0 ? THEME.green : THEME.danger} sub={netProfit >= 0 ? "أداء إيجابي هذا الشهر" : "عجز هذا الشهر"} />
        <StatCard label="الموظفون النشطون" value={fmtNum(activeEmployees)} icon={UserCog} accent={THEME.amber} sub={`من ${employees.length} إجمالي`} />
        <StatCard label="الموردون" value={fmtNum(suppliers.length)} icon={Truck} accent={THEME.amber} sub="مورد نشط" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 18, minWidth: 0 }}>
          <h4 style={{ margin: "0 0 14px", color: THEME.cream, fontFamily: "'Tajawal', sans-serif", fontSize: 15 }}>الإنتاج حسب خط الإنتاج</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={productionByLine}>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
              <XAxis dataKey="name" stroke={THEME.creamDim} fontSize={12} />
              <YAxis stroke={THEME.creamDim} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: THEME.border + "55" }} />
              <Bar dataKey="value" fill={THEME.amber} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 18, minWidth: 0 }}>
          <h4 style={{ margin: "0 0 14px", color: THEME.cream, fontFamily: "'Tajawal', sans-serif", fontSize: 15 }}>حالة الطلبات</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {ordersByStatus.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: THEME.creamDim }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 18 }}>
        <h4 style={{ margin: "0 0 14px", color: THEME.cream, fontFamily: "'Tajawal', sans-serif", fontSize: 15 }}>المصروفات حسب التصنيف</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={expensesByCategory} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
            <XAxis type="number" stroke={THEME.creamDim} fontSize={12} />
            <YAxis type="category" dataKey="name" stroke={THEME.creamDim} fontSize={12} width={90} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} cursor={{ fill: THEME.border + "55" }} />
            <Bar dataKey="value" fill={THEME.red} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  App shell                                                               */
/* ---------------------------------------------------------------------- */

const NAV_ITEMS = [
  { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { key: "production", label: "الإنتاج", icon: Factory },
  { key: "inventory", label: "المخزون", icon: Package },
  { key: "orders", label: "الطلبات", icon: ShoppingCart },
  { key: "clients", label: "العملاء", icon: Users },
  { key: "accounting", label: "الحسابات", icon: Wallet },
  { key: "expenses", label: "المصروفات", icon: Receipt },
  { key: "employees", label: "الموظفين", icon: UserCog },
  { key: "suppliers", label: "الموردين", icon: Truck },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState({
    production: [], inventory: [], orders: [], clients: [],
    accounting: [], expenses: [], employees: [], suppliers: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        Object.keys(MODULES).map(async (key) => [key, await loadCollection(key, SEED[key])])
      );
      if (!mounted) return;
      const next = {};
      entries.forEach(([k, v]) => { next[k] = v; });
      setStore(next);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const mutate = useCallback((moduleKey, updater) => {
    setStore((prev) => {
      const nextData = updater(prev[moduleKey]);
      saveCollection(moduleKey, nextData);
      return { ...prev, [moduleKey]: nextData };
    });
  }, []);

  const handlers = useMemo(() => {
    const map = {};
    Object.keys(MODULES).forEach((key) => {
      map[key] = {
        onAdd: (item) => mutate(key, (list) => [item, ...list]),
        onUpdate: (item) => mutate(key, (list) => list.map((r) => (r.id === item.id ? item : r))),
        onDelete: (id) => mutate(key, (list) => list.filter((r) => r.id !== id)),
      };
    });
    return map;
  }, [mutate]);

  const activeConfig = MODULES[active];

  return (
    <div dir="rtl" style={{
      fontFamily: "'IBM Plex Sans Arabic', sans-serif", background: THEME.bg, minHeight: "100vh",
      color: THEME.cream, display: "flex",
    }}>
      <style>{fontImport}{`
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: ${THEME.amber} !important; }
        select option { background: ${THEME.bg}; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 8px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 232 : 0, transition: "width .2s", overflow: "hidden",
        borderLeft: `1px solid ${THEME.border}`, background: THEME.panel, flexShrink: 0,
      }}>
        <div style={{ padding: "22px 18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${THEME.red}, ${THEME.amber})`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Factory size={18} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 15, color: THEME.cream, whiteSpace: "nowrap" }}>مصنع الكولا</div>
            <div style={{ fontSize: 11, color: THEME.creamDim, whiteSpace: "nowrap" }}>نظام إدارة المصنع</div>
          </div>
        </div>

        <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10,
                  border: "none", cursor: "pointer", textAlign: "right",
                  background: isActive ? THEME.red + "22" : "transparent",
                  color: isActive ? THEME.amberSoft : THEME.creamDim,
                  fontFamily: "'Tajawal', sans-serif", fontSize: 14, fontWeight: isActive ? 600 : 400,
                  transition: "all .15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = THEME.panelAlt; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 26px", borderBottom: `1px solid ${THEME.border}`, background: THEME.panel + "aa",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconButton onClick={() => setSidebarOpen((s) => !s)} title="القائمة">
              {sidebarOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
            </IconButton>
            <h2 style={{ margin: 0, fontFamily: "'Tajawal', sans-serif", fontSize: 19, fontWeight: 700, color: THEME.cream }}>
              {activeConfig ? activeConfig.title : "لوحة التحكم"}
            </h2>
          </div>
          <div style={{ fontSize: 13, color: THEME.creamDim }}>
            {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        <div style={{ padding: 26, flex: 1, overflow: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: THEME.creamDim }}>
              جارِ تحميل البيانات...
            </div>
          ) : active === "dashboard" ? (
            <Dashboard store={store} />
          ) : (
            <ModuleScreen
              moduleKey={active}
              data={store[active]}
              onAdd={handlers[active].onAdd}
              onUpdate={handlers[active].onUpdate}
              onDelete={handlers[active].onDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
