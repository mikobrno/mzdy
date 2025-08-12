using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SVJPortal.Web.Models;

namespace SVJPortal.Web.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<SVJ> SVJs { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<EmailLog> EmailLogs { get; set; }
        public DbSet<EmailAttachment> EmailAttachments { get; set; }
        public DbSet<EmailVariable> EmailVariables { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // SVJ Configuration
            builder.Entity<SVJ>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nazev).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ICO).IsRequired().HasMaxLength(8);
                entity.Property(e => e.IBAN).IsRequired().HasMaxLength(34);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.ICO).IsUnique();
                
                entity.HasMany(e => e.Zamestnanci)
                    .WithOne(e => e.SVJ)
                    .HasForeignKey(e => e.SVJId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(e => e.Mzdy)
                    .WithOne(e => e.SVJ)
                    .HasForeignKey(e => e.SVJId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Employee Configuration
            builder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Jmeno).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Prijmeni).IsRequired().HasMaxLength(50);
                entity.Property(e => e.RodneCislo).IsRequired().HasMaxLength(11);
                entity.Property(e => e.CisloUctu).IsRequired().HasMaxLength(34);
                entity.HasIndex(e => e.RodneCislo).IsUnique();
                
                entity.HasMany(e => e.Mzdy)
                    .WithOne(e => e.Employee)
                    .HasForeignKey(e => e.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Payroll Configuration
            builder.Entity<Payroll>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.HrubaMzda).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SocialniPojisteni).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ZdravotniPojisteni).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DanZPrijmu).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ExekuceSrazky).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CistaMzda).HasColumnType("decimal(18,2)");
                entity.Property(e => e.NakladyZamestnavatele).HasColumnType("decimal(18,2)");
                
                // Compound index for unique payroll per employee per month/year
                entity.HasIndex(e => new { e.EmployeeId, e.Rok, e.Mesic }).IsUnique();
            });

            // EmailTemplate Configuration
            builder.Entity<EmailTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nazev).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Predmet).IsRequired().HasMaxLength(200);
                entity.Property(e => e.TeloEmailu).IsRequired();
                
                entity.HasMany(e => e.EmailLogy)
                    .WithOne(e => e.EmailTemplate)
                    .HasForeignKey(e => e.EmailTemplateId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // EmailLog Configuration
            builder.Entity<EmailLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Prijemce).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Predmet).IsRequired().HasMaxLength(200);
                
                entity.HasMany(e => e.Prilohy)
                    .WithOne(e => e.EmailLog)
                    .HasForeignKey(e => e.EmailLogId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // EmailAttachment Configuration
            builder.Entity<EmailAttachment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.NazevSouboru).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CestaSouboru).IsRequired().HasMaxLength(500);
            });

            // EmailVariable Configuration
            builder.Entity<EmailVariable>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nazev).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Popis).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Nazev).IsUnique();
            });

            // AuditLog Configuration
            builder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.NazevTabulky).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IdZaznamu).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Akce).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Uzivatel).IsRequired().HasMaxLength(100);
                
                entity.HasIndex(e => new { e.NazevTabulky, e.IdZaznamu });
                entity.HasIndex(e => e.DatumZmeny);
            });

            // Seed initial data
            SeedInitialData(builder);
        }

        private void SeedInitialData(ModelBuilder builder)
        {
            // Seed Email Variables
            builder.Entity<EmailVariable>().HasData(
                new EmailVariable { Id = 1, Nazev = "rok", Popis = "Aktuální rok", TypPromenne = TypPromenne.Systemova, JeSystemova = true },
                new EmailVariable { Id = 2, Nazev = "aktualni_mesic", Popis = "Aktuální měsíc", TypPromenne = TypPromenne.Systemova, JeSystemova = true },
                new EmailVariable { Id = 3, Nazev = "osloveni_vyboru", Popis = "Oslovení výboru SVJ", TypPromenne = TypPromenne.Dynamicka, JeSystemova = false, DefaultniHodnota = "Vážení členové výboru" },
                new EmailVariable { Id = 4, Nazev = "nazev_svj", Popis = "Název SVJ", TypPromenne = TypPromenne.Dynamicka, JeSystemova = false },
                new EmailVariable { Id = 5, Nazev = "kontaktni_osoba", Popis = "Kontaktní osoba SVJ", TypPromenne = TypPromenne.Dynamicka, JeSystemova = false }
            );

            // Seed default email template
            builder.Entity<EmailTemplate>().HasData(
                new EmailTemplate
                {
                    Id = 1,
                    Nazev = "Výkaz mezd - výchozí šablona",
                    Predmet = "Měsíční výkaz mezd {{nazev_svj}} - {{aktualni_mesic}} {{rok}}",
                    TeloEmailu = @"{{osloveni_vyboru}},

zasíláme Vám v příloze měsíční výkaz mezd pro {{nazev_svj}} za období {{aktualni_mesic}} {{rok}}.

V příloze naleznete:
- Výplatní pásky zaměstnanců
- Hromadný příkaz k úhradě
- Podklady pro ČSSZ a zdravotní pojišťovny

S pozdravem,
{{kontaktni_osoba}}",
                    JeGlobalni = true,
                    JeAktivni = true,
                    DatumVytvoreni = DateTime.Now,
                    VytvorenoUzivatelem = "System"
                }
            );
        }
    }
}