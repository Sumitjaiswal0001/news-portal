using Newtonsoft.Json;
using Project;
using System;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/LoginLog")]
    public class LoginLogController : ApiController
    {
        [HttpPost]
        [Route("LoginLogList")]
        public ExpandoObject LoginLogList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                LoginLog model = JsonConvert.DeserializeObject<LoginLog>(decryptData);

                var list = (from l in dbContext.LoginLogs
                            where (model.LoginLogId == 0 || l.LoginLogId == model.LoginLogId)
                            && (string.IsNullOrEmpty(model.UserName) || l.UserName.Contains(model.UserName))
                            orderby l.LoginTime descending
                            select new
                            {
                                l.LoginLogId,
                                l.UserName,
                                l.ClientBrowser,
                                l.LoginDevice,
                                l.IPAddress,
                                l.ReferrerUrl,
                                l.LoginResult,
                                l.LoginTime,
                                l.LastUpdatedOn,
                                l.UserType,
                                l.GoogleLocation,
                                l.IMEINo
                            }).ToList();

                response.LoginLogList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }
    }
}
