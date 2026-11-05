using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTMNAdmin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBeallitasLabelek : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnyjaNeveLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnyjaNeveLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnyjaNeveLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FejlesztesFormajaLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FejlesztesFormajaLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FejlesztesFormajaLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ForgalmiSzamLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForgalmiSzamLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForgalmiSzamLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IktatoszamLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IktatoszamLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IktatoszamLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NevLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NevLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NevLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SzuletesiHelyEsIdoLabelek",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SzuletesiHelyEsIdoLabelek", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SzuletesiHelyEsIdoLabelek_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnyjaNeveLabelek_FejlesztopedagogusId",
                table: "AnyjaNeveLabelek",
                column: "FejlesztopedagogusId");

            migrationBuilder.CreateIndex(
                name: "IX_FejlesztesFormajaLabelek_FejlesztopedagogusId",
                table: "FejlesztesFormajaLabelek",
                column: "FejlesztopedagogusId");

            migrationBuilder.CreateIndex(
                name: "IX_ForgalmiSzamLabelek_FejlesztopedagogusId",
                table: "ForgalmiSzamLabelek",
                column: "FejlesztopedagogusId");

            migrationBuilder.CreateIndex(
                name: "IX_IktatoszamLabelek_FejlesztopedagogusId",
                table: "IktatoszamLabelek",
                column: "FejlesztopedagogusId");

            migrationBuilder.CreateIndex(
                name: "IX_NevLabelek_FejlesztopedagogusId",
                table: "NevLabelek",
                column: "FejlesztopedagogusId");

            migrationBuilder.CreateIndex(
                name: "IX_SzuletesiHelyEsIdoLabelek_FejlesztopedagogusId",
                table: "SzuletesiHelyEsIdoLabelek",
                column: "FejlesztopedagogusId");

            // Meglévő fejlesztőpedagógusok alapértelmezett labeljeinek feltöltése
            migrationBuilder.Sql("""
                INSERT INTO [NevLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'Név'),
                    (N'Gyermek neve'),
                    (N'Tanuló neve')
                ) AS v([Nev]);

                INSERT INTO [AnyjaNeveLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'Anyja neve'),
                    (N'Anyja leánykori neve')
                ) AS v([Nev]);

                INSERT INTO [SzuletesiHelyEsIdoLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'Születési helye és ideje'),
                    (N'Születési helye, ideje'),
                    (N'Születési hely és idő'),
                    (N'Születési hely, idő'),
                    (N'Születési idő és hely')
                ) AS v([Nev]);

                INSERT INTO [ForgalmiSzamLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'Forgalmi szám'),
                    (N'Forgalmi száma'),
                    (N'Forg. szám')
                ) AS v([Nev]);

                INSERT INTO [IktatoszamLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'Iktatószám'),
                    (N'Iktatószáma'),
                    (N'Ikt. szám'),
                    (N'Ikt. sz.')
                ) AS v([Nev]);

                INSERT INTO [FejlesztesFormajaLabelek] ([FejlesztopedagogusId], [Nev])
                SELECT p.[Id], v.[Nev]
                FROM [Fejlesztopedagogusok] p
                CROSS JOIN (VALUES
                    (N'egyéni'),
                    (N'csoportos')
                ) AS v([Nev]);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnyjaNeveLabelek");

            migrationBuilder.DropTable(
                name: "FejlesztesFormajaLabelek");

            migrationBuilder.DropTable(
                name: "ForgalmiSzamLabelek");

            migrationBuilder.DropTable(
                name: "IktatoszamLabelek");

            migrationBuilder.DropTable(
                name: "NevLabelek");

            migrationBuilder.DropTable(
                name: "SzuletesiHelyEsIdoLabelek");
        }
    }
}
