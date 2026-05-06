import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceipt = (data) => {
  const { type, student, amount, date, reference, details } = data;
  const doc = new jsPDF();

  // 1. Branding & Header
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('UHOSTEL MANAGEMENT', 20, 25);
  
  doc.setFontSize(12);
  doc.text('Official Payment Receipt', 20, 32);

  // 2. Receipt Info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 150, 50);
  doc.text(`Reference No: ${reference?.slice(-12).toUpperCase() || 'N/A'}`, 150, 55);

  // 3. Student Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details', 20, 70);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, 20, 80);
  doc.text(`Email: ${student.email}`, 20, 85);

  // Transaction Info
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', 110, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction ID: ${data.payment_id || 'N/A'}`, 110, 80);
  doc.text(`Payment Date: ${data.date ? new Date(data.date).toLocaleString() : 'N/A'}`, 110, 85);
  
  // 4. Payment Details Table

  autoTable(doc, {
    startY: 100,
    head: [['Description', 'Amount (INR)']],
    body: [
      [`${type} - ${details}`, `Rs. ${amount}`],
      ['Transaction Fee', 'Rs. 0.00'],
      ['Total Paid', `Rs. ${amount}`]
    ],
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 20, right: 20 }
  });

  // 5. Verification Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Status: PAID', 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 20, finalY + 10);
  doc.text('All payments are processed securely via Razorpay.', 20, finalY + 15);

  // 6. Save PDF
  doc.save(`UHostel_Receipt_${type}_${reference?.slice(-6).toUpperCase()}.pdf`);
};

export const generateCanteenReceipt = (order) => {
  const doc = new jsPDF();
  const primaryColor = [5, 150, 105]; // Emerald-600 for Canteen

  // 1. Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('UHOSTEL ECANTEEN', 20, 25);
  
  doc.setFontSize(12);
  doc.text('Digital Purchase Receipt', 20, 32);

  // 2. Info Row
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 140, 50);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 140, 55);
  doc.text(`Status: ${order.status.toUpperCase()}`, 140, 60);

  // 3. Customer Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 20, 75);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.user_id?.name || 'Student'}`, 20, 85);
  doc.text(`Email: ${order.user_id?.email || 'N/A'}`, 20, 90);

  // 4. Products Table
  const tableData = order.products.map(p => [
    p.product_id?.name || 'Product',
    p.quantity.toString(),
    `Rs. ${p.price_at_order}`,
    `Rs. ${p.quantity * p.price_at_order}`
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: [
      ...tableData,
      ['', '', 'Grand Total', `Rs. ${order.total_amount}`]
    ],
    headStyles: { fillColor: primaryColor },
    columnStyles: {
      3: { fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [245, 252, 250] }, // Light emerald tint
    margin: { left: 20, right: 20 }
  });

  // 5. Transaction details
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Summary', 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Gateway: Razorpay`, 20, finalY + 10);
  doc.text(`Payment Status: ${order.payment_status.toUpperCase()}`, 20, finalY + 15);
  
  if (order.razorpay_payment_id) {
    doc.text(`Razorpay Payment ID: ${order.razorpay_payment_id}`, 20, finalY + 20);
    doc.text(`Gateway Reference: RZP_ORD_${order._id.slice(-6).toUpperCase()}`, 20, finalY + 25);
  } else if (order.payment_status === 'Paid') {
    doc.text(`Internal Transaction Ref: RZP_INT_${order._id.slice(-6).toUpperCase()}`, 20, finalY + 20);
  }

  // 6. Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping at UHostel ECanteen!', 105, 280, { align: 'center' });
  doc.text('This is a digitally generated receipt.', 105, 285, { align: 'center' });

  doc.save(`Canteen_Receipt_${order._id.slice(-8)}.pdf`);
};
