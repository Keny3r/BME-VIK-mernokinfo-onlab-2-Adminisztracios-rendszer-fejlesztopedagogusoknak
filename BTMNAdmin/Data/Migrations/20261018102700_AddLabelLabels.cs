using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTMNAdmin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLabelLabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FejlesztesiTeruletek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FejlesztesiTeruletek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FejlesztesiTeruletek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FejlesztesiCelok",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LabelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FejlesztesiCelok", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FejlesztesiCelok_FejlesztesiTeruletek_LabelId",
                        column: x => x.LabelId,
                        principalTable: "FejlesztesiTeruletek",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FejlesztesiEszkozok",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LabelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FejlesztesiEszkozok", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FejlesztesiEszkozok_FejlesztesiCelok_LabelId",
                        column: x => x.LabelId,
                        principalTable: "FejlesztesiCelok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FejlesztesiCelok_LabelId",
                table: "FejlesztesiCelok",
                column: "LabelId");

            migrationBuilder.CreateIndex(
                name: "IX_FejlesztesiEszkozok_LabelId",
                table: "FejlesztesiEszkozok",
                column: "LabelId");

            migrationBuilder.CreateIndex(
                name: "IX_FejlesztesiTeruletek_FejlesztopedagogusId",
                table: "FejlesztesiTeruletek",
                column: "FejlesztopedagogusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FejlesztesiEszkozok");

            migrationBuilder.DropTable(
                name: "FejlesztesiCelok");

            migrationBuilder.DropTable(
                name: "FejlesztesiTeruletek");
        }
    }
}
