import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from "ngx-pagination";
import { MaterialModule } from './material/material.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppService } from './utils/app.service';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminMasterComponent } from './admin/admin-master/admin-master.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { CityComponent } from './admin/city/city.component';
import { DepartmentComponent } from './admin/department/department.component';
import { DesignationComponent } from './admin/designation/designation.component';
import { MenuComponent } from './admin/menu/menu.component';
import { PageComponent } from './admin/page/page.component';
import { PageGroupComponent } from './admin/page-group/page-group.component';
import { RoleComponent } from './admin/role/role.component';
import { RoleMenuComponent } from './admin/role-menu/role-menu.component';
import { StaffLoginComponent } from './admin/staff-login/staff-login.component';
import { StateComponent } from './admin/state/state.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { ProgressComponent } from './component/progress/progress.component';
import { EnumCasePipe } from './pipes/enum-case.pipe';
import { MoneyPipe } from './pipes/money.pipe';
import { StaffComponent } from './admin/staff/staff.component';
import { OrderByPipe } from './pipes/order-by.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { CompanyComponent } from './admin/company/company.component';
import { DistrictComponent } from './admin/district/district.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { ContactUsComponent } from './component/contact-us/contact-us.component';
import { AdvertisementComponent } from './component/advertisement/advertisement.component';
import { VacancyComponent } from './component/vacancy/vacancy.component';
import { PrivacyPolicyComponent } from './component/privacy-policy/privacy-policy.component';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

@NgModule({
  declarations: [
    AppComponent,
    AdminLoginComponent,
    AdminMasterComponent,
    ChangePasswordComponent,
    CityComponent,
    DepartmentComponent,
    DesignationComponent,
    DistrictComponent,
    MenuComponent,
    PageComponent,
    PageGroupComponent,
    RoleComponent,
    RoleMenuComponent,
    StaffLoginComponent,
    StateComponent,
    PageNotFoundComponent,
    ProgressComponent,
    EnumCasePipe,
    MoneyPipe,
    StaffComponent,
    OrderByPipe,
    FilterPipe,
    CompanyComponent,
    AboutUsComponent,
    ContactUsComponent,
    AdvertisementComponent,
    VacancyComponent,
    PrivacyPolicyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent,
    ToastrModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatFormFieldModule
  ],
  providers: [
    AppService, 
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    provideAnimations(),
    provideToastr()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
