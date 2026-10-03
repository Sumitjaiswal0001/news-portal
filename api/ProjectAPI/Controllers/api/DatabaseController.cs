using Newtonsoft.Json;
using Project;
using System;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/Database")]
    public class DatabaseController : ApiController
    {
        [HttpPost]
        [Route("DatabaseList")]
        public ExpandoObject DatabaseList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Database model = JsonConvert.DeserializeObject<Database>(decryptData);

                var list = (from d in dbContext.Databases
                            join s in dbContext.Staffs on d.CreatedBy equals s.StaffId into sj
                            from s in sj.DefaultIfEmpty()
                            where (model.DatabaseId == 0 || d.DatabaseId == model.DatabaseId)
                            && (model.Status == 0 || d.Status == model.Status)
                            orderby d.DatabaseName
                            select new
                            {
                                d.DatabaseId,
                                d.DatabaseName,
                                d.Status,
                                d.CreatedBy,
                                StaffName = s != null ? s.StaffName : "",
                                d.CreatedOn,
                                d.UpdatedBy,
                                d.UpdatedOn
                            }).ToList();

                response.DatabaseList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("saveDatabase")]
        public ExpandoObject SaveDatabase(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Database model = JsonConvert.DeserializeObject<Database>(decryptData);

                Database db = null;
                if (model.DatabaseId > 0)
                {
                    db = dbContext.Databases.Where(x => x.DatabaseId == model.DatabaseId).First();
                    db.DatabaseName = model.DatabaseName;
                    db.Status = model.Status;
                    db.UpdatedBy = model.UpdatedBy;
                    db.UpdatedOn = DateTime.Now;
                }
                else
                {
                    db = model;
                    if (db.CreatedOn == default(DateTime))
                        db.CreatedOn = DateTime.Now;
                    dbContext.Databases.Add(db);
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
        [Route("deleteDatabase")]
        public ExpandoObject DeleteDatabase(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Database model = JsonConvert.DeserializeObject<Database>(decryptData);

                var db = dbContext.Databases.Where(x => x.DatabaseId == model.DatabaseId).First();
                dbContext.Databases.Remove(db);
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
