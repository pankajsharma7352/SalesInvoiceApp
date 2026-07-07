using Microsoft.EntityFrameworkCore;
using SalesInvoiceApp.Server.Models;

namespace SalesInvoiceApp.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<InvoiceHeader> InvoiceHeaders { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<InvoiceItem>(entity =>
            {
                entity.Property(e => e.Amount)
                      .HasColumnType("decimal(18,2)")
                      .ValueGeneratedNever();

                entity.Property(e => e.MRP)
                      .HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<InvoiceHeader>()
                .HasMany(h => h.Items)
                .WithOne(i => i.InvoiceHeader)
                .HasForeignKey(i => i.InvoiceHeaderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
