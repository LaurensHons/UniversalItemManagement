using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class FlattenFieldValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_BooleanValue_BooleanValueId",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_DateValue_DateValueId",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_TextValue_TextValueId",
                table: "FieldValues");

            migrationBuilder.DropTable(
                name: "BooleanValue");

            migrationBuilder.DropTable(
                name: "DateValue");

            migrationBuilder.DropTable(
                name: "TextValue");

            migrationBuilder.DropIndex(
                name: "IX_FieldValues_BooleanValueId",
                table: "FieldValues");

            migrationBuilder.DropIndex(
                name: "IX_FieldValues_DateValueId",
                table: "FieldValues");

            migrationBuilder.DropIndex(
                name: "IX_FieldValues_TextValueId",
                table: "FieldValues");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("8364a22a-a347-4a95-a869-725f9ff3e27f"));

            migrationBuilder.DropColumn(
                name: "BooleanValueId",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "DateValueId",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "TextValueId",
                table: "FieldValues");

            migrationBuilder.AddColumn<bool>(
                name: "BooleanValue",
                table: "FieldValues",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateValue",
                table: "FieldValues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextValue",
                table: "FieldValues",
                type: "text",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("4b8d7f95-6fce-4ce2-996b-6913db9b4145"), null, new DateTime(2026, 2, 28, 20, 19, 21, 254, DateTimeKind.Utc).AddTicks(7244), "Bla", null, new DateTime(2026, 2, 28, 20, 19, 21, 254, DateTimeKind.Utc).AddTicks(7430), "Test" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("4b8d7f95-6fce-4ce2-996b-6913db9b4145"));

            migrationBuilder.DropColumn(
                name: "BooleanValue",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "DateValue",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "TextValue",
                table: "FieldValues");

            migrationBuilder.AddColumn<Guid>(
                name: "BooleanValueId",
                table: "FieldValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DateValueId",
                table: "FieldValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TextValueId",
                table: "FieldValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BooleanValue",
                columns: table => new
                {
                    ValueId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BooleanValue", x => x.ValueId);
                });

            migrationBuilder.CreateTable(
                name: "DateValue",
                columns: table => new
                {
                    ValueId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DateValue", x => x.ValueId);
                });

            migrationBuilder.CreateTable(
                name: "TextValue",
                columns: table => new
                {
                    ValueId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextValue", x => x.ValueId);
                });

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("8364a22a-a347-4a95-a869-725f9ff3e27f"), null, new DateTime(2026, 2, 28, 16, 23, 11, 303, DateTimeKind.Utc).AddTicks(4496), "Bla", null, new DateTime(2026, 2, 28, 16, 23, 11, 303, DateTimeKind.Utc).AddTicks(4665), "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldValues_BooleanValueId",
                table: "FieldValues",
                column: "BooleanValueId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldValues_DateValueId",
                table: "FieldValues",
                column: "DateValueId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldValues_TextValueId",
                table: "FieldValues",
                column: "TextValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_BooleanValue_BooleanValueId",
                table: "FieldValues",
                column: "BooleanValueId",
                principalTable: "BooleanValue",
                principalColumn: "ValueId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_DateValue_DateValueId",
                table: "FieldValues",
                column: "DateValueId",
                principalTable: "DateValue",
                principalColumn: "ValueId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_TextValue_TextValueId",
                table: "FieldValues",
                column: "TextValueId",
                principalTable: "TextValue",
                principalColumn: "ValueId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
