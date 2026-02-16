using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.Server;
using UniversalItemManagement.Server.Services.Contracts;
using UniversalItemManagement.Server.Services;
using UniversalItemManagement.Server.Services.BackGroundTasks;
using UniversalItemManagement.Server.Middleware;
using UniversalItemManagement.Server.Hubs;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Don't register Entity Framework in test environment - tests will configure their own database
if (builder.Environment.EnvironmentName != "Testing")
{
    builder.Services.AddEntityFramework();
}
builder.Services.AddServices();
builder.Services.AddHostedService<QueuedHostedService>();
builder.Services.AddSingleton<IBackgroundTaskQueue>(_ =>
{
    if (!int.TryParse(builder.Configuration["QueueCapacity"], out var queueCapacity))
    {
        queueCapacity = 100;
    }

    return new DefaultBackgroundTaskQueue(queueCapacity);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "FrontEndUI", policy =>
    {
        policy.WithOrigins(
            "https://127.0.0.1:63820", 
            "https://localhost:63820",
            "http://localhost:5232")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseWebSockets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.BuildEndpoints();

app.Use(async (context, next) =>
{
    var connectionId = context.Request.Headers[EntityHub.ConnectionCookieKey];
    if (!string.IsNullOrWhiteSpace(connectionId))
        context.RequestServices.GetRequiredService<HubConnectionService>().ConnectionId = connectionId;

    await next();
});

app.BuildApplication();
app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("FrontEndUI");
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();

// Make the implicit Program class public so integration tests can reference it
public partial class Program
{

}
