using Microsoft.EntityFrameworkCore;
using UniversalItemManagement.EF;
using UniversalItemManagement.EF.Domain.Infrastructure;
using UniversalItemManagement.Server;
using UniversalItemManagement.Server.Services.Contracts;
using UniversalItemManagement.Server.Services;
using UniversalItemManagement.Server.Services.BackGroundTasks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddEntityFramework();
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
        policy.WithOrigins("https://localhost:63820").AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors("FrontEndUI");

app.MapFallbackToFile("/index.html");

app.Run();
