import { Component, OnInit } from '@angular/core';
import { Order, OrderState } from '../../../models/order';
import { OrderServiceService } from '../../../services/order-service.service';
import { ProductServiceService } from '../../../services/product-service.service';
import { OrderItem } from '../../../models/order-item';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  filterDate: string = "";

  loading = false;
  searchTerm: string = '';

  orderStates = Object.values(OrderState);

  constructor(
    private orderService: OrderServiceService,
    private productService: ProductServiceService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...data];
        this.loading = false;
        console.log('Orders loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

  search(): void {
    const term = this.searchTerm.toLowerCase();
    const dateFilter = this.filterDate;

    this.filteredOrders = this.orders.filter(order => {
      const matchesText =
        !term ||
        order.id?.toString().includes(term);

      const matchesDate =
        !dateFilter ||
        (order.createdAt &&
         new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter);

      return matchesText && matchesDate;
    });
  }

  onStateChange(order: Order, newState: OrderState): void {
    const updatedOrder: Order = { ...order, state: newState };

    this.orderService.update(order.id!, updatedOrder).subscribe({
      next: () => {
        order.state = newState;
        
        if (newState === OrderState.DELIVERED && order.items && order.items.length > 0) {
          this.updateProductsStock(order.items);
        }
      },
      error: (err) => {
        console.error('Order update failed', err);
        alert('Failed to update order!');
      }
    });
  }

  private updateProductsStock(orderItems: OrderItem[]): void {
    orderItems.forEach(item => {
      const newStock = item.product.stock - item.quantity;
      
      this.productService.updateProductStock(item.product.code, newStock).subscribe({
        next: (updatedProduct) => {
          console.log(`Stock updated for product ${updatedProduct.code}: ${updatedProduct.stock}`);
          item.product.stock = updatedProduct.stock;
          this.loadOrders();
        },
        error: (err) => {
          console.error(`Failed to update stock for product ${item.product.code}`, err);
          alert(`Failed to update stock for product: ${item.product.titre}`);
        }
      });
    });
  }

  toggleItems(order: any) {
    order.showItems = !order.showItems;
  }

  exportOrderToPDF(order: Order): void {
  const doc = new jsPDF();
  
  // Company logo with more width
  const logoPath = 'mouja.png'; // Path to logo in public folder
  try {
    doc.addImage(logoPath, 'PNG', 14, 10, 60, 40); // Wider logo: 60x30
  } catch (error) {
    console.error('Error loading logo:', error);
  }
  
  // Company contact info under logo
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Tél: +216 XX XXX XXX', 14, 55);
  doc.text('Email: contact@mouja.tn', 14, 60);
  
  // Order info on the right
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text('Facture', 200, 20, { align: 'right' });
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Commande N°: ${order.id}`, 200, 30, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt!).toLocaleDateString('fr-FR')}`, 200, 36, { align: 'right' });
  
  // Customer Info box with border and rounded corners
  if (order.user) {
    const boxX = 120;
    const boxY = 45;
    const boxWidth = 80;
    const boxHeight = order.user.adresse ? 40 : 30;
    const borderRadius = 3;
    
    // Draw rounded rectangle
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, borderRadius, borderRadius);
    
    // Customer info inside the box - aligned to the left
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, 'bold');
    doc.text('Client:', boxX + 3, boxY + 6);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`${order.user.nom} ${order.user.prenom}`, boxX + 3, boxY + 12);
    doc.text(`${order.user.mail}`, boxX + 3, boxY + 17);
    doc.text(`${order.user.telephone}`, boxX + 3, boxY + 22);
    
    if (order.user.adresse) {
      doc.text(`${order.user.adresse.street}`, boxX + 3, boxY + 27);
      doc.text(`${order.user.adresse.city}, ${order.user.adresse.postalCode}`, boxX + 3, boxY + 32);
      doc.text(`${order.user.adresse.country}`, boxX + 3, boxY + 37);
    }
  }
  
  // Items Table - Removed "Montant TVA" column to reduce width
  if (order.items && order.items.length > 0) {
    const tableData = order.items.map(item => {
      const unitPrice = item.unitPrice || 0;
      const quantity = item.quantity || 0;
      const tvaRate = 0.19; // 19%
      const htTotal = unitPrice * quantity;
      const tvaAmount = htTotal * tvaRate;
      const ttcTotal = htTotal + tvaAmount;
      
      return [
        item.product.code || 'N/A', // Product code
        item.product.titre,
        quantity.toString(),
        `${unitPrice.toFixed(3)}`,
        '19%',
        `${ttcTotal.toFixed(3)}`
      ];
    });
    
    autoTable(doc, {
      startY: 95,
      head: [['Code', 'Produit', 'Qté', 'Prix HT', 'TVA', 'Total TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Get the final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY || 95;
    
    // Calculate totals
    const totalHT = order.items.reduce((sum, item) => {
      return sum + ((item.unitPrice || 0) * (item.quantity || 0));
    }, 0);
    
    const totalTVA = totalHT * 0.19;
    const totalTTC = totalHT + totalTVA;
    
    // Total section below table - better spacing
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    const rightX = 195;
    const labelX = 140;
    let currentY = finalY + 12;
    
    // Total HT
    doc.text(`Total HT:`, labelX, currentY);
    doc.text(`${totalHT.toFixed(3)} TND`, rightX, currentY, { align: 'right' });
    
    // Total TVA
    currentY += 6;
    doc.text(`Total TVA (19%):`, labelX, currentY);
    doc.text(`${totalTVA.toFixed(3)} TND`, rightX, currentY, { align: 'right' });
    
    // Draw a separator line
    currentY += 4;
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(labelX, currentY, rightX, currentY);
    
    // Total à Payer - with more spacing
    currentY += 8;
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, 'bold');
    doc.text(`Total à Payer:`, labelX, currentY);
    doc.text(`${totalTTC.toFixed(3)} TND`, rightX, currentY, { align: 'right' });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont(undefined, 'normal');
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`commande-${order.id}.pdf`);
}
}