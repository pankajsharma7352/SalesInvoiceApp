using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SalesInvoiceApp.Server.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }

        public int InvoiceHeaderId { get; set; }

        [JsonIgnore]
        [ForeignKey(nameof(InvoiceHeaderId))]
        public InvoiceHeader? InvoiceHeader { get; set; }

        [Required]
        [MaxLength(50)]
        public string ItemNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Qty { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal MRP { get; set; }

        public decimal Amount { get; set; }
    }
}
