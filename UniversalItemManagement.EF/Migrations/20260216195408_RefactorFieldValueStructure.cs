using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class RefactorFieldValueStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Field_BooleanValue_BooleanValueId",
                table: "Field");

            migrationBuilder.DropForeignKey(
                name: "FK_Field_DateValue_DateValueId",
                table: "Field");

            migrationBuilder.DropForeignKey(
                name: "FK_Field_FieldValue_TextValueId",
                table: "Field");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValue_Users_CreatedById",
                table: "FieldValue");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValue_Users_ModifiedById",
                table: "FieldValue");

            migrationBuilder.DropIndex(
                name: "IX_Field_BooleanValueId",
                table: "Field");

            migrationBuilder.DropIndex(
                name: "IX_Field_DateValueId",
                table: "Field");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DateValue",
                table: "DateValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BooleanValue",
                table: "BooleanValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FieldValue",
                table: "FieldValue");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("ea05c8d1-b9ed-46b7-8152-f86540cf4120"));

            migrationBuilder.DropColumn(
                name: "BooleanValueId",
                table: "Field");

            migrationBuilder.DropColumn(
                name: "DateValueId",
                table: "Field");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "DateValue");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "BooleanValue");

            migrationBuilder.DropColumn(
                name: "TextValue",
                table: "FieldValue");

            migrationBuilder.DropColumn(
                name: "ValueId",
                table: "FieldValue");

            migrationBuilder.RenameTable(
                name: "FieldValue",
                newName: "FieldValues");

            migrationBuilder.RenameColumn(
                name: "TextValueId",
                table: "Field",
                newName: "ValueId");

            migrationBuilder.RenameIndex(
                name: "IX_Field_TextValueId",
                table: "Field",
                newName: "IX_Field_ValueId");

            migrationBuilder.RenameIndex(
                name: "IX_FieldValue_ModifiedById",
                table: "FieldValues",
                newName: "IX_FieldValues_ModifiedById");

            migrationBuilder.RenameIndex(
                name: "IX_FieldValue_CreatedById",
                table: "FieldValues",
                newName: "IX_FieldValues_CreatedById");

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_DateValue",
                table: "DateValue",
                column: "ValueId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BooleanValue",
                table: "BooleanValue",
                column: "ValueId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FieldValues",
                table: "FieldValues",
                column: "Id");

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
                values: new object[] { new Guid("ddcc75fb-a34b-4a30-b408-002443ddfbdb"), null, new DateTime(2026, 2, 16, 19, 54, 7, 699, DateTimeKind.Utc).AddTicks(9106), "Bla", null, new DateTime(2026, 2, 16, 19, 54, 7, 699, DateTimeKind.Utc).AddTicks(9372), "Test" });

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
                name: "FK_Field_FieldValues_ValueId",
                table: "Field",
                column: "ValueId",
                principalTable: "FieldValues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_Users_CreatedById",
                table: "FieldValues",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValues_Users_ModifiedById",
                table: "FieldValues",
                column: "ModifiedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Field_FieldValues_ValueId",
                table: "Field");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_BooleanValue_BooleanValueId",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_DateValue_DateValueId",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_TextValue_TextValueId",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_Users_CreatedById",
                table: "FieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldValues_Users_ModifiedById",
                table: "FieldValues");

            migrationBuilder.DropTable(
                name: "TextValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DateValue",
                table: "DateValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BooleanValue",
                table: "BooleanValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FieldValues",
                table: "FieldValues");

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
                keyValue: new Guid("ddcc75fb-a34b-4a30-b408-002443ddfbdb"));

            migrationBuilder.DropColumn(
                name: "BooleanValueId",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "DateValueId",
                table: "FieldValues");

            migrationBuilder.DropColumn(
                name: "TextValueId",
                table: "FieldValues");

            migrationBuilder.RenameTable(
                name: "FieldValues",
                newName: "FieldValue");

            migrationBuilder.RenameColumn(
                name: "ValueId",
                table: "Field",
                newName: "TextValueId");

            migrationBuilder.RenameIndex(
                name: "IX_Field_ValueId",
                table: "Field",
                newName: "IX_Field_TextValueId");

            migrationBuilder.RenameIndex(
                name: "IX_FieldValues_ModifiedById",
                table: "FieldValue",
                newName: "IX_FieldValue_ModifiedById");

            migrationBuilder.RenameIndex(
                name: "IX_FieldValues_CreatedById",
                table: "FieldValue",
                newName: "IX_FieldValue_CreatedById");

            migrationBuilder.AddColumn<Guid>(
                name: "BooleanValueId",
                table: "Field",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DateValueId",
                table: "Field",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "DateValue",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "BooleanValue",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "TextValue",
                table: "FieldValue",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ValueId",
                table: "FieldValue",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DateValue",
                table: "DateValue",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BooleanValue",
                table: "BooleanValue",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FieldValue",
                table: "FieldValue",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "Description", "ModifiedById", "Name" },
                values: new object[] { new Guid("ea05c8d1-b9ed-46b7-8152-f86540cf4120"), null, "Bla", null, "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_Field_BooleanValueId",
                table: "Field",
                column: "BooleanValueId");

            migrationBuilder.CreateIndex(
                name: "IX_Field_DateValueId",
                table: "Field",
                column: "DateValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Field_BooleanValue_BooleanValueId",
                table: "Field",
                column: "BooleanValueId",
                principalTable: "BooleanValue",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Field_DateValue_DateValueId",
                table: "Field",
                column: "DateValueId",
                principalTable: "DateValue",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Field_FieldValue_TextValueId",
                table: "Field",
                column: "TextValueId",
                principalTable: "FieldValue",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValue_Users_CreatedById",
                table: "FieldValue",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldValue_Users_ModifiedById",
                table: "FieldValue",
                column: "ModifiedById",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
