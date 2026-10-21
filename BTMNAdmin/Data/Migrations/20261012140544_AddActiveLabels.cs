using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BTMNAdmin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddActiveLabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActiveIskola",
                table: "Fejlesztopedagogusok",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActiveSzakszolgalat",
                table: "Fejlesztopedagogusok",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActiveTanev",
                table: "Fejlesztopedagogusok",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveIskola",
                table: "Fejlesztopedagogusok");

            migrationBuilder.DropColumn(
                name: "ActiveSzakszolgalat",
                table: "Fejlesztopedagogusok");

            migrationBuilder.DropColumn(
                name: "ActiveTanev",
                table: "Fejlesztopedagogusok");
        }
    }
}
