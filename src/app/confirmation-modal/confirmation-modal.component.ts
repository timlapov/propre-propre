import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent implements OnInit, AfterViewInit {
  @Input() address: string = '';
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() modify: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('confirmationModal') confirmationModal!: ElementRef;
  private modalInstance!: any;

  constructor() { }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    this.modalInstance = new Modal(this.confirmationModal.nativeElement, {
      backdrop: 'static', // Prevent closing by clicking outside
      keyboard: false     // Prevent closing with Esc key
    });
  }

  open(): void {
    this.modalInstance.show();
  }

  close(): void {
    this.modalInstance.hide();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.close();
  }

  onModify(): void {
    this.modify.emit();
    this.close();
  }
}
