using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class RefactorSelectToMultiSelect : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_SelectOptions_SelectOptionId",
                table: "FieldValues");

            migrationBuilder.DropIndex(
                name: "IX_FieldValues_SelectOptionId",
                table: "FieldValues");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("9bfe86c3-3d9e-4620-b971-c98164d68021"));

            migrationBuilder.DropColumn(
                name: "SelectOptionId",
                table: "FieldValues");

            migrationBuilder.CreateTable(
                name: "FieldValueSelectOption",
                columns: table => new
                {
                    FieldValueId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedOptionsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldValueSelectOption", x => new { x.FieldValueId, x.SelectedOptionsId });
                    table.ForeignKey(
                        name: "FK_FieldValueSelectOption_FieldValues_FieldValueId",
                        column: x => x.FieldValueId,
                        principalTable: "FieldValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FieldValueSelectOption_SelectOptions_SelectedOptionsId",
                        column: x => x.SelectedOptionsId,
                        principalTable: "SelectOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("74f87dcf-8241-4419-b361-30fb9eb729f7"), null, new DateTime(2026, 2, 28, 22, 24, 20, 223, DateTimeKind.Utc).AddTicks(777), "Bla", null, new DateTime(2026, 2, 28, 22, 24, 20, 223, DateTimeKind.Utc).AddTicks(934), "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldValueSelectOption_SelectedOptionsId",
                table: "FieldValueSelectOption",
                column: "SelectedOptionsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FieldValueSelectOption");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("74f87dcf-8241-4419-b361-30fb9eb729f7"));

            migrationBuilder.AddColumn<Guid>(
                name: "SelectOptionId",
                table: "FieldValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("9bfe86c3-3d9e-4620-b971-c98164d68021"), null, new DateTime(2026, 2, 28, 21, 9, 14, 58, DateTimeKind.Utc).AddTicks(9159), "Bla", null, new DateTime(2026, 2, 28, 21, 9, 14, 58, DateTimeKind.Utc).AddTicks(9321), "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldValues_SelectOptionId",
                table: "FieldValues",
                column: "SelectOptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_SelectOptions_SelectOptionId",
                table: "FieldValues",
                column: "SelectOptionId",
                principalTable: "SelectOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
