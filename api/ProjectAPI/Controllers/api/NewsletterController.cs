using Newtonsoft.Json;
using Project;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    public class NewsletterDTO
    {
        public int NewsletterId { get; set; }
        public string Title { get; set; }
        public DateTime PublishDate { get; set; }
        public string PdfUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string Edition { get; set; }
        public int? PageCount { get; set; }
        public byte? Status { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
    }

    public class NewsletterUploadModel
    {
        public int NewsletterId { get; set; }
        public string Title { get; set; }
        public string PublishDate { get; set; }
        public string Edition { get; set; }
        public string PdfBase64 { get; set; }
        public string FileName { get; set; }
    }

    [RoutePrefix("api/Newsletter")]
    public class NewsletterController : ApiController
    {
        private string FormatPdfUrl(string rawPath)
        {
            if (string.IsNullOrEmpty(rawPath)) return "";
            if (rawPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                rawPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return rawPath;
            }
            string baseUrl = HttpContext.Current != null && HttpContext.Current.Request != null
                ? HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority)
                : "https://api.satyasamwad.com";
            return baseUrl.TrimEnd('/') + "/" + rawPath.TrimStart('/');
        }

        // ========================================================
        // 1. GET PREVIOUS 10 DAYS NEWSLETTERS (For Front Website)
        // ========================================================
        [HttpGet]
        [Route("GetRecentTenDays")]
        public IHttpActionResult GetRecentTenDays()
        {
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    string sql = @"
                        SELECT TOP 10 
                            NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                        FROM dbo.Newsletter
                        WHERE Status = 1
                        ORDER BY PublishDate DESC, NewsletterId DESC";

                    var list = dbContext.Database.SqlQuery<NewsletterDTO>(sql).ToList();
                    foreach (var item in list)
                    {
                        item.PdfUrl = FormatPdfUrl(item.PdfUrl);
                        if (!string.IsNullOrEmpty(item.ThumbnailUrl))
                        {
                            item.ThumbnailUrl = FormatPdfUrl(item.ThumbnailUrl);
                        }
                    }

                    return Ok(new { success = true, data = list });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // ========================================================
        // 2. GET CURRENT MONTH NEWSLETTERS (View All Button)
        // ========================================================
        [HttpGet]
        [Route("GetCurrentMonth")]
        public IHttpActionResult GetCurrentMonth(int? year = null, int? month = null)
        {
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    int targetYear = year ?? DateTime.Today.Year;
                    int targetMonth = month ?? DateTime.Today.Month;

                    DateTime firstDay = new DateTime(targetYear, targetMonth, 1);
                    DateTime lastDay = firstDay.AddMonths(1).AddDays(-1);

                    string sql = @"
                        SELECT 
                            NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                        FROM dbo.Newsletter
                        WHERE Status = 1 AND PublishDate >= @FirstDay AND PublishDate <= @LastDay
                        ORDER BY PublishDate DESC, NewsletterId DESC";

                    var list = dbContext.Database.SqlQuery<NewsletterDTO>(
                        sql,
                        new SqlParameter("@FirstDay", firstDay),
                        new SqlParameter("@LastDay", lastDay)
                    ).ToList();

                    // If current month has fewer than 5, also fetch previous 30 days as friendly fallback
                    if (list.Count < 5)
                    {
                        DateTime thirtyDaysAgo = DateTime.Today.AddDays(-30);
                        string fallbackSql = @"
                            SELECT TOP 31
                                NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                            FROM dbo.Newsletter
                            WHERE Status = 1 AND PublishDate >= @ThirtyDaysAgo
                            ORDER BY PublishDate DESC, NewsletterId DESC";

                        list = dbContext.Database.SqlQuery<NewsletterDTO>(
                            fallbackSql,
                            new SqlParameter("@ThirtyDaysAgo", thirtyDaysAgo)
                        ).ToList();
                    }

                    foreach (var item in list)
                    {
                        item.PdfUrl = FormatPdfUrl(item.PdfUrl);
                        if (!string.IsNullOrEmpty(item.ThumbnailUrl))
                        {
                            item.ThumbnailUrl = FormatPdfUrl(item.ThumbnailUrl);
                        }
                    }

                    return Ok(new { 
                        success = true, 
                        data = list, 
                        month = targetMonth, 
                        year = targetYear,
                        monthName = firstDay.ToString("MMMM yyyy")
                    });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // ========================================================
        // 3. DATE FILTER (Day-wise newsletter search)
        // ========================================================
        [HttpGet]
        [Route("GetByDate")]
        public IHttpActionResult GetByDate(string date = null, string fromDate = null, string toDate = null)
        {
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    List<SqlParameter> parameters = new List<SqlParameter>();
                    string sql;

                    if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out DateTime parsedDate))
                    {
                        sql = @"
                            SELECT 
                                NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                            FROM dbo.Newsletter
                            WHERE Status = 1 AND PublishDate = @Date
                            ORDER BY NewsletterId DESC";
                        parameters.Add(new SqlParameter("@Date", parsedDate.Date));
                    }
                    else if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate)
                             && DateTime.TryParse(fromDate, out DateTime pFrom)
                             && DateTime.TryParse(toDate, out DateTime pTo))
                    {
                        sql = @"
                            SELECT 
                                NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                            FROM dbo.Newsletter
                            WHERE Status = 1 AND PublishDate >= @From AND PublishDate <= @To
                            ORDER BY PublishDate DESC, NewsletterId DESC";
                        parameters.Add(new SqlParameter("@From", pFrom.Date));
                        parameters.Add(new SqlParameter("@To", pTo.Date));
                    }
                    else
                    {
                        sql = @"
                            SELECT TOP 30 
                                NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                            FROM dbo.Newsletter
                            WHERE Status = 1
                            ORDER BY PublishDate DESC, NewsletterId DESC";
                    }

                    var list = dbContext.Database.SqlQuery<NewsletterDTO>(sql, parameters.ToArray()).ToList();
                    foreach (var item in list)
                    {
                        item.PdfUrl = FormatPdfUrl(item.PdfUrl);
                        if (!string.IsNullOrEmpty(item.ThumbnailUrl))
                        {
                            item.ThumbnailUrl = FormatPdfUrl(item.ThumbnailUrl);
                        }
                    }

                    return Ok(new { success = true, data = list });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // ========================================================
        // 4. ADMIN LIST (All newsletters with pagination/list)
        // ========================================================
        [HttpGet]
        [Route("GetAdminList")]
        public IHttpActionResult GetAdminList()
        {
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    string sql = @"
                        SELECT TOP 200 
                            NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn
                        FROM dbo.Newsletter
                        ORDER BY PublishDate DESC, NewsletterId DESC";

                    var list = dbContext.Database.SqlQuery<NewsletterDTO>(sql).ToList();
                    foreach (var item in list)
                    {
                        item.PdfUrl = FormatPdfUrl(item.PdfUrl);
                        if (!string.IsNullOrEmpty(item.ThumbnailUrl))
                        {
                            item.ThumbnailUrl = FormatPdfUrl(item.ThumbnailUrl);
                        }
                    }

                    return Ok(new { success = true, data = list });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // ========================================================
        // 5. UPLOAD NEWSLETTER (Admin Panel PDF Upload)
        // ========================================================
        [HttpPost]
        [Route("UploadNewsletter")]
        public async Task<HttpResponseMessage> UploadNewsletter()
        {
            try
            {
                string targetFolder = HttpContext.Current.Server.MapPath("~/Content/newsletters/");
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }

                string title = "";
                string edition = "मुख्य संस्करण";
                DateTime publishDate = DateTime.Today;
                string relativePdfUrl = "";

                var httpRequest = HttpContext.Current != null ? HttpContext.Current.Request : null;

                // 1. PRIMARY: Native ASP.NET Request.Files (Handles large files up to 100MB seamlessly)
                if (httpRequest != null && httpRequest.Files.Count > 0)
                {
                    var postedFile = httpRequest.Files[0];

                    if (!string.IsNullOrEmpty(httpRequest.Form["title"]))
                    {
                        title = httpRequest.Form["title"].Trim();
                    }
                    if (!string.IsNullOrEmpty(httpRequest.Form["edition"]))
                    {
                        edition = httpRequest.Form["edition"].Trim();
                    }
                    if (!string.IsNullOrEmpty(httpRequest.Form["publishDate"]) && DateTime.TryParse(httpRequest.Form["publishDate"], out DateTime pd))
                    {
                        publishDate = pd;
                    }

                    if (string.IsNullOrWhiteSpace(title))
                    {
                        title = $"सत्य संवाद - {publishDate:dd MMMM yyyy}";
                    }

                    string originalName = Path.GetFileName(postedFile.FileName);
                    string ext = Path.GetExtension(originalName);
                    if (string.IsNullOrEmpty(ext)) ext = ".pdf";

                    string safeFileName = $"newsletter_{publishDate:yyyyMMdd}_{DateTime.Now.Ticks}{ext}";
                    string finalFullPath = Path.Combine(targetFolder, safeFileName);

                    postedFile.SaveAs(finalFullPath);
                    relativePdfUrl = "Content/newsletters/" + safeFileName;
                }
                // 2. SECONDARY: MultipartFormDataStreamProvider
                else if (Request.Content.IsMimeMultipartContent())
                {
                    var provider = new MultipartFormDataStreamProvider(targetFolder);
                    await Request.Content.ReadAsMultipartAsync(provider);

                    if (provider.FormData["title"] != null)
                    {
                        title = provider.FormData["title"].Trim();
                    }
                    if (provider.FormData["edition"] != null && !string.IsNullOrWhiteSpace(provider.FormData["edition"]))
                    {
                        edition = provider.FormData["edition"].Trim();
                    }
                    if (provider.FormData["publishDate"] != null && DateTime.TryParse(provider.FormData["publishDate"], out DateTime pd))
                    {
                        publishDate = pd;
                    }

                    if (string.IsNullOrWhiteSpace(title))
                    {
                        title = $"सत्य संवाद - {publishDate:dd MMMM yyyy}";
                    }

                    var fileData = provider.FileData.FirstOrDefault();
                    if (fileData != null)
                    {
                        string originalName = fileData.Headers.ContentDisposition.FileName.Trim('\"');
                        string ext = Path.GetExtension(originalName);
                        if (string.IsNullOrEmpty(ext)) ext = ".pdf";

                        string safeFileName = $"newsletter_{publishDate:yyyyMMdd}_{DateTime.Now.Ticks}{ext}";
                        string finalFullPath = Path.Combine(targetFolder, safeFileName);

                        File.Move(fileData.LocalFileName, finalFullPath);
                        relativePdfUrl = "Content/newsletters/" + safeFileName;
                    }
                }
                else
                {
                    // Fallback to JSON payload (Base64)
                    string rawJson = await Request.Content.ReadAsStringAsync();
                    NewsletterUploadModel model = JsonConvert.DeserializeObject<NewsletterUploadModel>(rawJson);

                    if (model != null)
                    {
                        title = !string.IsNullOrWhiteSpace(model.Title) ? model.Title.Trim() : $"सत्य संवाद - {DateTime.Today:dd MMMM yyyy}";
                        if (!string.IsNullOrWhiteSpace(model.Edition)) edition = model.Edition.Trim();
                        if (!string.IsNullOrWhiteSpace(model.PublishDate) && DateTime.TryParse(model.PublishDate, out DateTime pd))
                        {
                            publishDate = pd;
                        }

                        if (!string.IsNullOrWhiteSpace(model.PdfBase64))
                        {
                            string base64Data = model.PdfBase64;
                            int commaIdx = base64Data.IndexOf(',');
                            if (commaIdx >= 0)
                            {
                                base64Data = base64Data.Substring(commaIdx + 1);
                            }

                            byte[] pdfBytes = Convert.FromBase64String(base64Data);
                            string safeFileName = $"newsletter_{publishDate:yyyyMMdd}_{DateTime.Now.Ticks}.pdf";
                            string finalFullPath = Path.Combine(targetFolder, safeFileName);

                            File.WriteAllBytes(finalFullPath, pdfBytes);
                            relativePdfUrl = "Content/newsletters/" + safeFileName;
                        }
                    }
                }

                if (string.IsNullOrEmpty(relativePdfUrl))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, new
                    {
                        success = false,
                        message = "PDF file is required."
                    });
                }

                // Insert into Database
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    string insertSql = @"
                        INSERT INTO dbo.Newsletter (Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn)
                        VALUES (@Title, @PublishDate, @PdfUrl, NULL, @Edition, 1, 1, GETDATE(), GETDATE())";

                    dbContext.Database.ExecuteSqlCommand(
                        insertSql,
                        new SqlParameter("@Title", title),
                        new SqlParameter("@PublishDate", publishDate.Date),
                        new SqlParameter("@PdfUrl", relativePdfUrl),
                        new SqlParameter("@Edition", edition)
                    );
                }

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    success = true,
                    message = "न्यूज़लेटर सफलतापूर्वक अपलोड हो गया!",
                    pdfUrl = FormatPdfUrl(relativePdfUrl)
                });
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    success = false,
                    message = "Upload failed: " + ex.Message
                });
            }
        }

        // ========================================================
        // 6. DELETE NEWSLETTER
        // ========================================================
        [HttpPost]
        [Route("DeleteNewsletter/{id}")]
        public IHttpActionResult DeleteNewsletter(int id)
        {
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    // Fetch existing to delete physical file if needed
                    var existing = dbContext.Database.SqlQuery<NewsletterDTO>(
                        "SELECT * FROM dbo.Newsletter WHERE NewsletterId = @id",
                        new SqlParameter("@id", id)
                    ).FirstOrDefault();

                    if (existing != null && !string.IsNullOrEmpty(existing.PdfUrl))
                    {
                        try
                        {
                            string physicalPath = HttpContext.Current.Server.MapPath("~/" + existing.PdfUrl.TrimStart('/'));
                            if (File.Exists(physicalPath))
                            {
                                File.Delete(physicalPath);
                            }
                        }
                        catch { }
                    }

                    dbContext.Database.ExecuteSqlCommand(
                        "DELETE FROM dbo.Newsletter WHERE NewsletterId = @id",
                        new SqlParameter("@id", id)
                    );

                    return Ok(new { success = true, message = "न्यूज़लेटर सफलतापूर्वक हटा दिया गया।" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // ========================================================
        // SOCIAL SHARE PAGE FOR NEWSLETTER
        // ========================================================
        [HttpGet]
        [AllowAnonymous]
        [Route("Share/{id:int}")]
        public HttpResponseMessage ShareNewsletter(int id)
        {
            try
            {
                NewsletterDTO item = null;
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    item = dbContext.Database.SqlQuery<NewsletterDTO>(
                        "SELECT TOP 1 NewsletterId, Title, PublishDate, PdfUrl, ThumbnailUrl, Edition, PageCount, Status, CreatedOn, UpdatedOn FROM dbo.Newsletter WHERE NewsletterId = @id",
                        new SqlParameter("@id", id)
                    ).FirstOrDefault();
                }

                if (item == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound, "Newsletter not found.");
                }

                string dateStr = item.PublishDate.ToString("dd/MM/yyyy");
                string edition = !string.IsNullOrWhiteSpace(item.Edition) ? item.Edition : "मुख्य संस्करण";
                string title = !string.IsNullOrWhiteSpace(item.Title)
                    ? item.Title + " (" + dateStr + ")"
                    : "सत्य संवाद दैनिक ई-अख़बार - " + dateStr + " (" + edition + ")";

                string description = "सत्य संवाद दैनिक ई-अख़बार (" + dateStr + ") का डिजिटल संस्करण पढ़ें व डाउनलोड करें।";

                string imageUrl = "";
                if (!string.IsNullOrWhiteSpace(item.ThumbnailUrl))
                {
                    imageUrl = FormatPdfUrl(item.ThumbnailUrl);
                }
                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    imageUrl = "https://satyasamwad.com/assets/img/satya_samwad_logo.png";
                }
                if (imageUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
                {
                    imageUrl = "https://" + imageUrl.Substring(7);
                }

                string redirectUrl = !string.IsNullOrWhiteSpace(item.PdfUrl)
                    ? FormatPdfUrl(item.PdfUrl)
                    : "https://satyasamwad.com/#/newsletter";

                string shareUrl = "";
                if (HttpContext.Current != null && HttpContext.Current.Request != null)
                {
                    shareUrl = HttpContext.Current.Request.Url.AbsoluteUri;
                }
                if (string.IsNullOrEmpty(shareUrl) || shareUrl.IndexOf("localhost", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    shareUrl = "https://api.satyasamwad.com/api/Newsletter/Share/" + id;
                }
                else if (shareUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
                {
                    shareUrl = "https://" + shareUrl.Substring(7);
                }

                string mimeType = "image/jpeg";
                if (imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase)) mimeType = "image/png";
                else if (imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase)) mimeType = "image/webp";

                string safeTitle = HttpUtility.HtmlAttributeEncode(title);
                string safeDescription = HttpUtility.HtmlAttributeEncode(description);
                string safeImageUrl = HttpUtility.HtmlAttributeEncode(imageUrl);
                string safeShareUrl = HttpUtility.HtmlAttributeEncode(shareUrl);
                string safeRedirectUrl = HttpUtility.HtmlAttributeEncode(redirectUrl);

                StringBuilder sb = new StringBuilder();
                sb.AppendLine("<!DOCTYPE html>");
                sb.AppendLine("<html lang=\"hi\">");
                sb.AppendLine("<head>");
                sb.AppendLine("<meta charset=\"UTF-8\" />");
                sb.AppendLine("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />");
                sb.AppendLine("<title>" + safeTitle + " - सत्य संवाद</title>");

                // Open Graph
                sb.AppendLine("<meta property=\"og:type\" content=\"article\" />");
                sb.AppendLine("<meta property=\"og:site_name\" content=\"सत्य संवाद\" />");
                sb.AppendLine("<meta property=\"og:title\" content=\"" + safeTitle + "\" />");
                sb.AppendLine("<meta property=\"og:description\" content=\"" + safeDescription + "\" />");
                sb.AppendLine("<meta property=\"og:url\" content=\"" + safeShareUrl + "\" />");
                sb.AppendLine("<meta property=\"og:image\" content=\"" + safeImageUrl + "\" />");
                sb.AppendLine("<meta property=\"og:image:url\" content=\"" + safeImageUrl + "\" />");
                sb.AppendLine("<meta property=\"og:image:secure_url\" content=\"" + safeImageUrl + "\" />");
                sb.AppendLine("<meta property=\"og:image:type\" content=\"" + mimeType + "\" />");
                sb.AppendLine("<meta property=\"og:image:width\" content=\"1200\" />");
                sb.AppendLine("<meta property=\"og:image:height\" content=\"630\" />");
                sb.AppendLine("<meta property=\"og:image:alt\" content=\"" + safeTitle + "\" />");

                // Twitter
                sb.AppendLine("<meta name=\"twitter:card\" content=\"summary_large_image\" />");
                sb.AppendLine("<meta name=\"twitter:title\" content=\"" + safeTitle + "\" />");
                sb.AppendLine("<meta name=\"twitter:description\" content=\"" + safeDescription + "\" />");
                sb.AppendLine("<meta name=\"twitter:image\" content=\"" + safeImageUrl + "\" />");

                // Canonical
                sb.AppendLine("<link rel=\"canonical\" href=\"" + safeShareUrl + "\" />");

                // Instant redirection for real human visitors
                sb.AppendLine("<script type=\"text/javascript\">");
                sb.AppendLine("  window.location.replace(\"" + safeRedirectUrl + "\");");
                sb.AppendLine("</script>");
                sb.AppendLine("<meta http-equiv=\"refresh\" content=\"0;url=" + safeRedirectUrl + "\" />");

                sb.AppendLine("</head>");
                sb.AppendLine("<body style=\"font-family:Arial,sans-serif;text-align:center;padding:40px;\">");
                sb.AppendLine("<h1>" + safeTitle + "</h1>");
                sb.AppendLine("<p>ई-अख़बार पढ़ने व डाउनलोड करने के लिए आगे बढ़ें...</p>");
                sb.AppendLine("<p><a href=\"" + safeRedirectUrl + "\" style=\"display:inline-block;padding:12px 24px;background:#c53030;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;\">अख़बार पढ़ें →</a></p>");
                sb.AppendLine("</body>");
                sb.AppendLine("</html>");

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(sb.ToString(), Encoding.UTF8, "text/html");
                response.Headers.CacheControl = new System.Net.Http.Headers.CacheControlHeaderValue
                {
                    Public = true,
                    MaxAge = TimeSpan.FromMinutes(10)
                };
                return response;
            }
            catch (Exception ex)
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error: " + ex.Message, Encoding.UTF8, "text/plain");
                return response;
            }
        }
    }
}
