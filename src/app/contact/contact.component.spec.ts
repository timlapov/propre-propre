import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import emailjs from '@emailjs/browser';
import { By } from '@angular/platform-browser';

// Create a mock ToastrService
class MockToastrService {
  success(message: string, title?: string, override?: any) {}
  error(message: string, title?: string, override?: any) {}
}

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let toastrService: ToastrService;
  let sendSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContactComponent, FormsModule, CommonModule],
      providers: [
        { provide: ToastrService, useClass: MockToastrService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    // Spy on emailjs.send method
    sendSpy = spyOn(emailjs, 'send').and.returnValue(Promise.resolve({ status: 200, text: 'OK' }));
    fixture.detectChanges();
  });

  it('should create the ContactComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render all form fields and the submit button', () => {
    const nameInput = fixture.debugElement.query(By.css('input[name="name"]'));
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    const messageTextarea = fixture.debugElement.query(By.css('textarea[name="message"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(messageTextarea).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('should enable the submit button when required fields are filled', fakeAsync(() => {
    component.formData.name = 'John';
    component.formData.email = 'john@example.com';
    component.formData.message = 'Hello!';
    fixture.detectChanges();
    tick();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    // Assuming form validity is updated after change detection
    expect(submitButton.disabled).toBeFalse();
  }));

  it('should call emailjs.send and display success toast on valid form submission', fakeAsync(() => {
    spyOn(toastrService, 'success');
    const form = { invalid: false, resetForm: jasmine.createSpy('resetForm') };

    component.formData = {
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello there!'
    };

    component.sendEmail(form as any);
    expect(component.isSending).toBeTrue();
    tick(); // Simulate async

    expect(sendSpy).toHaveBeenCalledWith(
      'service_augkxsc',
      'template_8jjlvur',
      component.formData,
      'M8xk45izLg6PCP8nU'
    );
    expect(component.isSending).toBeFalse();
    expect(component.emailSent).toBeTrue();
    expect(component.emailError).toBeFalse();
    expect(form.resetForm).toHaveBeenCalled();
    expect(toastrService.success).toHaveBeenCalledWith(
      'Votre message a été envoyé avec succès !',
      'Success',
      { timeOut: 3500, progressBar: true }
    );
  }));

  it('should display an error toast if emailjs.send fails', fakeAsync(() => {
    sendSpy.and.returnValue(Promise.reject('Error'));
    spyOn(toastrService, 'error');

    const form = { invalid: false, resetForm: () => {} };

    component.formData = {
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello there!'
    };

    component.sendEmail(form as any);
    expect(component.isSending).toBeTrue();
    tick(); // Simulate async

    expect(sendSpy).toHaveBeenCalled();
    expect(component.isSending).toBeFalse();
    expect(component.emailSent).toBeFalse();
    expect(component.emailError).toBeTrue();
    expect(toastrService.error).toHaveBeenCalledWith(
      'Une erreur s\'est produite lors de l\'envoi d\'un message. Veuillez réessayer plus tard.',
      'Erreur',
      { timeOut: 3500, progressBar: true }
    );
  }));

  it('should disable the submit button and show "En cours..." when sending', fakeAsync(() => {
    const form = { invalid: false, resetForm: () => {} };
    component.formData = {
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello there!'
    };

    component.sendEmail(form as any);
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTrue();
    expect(submitButton.textContent.trim()).toBe('En cours...');

    tick(); // Complete the async operation
    fixture.detectChanges();

    expect(submitButton.disabled).toBeFalse();
    expect(submitButton.textContent.trim()).toBe('Envoyer');
  }));
});
