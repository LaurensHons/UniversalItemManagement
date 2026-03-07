using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMultiSelectToFieldProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("74f87dcf-8241-4419-b361-30fb9eb729f7"));

            migrationBuilder.AddColumn<bool>(
                name: "IsMultiSelect",
                table: "FieldProperty",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("a05d2c91-0824-49f9-91c5-3e412c76cf29"), null, new DateTime(2026, 2, 28, 22, 51, 53, 102, DateTimeKind.Utc).AddTicks(5255), "Bla", null, new DateTime(2026, 2, 28, 22, 51, 53, 102, DateTimeKind.Utc).AddTicks(5418), "Test" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("a05d2c91-0824-49f9-91c5-3e412c76cf29"));

            migrationBuilder.DropColumn(
                name: "IsMultiSelect",
                table: "FieldProperty");

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("74f87dcf-8241-4419-b361-30fb9eb729f7"), null, new DateTime(2026, 2, 28, 22, 24, 20, 223, DateTimeKind.Utc).AddTicks(777), "Bla", null, new DateTime(2026, 2, 28, 22, 24, 20, 223, DateTimeKind.Utc).AddTicks(934), "Test" });
        }
    }
}
