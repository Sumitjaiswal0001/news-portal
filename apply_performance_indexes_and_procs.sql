-- ========================================================================================
-- NEWS PORTAL: PERFORMANCE OPTIMIZATION SCRIPT (PHASE 1)
-- Database: Microsoft SQL Server (newsportal)
-- Purpose:
--   1. Create high-performance Composite Indexes for NewsArticle
--   2. Enforce strict non-blocking reads (WITH NOLOCK) and exclude heavy Content from lists
-- ========================================================================================

USE [newsportal];
GO

-- ----------------------------------------------------------------------------------------
-- 1. COMPOSITE INDEXES
-- ----------------------------------------------------------------------------------------

-- Composite Index 1: Exact homepage read pattern (Status + PublishedOn DESC)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Status_PublishedOn' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Status_PublishedOn]
    ON [dbo].[NewsArticle] ([Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [AuthorStaffId], [AuthorName], [AuthorRole], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl], [UpdatedOn])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_Status_PublishedOn';
END
GO

-- Composite Index 2: Category feeds read pattern (CategoryId + Status + PublishedOn DESC)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Category_Status_PublishedOn' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Category_Status_PublishedOn]
    ON [dbo].[NewsArticle] ([CategoryId] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [DistrictName], [AuthorStaffId], [AuthorName], [AuthorRole], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl], [UpdatedOn])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_Category_Status_PublishedOn';
END
GO

-- Composite Index 3: District feeds read pattern (DistrictName + Status + PublishedOn DESC)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_District_Status' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_District_Status]
    ON [dbo].[NewsArticle] ([DistrictName] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [AuthorName], [ViewCount], [IsBreaking], [IsTrending], [IsFeatured], [YoutubeUrl])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_District_Status';
END
GO

-- Composite Index 4: Breaking news feed
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Breaking' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Breaking]
    ON [dbo].[NewsArticle] ([IsBreaking] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [ViewCount])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_Breaking';
END
GO

-- Composite Index 5: Featured slider stories
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Featured' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Featured]
    ON [dbo].[NewsArticle] ([IsFeatured] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [AuthorName], [AuthorRole], [ViewCount])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_Featured';
END
GO

-- Composite Index 6: Trending news feed
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_NewsArticle_Trending' AND object_id = OBJECT_ID('dbo.NewsArticle'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_NewsArticle_Trending]
    ON [dbo].[NewsArticle] ([IsTrending] ASC, [Status] ASC, [PublishedOn] DESC)
    INCLUDE ([ArticleId], [Title], [TitleHindi], [Subtitle], [Slug], [Summary], [ThumbnailUrl], [CategoryId], [DistrictName], [ViewCount])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
    PRINT 'Created Index: IX_NewsArticle_Trending';
END
GO


-- ----------------------------------------------------------------------------------------
-- 2. REFACTORED STORED PROCEDURES (Strict SELECTs, Excludes Heavy [Content])
-- ----------------------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[sp_GetArticles]
    @DistrictName NVARCHAR(150) = NULL,
    @CategoryId INT = 0,
    @SearchQuery NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 100
        a.ArticleId,
        a.Title,
        a.TitleHindi,
        a.Subtitle,
        a.Slug,
        a.Summary,
        CAST('' AS NVARCHAR(MAX)) AS [Content], -- Exclude heavy HTML body from lists
        a.ThumbnailUrl,
        a.CategoryId,
        ISNULL(c.CategoryName, '') AS CategoryName,
        a.DistrictName,
        a.AuthorStaffId,
        a.AuthorName,
        a.AuthorRole,
        a.ViewCount,
        a.IsBreaking,
        a.IsTrending,
        a.IsFeatured,
        a.Status,
        a.PublishedOn,
        a.UpdatedOn,
        a.YoutubeUrl
    FROM [dbo].[NewsArticle] a WITH (NOLOCK)
    LEFT JOIN [dbo].[NewsCategory] c WITH (NOLOCK) ON a.CategoryId = c.CategoryId
    WHERE a.[Status] = 1
      AND (@DistrictName IS NULL OR a.DistrictName = @DistrictName)
      AND (@CategoryId IS NULL OR @CategoryId = 0 OR a.CategoryId = @CategoryId)
      AND (@SearchQuery IS NULL OR a.Title LIKE '%' + @SearchQuery + '%' OR a.Summary LIKE '%' + @SearchQuery + '%')
    ORDER BY a.PublishedOn DESC;
END
GO
PRINT 'Updated Procedure: sp_GetArticles';
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetArticleById]
    @ArticleId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.ArticleId,
        a.Title,
        a.TitleHindi,
        a.Subtitle,
        a.Slug,
        a.Summary,
        a.Content, -- Single article detail includes full HTML body
        a.ThumbnailUrl,
        a.CategoryId,
        ISNULL(c.CategoryName, '') AS CategoryName,
        a.DistrictName,
        a.AuthorStaffId,
        a.AuthorName,
        a.AuthorRole,
        a.ViewCount,
        a.IsBreaking,
        a.IsTrending,
        a.IsFeatured,
        a.Status,
        a.PublishedOn,
        a.UpdatedOn,
        a.YoutubeUrl
    FROM [dbo].[NewsArticle] a WITH (NOLOCK)
    LEFT JOIN [dbo].[NewsCategory] c WITH (NOLOCK) ON a.CategoryId = c.CategoryId
    WHERE a.ArticleId = @ArticleId;
END
GO
PRINT 'Updated Procedure: sp_GetArticleById';
GO
