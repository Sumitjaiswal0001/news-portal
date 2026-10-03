<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web" %>
<script runat="server">
    protected string ArticleTitle = "सत्य संवाद - समाचार";
    protected string ArticleDescription = "झारखंड एवं देश की ताज़ा ख़बरें";
    protected string ArticleImage = "https://satyasamwad.com/assets/img/satya_samwad_logo.png";
    protected string RedirectUrl = "https://satyasamwad.com/";
    protected string CurrentShareUrl = "https://api.satyasamwad.com/share.aspx";

    protected void Page_Load(object sender, EventArgs e)
    {
        string idStr = Request.QueryString["id"];
        int articleId = 0;

        if (!string.IsNullOrEmpty(idStr) && int.TryParse(idStr, out articleId))
        {
            CurrentShareUrl = Request.Url != null ? Request.Url.AbsoluteUri : ("https://satyasamwad.com/share.aspx?id=" + articleId);
            RedirectUrl = "https://satyasamwad.com/#/article/" + articleId;
            try
            {
                string rawConn = "";
                if (ConfigurationManager.ConnectionStrings["newsportalEntities"] != null)
                {
                    rawConn = ConfigurationManager.ConnectionStrings["newsportalEntities"].ConnectionString;
                }
                else if (ConfigurationManager.ConnectionStrings["DefaultConnection"] != null)
                {
                    rawConn = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
                }

                string sqlConnStr = rawConn;
                if (rawConn.Contains("provider connection string="))
                {
                    int start = rawConn.IndexOf("provider connection string=\"") + 28;
                    int end = rawConn.LastIndexOf("\"");
                    if (start > 27 && end > start)
                    {
                        sqlConnStr = rawConn.Substring(start, end - start);
                    }
                }

                if (!string.IsNullOrEmpty(sqlConnStr))
                {
                    using (SqlConnection conn = new SqlConnection(sqlConnStr))
                    {
                        conn.Open();
                        using (SqlCommand cmd = new SqlCommand("SELECT Title, Subtitle, Summary, ThumbnailUrl FROM NewsArticle WHERE ArticleId = @id", conn))
                        {
                            cmd.Parameters.AddWithValue("@id", articleId);
                            using (SqlDataReader rdr = cmd.ExecuteReader())
                            {
                                if (rdr.Read())
                                {
                                    ArticleTitle = rdr["Title"] != DBNull.Value ? rdr["Title"].ToString() : ArticleTitle;
                                    string sub = rdr["Subtitle"] != DBNull.Value ? rdr["Subtitle"].ToString() : "";
                                    string sum = rdr["Summary"] != DBNull.Value ? rdr["Summary"].ToString() : "";
                                    ArticleDescription = !string.IsNullOrEmpty(sub) ? sub : (!string.IsNullOrEmpty(sum) ? sum : ArticleTitle);
                                    
                                    string thumb = rdr["ThumbnailUrl"] != DBNull.Value ? rdr["ThumbnailUrl"].ToString() : "";
                                    if (!string.IsNullOrEmpty(thumb))
                                    {
                                        if (thumb.StartsWith("http://") || thumb.StartsWith("https://"))
                                        {
                                            ArticleImage = thumb;
                                        }
                                        else
                                        {
                                            ArticleImage = "https://api.satyasamwad.com/" + thumb.TrimStart('/');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Fallback gracefully
            }

            // Fallback: If DB query didn't find it or no DB connection string, fetch from live API
            if (ArticleTitle == "सत्य संवाद - समाचार")
            {
                try
                {
                    using (var webClient = new System.Net.WebClient())
                    {
                        webClient.Encoding = System.Text.Encoding.UTF8;
                        string json = webClient.DownloadString("https://api.satyasamwad.com/api/NewsArticle/GetArticles");
                        var match = System.Text.RegularExpressions.Regex.Match(json, "\"ArticleId\":" + articleId + ",\"Title\":\"(.*?)\"");
                        if (match.Success)
                        {
                            ArticleTitle = System.Text.RegularExpressions.Regex.Unescape(match.Groups[1].Value);
                        }
                        var subMatch = System.Text.RegularExpressions.Regex.Match(json, "\"ArticleId\":" + articleId + @".*?\"Summary\":\"(.*?)\"");
                        if (subMatch.Success && !string.IsNullOrEmpty(subMatch.Groups[1].Value))
                        {
                            ArticleDescription = System.Text.RegularExpressions.Regex.Unescape(subMatch.Groups[1].Value);
                        }
                        else
                        {
                            ArticleDescription = ArticleTitle;
                        }
                        var imgMatch = System.Text.RegularExpressions.Regex.Match(json, "\"ArticleId\":" + articleId + @".*?\"ThumbnailUrl\":\"(.*?)\"");
                        if (imgMatch.Success)
                        {
                            string thumb = System.Text.RegularExpressions.Regex.Unescape(imgMatch.Groups[1].Value);
                            if (!string.IsNullOrEmpty(thumb))
                            {
                                ArticleImage = thumb.StartsWith("http") ? thumb : ("https://api.satyasamwad.com/" + thumb.TrimStart('/'));
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    // Default fallback
                }
            }
        }
    }
</script>
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="utf-8" />
    <title><%= HttpUtility.HtmlEncode(ArticleTitle) %> - सत्य संवाद</title>
    
    <link rel="canonical" href="<%= HttpUtility.HtmlEncode(CurrentShareUrl) %>" />
    
    <!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="सत्य संवाद" />
    <meta property="og:title" content="<%= HttpUtility.HtmlEncode(ArticleTitle) %>" />
    <meta property="og:description" content="<%= HttpUtility.HtmlEncode(ArticleDescription) %>" />
    <meta property="og:image" content="<%= HttpUtility.HtmlEncode(ArticleImage) %>" />
    <meta property="og:image:url" content="<%= HttpUtility.HtmlEncode(ArticleImage) %>" />
    <meta property="og:image:secure_url" content="<%= HttpUtility.HtmlEncode(ArticleImage) %>" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="<%= HttpUtility.HtmlEncode(CurrentShareUrl) %>" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<%= HttpUtility.HtmlEncode(ArticleTitle) %>" />
    <meta name="twitter:description" content="<%= HttpUtility.HtmlEncode(ArticleDescription) %>" />
    <meta name="twitter:image" content="<%= HttpUtility.HtmlEncode(ArticleImage) %>" />
    
    <!-- Instant human visitor redirect to Angular article page -->
    <script type="text/javascript">
        window.location.replace('<%= RedirectUrl %>');
    </script>
</head>
<body>
    <h2><%= HttpUtility.HtmlEncode(ArticleTitle) %></h2>
    <p>Redirecting to <a href="<%= RedirectUrl %>">full news story...</a></p>
</body>
</html>
