// src/lib/invoiceGenerator.js
// Premium PDF invoice generator (vector-based — crisp at any zoom)
// Requires: npm i jspdf jspdf-autotable

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────── Brand / company settings ─────────── */
const BRAND = {
  name: 'YOUR STORE',
  tagline: 'Premium Online Marketplace',
  address: 'King Fahd Road, Riyadh 12345',
  country: 'Kingdom of Saudi Arabia',
  email: 'support@yourstore.com',
  phone: '+966 11 234 5678',
  website: 'www.yourstore.com',
  vat: 'VAT: 300000000000003',
};

/* Theme colors (RGB) */
const C = {
  primary: [234, 88, 12],      // orange-600
  primaryDark: [194, 65, 12],  // orange-700
  ink: [15, 23, 42],           // slate-900
  body: [51, 65, 85],          // slate-700
  muted: [100, 116, 139],      // slate-500
  line: [226, 232, 240],       // slate-200
  soft: [248, 250, 252],       // slate-50
  success: [5, 150, 105],      // emerald-600
  bg: [255, 247, 237],         // orange-50
};

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket',
  card: 'Credit / Debit Card', bank: 'Bank Transfer', online: 'Online Payment',
};

const fmtMoney = (n = 0) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/* ─────────── Main entry ─────────── */
export function generateInvoicePDF(order, opts = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 40; // margin

  /* ── Top accent bar ── */
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');

  /* ── Header: brand + INVOICE label ── */
  // Logo bubble
  doc.setFillColor(...C.primary);
  doc.roundedRect(M, 28, 44, 44, 10, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND.name.charAt(0), M + 22, 58, { align: 'center' });

  // Brand text
  doc.setTextColor(...C.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(BRAND.name, M + 56, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(BRAND.tagline, M + 56, 64);

  // INVOICE label (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...C.ink);
  doc.text('INVOICE', pageW - M, 50, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(`#${order.orderNumber || order._id || '—'}`, pageW - M, 66, { align: 'right' });

  /* ── Divider ── */
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.5);
  doc.line(M, 90, pageW - M, 90);

  /* ── Meta strip ── */
  let y = 108;
  const metaCol = (label, value, x) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.ink);
    doc.text(String(value || '—'), x, y + 13);
  };

  metaCol('Invoice Date', fmtDate(new Date()), M);
  metaCol('Order Date', fmtDate(order.createdAt), M + 130);
  metaCol('Payment', PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || '—', M + 260);

  // Status pill (right)
  const status = (order.paymentStatus === 'paid' ? 'PAID' : (order.status || 'PENDING')).toUpperCase();
  const pillColor = order.paymentStatus === 'paid' ? C.success : C.primary;
  doc.setFillColor(...pillColor);
  const pillW = doc.getTextWidth(status) + 24;
  doc.roundedRect(pageW - M - pillW, y - 8, pillW, 22, 11, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(status, pageW - M - pillW / 2, y + 7, { align: 'center' });

  /* ── Billed to / Ship to cards ── */
  y = 150;
  const cardW = (pageW - M * 2 - 16) / 2;
  const cardH = 110;

  const addr = order.shippingAddress || {};
  const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || order.customerName || '—';

  const drawCard = (x, title, lines) => {
    doc.setFillColor(...C.soft);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, 'F');
    doc.setDrawColor(...C.line);
    doc.roundedRect(x, y, cardW, cardH, 8, 8, 'S');

    // Accent dot
    doc.setFillColor(...C.primary);
    doc.circle(x + 14, y + 18, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(title.toUpperCase(), x + 24, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.ink);
    doc.text(lines[0] || '—', x + 14, y + 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.body);
    let ly = y + 56;
    lines.slice(1).forEach((line) => {
      if (!line) return;
      const wrapped = doc.splitTextToSize(String(line), cardW - 28);
      wrapped.forEach((w) => { doc.text(w, x + 14, ly); ly += 12; });
    });
  };

  drawCard(M, 'Billed To', [
    fullName,
    addr.phone,
    addr.email || order.customerEmail,
  ]);

  const shipLines = [
    fullName,
    [addr.houseNo, addr.road].filter(Boolean).join(', '),
    [addr.area, addr.city].filter(Boolean).join(', '),
    [addr.postalCode, BRAND.country].filter(Boolean).join(', '),
    addr.landmark && `Landmark: ${addr.landmark}`,
  ];
  drawCard(M + cardW + 16, 'Ship To', shipLines);

  /* ── Items table ── */
  const items = order.items || [];
  const tableBody = items.map((it, i) => {
    const variant = it.variantAttrs
      ? Object.entries(it.variantAttrs).map(([k, v]) => `${k}: ${v}`).join(' · ')
      : '';
    const name = variant ? `${it.productName}\n${variant}` : it.productName;
    return [
      String(i + 1).padStart(2, '0'),
      name,
      String(it.quantity),
      fmtMoney(it.unitPrice),
      fmtMoney(it.lineTotal ?? (it.unitPrice * it.quantity)),
    ];
  });

  autoTable(doc, {
    startY: y + cardH + 24,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableBody,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: C.body,
      cellPadding: { top: 10, right: 10, bottom: 10, left: 10 },
      lineColor: C.line,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: C.ink,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: { top: 10, right: 10, bottom: 10, left: 10 },
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center', textColor: C.muted },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 80, halign: 'right' },
      4: { cellWidth: 90, halign: 'right', fontStyle: 'bold', textColor: C.ink },
    },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    margin: { left: M, right: M },
  });

  /* ── Totals block ── */
  let ty = doc.lastAutoTable.finalY + 20;
  const totalsX = pageW - M - 240;
  const totalsW = 240;

  const row = (label, value, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.bold ? 10 : 9.5);
    doc.setTextColor(...(opts.color || C.body));
    doc.text(label, totalsX + 12, ty);
    doc.text(`SAR ${value}`, totalsX + totalsW - 12, ty, { align: 'right' });
    ty += opts.gap || 18;
  };

  row('Subtotal', fmtMoney(order.subtotal));
  row('Shipping', order.shippingCost ? fmtMoney(order.shippingCost) : 'Free',
      order.shippingCost ? {} : { color: C.success });

  if (order.couponDiscount > 0) {
    row(`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`,
        `-${fmtMoney(order.couponDiscount)}`, { color: C.success });
  }
  if (order.tax > 0) row('VAT', fmtMoney(order.tax));

  // Grand total band
  ty += 4;
  doc.setFillColor(...C.ink);
  doc.roundedRect(totalsX, ty - 4, totalsW, 36, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DUE', totalsX + 12, ty + 18);
  doc.setFontSize(14);
  doc.text(`SAR ${fmtMoney(order.total)}`, totalsX + totalsW - 12, ty + 19, { align: 'right' });

  /* ── Thank you note + Footer ── */
  const footY = pageH - 90;
  doc.setDrawColor(...C.line);
  doc.line(M, footY, pageW - M, footY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.primary);
  doc.text('Thank you for your purchase!', M, footY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(
    'This is a computer-generated invoice and does not require a signature.',
    M, footY + 32
  );

  // Right footer (company info)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.ink);
  doc.text(BRAND.name, pageW - M, footY + 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(BRAND.address, pageW - M, footY + 30, { align: 'right' });
  doc.text(`${BRAND.email}  ·  ${BRAND.phone}`, pageW - M, footY + 42, { align: 'right' });
  doc.text(BRAND.vat, pageW - M, footY + 54, { align: 'right' });

  // Bottom accent
  doc.setFillColor(...C.primary);
  doc.rect(0, pageH - 6, pageW, 6, 'F');

  /* ── Save ── */
  const fileName = opts.fileName || `Invoice-${order.orderNumber || order._id || 'order'}.pdf`;
  doc.save(fileName);
}
