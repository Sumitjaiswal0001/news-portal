using Newtonsoft.Json;
using Project;
using ProjectAPI.Models;
using System;
using System.Data.Entity;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/NewsCategory")]
    public class NewsCategoryController : ApiController
    {
        [HttpPost]
        [Route("CategoryList")]
        public ExpandoObject CategoryList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                    AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                    var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                    NewsCategory model = JsonConvert.DeserializeObject<NewsCategory>(decryptData);

                    var list = (from c in dbContext.NewsCategories.AsNoTracking()
                                where (model.CategoryId == 0 || c.CategoryId == model.CategoryId)
                                && (model.Status == 0 || c.Status == model.Status)
                                orderby c.DisplayOrder
                                select new
                                {
                                    c.CategoryId,
                                    c.CategoryName,
                                    c.CategoryNameHindi,
                                    c.Slug,
                                    c.Icon,
                                    c.DisplayOrder,
                                    c.Status,
                                    c.CreatedOn
                                }).ToList();

                    response.CategoryList = list;
                    response.Message = ConstantData.SuccessMessage;
                }
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpGet]
        [Route("GetCategories")]
        public IHttpActionResult GetCategories()
        {
            try
            {
                string cacheKey = "categories_public";
                var cached = CacheService.Get<object>(cacheKey);
                if (cached != null)
                {
                    return Ok(new { success = true, data = cached });
                }

                using (newsportalEntities dbContext = new newsportalEntities())
                {
                    var list = dbContext.NewsCategories
                        .AsNoTracking()
                        .OrderBy(c => c.DisplayOrder)
                        .Select(c => new
                        {
                            c.CategoryId,
                            c.CategoryName,
                            c.CategoryNameHindi,
                            c.Slug,
                            c.Icon,
                            c.DisplayOrder,
                            c.Status
                        }).ToList();

                    CacheService.Set(cacheKey, list, 60);

                    return Ok(new { success = true, data = list });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("saveCategory")]
        public ExpandoObject SaveCategory(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                NewsCategory model = JsonConvert.DeserializeObject<NewsCategory>(decryptData);

                NewsCategory category = null;
                if (model.CategoryId > 0)
                {
                    category = dbContext.NewsCategories.Where(x => x.CategoryId == model.CategoryId).First();
                    category.CategoryName = model.CategoryName;
                    category.CategoryNameHindi = model.CategoryNameHindi;
                    category.Slug = model.Slug;
                    category.Icon = model.Icon;
                    category.DisplayOrder = model.DisplayOrder;
                    category.Status = model.Status;
                }
                else
                {
                    category = model;
                    if (category.CreatedOn == default(DateTime))
                        category.CreatedOn = DateTime.Now;
                    dbContext.NewsCategories.Add(category);
                }
                dbContext.SaveChanges();
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("IX"))
                    response.Message = "This record is already exist";
                else
                    response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("deleteCategory")]
        public ExpandoObject DeleteCategory(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                NewsCategory model = JsonConvert.DeserializeObject<NewsCategory>(decryptData);

                var category = dbContext.NewsCategories.Where(x => x.CategoryId == model.CategoryId).First();
                dbContext.NewsCategories.Remove(category);
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
