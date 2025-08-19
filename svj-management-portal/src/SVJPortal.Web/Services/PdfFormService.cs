using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using iText.Kernel.Pdf;
using iText.Forms;
using iText.Forms.Fields;

namespace SVJPortal.Web.Services
{
    public class PdfFormService
    {
        // Detekce polí v PDF šabloně
        public async Task<List<string>> DetectFieldsAsync(Stream pdfStream)
        {
            var fieldNames = new List<string>();
            using (var reader = new PdfReader(pdfStream))
            using (var pdfDoc = new PdfDocument(reader))
            {
                var form = PdfAcroForm.GetAcroForm(pdfDoc, false);
                if (form != null)
                {
                    foreach (var field in form.GetFormFields())
                    {
                        fieldNames.Add(field.Key);
                    }
                }
            }
            return fieldNames;
        }

        // Vyplnění PDF šablony daty
        public async Task<byte[]> FillPdfAsync(Stream pdfStream, Dictionary<string, string> fieldValues)
        {
            using (var reader = new PdfReader(pdfStream))
            using (var ms = new MemoryStream())
            using (var pdfDoc = new PdfDocument(reader, new PdfWriter(ms)))
            {
                var form = PdfAcroForm.GetAcroForm(pdfDoc, true);
                if (form != null)
                {
                    foreach (var kvp in fieldValues)
                    {
                        if (form.GetField(kvp.Key) != null)
                        {
                            form.GetField(kvp.Key).SetValue(kvp.Value);
                        }
                    }
                    form.FlattenFields();
                }
                pdfDoc.Close();
                return ms.ToArray();
            }
        }
    }
}
