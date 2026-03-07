using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniversalItemManagement.EF.Migrations
{
    /// <inheritdoc />
    public partial class ExtractItemLists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Create new tables BEFORE dropping old ones (to allow data migration)
            migrationBuilder.AddColumn<Guid>(
                name: "ItemListId",
                table: "FieldProperty",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ItemLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemLists_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ItemLists_Users_ModifiedById",
                        column: x => x.ModifiedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListColumn",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsDisplayColumn = table.Column<bool>(type: "boolean", nullable: false),
                    ItemListId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListColumn", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListColumn_ItemLists_ItemListId",
                        column: x => x.ItemListId,
                        principalTable: "ItemLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListColumn_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListColumn_Users_ModifiedById",
                        column: x => x.ModifiedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    ItemListId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListItem_ItemLists_ItemListId",
                        column: x => x.ItemListId,
                        principalTable: "ItemLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListItem_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListItem_Users_ModifiedById",
                        column: x => x.ModifiedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FieldValueListItem",
                columns: table => new
                {
                    FieldValueId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedItemsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldValueListItem", x => new { x.FieldValueId, x.SelectedItemsId });
                    table.ForeignKey(
                        name: "FK_FieldValueListItem_FieldValues_FieldValueId",
                        column: x => x.FieldValueId,
                        principalTable: "FieldValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FieldValueListItem_ListItem_SelectedItemsId",
                        column: x => x.SelectedItemsId,
                        principalTable: "ListItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListItemValue",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListColumnId = table.Column<Guid>(type: "uuid", nullable: false),
                    ListItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    TextValue = table.Column<string>(type: "text", nullable: true),
                    BooleanValue = table.Column<bool>(type: "boolean", nullable: true),
                    DateValue = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NumberValue = table.Column<decimal>(type: "numeric(18,6)", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListItemValue", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListItemValue_ListColumn_ListColumnId",
                        column: x => x.ListColumnId,
                        principalTable: "ListColumn",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListItemValue_ListItem_ListItemId",
                        column: x => x.ListItemId,
                        principalTable: "ListItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListItemValue_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListItemValue_Users_ModifiedById",
                        column: x => x.ModifiedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_FieldProperty_ItemListId",
                table: "FieldProperty",
                column: "ItemListId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldValueListItem_SelectedItemsId",
                table: "FieldValueListItem",
                column: "SelectedItemsId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemLists_CreatedById",
                table: "ItemLists",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ItemLists_ModifiedById",
                table: "ItemLists",
                column: "ModifiedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListColumn_CreatedById",
                table: "ListColumn",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListColumn_ItemListId",
                table: "ListColumn",
                column: "ItemListId");

            migrationBuilder.CreateIndex(
                name: "IX_ListColumn_ModifiedById",
                table: "ListColumn",
                column: "ModifiedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_CreatedById",
                table: "ListItem",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_ItemListId",
                table: "ListItem",
                column: "ItemListId");

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_ModifiedById",
                table: "ListItem",
                column: "ModifiedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListItemValue_CreatedById",
                table: "ListItemValue",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListItemValue_ListColumnId",
                table: "ListItemValue",
                column: "ListColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_ListItemValue_ListItemId",
                table: "ListItemValue",
                column: "ListItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ListItemValue_ModifiedById",
                table: "ListItemValue",
                column: "ModifiedById");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldProperty_ItemLists_ItemListId",
                table: "FieldProperty",
                column: "ItemListId",
                principalTable: "ItemLists",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Step 2: Migrate data from SelectOptions → ItemList/ListItem/ListItemValue
            migrationBuilder.Sql(@"
                CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";

                -- Create an ItemList for each FieldProperty that has Type='Select', reusing FieldProperty.Id as ItemList.Id
                INSERT INTO ""ItemLists"" (""Id"", ""Name"", ""CreatedOn"", ""ModifiedOn"", ""CreatedById"", ""ModifiedById"")
                SELECT fp.""Id"", fp.""Name"" || ' List', fp.""CreatedOn"", fp.""ModifiedOn"", fp.""CreatedById"", fp.""ModifiedById""
                FROM ""FieldProperty"" fp
                WHERE fp.""Type"" = 'Select'
                  AND EXISTS (SELECT 1 FROM ""SelectOptions"" so WHERE so.""FieldPropertyId"" = fp.""Id"");

                -- Create a 'Name' display column for each ItemList
                INSERT INTO ""ListColumn"" (""Id"", ""Name"", ""Type"", ""Order"", ""IsDisplayColumn"", ""ItemListId"", ""CreatedOn"", ""ModifiedOn"")
                SELECT uuid_generate_v4(), 'Name', 'Text', 0, true, il.""Id"", NOW(), NOW()
                FROM ""ItemLists"" il;

                -- Create a 'Color' column for each ItemList
                INSERT INTO ""ListColumn"" (""Id"", ""Name"", ""Type"", ""Order"", ""IsDisplayColumn"", ""ItemListId"", ""CreatedOn"", ""ModifiedOn"")
                SELECT uuid_generate_v4(), 'Color', 'Text', 1, false, il.""Id"", NOW(), NOW()
                FROM ""ItemLists"" il;

                -- Migrate SelectOptions → ListItems (reuse SelectOption.Id as ListItem.Id)
                INSERT INTO ""ListItem"" (""Id"", ""Order"", ""Color"", ""ItemListId"", ""CreatedOn"", ""ModifiedOn"", ""CreatedById"", ""ModifiedById"")
                SELECT so.""Id"", so.""Order"", so.""Color"", so.""FieldPropertyId"", so.""CreatedOn"", so.""ModifiedOn"", so.""CreatedById"", so.""ModifiedById""
                FROM ""SelectOptions"" so;

                -- Create ListItemValues for the 'Name' column
                INSERT INTO ""ListItemValue"" (""Id"", ""ListColumnId"", ""ListItemId"", ""TextValue"", ""CreatedOn"", ""ModifiedOn"")
                SELECT uuid_generate_v4(), lc.""Id"", li.""Id"", so.""Name"", NOW(), NOW()
                FROM ""SelectOptions"" so
                JOIN ""ListItem"" li ON li.""Id"" = so.""Id""
                JOIN ""ListColumn"" lc ON lc.""ItemListId"" = so.""FieldPropertyId"" AND lc.""Name"" = 'Name';

                -- Create ListItemValues for the 'Color' column (only where Color is not null)
                INSERT INTO ""ListItemValue"" (""Id"", ""ListColumnId"", ""ListItemId"", ""TextValue"", ""CreatedOn"", ""ModifiedOn"")
                SELECT uuid_generate_v4(), lc.""Id"", li.""Id"", so.""Color"", NOW(), NOW()
                FROM ""SelectOptions"" so
                JOIN ""ListItem"" li ON li.""Id"" = so.""Id""
                JOIN ""ListColumn"" lc ON lc.""ItemListId"" = so.""FieldPropertyId"" AND lc.""Name"" = 'Color'
                WHERE so.""Color"" IS NOT NULL;

                -- Set FieldProperty.ItemListId for all Select properties
                UPDATE ""FieldProperty"" SET ""ItemListId"" = ""Id"" WHERE ""Type"" = 'Select'
                  AND EXISTS (SELECT 1 FROM ""ItemLists"" il WHERE il.""Id"" = ""FieldProperty"".""Id"");

                -- Migrate the M2M join table: FieldValueSelectOption → FieldValueListItem
                INSERT INTO ""FieldValueListItem"" (""FieldValueId"", ""SelectedItemsId"")
                SELECT ""FieldValueId"", ""SelectedOptionsId""
                FROM ""FieldValueSelectOption"";
            ");

            // Step 3: Drop old tables
            migrationBuilder.DropTable(
                name: "FieldValueSelectOption");

            migrationBuilder.DropTable(
                name: "SelectOptions");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("a05d2c91-0824-49f9-91c5-3e412c76cf29"));

            migrationBuilder.InsertData(
                table: "Records",
                columns: new[] { "Id", "CreatedById", "CreatedOn", "Description", "ModifiedById", "ModifiedOn", "Name" },
                values: new object[] { new Guid("1d3379f7-4eae-49ac-bbda-8ec6fd6bf061"), null, new DateTime(2026, 2, 28, 23, 36, 29, 249, DateTimeKind.Utc).AddTicks(1255), "Bla", null, new DateTime(2026, 2, 28, 23, 36, 29, 249, DateTimeKind.Utc).AddTicks(1415), "Test" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldProperty_ItemLists_ItemListId",
                table: "FieldProperty");

            migrationBuilder.DropTable(
                name: "FieldValueListItem");

            migrationBuilder.DropTable(
                name: "ListItemValue");

            migrationBuilder.DropTable(
                name: "ListColumn");

            migrationBuilder.DropTable(
                name: "ListItem");

            migrationBuilder.DropTable(
                name: "ItemLists");

            migrationBuilder.DropIndex(
                name: "IX_FieldProperty_ItemListId",
                table: "FieldProperty");

            migrationBuilder.DeleteData(
                table: "Records",
                keyColumn: "Id",
                keyValue: new Guid("1d3379f7-4eae-49ac-bbda-8ec6fd6bf061"));

            migrationBuilder.DropColumn(
                name: "ItemListId",
                table: "FieldProperty");

            migrationBuilder.CreateTable(
                name: "SelectOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    FieldPropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModifiedById = table.Column<Guid>(type: "uuid", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
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
                values: new object[] { new Guid("a05d2c91-0824-49f9-91c5-3e412c76cf29"), null, new DateTime(2026, 2, 28, 22, 51, 53, 102, DateTimeKind.Utc).AddTicks(5255), "Bla", null, new DateTime(2026, 2, 28, 22, 51, 53, 102, DateTimeKind.Utc).AddTicks(5418), "Test" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldValueSelectOption_SelectedOptionsId",
                table: "FieldValueSelectOption",
                column: "SelectedOptionsId");

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
        }
    }
}
