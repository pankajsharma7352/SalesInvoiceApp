import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface InvoiceItem {
  itemNo: string;
  itemName: string;
  qty: number;
  mrp: number;
  amount: number;
  isEditing?: boolean;
}

interface InvoiceHeader {
  customerNo: string;
  customerName: string;
  invoiceDate: string;
  items: InvoiceItem[];
}

interface SalesReportRow {
  invoiceDate: string;
  customerName: string;
  itemName: string;
  qty: number;
  mrp: number;
  amount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Sales Invoice App';

  customerNo: string = '';
  customerName: string = '';
  invoiceDate: string = '';

  itemNo: string = '';
  itemName: string = '';
  qty: number | null = null;
  mrp: number | null = null;


  invoiceItems: InvoiceItem[] = [];
  editIndex: number = -1;

  successMessage: string = '';
  errorMessage: string = '';
  validationErrors: string[] = [];
  salesReport: SalesReportRow[] = [];

  private readonly apiBase = 'https://localhost:7051';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadSalesReport();
  }
  get calculatedAmount(): number {
    if (this.qty && this.mrp && this.qty > 0 && this.mrp > 0) {
      return this.qty * this.mrp;
    }
    return 0;
  }

  get invoiceTotal(): number {
    return this.invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  }
  addItem(): void {
    this.validationErrors = [];
    const errors: string[] = [];

    if (!this.itemNo.trim()) errors.push('Item Number is required.');
    if (!this.itemName.trim()) errors.push('Item Name is required.');
    if (!this.qty || this.qty <= 0) errors.push('Quantity must be greater than zero.');
    if (!this.mrp || this.mrp <= 0) errors.push('MRP must be greater than zero.');

    if (errors.length > 0) {
      this.validationErrors = errors;
      return;
    }

    const item: InvoiceItem = {
      itemNo: this.itemNo.trim(),
      itemName: this.itemName.trim(),
      qty: this.qty!,
      mrp: this.mrp!,
      amount: this.qty! * this.mrp!
    };

    if (this.editIndex >= 0) {
      this.invoiceItems[this.editIndex] = item;
      this.editIndex = -1;
    } else {
      this.invoiceItems.push(item);
    }

    this.clearItemFields();
  }


  editItem(index: number): void {
    const item = this.invoiceItems[index];
    this.itemNo = item.itemNo;
    this.itemName = item.itemName;
    this.qty = item.qty;
    this.mrp = item.mrp;
    this.editIndex = index;
    this.validationErrors = [];
  }

  deleteItem(index: number): void {
    this.invoiceItems.splice(index, 1);
    if (this.editIndex === index) {
      this.clearItemFields();
      this.editIndex = -1;
    }
  }

  cancelEdit(): void {
    this.clearItemFields();
    this.editIndex = -1;
    this.validationErrors = [];
  }

  clearItemFields(): void {
    this.itemNo = '';
    this.itemName = '';
    this.qty = null;
    this.mrp = null;
    this.validationErrors = [];
  }


  saveInvoice(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.validationErrors = [];

    const errors: string[] = [];
    if (!this.customerNo.trim()) errors.push('Customer Number is required.');
    if (!this.customerName.trim()) errors.push('Customer Name is required.');
    if (!this.invoiceDate) errors.push('Invoice Date is required.');
    if (this.invoiceItems.length === 0) errors.push('At least one item must be added.');

    if (errors.length > 0) {
      this.validationErrors = errors;
      return;
    }

    const payload: InvoiceHeader = {
      customerNo: this.customerNo.trim(),
      customerName: this.customerName.trim(),
      invoiceDate: this.invoiceDate,
      items: this.invoiceItems.map(i => ({ ...i }))
    };

    this.http.post(`${this.apiBase}/api/invoice`, payload).subscribe({
      next: () => {
        this.successMessage = 'Invoice saved successfully!';
        this.resetForm();
        this.loadSalesReport();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Failed to save invoice. Please try again.';
      }
    });
  }

  resetForm(): void {
    this.customerNo = '';
    this.customerName = '';
    this.invoiceDate = '';
    this.invoiceItems = [];
    this.clearItemFields();
    this.editIndex = -1;
  }

  loadSalesReport(): void {
    this.http.get<SalesReportRow[]>(`${this.apiBase}/api/invoice/salesreport`).subscribe({
      next: (data) => { this.salesReport = data; },
      error: (err) => { console.error('Failed to load sales report', err); }
    });
  }
}
