using Newtonsoft.Json;
using Project;
using System;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/App")]
    public class AppController : ApiController
    {
        [HttpPost]
        [Route("AppList")]
        public ExpandoObject AppList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                App model = JsonConvert.DeserializeObject<App>(decryptData);

                var list = (from a in dbContext.Apps
                            where (model.AppId == 0 || a.AppId == model.AppId)
                            && (model.Status == 0 || a.Status == model.Status)
                            select new
                            {
                                a.AppId,
                                a.AppKey,
                                a.KeyFor,
                                a.Status
                            }).ToList();

                response.AppList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("saveApp")]
        public ExpandoObject SaveApp(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                App model = JsonConvert.DeserializeObject<App>(decryptData);

                App app = null;
                if (model.AppId > 0)
                {
                    app = dbContext.Apps.Where(x => x.AppId == model.AppId).First();
                    app.AppKey = model.AppKey;
                    app.KeyFor = model.KeyFor;
                    app.Status = model.Status;
                }
                else
                {
                    app = model;
                    if (app.AppKey == Guid.Empty)
                        app.AppKey = Guid.NewGuid();
                    dbContext.Apps.Add(app);
                }
                dbContext.SaveChanges();
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("deleteApp")]
        public ExpandoObject DeleteApp(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                App model = JsonConvert.DeserializeObject<App>(decryptData);

                var app = dbContext.Apps.Where(x => x.AppId == model.AppId).First();
                dbContext.Apps.Remove(app);
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
