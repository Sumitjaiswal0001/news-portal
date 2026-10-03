using Newtonsoft.Json;
using Project;
using System;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/Backup")]
    public class BackupController : ApiController
    {
        [HttpPost]
        [Route("BackupList")]
        public ExpandoObject BackupList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Backup model = JsonConvert.DeserializeObject<Backup>(decryptData);

                var list = (from b in dbContext.Backups
                            join s in dbContext.Staffs on b.CreatedBy equals s.StaffId into sj
                            from s in sj.DefaultIfEmpty()
                            where (model.BackupId == 0 || b.BackupId == model.BackupId)
                            orderby b.CreatedOn descending
                            select new
                            {
                                b.BackupId,
                                b.BackupFile,
                                b.CreatedBy,
                                StaffName = s != null ? s.StaffName : "",
                                b.CreatedOn,
                                b.BackupStatus,
                                b.ErrorMessage,
                                b.BackupDatabase
                            }).ToList();

                response.BackupList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("saveBackup")]
        public ExpandoObject SaveBackup(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Backup model = JsonConvert.DeserializeObject<Backup>(decryptData);

                Backup backup = null;
                if (model.BackupId > 0)
                {
                    backup = dbContext.Backups.Where(x => x.BackupId == model.BackupId).First();
                    backup.BackupFile = model.BackupFile;
                    backup.BackupStatus = model.BackupStatus;
                    backup.ErrorMessage = model.ErrorMessage;
                    backup.BackupDatabase = model.BackupDatabase;
                }
                else
                {
                    backup = model;
                    if (backup.CreatedOn == default(DateTime))
                        backup.CreatedOn = DateTime.Now;
                    dbContext.Backups.Add(backup);
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
        [Route("deleteBackup")]
        public ExpandoObject DeleteBackup(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                Backup model = JsonConvert.DeserializeObject<Backup>(decryptData);

                var backup = dbContext.Backups.Where(x => x.BackupId == model.BackupId).First();
                dbContext.Backups.Remove(backup);
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
