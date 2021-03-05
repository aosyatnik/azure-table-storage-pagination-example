using Microsoft.Azure.Cosmos.Table;
using System;

namespace ExampleServerPagination
{
    public class LogEntity : TableEntity
    {
        public LogEntity()
        {
        }

        public LogEntity(DateTime date, string text)
        {
            PartitionKey = "log";
            // This will ensure that the latest entries are added to the top of the table instead of at the bottom of the table.
            // More info here: https://stackoverflow.com/questions/40593939/how-to-retrieve-latest-record-using-rowkey-or-timestamp-in-azure-table-storage
            RowKey = (DateTime.MaxValue.Ticks - date.Ticks).ToString("d19");
            Text = text;
        }

        public string Text { get; set; }
    }
}
