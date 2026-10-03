import { Component } from '@angular/core';

@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.css']
})
export class AdvertisementComponent {
  adForm = {
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    adType: 'Header Banner',
    duration: '1 Month'
  };
  submitted = false;

  submitAdQuery() {
    if (this.adForm.companyName && this.adForm.phone) {
      this.submitted = true;
    }
  }
}
