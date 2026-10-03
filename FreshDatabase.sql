

USE [newsportal]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- 1. Table: App
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[App]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[App](<
	[AppId] [int] IDENTITY(1,1>) NOT NULL,
	[AppKey] [uniqueidentifier] NOT NULL,
	[KeyFor] [tinyint] NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_App] PRIMARY KEY CLUSTERED ([AppId] ASC)
) ON [PRIMARY]
END
GO

-- 2. Table: Backup
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Backup]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Backup](<
	[BackupId] [int] IDENTITY(1,1>) NOT NULL,
	[BackupFile] [nvarchar](250) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[BackupStatus] [tinyint] NOT NULL,
	[ErrorMessage] [nvarchar](max) NULL,
	[BackupDatabase] [nvarchar](max) NULL,
 CONSTRAINT [PK_Backup] PRIMARY KEY CLUSTERED ([BackupId] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO

-- 3. Table: State
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[State]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[State](<
	[StateId] [int] IDENTITY(1,1>) NOT NULL,
	[StateName] [nvarchar](255) NOT NULL,
	[StateCode] [money] NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [datetime] NULL,
 CONSTRAINT [PK_State] PRIMARY KEY CLUSTERED ([StateId] ASC)
) ON [PRIMARY]
END
GO

-- 4. Table: StateMaster
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StateMaster]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[StateMaster](<
	[StateId] [int] IDENTITY(1,1>) NOT NULL,
	[StateName] [nvarchar](255) NOT NULL,
	[StateCode] [money] NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [datetime] NULL,
 CONSTRAINT [PK_StateMaster] PRIMARY KEY CLUSTERED ([StateId] ASC)
) ON [PRIMARY]
END
GO

-- 5. Table: City
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[City]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[City](<
	[CityId] [int] IDENTITY(1,1>) NOT NULL,
	[StateId] [int] NOT NULL,
	[CityName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [datetime] NULL,
 CONSTRAINT [PK_City] PRIMARY KEY CLUSTERED ([CityId] ASC)
) ON [PRIMARY]
END
GO

-- 6. Table: Department
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Department]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Department](<
	[DepartmentId] [int] IDENTITY(1,1>) NOT NULL,
	[DepartmentName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_Department] PRIMARY KEY CLUSTERED ([DepartmentId] ASC)
) ON [PRIMARY]
END
GO

-- 7. Table: Designation
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Designation]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Designation](<
	[DesignationId] [int] IDENTITY(1,1>) NOT NULL,
	[DesignationName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
 CONSTRAINT [PK_Designation] PRIMARY KEY CLUSTERED ([DesignationId] ASC)
) ON [PRIMARY]
END
GO

-- 8. Table: District
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[District]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[District](<
	[DistrictId] [int] IDENTITY(1,1>) NOT NULL,
	[DistrictName] [nvarchar](250) NOT NULL,
	[StateId] [int] NOT NULL,
 CONSTRAINT [PK_District] PRIMARY KEY CLUSTERED ([DistrictId] ASC)
) ON [PRIMARY]
END
GO

-- 9. Table: Staff
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Staff]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Staff](<
	[StaffId] [int] IDENTITY(1,1>) NOT NULL,
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

-- 10. Table: StaffLogin
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StaffLogin]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[StaffLogin](<
	[StaffLoginId] [int] IDENTITY(1,1>) NOT NULL,
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

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_StaffLogin_UserName' AND object_id = OBJECT_ID(N'[dbo].[StaffLogin]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_StaffLogin_UserName] ON [dbo].[StaffLogin](<[UserName] ASC>) ON [PRIMARY]
END
GO

-- 11. Table: Company
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Company]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Company](<
	[CompanyId] [int] IDENTITY(1,1>) NOT NULL,
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

-- 12. Table: Database
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Database]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Database](<
	[DatabaseId] [int] IDENTITY(1,1>) NOT NULL,
	[DatabaseName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedOn] [datetime] NULL,
 CONSTRAINT [PK_Database] PRIMARY KEY CLUSTERED ([DatabaseId] ASC)
) ON [PRIMARY]
END
GO

-- 13. Table: LoginLog
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginLog]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[LoginLog](<
	[LoginLogId] [int] IDENTITY(1,1>) NOT NULL,
	[UserName] [nvarchar](255) NOT NULL,
	[LoginPassword] [nvarchar](255) NOT NULL,
	[ClientBrowser] [nvarchar](100) NOT NULL,
	[LoginDevice] [nvarchar](50) NOT NULL,
	[IPAddress] [nvarchar](100) NOT NULL,
	[ReferrerUrl] [nvarchar](500) NOT NULL,
	[LoginResult] [tinyint] NOT NULL,
	[LoginTime] [datetime] NOT NULL CONSTRAINT [DF_LoginLog_LoginTime] DEFAULT (getdate()),
	[LastUpdatedOn] [datetime] NOT NULL CONSTRAINT [DF_LoginLog_LastUpdatedOn] DEFAULT (getdate()),
	[UserType] [tinyint] NULL,
	[GoogleLocation] [nvarchar](250) NULL,
	[IMEINo] [nvarchar](150) NULL,
 CONSTRAINT [PK_LoginLog] PRIMARY KEY CLUSTERED ([LoginLogId] ASC)
) ON [PRIMARY]
END
GO

-- 14. Table: NewsCategory
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsCategory]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[NewsCategory](<
	[CategoryId] [int] IDENTITY(1,1>) NOT NULL,
	[CategoryName] [nvarchar](100) NOT NULL,
	[CategoryNameHindi] [nvarchar](100) NOT NULL,
	[Slug] [nvarchar](100) NOT NULL,
	[Icon] [nvarchar](50) NULL,
	[DisplayOrder] [int] NOT NULL CONSTRAINT [DF_NewsCategory_DisplayOrder] DEFAULT (0),
	[Status] [tinyint] NOT NULL CONSTRAINT [DF_NewsCategory_Status] DEFAULT (1),
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsCategory_CreatedOn] DEFAULT (getdate()),
 CONSTRAINT [PK_NewsCategory] PRIMARY KEY CLUSTERED ([CategoryId] ASC)
) ON [PRIMARY]
END
GO

-- 15. Table: NewsArticle
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsArticle]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[NewsArticle](<
	[ArticleId] [int] IDENTITY(1,1>) NOT NULL,
	[Title] [nvarchar](500) NOT NULL,
	[TitleHindi] [nvarchar](500) NULL,
	[Subtitle] [nvarchar](1000) NULL,
	[Slug] [nvarchar](500) NOT NULL,
	[Summary] [nvarchar](max) NULL,
	[Content] [nvarchar](max) NOT NULL,
	[ThumbnailUrl] [nvarchar](max) NULL,
	[CategoryId] [int] NOT NULL,
	[DistrictName] [nvarchar](150) NOT NULL,
	[AuthorStaffId] [int] NULL,
	[AuthorName] [nvarchar](150) NULL,
	[AuthorRole] [nvarchar](150) NULL,
	[ViewCount] [int] NOT NULL CONSTRAINT [DF_NewsArticle_ViewCount] DEFAULT (0),
	[IsBreaking] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsBreaking] DEFAULT (0),
	[IsTrending] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsTrending] DEFAULT (0),
	[IsFeatured] [bit] NOT NULL CONSTRAINT [DF_NewsArticle_IsFeatured] DEFAULT (0),
	[Status] [tinyint] NOT NULL CONSTRAINT [DF_NewsArticle_Status] DEFAULT (1),
	[PublishedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsArticle_PublishedOn] DEFAULT (getdate()),
	[UpdatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsArticle_UpdatedOn] DEFAULT (getdate()),
	[YoutubeUrl] [nvarchar](500) NULL,
 CONSTRAINT [PK_NewsArticle] PRIMARY KEY CLUSTERED ([ArticleId] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO

-- 16. Table: NewsComment
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NewsComment]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[NewsComment](<
	[CommentId] [int] IDENTITY(1,1>) NOT NULL,
	[ArticleId] [int] NOT NULL,
	[UserName] [nvarchar](150) NOT NULL,
	[UserEmail] [nvarchar](150) NULL,
	[CommentText] [nvarchar](max) NOT NULL,
	[IsApproved] [bit] NOT NULL CONSTRAINT [DF_NewsComment_IsApproved] DEFAULT (1),
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_NewsComment_CreatedOn] DEFAULT (getdate()),
 CONSTRAINT [PK_NewsComment] PRIMARY KEY CLUSTERED ([CommentId] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
GO

-- 17. Table: PageGroup
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PageGroup]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[PageGroup](<
	[PageGroupId] [int] IDENTITY(1,1>) NOT NULL,
	[PageGroupName] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
 CONSTRAINT [PK_PageGroup] PRIMARY KEY CLUSTERED ([PageGroupId] ASC)
) ON [PRIMARY]
END
GO

-- 18. Table: Page
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Page]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Page](<
	[PageId] [int] IDENTITY(1,1>) NOT NULL,
	[PageGroupId] [int] NOT NULL,
	[PageName] [nvarchar](255) NOT NULL,
	[PageUrl] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
 CONSTRAINT [PK_Page] PRIMARY KEY CLUSTERED ([PageId] ASC)
) ON [PRIMARY]
END
GO

-- 19. Table: Menu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Menu]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Menu](<
	[MenuId] [int] IDENTITY(1,1>) NOT NULL,
	[MenuTitle] [nvarchar](255) NOT NULL,
	[PageId] [int] NULL,
	[MenuNo] [int] NOT NULL,
	[ParentMenuId] [int] NULL,
	[MenuIcon] [nvarchar](255) NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
 CONSTRAINT [PK_Menu] PRIMARY KEY CLUSTERED ([MenuId] ASC)
) ON [PRIMARY]
END
GO

-- 20. Table: Role
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Role]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Role](<
	[RoleId] [int] IDENTITY(1,1>) NOT NULL,
	[RoleTitle] [nvarchar](255) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
 CONSTRAINT [PK_Role] PRIMARY KEY CLUSTERED ([RoleId] ASC)
) ON [PRIMARY]
END
GO

-- 21. Table: RoleMenu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RoleMenu]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[RoleMenu](<
	[RoleMenuId] [int] IDENTITY(1,1>) NOT NULL,
	[RoleId] [int] NOT NULL,
	[MenuId] [int] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
	[CanEdit] [bit] NOT NULL,
	[CanDelete] [bit] NOT NULL,
	[CanCreate] [bit] NOT NULL,
 CONSTRAINT [PK_RoleMenu] PRIMARY KEY CLUSTERED ([RoleMenuId] ASC)
) ON [PRIMARY]
END
GO

-- 22. Table: StaffLoginRole
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StaffLoginRole]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[StaffLoginRole](<
	[StaffLoginRoleId] [int] IDENTITY(1,1>) NOT NULL,
	[StaffLoginId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
	[UpdatedBy] [int] NULL,
	[UpdatedDate] [date] NULL,
 CONSTRAINT [PK_StaffLoginRole] PRIMARY KEY CLUSTERED ([StaffLoginRoleId] ASC)
) ON [PRIMARY]
END
GO

-- Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_NewsArticle_NewsCategory')
ALTER TABLE [dbo].[NewsArticle] WITH CHECK ADD CONSTRAINT [FK_NewsArticle_NewsCategory] FOREIGN KEY([CategoryId]) REFERENCES [dbo].[NewsCategory] ([CategoryId]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_NewsComment_NewsArticle')
ALTER TABLE [dbo].[NewsComment] WITH CHECK ADD CONSTRAINT [FK_NewsComment_NewsArticle] FOREIGN KEY([ArticleId]) REFERENCES [dbo].[NewsArticle] ([ArticleId]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Staff_Department')
ALTER TABLE [dbo].[Staff] WITH CHECK ADD CONSTRAINT [FK_Staff_Department] FOREIGN KEY([DepartmentId]) REFERENCES [dbo].[Department] ([DepartmentId]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_Staff_Designation')
ALTER TABLE [dbo].[Staff] WITH CHECK ADD CONSTRAINT [FK_Staff_Designation] FOREIGN KEY([DesignationId]) REFERENCES [dbo].[Designation] ([DesignationId]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_StaffLogin_Staff')
ALTER TABLE [dbo].[StaffLogin] WITH CHECK ADD CONSTRAINT [FK_StaffLogin_Staff] FOREIGN KEY([StaffId]) REFERENCES [dbo].[Staff] ([StaffId]);
GO

-- Seed App Keys
IF NOT EXISTS (SELECT * FROM [dbo].[App])
BEGIN
    INSERT INTO [dbo].[App] ([AppKey], [KeyFor], [Status])
    VALUES 
    ('52f4785c-7ee7-426e-a1ae-c2300972e70a', 1, 1),
    ('f690a596-71b5-453d-9f92-7cc24ccfd785', 2, 1);
END
GO

-- Seed & Update Office Address (Chouparan, Hazaribag, Jharkhand - 825406)
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

-- Seed Department & Designation
IF NOT EXISTS (SELECT * FROM [dbo].[Department])
BEGIN
    SET IDENTITY_INSERT [dbo].[Department] ON;
    INSERT INTO [dbo].[Department] ([DepartmentId], [DepartmentName], [Status]) VALUES (1, N'Administration', 1);
    SET IDENTITY_INSERT [dbo].[Department] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Designation])
BEGIN
    SET IDENTITY_INSERT [dbo].[Designation] ON;
    INSERT INTO [dbo].[Designation] ([DesignationId], [DesignationName], [Status]) VALUES (1, N'Admin', 1);
    SET IDENTITY_INSERT [dbo].[Designation] OFF;
END
GO

-- Seed Admin User (admin / admin@123)
IF NOT EXISTS (SELECT * FROM [dbo].[Staff])
BEGIN
    SET IDENTITY_INSERT [dbo].[Staff] ON;
    INSERT INTO [dbo].[Staff] ([StaffId], [StaffName], [StaffCode], [DesignationId], [StaffType], [FatherName], [MobileNo], [AlternateNo], [Email], [Gender], [StaffPhoto], [Qualification], [FullAddress], [JoinDate], [DepartmentId], [Status], [UpdatedBy], [UpdatedDate], [CreatedBy], [CreatedDate], [DOB]) 
    VALUES (5, N'Administrator', N'STF001', 1, 1, N'N/A', N'7004943471', NULL, N'info@news10team.com', 1, NULL, N'B.Tech', N'Ranchi', GETDATE(), 1, 1, 7, GETDATE(), NULL, NULL, CAST(N'1995-01-01' AS Date));
    SET IDENTITY_INSERT [dbo].[Staff] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[StaffLogin])
BEGIN
    SET IDENTITY_INSERT [dbo].[StaffLogin] ON;
    INSERT INTO [dbo].[StaffLogin] ([StaffLoginId], [StaffId], [UserName], [LoginPassword], [UpdatedBy], [UpdatedDate], [CreatedBy], [CreatedDate], [Status]) 
    VALUES (7, 5, N'admin', N'admin@123', 7, GETDATE(), NULL, NULL, 1);
    SET IDENTITY_INSERT [dbo].[StaffLogin] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Role])
BEGIN
    SET IDENTITY_INSERT [dbo].[Role] ON;
    INSERT INTO [dbo].[Role] ([RoleId], [RoleTitle], [Status], [UpdatedBy], [UpdatedDate]) 
    VALUES (5, N'Admin', 1, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[Role] OFF;
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[StaffLoginRole])
BEGIN
    SET IDENTITY_INSERT [dbo].[StaffLoginRole] ON;
    INSERT INTO [dbo].[StaffLoginRole] ([StaffLoginRoleId], [StaffLoginId], [RoleId], [UpdatedBy], [UpdatedDate]) 
    VALUES (4, 7, 5, 7, GETDATE());
    SET IDENTITY_INSERT [dbo].[StaffLoginRole] OFF;
END
GO

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
-- =========================================================
-- Table: Newsletter (Day-wise PDF Edition)
-- =========================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Newsletter]') AND type = 'U')
BEGIN
CREATE TABLE [dbo].[Newsletter] (
    [NewsletterId] INT IDENTITY(1,1) PRIMARY KEY,
    [Title] NVARCHAR(250) NOT NULL,
    [PublishDate] DATE NOT NULL,
    [PdfUrl] NVARCHAR(500) NOT NULL,
    [ThumbnailUrl] NVARCHAR(500) NULL,
    [Edition] NVARCHAR(100) NULL,
    [PageCount] INT DEFAULT 1,
    [Status] TINYINT DEFAULT 1,
    [CreatedOn] DATETIME DEFAULT GETDATE(),
    [UpdatedOn] DATETIME DEFAULT GETDATE()
);

CREATE INDEX IX_Newsletter_PublishDate ON [dbo].[Newsletter] ([PublishDate] DESC);
END
GO

-- ========================================================================================
-- COMPOSITE INDEXES FOR HIGH-PERFORMANCE NEWS PORTAL READ PATTERNS
-- ========================================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Status_PublishedOn' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Status_PublishedOn]
    ON [dbo].[NewsArticle] ([Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [AuthorStaffId], [AuthorName], [AuthorRole], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl], [UpdatedOn]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Category_Status_PublishedOn' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Category_Status_PublishedOn]
    ON [dbo].[NewsArticle] ([CategoryId] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [DistrictName], [AuthorStaffId], [AuthorName], [AuthorRole], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl], [UpdatedOn]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_District_Status' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_District_Status]
    ON [dbo].[NewsArticle] ([DistrictName] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [AuthorName], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Breaking' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Breaking]
    ON [dbo].[NewsArticle] ([IsBreaking] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [ViewCount]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Featured' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Featured]
    ON [dbo].[NewsArticle] ([IsFeatured] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [AuthorName], [AuthorRole], [ViewCount]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Trending' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Trending]
    ON [dbo].[NewsArticle] ([IsTrending] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [ViewCount]);
END
GO
