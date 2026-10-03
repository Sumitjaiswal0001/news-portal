using Newtonsoft.Json;
using Project;
using System;
using System.Data.Entity.Validation;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    public class CommentPostModel
    {
        public int ArticleId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string CommentText { get; set; }
    }

    [RoutePrefix("api/NewsComment")]
    public class NewsCommentController : ApiController
    {
        [HttpPost]
        [Route("CommentList")]
        public ExpandoObject CommentList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                NewsComment model = JsonConvert.DeserializeObject<NewsComment>(decryptData);

                var list = (from c in dbContext.NewsComments
                            join a in dbContext.NewsArticles on c.ArticleId equals a.ArticleId into aj
                            from a in aj.DefaultIfEmpty()
                            where (model.CommentId == 0 || c.CommentId == model.CommentId)
                            && (model.ArticleId == 0 || c.ArticleId == model.ArticleId)
                            orderby c.CreatedOn descending
                            select new
                            {
                                c.CommentId,
                                c.ArticleId,
                                ArticleTitle = a != null ? a.Title : "",
                                c.UserName,
                                c.UserEmail,
                                c.CommentText,
                                c.IsApproved,
                                c.CreatedOn
                            }).ToList();

                response.CommentList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpGet]
        [Route("GetComments/{articleId}")]
        public IHttpActionResult GetComments(int articleId)
        {
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                var query = dbContext.NewsComments.AsQueryable();

                if (articleId > 0)
                {
                    query = query.Where(c => c.ArticleId == articleId && c.IsApproved);
                }

                var list = query
                    .OrderByDescending(c => c.CreatedOn)
                    .Select(c => new
                    {
                        c.CommentId,
                        c.ArticleId,
                        c.UserName,
                        c.UserEmail,
                        c.CommentText,
                        c.IsApproved,
                        c.CreatedOn
                    }).ToList();

                return Ok(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("PostComment")]
        public IHttpActionResult PostComment([FromBody] CommentPostModel model)
        {
            try
            {
                if (model == null || string.IsNullOrWhiteSpace(model.CommentText) || string.IsNullOrWhiteSpace(model.UserName))
                {
                    return BadRequest("Name and Comment Text are required.");
                }

                newsportalEntities dbContext = new newsportalEntities();
                NewsComment comment = new NewsComment
                {
                    ArticleId = model.ArticleId,
                    UserName = model.UserName.Trim(),
                    UserEmail = model.UserEmail != null ? model.UserEmail.Trim() : "",
                    CommentText = model.CommentText.Trim(),
                    IsApproved = true,
                    CreatedOn = DateTime.Now
                };

                dbContext.NewsComments.Add(comment);
                dbContext.SaveChanges();

                return Ok(new
                {
                    success = true,
                    message = "Comment submitted successfully.",
                    data = new
                    {
                        comment.CommentId,
                        comment.ArticleId,
                        comment.UserName,
                        comment.UserEmail,
                        comment.CommentText,
                        comment.IsApproved,
                        comment.CreatedOn
                    }
                });
            }
            catch (DbEntityValidationException ex)
            {
                var errorMessages = ex.EntityValidationErrors
                        .SelectMany(x => x.ValidationErrors)
                        .Select(x => $"Field '{x.PropertyName}': {x.ErrorMessage}");
                return BadRequest("Validation Error: " + string.Join("; ", errorMessages));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("saveComment")]
        public ExpandoObject SaveComment(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                NewsComment model = JsonConvert.DeserializeObject<NewsComment>(decryptData);

                NewsComment comment = null;
                if (model.CommentId > 0)
                {
                    comment = dbContext.NewsComments.Where(x => x.CommentId == model.CommentId).First();
                    comment.UserName = model.UserName;
                    comment.UserEmail = model.UserEmail;
                    comment.CommentText = model.CommentText;
                    comment.IsApproved = model.IsApproved;
                }
                else
                {
                    comment = model;
                    if (comment.CreatedOn == default(DateTime))
                        comment.CreatedOn = DateTime.Now;
                    dbContext.NewsComments.Add(comment);
                }
                dbContext.SaveChanges();
                response.Message = ConstantData.SuccessMessage;
            }
            catch (DbEntityValidationException ex)
            {
                var errorMessages = ex.EntityValidationErrors
                        .SelectMany(x => x.ValidationErrors)
                        .Select(x => $"Field '{x.PropertyName}': {x.ErrorMessage}");

                response.Message = "Validation Error: " + string.Join("; ", errorMessages);
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("deleteComment")]
        public ExpandoObject DeleteComment(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                NewsComment model = JsonConvert.DeserializeObject<NewsComment>(decryptData);

                var comment = dbContext.NewsComments.Where(x => x.CommentId == model.CommentId).First();
                dbContext.NewsComments.Remove(comment);
                dbContext.SaveChanges();
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("FK"))
                    response.Message = "This record is in use.so can't delete.";
                else
                    response.Message = ex.Message;
            }
            return response;
        }
    }
}
