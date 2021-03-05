using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TableStorage.Abstractions.Factory;
using Microsoft.Extensions.Configuration;
using TableStorage.Abstractions.Store;
using System;

namespace ExampleServerPagination
{
    public class Functions
    {
        private readonly ITableStore<LogEntity> _table;

        public Functions(ITableStoreFactory tableFactory, IConfiguration config)
        {
            _table = tableFactory.CreateTableStore<LogEntity>("ExampleLogs", config["AzureWebJobsStorage"]);
            _table.CreateTable();
        }

        [FunctionName("GenerateData")]
        public IActionResult GenerateData(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "generate")] HttpRequest req)
        {
            for (var i = 0; i < 100; i++)
            {
                _table.Insert(new LogEntity(DateTime.UtcNow, $"Log ¹ {i}"));
            }
            return new OkObjectResult("Created 100 logs!");
        }

        [FunctionName("GetData")]
        public IActionResult GetData(
             [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "logs")] HttpRequest req)
        {
            var continuationToken = req.Query["continuationToken"];
            int pageSize;
            if (!int.TryParse(req.Query["pageSize"], out pageSize))
            {
                pageSize = 10;
            }

            var logs = _table.GetByPartitionKeyPaged("log", pageSize, continuationToken);
            return new OkObjectResult(logs);
        }
    }
}
