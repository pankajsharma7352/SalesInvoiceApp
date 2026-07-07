using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SalesInvoiceApp.Server.Models
{
    public class InvoiceHeader
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CustomerNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public DateTime InvoiceDate { get; set; }

        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }
}
