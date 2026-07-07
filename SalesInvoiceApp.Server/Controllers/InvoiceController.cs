using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesInvoiceApp.Server.Data;
using SalesInvoiceApp.Server.Models;

namespace SalesInvoiceApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _db;

        public InvoiceController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> SaveInvoice([FromBody] InvoiceHeader invoice)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (invoice.Items == null || !invoice.Items.Any())
                return BadRequest(new { message = "At least one item is required." });

            foreach (var item in invoice.Items)
            {
                item.Amount = item.Qty * item.MRP;
                item.Id = 0; // ensure insert, not update
            }
            invoice.Id = 0;

            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                _db.InvoiceHeaders.Add(invoice);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Invoice saved successfully.", id = invoice.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Failed to save invoice.", detail = ex.Message });
            }
        }

        [HttpGet("salesreport")]
        public async Task<IActionResult> GetSalesReport()
        {
            var report = await _db.InvoiceItems
                .Include(i => i.InvoiceHeader)
                .OrderByDescending(i => i.InvoiceHeader!.InvoiceDate)
                .Select(i => new
                {
                    invoiceDate = i.InvoiceHeader!.InvoiceDate.ToString("yyyy-MM-dd"),
                    customerName = i.InvoiceHeader.CustomerName,
                    itemName = i.ItemName,
                    qty = i.Qty,
                    mrp = i.MRP,
                    amount = i.Amount
                })
                .ToListAsync();

            return Ok(report);
        }
    }
}
