using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CarTrack.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cars",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    make = table.Column<string>(type: "text", nullable: false),
                    model = table.Column<string>(type: "text", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    vin = table.Column<string>(type: "text", nullable: false),
                    license_plate = table.Column<string>(type: "text", nullable: false),
                    accent_id = table.Column<string>(type: "text", nullable: false),
                    is_electric = table.Column<bool>(type: "boolean", nullable: false),
                    favorite = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cars", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_kinds",
                columns: table => new
                {
                    slug = table.Column<string>(type: "text", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    is_system = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_document_kinds", x => x.slug);
                });

            migrationBuilder.CreateTable(
                name: "expense_categories",
                columns: table => new
                {
                    slug = table.Column<string>(type: "text", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    icon = table.Column<string>(type: "text", nullable: true),
                    is_system = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expense_categories", x => x.slug);
                });

            migrationBuilder.CreateTable(
                name: "pictures",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    object_key = table.Column<string>(type: "text", nullable: false),
                    mime_type = table.Column<string>(type: "text", nullable: false),
                    size_bytes = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pictures", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "expenses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    cost = table.Column<decimal>(type: "numeric", nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fuel_unit = table.Column<string>(type: "text", nullable: true),
                    fuel_quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    fuel_unit_price = table.Column<decimal>(type: "numeric", nullable: true),
                    odometer_km = table.Column<int>(type: "integer", nullable: true),
                    next_due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    other_description = table.Column<string>(type: "text", nullable: true),
                    part_name = table.Column<string>(type: "text", nullable: true),
                    parts_quantity = table.Column<int>(type: "integer", nullable: true),
                    repair_description = table.Column<string>(type: "text", nullable: true),
                    mechanic = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expenses", x => x.id);
                    table.ForeignKey(
                        name: "fk_expenses_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vehicle_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false),
                    insurer = table.Column<string>(type: "text", nullable: false),
                    policy_number = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    cost = table.Column<decimal>(type: "numeric", nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vehicle_documents", x => x.id);
                    table.ForeignKey(
                        name: "fk_vehicle_documents_document_kinds_kind",
                        column: x => x.kind,
                        principalTable: "document_kinds",
                        principalColumn: "slug",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "car_pictures",
                columns: table => new
                {
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    picture_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_car_pictures", x => new { x.car_id, x.picture_id });
                    table.ForeignKey(
                        name: "fk_car_pictures_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_car_pictures_pictures_picture_id",
                        column: x => x.picture_id,
                        principalTable: "pictures",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "car_shares",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    redeemed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    redeemed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_car_shares", x => x.id);
                    table.ForeignKey(
                        name: "fk_car_shares_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_car_shares_users_redeemed_by",
                        column: x => x.redeemed_by,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "car_users",
                columns: table => new
                {
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_car_users", x => new { x.car_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_car_users_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_car_users_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "car_documents",
                columns: table => new
                {
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_car_documents", x => new { x.car_id, x.document_id });
                    table.ForeignKey(
                        name: "fk_car_documents_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_car_documents_vehicle_documents_document_id",
                        column: x => x.document_id,
                        principalTable: "vehicle_documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "document_pictures",
                columns: table => new
                {
                    document_id = table.Column<Guid>(type: "uuid", nullable: false),
                    picture_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_document_pictures", x => new { x.document_id, x.picture_id });
                    table.ForeignKey(
                        name: "fk_document_pictures_pictures_picture_id",
                        column: x => x.picture_id,
                        principalTable: "pictures",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_document_pictures_vehicle_documents_document_id",
                        column: x => x.document_id,
                        principalTable: "vehicle_documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "document_kinds",
                columns: new[] { "slug", "is_system", "label", "sort_order" },
                values: new object[,]
                {
                    { "cartea-verde", true, "Cartea Verde", 1 },
                    { "rca", true, "RCA Insurance", 0 }
                });

            migrationBuilder.InsertData(
                table: "expense_categories",
                columns: new[] { "slug", "icon", "is_system", "label", "sort_order" },
                values: new object[,]
                {
                    { "fuel", null, true, "Fuel", 0 },
                    { "inspection", null, true, "Inspection", 3 },
                    { "other", null, true, "Other", 4 },
                    { "parts", null, true, "Parts", 2 },
                    { "repair", null, true, "Repair", 1 }
                });

            migrationBuilder.CreateIndex(
                name: "ix_car_documents_document_id",
                table: "car_documents",
                column: "document_id");

            migrationBuilder.CreateIndex(
                name: "ix_car_pictures_picture_id",
                table: "car_pictures",
                column: "picture_id");

            migrationBuilder.CreateIndex(
                name: "ix_car_shares_car_id",
                table: "car_shares",
                column: "car_id");

            migrationBuilder.CreateIndex(
                name: "ix_car_shares_redeemed_by",
                table: "car_shares",
                column: "redeemed_by");

            migrationBuilder.CreateIndex(
                name: "ix_car_shares_token",
                table: "car_shares",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_car_users_user_id",
                table: "car_users",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_document_pictures_picture_id",
                table: "document_pictures",
                column: "picture_id");

            migrationBuilder.CreateIndex(
                name: "ix_expenses_car_id",
                table: "expenses",
                column: "car_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token_hash",
                table: "refresh_tokens",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vehicle_documents_kind",
                table: "vehicle_documents",
                column: "kind");

            // expenses.category → expense_categories.slug FK (TPH discriminator doubles as category reference)
            migrationBuilder.Sql("""
                ALTER TABLE expenses
                ADD CONSTRAINT fk_expenses_category
                FOREIGN KEY (category) REFERENCES expense_categories(slug);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE expenses DROP CONSTRAINT IF EXISTS fk_expenses_category;");

            migrationBuilder.DropTable(
                name: "car_documents");

            migrationBuilder.DropTable(
                name: "car_pictures");

            migrationBuilder.DropTable(
                name: "car_shares");

            migrationBuilder.DropTable(
                name: "car_users");

            migrationBuilder.DropTable(
                name: "document_pictures");

            migrationBuilder.DropTable(
                name: "expense_categories");

            migrationBuilder.DropTable(
                name: "expenses");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "pictures");

            migrationBuilder.DropTable(
                name: "vehicle_documents");

            migrationBuilder.DropTable(
                name: "cars");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "document_kinds");
        }
    }
}
