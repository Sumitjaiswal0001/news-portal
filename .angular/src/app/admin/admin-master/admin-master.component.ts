import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../utils/app.service';
declare var $: any;
import { LocalService } from "../../utils/local.service";
import { ConstantData } from "../../utils/constant-data";
import { ToastrService } from 'ngx-toastr';
import { Status } from '../../utils/enum';
import { RequestModel, StaffLoginModel } from '../../utils/interface';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html'
})
export class AdminMasterComponent implements OnInit {
  IsMenuShow = true;
  dataLoading: boolean = false;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  imageUrl = this.service.getImageUrl();
  screenWidth: any;
  docElm: any;
  isDarkMode: boolean = false;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private localService: LocalService,
    private router: Router,
    public service: AppService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.screenWidth = window.innerWidth;
    this.getUserMenuList();
    this.getCompanyList();
    this.docElm = this.document.documentElement;

    this.service.isDarkMode().subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleDarkMode(): void {
    this.service.toggleDarkMode();
  }

  Company: any = {};
  getCompanyList() {
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Status: Status.Active })).toString()
    }
    this.dataLoading = true
    this.service.getCompanyList(request).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (response.CompanyList.length != 0)
          this.Company = response.CompanyList[0];
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  isFullScreen: boolean = false;
  fullScreen() {
    if (!this.isFullScreen) {
      if (this.docElm.requestFullscreen) {
        this.docElm.requestFullscreen();
      } else if (this.docElm.mozRequestFullScreen) {
        this.docElm.mozRequestFullScreen();
      } else if (this.docElm.webkitRequestFullScreen) {
        this.docElm.webkitRequestFullScreen();
      } else if (this.docElm.msRequestFullscreen) {
        this.docElm.msRequestFullscreen();
      }
      this.isFullScreen = true;
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.webkitExitFullscreen) {
        this.document.webkitExitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        this.document.mozCancelFullScreen();
      } else if (this.document.msExitFullscreen) {
        this.document.msExitFullscreen();
      }
      this.isFullScreen = false;
    }
  }

  MenuList: any[] = [];
  getUserMenuList() {
    const staffId = this.staffLogin?.StaffLoginId || 7;
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ StaffLoginId: staffId })).toString()
    }
    this.dataLoading = true
    this.service.getUserMenuList(request).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage && response.MenuList && response.MenuList.length > 0) {
        this.MenuList = response.MenuList;
        this.MenuList.forEach(m => m.isExpanded = true);
      } else {
        this.loadDefaultMenus();
      }
      this.dataLoading = false
    }, (err => {
      this.loadDefaultMenus();
      this.dataLoading = false
    }))
  }

  loadDefaultMenus() {
    this.MenuList = [
      {
        MenuId: 1,
        MenuTitle: 'Master Entry',
        MenuIcon: 'bi bi-file-earmark-break',
        isExpanded: true,
        MenuList: [
          { MenuId: 2, MenuTitle: 'Manage Designation', PageUrl: '/admin/designation' },
          { MenuId: 8, MenuTitle: 'Manage Department', PageUrl: '/admin/department' },
          { MenuId: 2009, MenuTitle: 'Manage State', PageUrl: '/admin/state' },
          { MenuId: 2012, MenuTitle: 'Manage District', PageUrl: '/admin/district' },
          { MenuId: 2010, MenuTitle: 'Manage City', PageUrl: '/admin/city' },
          { MenuId: 2011, MenuTitle: 'Manage Company', PageUrl: '/admin/company' }
        ]
      },
      {
        MenuId: 6,
        MenuTitle: 'Roles & Responsibilties',
        MenuIcon: 'ri-map-pin-user-line',
        isExpanded: true,
        MenuList: [
          { MenuId: 7, MenuTitle: 'Manage Staff Login', PageUrl: '/admin/staffLogin' },
          { MenuId: 9, MenuTitle: 'Manage Staff', PageUrl: '/admin/staff' },
          { MenuId: 1004, MenuTitle: 'Manage Page Group', PageUrl: '/admin/page-group' },
          { MenuId: 1005, MenuTitle: 'Manage Menu', PageUrl: '/admin/menu' },
          { MenuId: 1006, MenuTitle: 'Manage Role', PageUrl: '/admin/role' },
          { MenuId: 1007, MenuTitle: 'Manage Role Menu', PageUrl: '/admin/role-menu' },
          { MenuId: 1009, MenuTitle: 'Manage Page', PageUrl: '/admin/page' }
        ]
      }
    ];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  checkSideNav() {
    if (this.screenWidth <= 500) {
      this.hideSideBar();
    }
  }

  hideSideBar() {
    if (this.IsMenuShow) {
      $('body').addClass('toggle-sidebar');
      this.IsMenuShow = false;
    }
    else {
      $('body').removeClass('toggle-sidebar');
      this.IsMenuShow = true;
    }
  }

  logOut() {
    this.localService.removeEmployeeDetail();
    this.router.navigate(['/admin-login']);
  }
}
