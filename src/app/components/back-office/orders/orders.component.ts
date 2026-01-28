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

  // NEW: Export single order to PDF
  exportOrderToPDF(order: Order): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('Détails de la Commande', 14, 20);

    // Order Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Commande N°: ${order.id}`, 14, 35);
    doc.text(`Date: ${new Date(order.createdAt!).toLocaleDateString('fr-FR')}`, 14, 42);
    doc.text(`État: ${order.state}`, 14, 49);
    doc.text(`Total: ${order.total?.toFixed(3)} TND`, 14, 56);

    // Customer Info
    if (order.user) {
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Informations Client', 14, 68);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nom: ${order.user.nom} ${order.user.prenom}`, 14, 76);
      doc.text(`Email: ${order.user.mail}`, 14, 82);
      
      if (order.user.adresse) {
        const address = `Adresse: ${order.user.adresse.street}, ${order.user.adresse.city}, ${order.user.adresse.postalCode}, ${order.user.adresse.country}`;
        doc.text(address, 14, 88);
      }
    }

    // Items Table
    if (order.items && order.items.length > 0) {
      const tableData = order.items.map(item => [
        item.product.titre,
        item.quantity.toString(),
        `${item.unitPrice?.toFixed(3)} TND`,
        `${item.subTotal?.toFixed(3)} TND`
      ]);

      autoTable(doc, {
        startY: order.user ? 98 : 68,
        head: [['Produit', 'Quantité', 'Prix Unitaire', 'Sous-total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
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