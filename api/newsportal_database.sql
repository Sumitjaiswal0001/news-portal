USE [master]
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'newsportal')
BEGIN
    CREATE DATABASE [newsportal]
END
GO

USE [newsportal]
GO

/****** Object:  Table [dbo].[App] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[App]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[App](
	[AppId] [int] IDENTITY(1,1) NOT NULL,
	[AppKey] [uniqueidentifier] NOT NULL,
	[KeyFor] [tinyint] NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_App] PRIMARY KEY CLUSTERED ([AppId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[Company] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Company]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Company](
	[CompanyId] [int] IDENTITY(1,1) NOT NULL,
	[CompanyName] [nvarchar](250) NULL,
	[ShortName] [nvarchar](150) NULL,
	[CompanyAddress] [nvarchar](250) NULL,
	[CityName] [nvarchar](150) NULL,
	[DistrictName] [nvarchar](150) NULL,
	[StateName] [nvarchar](150) NULL,
	[PinCode] [nvarchar](150) NULL,
	[Email] [nvarchar](150) NULL,
	[MobileNo] [nvarchar](50) NULL,
	[AlternateNo] [nvarchar](50) NULL,
	[Website] [nvarchar](150) NULL,
	[LogoPNG] [nvarchar](150) NULL,
	[Logo] [nvarchar](150) NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NOT NULL,
	[UpdatedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_Company] PRIMARY KEY CLUSTERED ([CompanyId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[Department] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Department]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Department](
	[DepartmentId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_Department] PRIMARY KEY CLUSTERED ([DepartmentId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[Designation] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Designation]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Designation](
	[DesignationId] [int] IDENTITY(1,1) NOT NULL,
	[DesignationName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_Designation] PRIMARY KEY CLUSTERED ([DesignationId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[District] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[District]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[District](
	[DistrictId] [int] IDENTITY(1,1) NOT NULL,
	[DistrictName] [nvarchar](250) NOT NULL,
	[StateId] [int] NOT NULL,
 CONSTRAINT [PK_District] PRIMARY KEY CLUSTERED ([DistrictId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[Staff] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Staff]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Staff](
	[StaffId] [int] IDENTITY(1,1) NOT NULL,
	[StaffName] [nvarchar](255) NOT NULL,
	[StaffCode] [nvarchar](255) NOT NULL,
	[DesignationId] [int] NOT NULL,
	[StaffType] [tinyint] NOT NULL,
	[FatherName] [nvarchar](255) NULL,
	[MobileNo] [nvarchar](20) NOT NULL,
	[AlternateNo] [nvarchar](255) NULL,
	[Email] [nvarchar](255) NULL,
	[Gender] [tinyint] NULL,
	[StaffPhoto] [nvarchar](150) NULL,
	[Qualification] [nvarchar](255) NULL,
	[FullAddress] [nvarchar](255) NULL,
	[JoinDate] [datetime] NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[DOB] [date] NOT NULL,
 CONSTRAINT [PK_Staff] PRIMARY KEY CLUSTERED ([StaffId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[StaffLogin] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StaffLogin]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[StaffLogin](
	[StaffLoginId] [int] IDENTITY(1,1) NOT NULL,
	[StaffId] [int] NOT NULL,
	[UserName] [nvarchar](255) NOT NULL,
	[LoginPassword] [nvarchar](255) NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_StaffLogin] PRIMARY KEY CLUSTERED ([StaffLoginId] ASC)
) ON [PRIMARY]
END
GO

/* =========================================================================
   NEWS PORTAL EXTENSION TABLES (CATEGORIES, ARTICLES, COMMENTS)
   ========================================================================= */

/****** Object:  Table [dbo].[NewsCategory] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsCategory]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[NewsCategory](
	[CategoryId] [int] IDENTITY(1,1) NOT NULL,
	[CategoryName] [nvarchar](100) NOT NULL,
	[CategoryNameHindi] [nvarchar](100) NOT NULL,
	[Slug] [nvarchar](100) NOT NULL,
	[Icon] [nvarchar](50) NULL,
	[DisplayOrder] [int] NOT NULL CONSTRAINT [DF_NewsCategory_DisplayOrder] DEFAULT (0),
	[Status] [tinyint] NOT NULL CONSTRAINT [DF_NewsCategory_Status] DEFAULT (1),
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsCategory_CreatedOn] DEFAULT (GETDATE()),
 CONSTRAINT [PK_NewsCategory] PRIMARY KEY CLUSTERED ([CategoryId] ASC)
) ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[NewsArticle] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsArticle]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[NewsArticle](
	[ArticleId] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](500) NOT NULL,
	[TitleHindi] [nvarchar](500) NULL,
	[Subtitle] [nvarchar](1000) NULL,
	[Slug] [nvarchar](500) NOT NULL,
	[Summary] [nvarchar](max) NULL,
	[Content] [nvarchar](max) NOT NULL,
	[ThumbnailUrl] [nvarchar](500) NULL,
	[CategoryId] [int] NOT NULL,
	[DistrictName] [nvarchar](150) NOT NULL,
	[AuthorStaffId] [int] NULL,
	[AuthorName] [nvarchar](150) NULL,
	[AuthorRole] [nvarchar](150) NULL,
	[ViewCount] [int] NOT NULL CONSTRAINT [DF_NewsArticle_ViewCount] DEFAULT (0),
	[IsBreaking] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsBreaking] DEFAULT (0),
	[IsTrending] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsTrending] DEFAULT (0),
	[IsFeatured] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsFeatured] DEFAULT (0),
	[Status] [tinyint] NOT NULL CONSTRAINT [DF_NewsArticle_Status] DEFAULT (1), -- 1: Published, 0: Draft, 2: Archived
	[PublishedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsArticle_PublishedOn] DEFAULT (GETDATE()),
	[UpdatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsArticle_UpdatedOn] DEFAULT (GETDATE()),
 CONSTRAINT [PK_NewsArticle] PRIMARY KEY CLUSTERED ([ArticleId] ASC),
 CONSTRAINT [FK_NewsArticle_NewsCategory] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[NewsCategory] ([CategoryId])
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO

/****** Object:  Table [dbo].[NewsComment] ******/
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsComment]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[NewsComment](
	[CommentId] [int] IDENTITY(1,1) NOT NULL,
	[ArticleId] [int] NOT NULL,
	[UserName] [nvarchar](150) NOT NULL,
	[UserEmail] [nvarchar](150) NULL,
	[CommentText] [nvarchar](max) NOT NULL,
	[IsApproved] [bit] NOT NULL CONSTRAINT [DF_NewsComment_IsApproved] DEFAULT (1),
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsComment_CreatedOn] DEFAULT (GETDATE()),
 CONSTRAINT [PK_NewsComment] PRIMARY KEY CLUSTERED ([CommentId] ASC),
 CONSTRAINT [FK_NewsComment_NewsArticle] FOREIGN KEY ([ArticleId]) REFERENCES [dbo].[NewsArticle] ([ArticleId]) ON DELETE CASCADE
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO

/* =========================================================================
   SEED DATA INSERTS
   ========================================================================= */

-- Seed News Categories
IF NOT EXISTS (SELECT * FROM [dbo].[NewsCategory])
BEGIN
    INSERT INTO [dbo].[NewsCategory] ([CategoryName], [CategoryNameHindi], [Slug], [Icon], [DisplayOrder], [Status])
    VALUES 
    (N'State Politics', N'राज्य राजनीति', N'politics', N'gavel', 1, 1),
    (N'Mining & Industry', N'उद्योग एवं खनन', N'mining-industry', N'business', 2, 1),
    (N'Jobs & Education', N'नौकरी एवं शिक्षा', N'jobs-education', N'school', 3, 1),
    (N'Crime & Law', N'अपराध एवं कानून', N'crime-law', N'security', 4, 1),
    (N'Culture & Tourism', N'संस्कृति एवं पर्यटन', N'culture-tourism', N'landscape', 5, 1),
    (N'Infrastructure', N'विकास एवं बुनियादी ढांचा', N'development', N'construction', 6, 1),
    (N'Jharkhand Sports', N'खेलकूद', N'sports', N'sports_cricket', 7, 1);
END
GO

-- Seed Sample Jharkhand News Articles
IF NOT EXISTS (SELECT * FROM [dbo].[NewsArticle])
BEGIN
    INSERT INTO [dbo].[NewsArticle] 
    ([Title], [TitleHindi], [Subtitle], [Slug], [Summary], [Content], [ThumbnailUrl], [CategoryId], [DistrictName], [AuthorName], [AuthorRole], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [Status], [PublishedOn], [UpdatedOn])
    VALUES
    (
        N'Jharkhand Cabinet Approves Key Infrastructure & Tribal Welfare Projects for 2026',
        N'झारखण्ड कैबिनेट ने 2026 के लिए प्रमुख बुनियादी ढांचे और आदिवासी कल्याण परियोजनाओं को मंजूरी दी',
        N'Over ₹4,500 crore sanctioned for rural road networking and healthcare expansion in Ranchi, Dumka and Chaibasa.',
        N'jharkhand-cabinet-approves-infrastructure-welfare-2026',
        N'State cabinet sanctions ₹4,500 Cr for rural roads, RIMS Ranchi expansion, and digital skill university in Jamshedpur.',
        N'The Jharkhand Cabinet, chaired in Ranchi, today passed a series of landmark resolutions aimed at accelerating rural road connectivity, bolstering healthcare infrastructure, and enhancing tribal education programs across the state.',
        N'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        1, N'Ranchi', N'Sunil Mahto', N'Senior State Correspondent', 1420, 1, 1, 1, 1, GETDATE(), GETDATE()
    ),
    (
        N'Tata Steel Jamshedpur Announces Green Energy Expansion Project in East Singhbhum',
        N'टाटा स्टील जमशेदपुर ने पूर्वी सिंहभूम में हरित ऊर्जा विस्तार परियोजना की घोषणा की',
        N'Multi-million dollar solar installation to power manufacturing plants and reduce industrial emissions.',
        N'tata-steel-jamshedpur-green-energy-expansion',
        N'Tata Steel Jamshedpur commissions 150 MW green energy solar power project in East Singhbhum.',
        N'In a major boost to Jharkhand industrial transition towards sustainability, Tata Steel Jamshedpur announced the commissioning of a 150 MW captive solar power project in East Singhbhum.',
        N'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        2, N'East Singhbhum (Jamshedpur)', N'Priya Sharma', N'Industrial Analyst', 980, 0, 1, 1, 1, GETDATE(), GETDATE()
    ),
    (
        N'Dhanbad Coal Belt Modernization: BCCL Implements AI Safety Monitoring Systems',
        N'धनबाद कोयला क्षेत्र का आधुनिकीकरण: बीसीसीएल ने एआई सुरक्षा निगरानी प्रणाली लागू की',
        N'Advanced sensor technology installed across underground mines to ensure worker safety and prevent hazard incidents.',
        N'dhanbad-bccl-ai-safety-monitoring-underground-mines',
        N'BCCL installs real-time AI gas sensors and safety monitors in Dhanbad coal fields.',
        N'Bharat Coking Coal Limited (BCCL) in Dhanbad has deployed state-of-the-art Artificial Intelligence powered surveillance and gas detection systems across major underground coal mines in Dhanbad district.',
        N'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        2, N'Dhanbad', N'Ramesh Kumar', N'Dhanbad Mining Reporter', 1150, 1, 1, 0, 1, GETDATE(), GETDATE()
    ),
    (
        N'JSSC CGL Exam Notification 2026 Released: Over 3,200 Government Posts Open Across Jharkhand',
        N'JSSC CGL परीक्षा अधिसूचना 2026 जारी: झारखण्ड में 3,200 से अधिक सरकारी पदों पर भर्ती',
        N'Applications invited for Secretariat Assistants, Circle Inspectors, and Block Development Officers.',
        N'jssc-cgl-exam-notification-2026-released',
        N'JSSC announces 3,200+ vacancies for administrative & secretariat posts; exam centers in all major Jharkhand cities.',
        N'The Jharkhand Staff Selection Commission (JSSC) has officially issued the examination notification for CGL 2026, offering over 3,200 vacancies across state government departments.',
        N'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        3, N'Ranchi', N'Anita Roy', N'Education Bureau', 3410, 0, 1, 1, 1, GETDATE(), GETDATE()
    );
END
GO

-- Seed System App Keys
IF NOT EXISTS (SELECT * FROM [dbo].[App])
BEGIN
    SET IDENTITY_INSERT [dbo].[App] ON;
    INSERT INTO [dbo].[App] ([AppId], [AppKey], [KeyFor], [Status]) VALUES (1, N'52f4785c-7ee7-426e-a1ae-c2300972e70a', 1, 1);
    INSERT INTO [dbo].[App] ([AppId], [AppKey], [KeyFor], [Status]) VALUES (2, N'f690a596-71b5-453d-9f92-7cc24ccfd785', 2, 1);
    SET IDENTITY_INSERT [dbo].[App] OFF;
END
GO

-- Seed Page Groups
IF NOT EXISTS (SELECT * FROM [dbo].[PageGroup])
BEGIN
    SET IDENTITY_INSERT [dbo].[PageGroup] ON;
    INSERT INTO [dbo].[PageGroup] ([PageGroupId], [PageGroupName], [Status], [UpdatedBy], [UpdatedDate]) VALUES (1003, N'Master Entry', 1, 7, GETDATE());
    INSERT INTO [dbo].[PageGroup] ([PageGroupId], [PageGroupName], [Status], [UpdatedBy], [UpdatedDate]) VALUES (1004, N'Staff Task Management', 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[PageGroup] OFF;
END
GO

-- Seed Pages
IF NOT EXISTS (SELECT * FROM [dbo].[Page])
BEGIN
    SET IDENTITY_INSERT [dbo].[Page] ON;
    INSERT INTO [dbo].[Page] ([PageId], [PageGroupId], [PageName], [PageUrl], [Status], [UpdatedBy], [UpdatedDate]) VALUES 
    (1004, 1003, N'Designation', N'/admin/designation', 1, 7, GETDATE()),
    (1005, 1003, N'Department', N'/admin/department', 1, 7, GETDATE()),
    (1006, 1004, N'Staff', N'/admin/staff', 1, 7, GETDATE()),
    (1007, 1004, N'Staff Login', N'/admin/staffLogin', 1, 7, GETDATE()),
    (1010, 1004, N'Page Group', N'/admin/page-group', 1, 7, GETDATE()),
    (1011, 1004, N'Page', N'/admin/page', 1, 7, GETDATE()),
    (1013, 1004, N'Menu', N'/admin/menu', 1, 7, GETDATE()),
    (1014, 1004, N'Role', N'/admin/role', 1, 7, GETDATE()),
    (1015, 1004, N'Role Menu', N'/admin/role-menu', 1, 7, GETDATE()),
    (1016, 1004, N'Staff Login Role', N'/admin/staff-login-role', 1, 7, GETDATE()),
    (2013, 1003, N'State', N'/admin/state', 1, 7, GETDATE()),
    (2014, 1003, N'City', N'/admin/city', 1, 7, GETDATE()),
    (2015, 1003, N'District', N'/admin/district', 1, 7, GETDATE()),
    (3034, 1003, N'Company', N'/admin/company', 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[Page] OFF;
END
GO

-- Seed Admin Menus
IF NOT EXISTS (SELECT * FROM [dbo].[Menu])
BEGIN
    SET IDENTITY_INSERT [dbo].[Menu] ON;
    INSERT INTO [dbo].[Menu] ([MenuId], [MenuTitle], [PageId], [MenuNo], [ParentMenuId], [MenuIcon], [Status], [UpdatedBy], [UpdatedDate]) VALUES 
    (1, N'Master Entry', NULL, 3, NULL, N'bi bi-file-earmark-break', 1, 7, GETDATE()),
    (2, N'Manage Designation', 1004, 1, 1, NULL, 1, 7, GETDATE()),
    (6, N'Roles & Responsibilties', NULL, 8, NULL, N'ri-map-pin-user-line', 1, 7, GETDATE()),
    (7, N'Manage Staff Login', 1007, 7, 6, NULL, 1, 7, GETDATE()),
    (8, N'Manage Department', 1005, 2, 1, NULL, 1, 7, GETDATE()),
    (9, N'Manage Staff', 1006, 6, 6, NULL, 1, 7, GETDATE()),
    (1004, N'Manage Page Group', 1010, 1, 6, NULL, 1, 7, GETDATE()),
    (1005, N'Manage Menu', 1013, 4, 6, NULL, 1, NULL, NULL),
    (1006, N'Manage Role', 1014, 3, 6, NULL, 1, NULL, NULL),
    (1007, N'Manage Role Menu', 1015, 5, 6, NULL, 1, 7, GETDATE()),
    (1009, N'Manage Page', 1011, 2, 6, NULL, 1, NULL, NULL),
    (2009, N'Manage State', 2013, 6, 1, NULL, 1, NULL, NULL),
    (2010, N'Manage City', 2014, 7, 1, NULL, 1, NULL, NULL),
    (2012, N'Manage District', 2015, 7, 1, NULL, 1, 7, GETDATE()),
    (2011, N'Manage Company', 3034, 8, 1, NULL, 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[Menu] OFF;
END
GO

-- Seed Roles
IF NOT EXISTS (SELECT * FROM [dbo].[Role])
BEGIN
    SET IDENTITY_INSERT [dbo].[Role] ON;
    INSERT INTO [dbo].[Role] ([RoleId], [RoleTitle], [Status], [UpdatedBy], [UpdatedDate]) VALUES 
    (5, N'Admin', 1, 7, GETDATE()),
    (6, N'Reception', 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[Role] OFF;
END
GO

-- Seed Role Menu Permissions
IF NOT EXISTS (SELECT * FROM [dbo].[RoleMenu])
BEGIN
    SET IDENTITY_INSERT [dbo].[RoleMenu] ON;
    INSERT INTO [dbo].[RoleMenu] ([RoleMenuId], [RoleId], [MenuId], [UpdatedBy], [UpdatedDate], [CanEdit], [CanDelete], [CanCreate]) VALUES 
    (3, 5, 7, 7, GETDATE(), 1, 1, 1),
    (11, 5, 9, 7, GETDATE(), 1, 1, 1),
    (13, 5, 1004, 7, GETDATE(), 1, 1, 1),
    (14, 5, 1005, 7, GETDATE(), 1, 1, 1),
    (15, 5, 1006, 7, GETDATE(), 1, 1, 1),
    (16, 5, 1007, 7, GETDATE(), 1, 1, 1),
    (18, 5, 1009, 7, GETDATE(), 1, 1, 1),
    (3119, 5, 2, 7, GETDATE(), 1, 1, 1),
    (3120, 5, 8, 7, GETDATE(), 1, 1, 1),
    (3121, 5, 2009, 7, GETDATE(), 1, 1, 1),
    (3122, 5, 2010, 7, GETDATE(), 1, 1, 1),
    (3124, 5, 2012, 7, GETDATE(), 1, 1, 1),
    (3123, 5, 2011, 7, GETDATE(), 1, 1, 1);
    SET IDENTITY_INSERT [dbo].[RoleMenu] OFF;
END
GO

-- Seed Default Admin Staff & Staff Login
IF NOT EXISTS (SELECT * FROM [dbo].[Staff])
BEGIN
    SET IDENTITY_INSERT [dbo].[Staff] ON;
    INSERT INTO [dbo].[Staff] ([StaffId], [StaffName], [StaffCode], [DesignationId], [StaffType], [FatherName], [MobileNo], [AlternateNo], [Email], [Gender], [StaffPhoto], [Qualification], [FullAddress], [JoinDate], [DepartmentId], [Status], [UpdatedBy], [UpdatedDate], [CreatedBy], [CreatedDate], [DOB]) VALUES 
    (5, N'Administrator', N'STF001', 1, 1, N'N/A', N'7004943471', NULL, N'info@news10team.com', 1, NULL, N'B.Tech', N'Ranchi', GETDATE(), 1, 1, 7, GETDATE(), NULL, NULL, CAST(N'1995-01-01' AS Date));
    SET IDENTITY_INSERT [dbo].[Staff] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[StaffLogin])
BEGIN
    SET IDENTITY_INSERT [dbo].[StaffLogin] ON;
    INSERT INTO [dbo].[StaffLogin] ([StaffLoginId], [StaffId], [UserName], [LoginPassword], [UpdatedBy], [UpdatedDate], [CreatedBy], [CreatedDate], [Status]) VALUES 
    (7, 5, N'admin', N'admin@123', 7, GETDATE(), NULL, NULL, 1);
    SET IDENTITY_INSERT [dbo].[StaffLogin] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[StaffLoginRole])
BEGIN
    SET IDENTITY_INSERT [dbo].[StaffLoginRole] ON;
    INSERT INTO [dbo].[StaffLoginRole] ([StaffLoginRoleId], [StaffLoginId], [RoleId], [UpdatedBy], [UpdatedDate]) VALUES 
    (4, 7, 5, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[StaffLoginRole] OFF;
END
GO

-- Seed & Update Company Office Address
IF NOT EXISTS (SELECT * FROM [dbo].[Company])
BEGIN
    SET IDENTITY_INSERT [dbo].[Company] ON;
    INSERT INTO [dbo].[Company] ([CompanyId], [CompanyName], [ShortName], [CompanyAddress], [CityName], [DistrictName], [StateName], [PinCode], [Email], [MobileNo], [AlternateNo], [Website], [LogoPNG], [Logo], [Status], [UpdatedBy], [UpdatedOn]) 
    VALUES (1, N'News Portal', N'News Portal', N'Chouparan, Hazaribag, Jharkhand - 825406', N'Chouparan', N'Hazaribag', N'JHARKHAND', N'825406', N'info@news10team.com', N'9999999999', NULL, N'', NULL, NULL, 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[Company] OFF;
END
ELSE
BEGIN
    UPDATE [dbo].[Company]
    SET [CompanyAddress] = N'Chouparan, Hazaribag, Jharkhand - 825406',
        [CityName] = N'Chouparan',
        [DistrictName] = N'Hazaribag',
        [StateName] = N'JHARKHAND',
        [PinCode] = N'825406'
    WHERE [CompanyId] = 1;
END
GO
