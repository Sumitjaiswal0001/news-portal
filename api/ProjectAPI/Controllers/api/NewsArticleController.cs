using Newtonsoft.Json;
using Project;
using ProjectAPI.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    // ============================================================
    // ARTICLE DTO
    // ============================================================

    public class ArticleDTO
    {
        public int ArticleId { get; set; }

        public string Title { get; set; }

        public string TitleHindi { get; set; }

        public string Subtitle { get; set; }

        public string Slug { get; set; }

        public string Summary { get; set; }

        public string Content { get; set; }

        public string ThumbnailUrl { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; }

        public string DistrictName { get; set; }

        public int? AuthorStaffId { get; set; }

        public string AuthorName { get; set; }

        public string AuthorRole { get; set; }

        public int ViewCount { get; set; }

        public bool IsBreaking { get; set; }

        public bool IsTrending { get; set; }

        public bool IsFeatured { get; set; }

        public byte Status { get; set; }

        public DateTime PublishedOn { get; set; }

        public DateTime UpdatedOn { get; set; }

        public string YoutubeUrl { get; set; }
    }


    // ============================================================
    // NEWS ARTICLE CONTROLLER
    // ============================================================

    [RoutePrefix("api/NewsArticle")]
    public class NewsArticleController : ApiController
    {

        // ========================================================
        // ARTICLE LIST
        // ========================================================

        [HttpPost]
        [Route("ArticleList")]
        public ExpandoObject ArticleList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();

            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    string AppKey =
                        HttpContext.Current.Request.Headers["AppKey"];

                    AppData.CheckAppKey(
                        dbContext,
                        AppKey,
                        (byte)KeyFor.Admin
                    );

                    var decryptData =
                        CryptoJs.Decrypt(
                            requestModel.request,
                            CryptoJs.key,
                            CryptoJs.iv
                        );

                    NewsArticle model =
                        JsonConvert.DeserializeObject<NewsArticle>(
                            decryptData
                        );

                    var rawList =
                        dbContext.Database.SqlQuery<ArticleDTO>(
                            "EXEC dbo.sp_GetArticleList @ArticleId, @CategoryId, @Status",

                            new SqlParameter(
                                "@ArticleId",
                                model.ArticleId
                            ),

                            new SqlParameter(
                                "@CategoryId",
                                model.CategoryId
                            ),

                            new SqlParameter(
                                "@Status",
                                model.Status
                            )
                        ).ToList();

                    var list =
                        rawList.Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,
                            a.Content,

                            ThumbnailUrl =
                                FormatImageUrl(
                                    a.ThumbnailUrl
                                ),

                            a.CategoryId,
                            a.CategoryName,
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

                        }).ToList();

                    response.ArticleList = list;

                    response.Message =
                        ConstantData.SuccessMessage;
                }
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }

            return response;
        }


        // ========================================================
        // GET ARTICLES
        // ========================================================

        [HttpGet]
        [Route("GetArticles")]
        public IHttpActionResult GetArticles(
            [FromUri] string districtId = null,
            [FromUri] string categoryId = null,
            [FromUri] string query = null
        )
        {
            try
            {
                string cacheKey = $"news_articles_{districtId ?? "all"}_{categoryId ?? "0"}_{query ?? "none"}";
                var cachedData = CacheService.Get<object>(cacheKey);
                if (cachedData != null)
                {
                    return Ok(new { success = true, data = cachedData });
                }

                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    int catId =
                        AppData.CheckInt(categoryId);

                    var rawList =
                        dbContext.Database.SqlQuery<ArticleDTO>(
                            "EXEC dbo.sp_GetArticles @DistrictName, @CategoryId, @SearchQuery",

                            new SqlParameter(
                                "@DistrictName",
                                (object)districtId ??
                                DBNull.Value
                            ),

                            new SqlParameter(
                                "@CategoryId",
                                catId
                            ),

                            new SqlParameter(
                                "@SearchQuery",
                                (object)query ??
                                DBNull.Value
                            )

                        ).ToList();

                    var list =
                        rawList.Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,
                            ThumbnailUrl =
                                FormatImageUrl(
                                    a.ThumbnailUrl
                                ),

                            a.CategoryId,
                            a.CategoryName,
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

                        }).ToList();

                    CacheService.Set(cacheKey, list, 3);

                    return Ok(
                        new
                        {
                            success = true,
                            data = list
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // GET SINGLE ARTICLE
        // ========================================================

        [HttpGet]
        [Route("GetArticle/{id}")]
        public IHttpActionResult GetArticle(int id)
        {
            try
            {
                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    var a =
                        dbContext.Database.SqlQuery<ArticleDTO>(
                            "EXEC dbo.sp_GetArticleById @ArticleId",

                            new SqlParameter(
                                "@ArticleId",
                                id
                            )

                        ).FirstOrDefault();

                    if (a == null)
                    {
                        return NotFound();
                    }

                    var articleData = new
                    {
                        a.ArticleId,
                        a.Title,
                        a.TitleHindi,
                        a.Subtitle,
                        a.Slug,
                        a.Summary,
                        a.Content,

                        ThumbnailUrl =
                            FormatImageUrl(
                                a.ThumbnailUrl
                            ),

                        a.CategoryId,
                        a.CategoryName,
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
                    };

                    return Ok(
                        new
                        {
                            success = true,
                            data = articleData
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // BREAKING NEWS
        // ========================================================

        [HttpGet]
        [Route("GetBreakingNews")]
        public IHttpActionResult GetBreakingNews()
        {
            try
            {
                string cacheKey = "news_breaking";
                var cachedData = CacheService.Get<object>(cacheKey);
                if (cachedData != null)
                {
                    return Ok(new { success = true, data = cachedData });
                }

                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    var rawList =
                        dbContext.NewsArticles
                        .AsNoTracking()
                        .Where(x => x.IsBreaking && x.Status == 1)
                        .OrderByDescending(
                            x => x.PublishedOn
                        )
                        .Take(15)
                        .Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,
                            a.ThumbnailUrl,
                            a.CategoryId,

                            CategoryName =
                                a.NewsCategory != null
                                    ? a.NewsCategory.CategoryName
                                    : "",

                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    var list =
                        rawList.Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,

                            ThumbnailUrl =
                                FormatImageUrl(
                                    a.ThumbnailUrl
                                ),

                            a.CategoryId,
                            a.CategoryName,
                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    CacheService.Set(cacheKey, list, 2);

                    return Ok(
                        new
                        {
                            success = true,
                            data = list
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // FEATURED ARTICLES
        // ========================================================

        [HttpGet]
        [Route("GetFeaturedArticles")]
        public IHttpActionResult GetFeaturedArticles()
        {
            try
            {
                string cacheKey = "news_featured";
                var cachedData = CacheService.Get<object>(cacheKey);
                if (cachedData != null)
                {
                    return Ok(new { success = true, data = cachedData });
                }

                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    var rawList =
                        dbContext.NewsArticles
                        .AsNoTracking()
                        .Where(x => x.IsFeatured && x.Status == 1)
                        .OrderByDescending(
                            x => x.PublishedOn
                        )
                        .Take(15)
                        .Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,
                            a.ThumbnailUrl,
                            a.CategoryId,

                            CategoryName =
                                a.NewsCategory != null
                                    ? a.NewsCategory.CategoryName
                                    : "",

                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    var list =
                        rawList.Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,

                            ThumbnailUrl =
                                FormatImageUrl(
                                    a.ThumbnailUrl
                                ),

                            a.CategoryId,
                            a.CategoryName,
                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    CacheService.Set(cacheKey, list, 3);

                    return Ok(
                        new
                        {
                            success = true,
                            data = list
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // TRENDING ARTICLES
        // ========================================================

        [HttpGet]
        [Route("GetTrendingArticles")]
        public IHttpActionResult GetTrendingArticles()
        {
            try
            {
                string cacheKey = "news_trending";
                var cachedData = CacheService.Get<object>(cacheKey);
                if (cachedData != null)
                {
                    return Ok(new { success = true, data = cachedData });
                }

                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    var rawList =
                        dbContext.NewsArticles
                        .AsNoTracking()
                        .Where(x => x.IsTrending && x.Status == 1)
                        .OrderByDescending(
                            x => x.PublishedOn
                        )
                        .Take(15)
                        .Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,
                            a.ThumbnailUrl,
                            a.CategoryId,

                            CategoryName =
                                a.NewsCategory != null
                                    ? a.NewsCategory.CategoryName
                                    : "",

                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    var list =
                        rawList.Select(a => new
                        {
                            a.ArticleId,
                            a.Title,
                            a.TitleHindi,
                            a.Subtitle,
                            a.Slug,
                            a.Summary,

                            ThumbnailUrl =
                                FormatImageUrl(
                                    a.ThumbnailUrl
                                ),

                            a.CategoryId,
                            a.CategoryName,
                            a.DistrictName,
                            a.ViewCount,
                            a.PublishedOn

                        }).ToList();

                    CacheService.Set(cacheKey, list, 3);

                    return Ok(
                        new
                        {
                            success = true,
                            data = list
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // INCREMENT VIEW COUNT
        // ========================================================

        [HttpPost]
        [HttpGet]
        [Route("IncrementViewCount/{id}")]
        public IHttpActionResult IncrementViewCount(int id)
        {
            try
            {
                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    var article =
                        dbContext.NewsArticles
                        .FirstOrDefault(
                            a => a.ArticleId == id
                        );

                    if (article == null)
                    {
                        return NotFound();
                    }

                    article.ViewCount =
                        article.ViewCount + 1;

                    dbContext.SaveChanges();

                    return Ok(
                        new
                        {
                            success = true,
                            viewCount = article.ViewCount
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        // ========================================================
        // SAVE ARTICLE
        // ========================================================

        [HttpPost]
        [Route("saveArticle")]
        public ExpandoObject SaveArticle(
            RequestModel requestModel
        )
        {
            dynamic response =
                new ExpandoObject();

            try
            {
                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    string AppKey =
                        HttpContext.Current
                        .Request.Headers["AppKey"];

                    AppData.CheckAppKey(
                        dbContext,
                        AppKey,
                        (byte)KeyFor.Admin
                    );

                    var decryptData =
                        CryptoJs.Decrypt(
                            requestModel.request,
                            CryptoJs.key,
                            CryptoJs.iv
                        );

                    NewsArticle model =
                        JsonConvert.DeserializeObject<NewsArticle>(
                            decryptData
                        );

                    string savedImagePath =
                        SaveImageFile(
                            model.ThumbnailUrl
                        );

                    NewsArticle article = null;

                    // ====================================================
                    // UPDATE
                    // ====================================================

                    if (model.ArticleId > 0)
                    {
                        article =
                            dbContext.NewsArticles
                            .Where(
                                x =>
                                    x.ArticleId ==
                                    model.ArticleId
                            )
                            .First();

                        article.Title =
                            model.Title;

                        article.TitleHindi =
                            model.TitleHindi;

                        article.Subtitle =
                            model.Subtitle;

                        article.Slug =
                            model.Slug;

                        article.Summary =
                            model.Summary;

                        if (!string.IsNullOrEmpty(
                            model.Content
                        ))
                        {
                            article.Content =
                                model.Content;
                        }
                        else if (
                            !string.IsNullOrEmpty(
                                model.Summary
                            )
                        )
                        {
                            article.Content =
                                model.Summary;
                        }

                        if (!string.IsNullOrEmpty(
                            savedImagePath
                        ))
                        {
                            article.ThumbnailUrl =
                                savedImagePath;
                        }

                        article.CategoryId =
                            model.CategoryId;

                        article.DistrictName =
                            model.DistrictName;

                        article.AuthorStaffId =
                            model.AuthorStaffId;

                        article.AuthorName =
                            model.AuthorName;

                        article.AuthorRole =
                            model.AuthorRole;

                        article.IsBreaking =
                            model.IsBreaking;

                        article.IsTrending =
                            model.IsTrending;

                        article.IsFeatured =
                            model.IsFeatured;

                        article.Status =
                            model.Status;

                        article.ViewCount =
                            model.ViewCount;

                        article.UpdatedOn =
                            DateTime.Now;
                    }

                    // ====================================================
                    // INSERT
                    // ====================================================

                    else
                    {
                        article = model;

                        if (!string.IsNullOrEmpty(
                            savedImagePath
                        ))
                        {
                            article.ThumbnailUrl =
                                savedImagePath;
                        }

                        if (string.IsNullOrEmpty(
                            article.Content
                        ))
                        {
                            article.Content =
                                !string.IsNullOrEmpty(
                                    article.Summary
                                )
                                    ? article.Summary
                                    : (
                                        !string.IsNullOrEmpty(
                                            article.Title
                                        )
                                            ? article.Title
                                            : "N/A"
                                    );
                        }

                        if (article.ViewCount < 0)
                        {
                            article.ViewCount = 0;
                        }

                        if (
                            article.PublishedOn ==
                            default(DateTime)
                        )
                        {
                            article.PublishedOn =
                                DateTime.Now;
                        }

                        article.UpdatedOn =
                            DateTime.Now;

                        dbContext.NewsArticles.Add(
                            article
                        );
                    }

                    dbContext.SaveChanges();
                    CacheService.InvalidateAllNewsCaches();

                    response.Message =
                        ConstantData.SuccessMessage;
                }
            }
            catch (DbEntityValidationException ex)
            {
                var errorMessages =
                    ex.EntityValidationErrors
                    .SelectMany(
                        x => x.ValidationErrors
                    )
                    .Select(
                        x =>
                            $"Field '{x.PropertyName}': {x.ErrorMessage}"
                    );

                response.Message =
                    "Validation Error: " +
                    string.Join(
                        "; ",
                        errorMessages
                    );
            }
            catch (Exception ex)
            {
                response.Message =
                    ex.Message;
            }

            return response;
        }


        // ========================================================
        // SAVE IMAGE
        // ========================================================

        private string SaveImageFile(
            string rawImageData
        )
        {
            if (string.IsNullOrEmpty(
                rawImageData
            ))
            {
                return string.Empty;
            }

            if (
                rawImageData.StartsWith(
                    "data:image/",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                try
                {
                    string folderPath =
                        HttpContext.Current
                        .Server.MapPath(
                            "~/Content/files/"
                        );

                    if (!System.IO.Directory.Exists(
                        folderPath
                    ))
                    {
                        System.IO.Directory.CreateDirectory(
                            folderPath
                        );
                    }

                    string extension = ".jpg";

                    if (
                        rawImageData.Contains(
                            "data:image/png;"
                        )
                    )
                    {
                        extension = ".png";
                    }
                    else if (
                        rawImageData.Contains(
                            "data:image/gif;"
                        )
                    )
                    {
                        extension = ".gif";
                    }
                    else if (
                        rawImageData.Contains(
                            "data:image/webp;"
                        )
                    )
                    {
                        extension = ".webp";
                    }
                    else if (
                        rawImageData.Contains(
                            "data:image/avif;"
                        )
                    )
                    {
                        extension = ".avif";
                    }

                    int commaIdx =
                        rawImageData.IndexOf(',');

                    string base64Data =
                        commaIdx > 0
                            ? rawImageData.Substring(
                                commaIdx + 1
                              )
                            : rawImageData;

                    byte[] imageBytes =
                        Convert.FromBase64String(
                            base64Data
                        );

                    string fileName =
                        "article_" +
                        DateTime.Now.Ticks +
                        extension;

                    string fullPath =
                        System.IO.Path.Combine(
                            folderPath,
                            fileName
                        );

                    // Phase 3: Optimize and compress image bytes (max 1200px, 82% JPEG quality)
                    byte[] optimizedBytes = OptimizeImageBytes(imageBytes, 1200);

                    System.IO.File.WriteAllBytes(
                        fullPath,
                        optimizedBytes
                    );

                    return
                        "Content/files/" +
                        fileName;
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine(
                        "Error saving image file: " +
                        ex.Message
                    );
                }
            }

            return rawImageData;
        }

        /// <summary>
        /// Phase 3 Pipeline: Automatically resizes and compresses uploaded images
        /// to prevent oversized payloads from slowing down server and client page loads.
        /// </summary>
        private static byte[] OptimizeImageBytes(byte[] rawBytes, int maxDimension = 1200)
        {
            if (rawBytes == null || rawBytes.Length == 0) return rawBytes;

            try
            {
                using (var ms = new System.IO.MemoryStream(rawBytes))
                using (var original = System.Drawing.Image.FromStream(ms))
                {
                    int w = original.Width;
                    int h = original.Height;

                    if (w <= maxDimension && h <= maxDimension && rawBytes.Length <= 300 * 1024)
                    {
                        return rawBytes;
                    }

                    float ratio = Math.Min((float)maxDimension / w, (float)maxDimension / h);
                    int targetW = (ratio < 1f) ? (int)(w * ratio) : w;
                    int targetH = (ratio < 1f) ? (int)(h * ratio) : h;

                    using (var bitmap = new System.Drawing.Bitmap(targetW, targetH))
                    using (var g = System.Drawing.Graphics.FromImage(bitmap))
                    {
                        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                        g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                        g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;

                        g.DrawImage(original, 0, 0, targetW, targetH);

                        using (var outMs = new System.IO.MemoryStream())
                        {
                            var jpgEncoder = System.Drawing.Imaging.ImageCodecInfo.GetImageEncoders()
                                .FirstOrDefault(codec => codec.FormatID == System.Drawing.Imaging.ImageFormat.Jpeg.Guid);

                            if (jpgEncoder != null)
                            {
                                var encoderParams = new System.Drawing.Imaging.EncoderParameters(1);
                                encoderParams.Param[0] = new System.Drawing.Imaging.EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 82L);
                                bitmap.Save(outMs, jpgEncoder, encoderParams);
                                return outMs.ToArray();
                            }

                            bitmap.Save(outMs, System.Drawing.Imaging.ImageFormat.Jpeg);
                            return outMs.ToArray();
                        }
                    }
                }
            }
            catch
            {
                return rawBytes;
            }
        }


        // ========================================================
        // FORMAT IMAGE URL
        // ========================================================

        public static string FormatImageUrl(
            string url
        )
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return string.Empty;
            }

            url = url.Trim().Replace("~", "");

            // Already absolute URL
            if (
                url.StartsWith(
                    "http://",
                    StringComparison.OrdinalIgnoreCase
                ) ||
                url.StartsWith(
                    "https://",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
                {
                    url = "https://" + url.Substring(7);
                }
                return url;
            }

            // Data URL
            if (
                url.StartsWith(
                    "data:image/",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return url;
            }

            string authority = "";

            if (
                HttpContext.Current != null &&
                HttpContext.Current.Request != null
            )
            {
                authority =
                    HttpContext.Current
                    .Request
                    .Url
                    .GetLeftPart(
                        UriPartial.Authority
                    );
            }

            if (string.IsNullOrEmpty(authority) || authority.IndexOf("localhost", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                authority = "https://api.satyasamwad.com";
            }
            else if (authority.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            {
                authority = "https://" + authority.Substring(7);
            }

            string path =
                url.StartsWith("/")
                    ? url
                    : "/" + url;

            return authority + path;
        }


        // ========================================================
        // DELETE ARTICLE
        // ========================================================

        [HttpPost]
        [Route("deleteArticle")]
        public ExpandoObject DeleteArticle(
            RequestModel requestModel
        )
        {
            dynamic response =
                new ExpandoObject();

            try
            {
                using (newsportalEntities dbContext =
                       new newsportalEntities())
                {
                    string AppKey =
                        HttpContext.Current
                        .Request.Headers["AppKey"];

                    AppData.CheckAppKey(
                        dbContext,
                        AppKey,
                        (byte)KeyFor.Admin
                    );

                    var decryptData =
                        CryptoJs.Decrypt(
                            requestModel.request,
                            CryptoJs.key,
                            CryptoJs.iv
                        );

                    NewsArticle model =
                        JsonConvert.DeserializeObject<NewsArticle>(
                            decryptData
                        );

                    var article =
                        dbContext.NewsArticles
                        .Where(
                            x =>
                                x.ArticleId ==
                                model.ArticleId
                        )
                        .First();

                    dbContext.NewsArticles.Remove(
                        article
                    );

                    dbContext.SaveChanges();
                    CacheService.InvalidateAllNewsCaches();

                    response.Message =
                        ConstantData.SuccessMessage;
                }
            }
            catch (Exception ex)
            {
                if (
                    ex.Message.Contains("FK")
                )
                {
                    response.Message =
                        "This record is in use. so can't delete.";
                }
                else
                {
                    response.Message =
                        ex.Message;
                }
            }

            return response;
        }


        // ========================================================
        // SOCIAL SHARE PAGE
        // ========================================================
        //
        // IMPORTANT:
        //
        // WhatsApp / Facebook / X will request this URL:
        //
        // https://satyasamwad.com/api/NewsArticle/Share/123
        //
        // The endpoint returns OG metadata.
        //
        // Normal browser users are redirected to:
        //
        // https://satyasamwad.com/#/article/123
        //
        // ========================================================

        [HttpGet]
        [AllowAnonymous]
        [Route("Share/{id:int}")]
        public HttpResponseMessage ShareArticle(
            int id
        )
        {
            try
            {
                ArticleDTO article = null;

                using (
                    newsportalEntities dbContext =
                    new newsportalEntities()
                )
                {
                    // ================================================
                    // First try stored procedure
                    // ================================================

                    article =
                        dbContext.Database
                        .SqlQuery<ArticleDTO>(
                            "EXEC dbo.sp_GetArticleById @ArticleId",

                            new SqlParameter(
                                "@ArticleId",
                                id
                            )

                        )
                        .FirstOrDefault();


                    // ================================================
                    // Fallback to Entity Framework
                    // ================================================

                    if (article == null)
                    {
                        article =
                            dbContext.NewsArticles
                            .Where(
                                x =>
                                    x.ArticleId ==
                                    id
                            )
                            .Select(
                                a =>
                                    new ArticleDTO
                                    {
                                        ArticleId =
                                            a.ArticleId,

                                        Title =
                                            a.Title,

                                        TitleHindi =
                                            a.TitleHindi,

                                        Subtitle =
                                            a.Subtitle,

                                        Summary =
                                            a.Summary,

                                        ThumbnailUrl =
                                            a.ThumbnailUrl
                                    }
                            )
                            .FirstOrDefault();
                    }
                }


                // ================================================
                // ARTICLE NOT FOUND
                // ================================================

                if (article == null)
                {
                    return Request.CreateResponse(
                        HttpStatusCode.NotFound,
                        "Article not found."
                    );
                }


                // ================================================
                // BASIC DATA
                // ================================================

                string title =
                    !string.IsNullOrWhiteSpace(
                        article.Title
                    )
                        ? article.Title
                        : (
                            !string.IsNullOrWhiteSpace(
                                article.TitleHindi
                            )
                                ? article.TitleHindi
                                : "सत्य संवाद - समाचार"
                          );


                string description =
                    !string.IsNullOrWhiteSpace(
                        article.Subtitle
                    )
                        ? article.Subtitle
                        : (
                            !string.IsNullOrWhiteSpace(
                                article.Summary
                            )
                                ? article.Summary
                                : title
                          );


                // Limit description length
                if (description.Length > 300)
                {
                    description =
                        description.Substring(
                            0,
                            297
                        ) + "...";
                }


                // ================================================
                // IMAGE
                // ================================================

                string imageUrl =
                    FormatImageUrl(
                        article.ThumbnailUrl
                    );

                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    imageUrl = "https://satyasamwad.com/assets/img/satya_samwad_logo.png";
                }

                string mimeType = "image/jpeg";
                if (imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                {
                    mimeType = "image/png";
                }
                else if (imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                {
                    mimeType = "image/webp";
                }
                else if (imageUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase))
                {
                    mimeType = "image/gif";
                }


                // ================================================
                // PRODUCTION FRONTEND REDIRECT URL
                // ================================================

                string frontendUrl =
                    "https://satyasamwad.com";

                string redirectUrl =
                    frontendUrl +
                    "/#/article/" +
                    id;


                // ================================================
                // SOCIAL SHARE BRIDGE URL (For og:url and canonical)
                // Note: Do NOT use redirectUrl with '#' here,
                // otherwise Facebook scraper will follow canonical
                // to root home page!
                // ================================================

                string shareUrl = "";
                if (
                    HttpContext.Current != null &&
                    HttpContext.Current.Request != null
                )
                {
                    shareUrl =
                        HttpContext.Current
                        .Request
                        .Url
                        .AbsoluteUri;
                }

                if (string.IsNullOrEmpty(shareUrl) || shareUrl.IndexOf("localhost", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    shareUrl = "https://api.satyasamwad.com/api/NewsArticle/Share/" + id;
                }
                else if (shareUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
                {
                    shareUrl = "https://" + shareUrl.Substring(7);
                }


                // ================================================
                // ESCAPE VALUES FOR HTML ATTRIBUTES
                // ================================================

                string safeTitle =
                    HttpUtility.HtmlAttributeEncode(
                        title
                    );

                string safeDescription =
                    HttpUtility.HtmlAttributeEncode(
                        description
                    );

                string safeImageUrl =
                    HttpUtility.HtmlAttributeEncode(
                        imageUrl
                    );

                string safeRedirectUrl =
                    HttpUtility.HtmlAttributeEncode(
                        redirectUrl
                    );

                string safeShareUrl =
                    HttpUtility.HtmlAttributeEncode(
                        shareUrl
                    );


                // ================================================
                // HTML
                // ================================================

                StringBuilder sb =
                    new StringBuilder();

                sb.AppendLine(
                    "<!DOCTYPE html>"
                );

                sb.AppendLine(
                    "<html lang=\"hi\">"
                );

                sb.AppendLine(
                    "<head>"
                );

                // Charset
                sb.AppendLine(
                    "<meta charset=\"UTF-8\" />"
                );

                // Viewport
                sb.AppendLine(
                    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />"
                );

                // Standard title
                sb.AppendLine(
                    "<title>" +
                    safeTitle +
                    " - सत्य संवाद</title>"
                );

                // ==================================================
                // OPEN GRAPH (Facebook, WhatsApp, LinkedIn)
                // ==================================================

                sb.AppendLine(
                    "<meta property=\"og:type\" content=\"article\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:site_name\" content=\"सत्य संवाद\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:title\" content=\"" +
                    safeTitle +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:description\" content=\"" +
                    safeDescription +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:url\" content=\"" +
                    safeShareUrl +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image\" content=\"" +
                    safeImageUrl +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:url\" content=\"" +
                    safeImageUrl +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:secure_url\" content=\"" +
                    safeImageUrl +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:type\" content=\"" +
                    mimeType +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:width\" content=\"1200\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:height\" content=\"630\" />"
                );

                sb.AppendLine(
                    "<meta property=\"og:image:alt\" content=\"" +
                    safeTitle +
                    "\" />"
                );

                // ==================================================
                // TWITTER / X
                // ==================================================

                sb.AppendLine(
                    "<meta name=\"twitter:card\" content=\"summary_large_image\" />"
                );

                sb.AppendLine(
                    "<meta name=\"twitter:title\" content=\"" +
                    safeTitle +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta name=\"twitter:description\" content=\"" +
                    safeDescription +
                    "\" />"
                );

                sb.AppendLine(
                    "<meta name=\"twitter:image\" content=\"" +
                    safeImageUrl +
                    "\" />"
                );

                // ==================================================
                // CANONICAL
                // ==================================================

                sb.AppendLine(
                    "<link rel=\"canonical\" href=\"" +
                    safeShareUrl +
                    "\" />"
                );

                // ==================================================
                // REDIRECT FOR REAL USERS
                // ==================================================

                sb.AppendLine(
                    "<script type=\"text/javascript\">"
                );
                sb.AppendLine(
                    "  window.location.replace(\"" +
                    safeRedirectUrl +
                    "\");"
                );
                sb.AppendLine(
                    "</script>"
                );

                sb.AppendLine(
                    "<meta http-equiv=\"refresh\" content=\"0;url=" +
                    safeRedirectUrl +
                    "\" />"
                );

                sb.AppendLine(
                    "</head>"
                );

                sb.AppendLine(
                    "<body style=\"font-family:Arial,sans-serif;text-align:center;padding:40px;\">"
                );

                sb.AppendLine(
                    "<h1>" +
                    safeTitle +
                    "</h1>"
                );

                sb.AppendLine(
                    "<p>सत्य संवाद पर खबर पढ़ने के लिए आगे बढ़ें...</p>"
                );

                sb.AppendLine(
                    "<p><a href=\"" +
                    safeRedirectUrl +
                    "\" style=\"display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;\">खबर पढ़ें →</a></p>"
                );

                sb.AppendLine(
                    "</body>"
                );

                sb.AppendLine(
                    "</html>"
                );


                // ==================================================
                // RESPONSE
                // ==================================================

                HttpResponseMessage response =
                    Request.CreateResponse(
                        HttpStatusCode.OK
                    );


                response.Content =
                    new StringContent(
                        sb.ToString(),
                        Encoding.UTF8,
                        "text/html"
                    );


                // Cache for social crawlers
                response.Headers.CacheControl =
                    new System.Net.Http.Headers.CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromMinutes(10)
                    };


                return response;
            }
            catch (Exception ex)
            {
                HttpResponseMessage response =
                    Request.CreateResponse(
                        HttpStatusCode.InternalServerError
                    );

                response.Content =
                    new StringContent(
                        "Error generating share preview: " +
                        ex.Message,
                        Encoding.UTF8,
                        "text/plain"
                    );

                return response;
            }
        }
    }
}