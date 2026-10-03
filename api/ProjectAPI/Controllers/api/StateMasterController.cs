using Newtonsoft.Json;
using Project;
using System;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ProjectAPI.Controllers.api
{
    [RoutePrefix("api/StateMaster")]
    public class StateMasterController : ApiController
    {
        [HttpPost]
        [Route("StateMasterList")]
        public ExpandoObject StateMasterList(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                StateMaster model = JsonConvert.DeserializeObject<StateMaster>(decryptData);

                var list = (from s in dbContext.StateMasters
                            where (model.StateId == 0 || s.StateId == model.StateId)
                            && (model.Status == 0 || s.Status == model.Status)
                            orderby s.StateName
                            select new
                            {
                                s.StateId,
                                s.StateName,
                                s.StateCode,
                                s.Status,
                                s.UpdatedBy,
                                s.UpdatedDate
                            }).ToList();

                response.StateMasterList = list;
                response.Message = ConstantData.SuccessMessage;
            }
            catch (Exception ex)
            {
                response.Message = ex.Message;
            }
            return response;
        }

        [HttpPost]
        [Route("saveStateMaster")]
        public ExpandoObject SaveStateMaster(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                StateMaster model = JsonConvert.DeserializeObject<StateMaster>(decryptData);

                StateMaster state = null;
                if (model.StateId > 0)
                {
                    state = dbContext.StateMasters.Where(x => x.StateId == model.StateId).First();
                    state.StateName = model.StateName;
                    state.StateCode = model.StateCode;
                    state.Status = model.Status;
                    state.UpdatedBy = model.UpdatedBy;
                    state.UpdatedDate = DateTime.Now;
                }
                else
                {
                    state = model;
                    state.UpdatedDate = DateTime.Now;
                    dbContext.StateMasters.Add(state);
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
        [Route("deleteStateMaster")]
        public ExpandoObject DeleteStateMaster(RequestModel requestModel)
        {
            dynamic response = new ExpandoObject();
            try
            {
                newsportalEntities dbContext = new newsportalEntities();
                string AppKey = HttpContext.Current.Request.Headers["AppKey"];
                AppData.CheckAppKey(dbContext, AppKey, (byte)KeyFor.Admin);
                var decryptData = CryptoJs.Decrypt(requestModel.request, CryptoJs.key, CryptoJs.iv);
                StateMaster model = JsonConvert.DeserializeObject<StateMaster>(decryptData);

                var state = dbContext.StateMasters.Where(x => x.StateId == model.StateId).First();
                dbContext.StateMasters.Remove(state);
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
