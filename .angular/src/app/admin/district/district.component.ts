import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.css']
})
export class DistrictComponent {

  dataLoading: boolean = false;
  DistrictList: any = [];
  District: any = {};
  isSubmitted = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getDistrictList();
    this.getStateList();
    this.resetForm();
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    };
    this.dataLoading = true;
    this.service.validiateMenu(request).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router);
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    }));
  }

  @ViewChild('formDistrict') formDistrict: NgForm;
  resetForm() {
    this.District = {};
    if (this.formDistrict) {
      this.formDistrict.control.markAsPristine();
      this.formDistrict.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }

  filterStateList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterState = this.StateList.filter((option: any) => option.StateName.toLowerCase().includes(filterValue));
    } else {
      this.filterState = this.StateList;
    }
  }

  afterStateSelected(event: any) {
    this.District.StateId = event.option.id;
  }

  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    this.dataLoading = true;
    this.service.getStateList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.StateList = response.StateList;
        this.filterState = this.StateList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    }));
  }

  getDistrictList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    this.dataLoading = true;
    this.service.getDistrictList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.DistrictList = response.DistrictList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    }));
  }

  saveDistrict() {
    this.isSubmitted = true;
    this.formDistrict.control.markAllAsTouched();
    if (this.formDistrict.invalid) {
      this.toastr.error("Fill all the required fields !!");
      return;
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.District)).toString()
    };
    this.dataLoading = true;
    this.service.saveDistrict(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.District.DistrictId > 0) {
          this.toastr.success("District updated successfully");
          $('#staticBackdrop').modal('hide');
        } else {
          this.toastr.success("District added successfully");
        }
        this.resetForm();
        this.getDistrictList();
      } else {
        this.toastr.error(response.Message);
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occurred while submitting data");
      this.dataLoading = false;
    }));
  }

  deleteDistrict(obj: any) {
    if (confirm("Are you sure you want to delete this district record?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      };
      this.dataLoading = true;
      this.service.deleteDistrict(request).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record deleted successfully");
          this.getDistrictList();
        } else {
          this.toastr.error(response.Message);
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occurred while deleting the record");
        this.dataLoading = false;
      }));
    }
  }

  editDistrict(obj: any) {
    this.resetForm();
    this.District = { ...obj };
  }
}
