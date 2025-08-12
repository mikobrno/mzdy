using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;
using SVJPortal.Web.Models.Interfaces;
using SVJPortal.Web.Data;
using SVJPortal.Web.Models;
using SVJPortal.Web.Models.Entities;

namespace SVJPortal.Web.Services
{
    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailSettings _emailSettings;

        public EmailService(ApplicationDbContext context, IOptions<EmailSettings> emailSettings)
        {
            _context = context;
            _emailSettings = emailSettings.Value;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, List<EmailAttachment> attachments = null)
        {
            try
            {
                using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    EnableSsl = _emailSettings.EnableSsl,
                    Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_emailSettings.Username, _emailSettings.DisplayName ?? "SVJ Portal"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                foreach (var recipient in to.Split(';', ','))
                {
                    if (!string.IsNullOrWhiteSpace(recipient))
                        mailMessage.To.Add(recipient.Trim());
                }

                if (attachments != null)
                {
                    foreach (var attachment in attachments)
                    {
                        if (File.Exists(attachment.CestaSouboru))
                        {
                            mailMessage.Attachments.Add(new Attachment(attachment.CestaSouboru));
                        }
                    }
                }

                await client.SendMailAsync(mailMessage);

                // Log successful email
                await LogEmailAsync(to, subject, body, attachments, true, null);

                return true;
            }
            catch (Exception ex)
            {
                // Log failed email
                await LogEmailAsync(to, subject, body, attachments, false, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendEmailFromTemplateAsync(int templateId, int svjId, Dictionary<string, string> variables = null)
        {
            var template = await _context.EmailTemplates.FindAsync(templateId);
            var svj = await _context.SVJs.FindAsync(svjId);

            if (template == null || svj == null) return false;

            var processedSubject = await ProcessTemplateAsync(template.Predmet, variables ?? new Dictionary<string, string>());
            var processedBody = await ProcessTemplateAsync(template.TeloEmailu, variables ?? new Dictionary<string, string>());

            return await SendEmailAsync(svj.Email, processedSubject, processedBody);
        }

        public async Task<EmailTemplate> CreateTemplateAsync(EmailTemplate template)
        {
            template.DatumVytvoreni = DateTime.Now;
            _context.EmailTemplates.Add(template);
            await _context.SaveChangesAsync();
            return template;
        }

        public async Task<EmailTemplate> UpdateTemplateAsync(EmailTemplate template)
        {
            template.DatumPosledniUpravy = DateTime.Now;
            _context.Entry(template).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return template;
        }

        public async Task<IEnumerable<EmailTemplate>> GetTemplatesAsync(int? svjId = null)
        {
            var query = _context.EmailTemplates
                .Where(t => t.JeAktivni);

            if (svjId.HasValue)
            {
                query = query.Where(t => t.JeGlobalni || t.SVJId == svjId.Value);
            }
            else
            {
                query = query.Where(t => t.JeGlobalni);
            }

            return await query
                .OrderBy(t => t.Nazev)
                .ToListAsync();
        }

        public async Task<string> ProcessTemplateAsync(string template, Dictionary<string, string> variables)
        {
            if (string.IsNullOrEmpty(template)) return template;

            // Načteme systémové proměnné
            var systemVariables = new Dictionary<string, string>
            {
                ["rok"] = DateTime.Now.Year.ToString(),
                ["aktualni_mesic"] = DateTime.Now.ToString("MMMM", new System.Globalization.CultureInfo("cs-CZ")),
                ["aktualni_datum"] = DateTime.Now.ToString("dd.MM.yyyy")
            };

            // Sloučíme s uživatelskými proměnnými
            foreach (var variable in variables)
            {
                systemVariables[variable.Key] = variable.Value;
            }

            // Nahradíme proměnné v šabloně
            var processed = template;
            foreach (var variable in systemVariables)
            {
                var pattern = $@"\{{\{{\s*{Regex.Escape(variable.Key)}\s*\}}\}}";
                processed = Regex.Replace(processed, pattern, variable.Value, RegexOptions.IgnoreCase);
            }

            return processed;
        }

        public async Task<List<EmailAttachment>> LoadCloudAttachmentsAsync(int svjId)
        {
            var attachments = new List<EmailAttachment>();
            var svj = await _context.SVJs.FindAsync(svjId);
            
            if (svj == null) return attachments;

            // Zde by byla implementace pro načítání souborů z Google Drive/OneDrive
            // podle IČO v názvu souboru

            // Simulace načítání souborů
            var cloudFolder = Path.Combine("CloudAttachments", svj.ICO);
            if (Directory.Exists(cloudFolder))
            {
                var files = Directory.GetFiles(cloudFolder);
                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    attachments.Add(new EmailAttachment
                    {
                        NazevSouboru = fileInfo.Name,
                        CestaSouboru = file,
                        VelikostSouboru = fileInfo.Length,
                        ContentType = GetContentType(fileInfo.Extension)
                    });
                }
            }

            return attachments;
        }

        private async Task LogEmailAsync(string to, string subject, string body, List<EmailAttachment> attachments, bool success, string errorMessage)
        {
            var emailLog = new EmailLog
            {
                Prijemce = to,
                Predmet = subject,
                TeloEmailu = body,
                DatumOdeslani = DateTime.Now,
                UspesneOdeslano = success,
                ChybovaZprava = errorMessage,
                OdeslanoPres = "SMTP"
            };

            _context.EmailLogs.Add(emailLog);
            await _context.SaveChangesAsync();

            if (attachments != null && success)
            {
                foreach (var attachment in attachments)
                {
                    attachment.EmailLogId = emailLog.Id;
                    _context.EmailAttachments.Add(attachment);
                }
                await _context.SaveChangesAsync();
            }
        }

        private string GetContentType(string extension)
        {
            return extension.ToLower() switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xml" => "application/xml",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }
    }
}