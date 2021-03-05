using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using TableStorage.Abstractions.Factory;

[assembly: FunctionsStartup(typeof(ExampleServerPagination.Startup))]
namespace ExampleServerPagination
{
    /// <summary>
    /// Startup is used for dependency injection configuration.
    /// </summary>
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<ITableStoreFactory, TableStoreFactory>();
        }
    }
}
