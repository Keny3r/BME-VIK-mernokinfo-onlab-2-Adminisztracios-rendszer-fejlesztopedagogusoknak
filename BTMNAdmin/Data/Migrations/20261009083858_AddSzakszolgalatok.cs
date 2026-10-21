using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTMNAdmin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSzakszolgalatok : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Szakszolgalatok",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FejlesztopedagogusId = table.Column<int>(type: "int", nullable: false),
                    Nev = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Szakszolgalatok", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Szakszolgalatok_Fejlesztopedagogusok_FejlesztopedagogusId",
                        column: x => x.FejlesztopedagogusId,
                        principalTable: "Fejlesztopedagogusok",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Szakszolgalatok_FejlesztopedagogusId",
                table: "Szakszolgalatok",
                column: "FejlesztopedagogusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Szakszolgalatok");
        }
    }
}
