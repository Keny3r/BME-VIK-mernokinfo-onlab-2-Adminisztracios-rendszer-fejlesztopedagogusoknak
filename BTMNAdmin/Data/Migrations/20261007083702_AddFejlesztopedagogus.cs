using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTMNAdmin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFejlesztopedagogus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Fejlesztopedagogusok",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Nev = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fejlesztopedagogusok", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Fejlesztopedagogusok_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Fejlesztopedagogusok_ApplicationUserId",
                table: "Fejlesztopedagogusok",
                column: "ApplicationUserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Fejlesztopedagogusok");
        }
    }
}
