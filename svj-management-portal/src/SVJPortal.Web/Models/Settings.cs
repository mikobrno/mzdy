using System.ComponentModel.DataAnnotations;

namespace SVJPortal.Web.Models
{
    public class EmailSettings
    {
        [Required]
        public string SmtpServer { get; set; }
        
        [Required]
        public int SmtpPort { get; set; }
        
        [Required]
        public string Username { get; set; }
        
        [Required]
        public string Password { get; set; }
        
        public bool EnableSsl { get; set; } = true;
        
        public string DisplayName { get; set; }
    }
    
    public class CloudStorageSettings
    {
        public GoogleDriveSettings GoogleDrive { get; set; }
        public OneDriveSettings OneDrive { get; set; }
    }
    
    public class GoogleDriveSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string FolderId { get; set; }
    }
    
    public class OneDriveSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string FolderId { get; set; }
    }
    
    public class BankApiSettings
    {
        public FioBankSettings FioBank { get; set; }
        public CeskaSporitelnaSetting CeskaSporitelnaSetting { get; set; }
        public CsobSettings Csob { get; set; }
        public KomercniBankaSettings KomercniBanka { get; set; }
        public RaiffeisenBankSettings RaiffeisenBank { get; set; }
    }
    
    public class FioBankSettings
    {
        public string ApiToken { get; set; }
        public string ApiUrl { get; set; }
    }
    
    public class CeskaSporitelnaSetting
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string ApiUrl { get; set; }
    }
    
    public class CsobSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string ApiUrl { get; set; }
    }
    
    public class KomercniBankaSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string ApiUrl { get; set; }
    }
    
    public class RaiffeisenBankSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string ApiUrl { get; set; }
    }
}
