import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import { Modal } from 'bootstrap';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-payment-method-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './payment-method-modal.component.html',
  styleUrls: ['./payment-method-modal.component.css']
})
export class PaymentMethodModalComponent implements AfterViewInit {
  @Output() paymentMethodSelected: EventEmitter<'cash' | 'card'> = new EventEmitter();

  // ViewChild to get a reference to the modal template
  @ViewChild('paymentMethodModal') paymentMethodModal!: ElementRef;
  private modalInstance!: Modal;

  selectedPaymentMethod: 'cash' | 'card' = 'card';

  ngAfterViewInit(): void {
    this.modalInstance = new Modal(this.paymentMethodModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }

  open(): void {
    this.modalInstance.show();
  }

  close(): void {
    this.modalInstance.hide();
  }

  confirmSelection(): void {
    this.paymentMethodSelected.emit(this.selectedPaymentMethod);
    this.close();
  }
}
