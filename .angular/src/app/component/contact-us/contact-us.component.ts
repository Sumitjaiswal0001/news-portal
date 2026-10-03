import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  submitted = false;

  onSubmit() {
    if (this.formData.name && this.formData.message) {
      this.submitted = true;
    }
  }
}
