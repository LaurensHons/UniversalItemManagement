using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class AddNumberAndSelectFieldTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("4b8d7f95-6fce-4ce2-996b-6913db9b4145"));

            migrationBuilder.AddColumn<decimal>(
                name: "NumberValue",
                table: "FieldValues",
                type: "numeric(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SelectOptionId",
                table: "FieldValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SelectOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    FieldPropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SelectOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SelectOptions_FieldProperty_FieldPropertyId",
                        column: x => x.FieldPropertyId,
                        principalTable: "FieldProperty",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SelectOptions_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SelectOptions_Users_ModifiedById",
                        column: x => x.ModifiedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("9bfe86c3-3d9e-4620-b971-c98164d68021"), null, new DateTime(2026, 2, 28, 21, 9, 14, 58, DateTimeKind.Utc).AddTicks(9159), "Bla", null, new DateTime(2026, 2, 28, 21, 9, 14, 58, DateTimeKind.Utc).AddTicks(9321), "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldValues_SelectOptionId",
                table: "FieldValues",
                column: "SelectOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectOptions_CreatedById",
                table: "SelectOptions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_SelectOptions_FieldPropertyId",
                table: "SelectOptions",
                column: "FieldPropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectOptions_ModifiedById",
                table: "SelectOptions",
                column: "ModifiedById");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_SelectOptions_SelectOptionId",
                table: "FieldValues",
                column: "SelectOptionId",
                principalTable: "SelectOptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_SelectOptions_SelectOptionId",
                table: "FieldValues");

            migrationBuilder.DropTable(
                name: "SelectOptions");

            migrationBuilder.DropIndex(
                name: "IX_FieldValues_SelectOptionId",
                table: "FieldValues");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("9bfe86c3-3d9e-4620-b971-c98164d68021"));

            migrationBuilder.DropColumn(
                name: "NumberValue",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "SelectOptionId",
                table: "FieldValues");

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("4b8d7f95-6fce-4ce2-996b-6913db9b4145"), null, new DateTime(2026, 2, 28, 20, 19, 21, 254, DateTimeKind.Utc).AddTicks(7244), "Bla", null, new DateTime(2026, 2, 28, 20, 19, 21, 254, DateTimeKind.Utc).AddTicks(7430), "Test" });
        }
    }
}
