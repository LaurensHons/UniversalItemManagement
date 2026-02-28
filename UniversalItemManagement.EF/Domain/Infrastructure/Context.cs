using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Linq;
using UniversalItemManagement.EF.Domain.Models;
using UniversalItemManagement.EF.Domain.Models.Entities;
using UniversalItemManagement.EF.Domain.Models.Entities.Fields;
using UniversalItemManagement.EF.SeedData;

namespace UniversalItemManagement.EF.Domain.Infrastructure
{
    public class Context : DbContext
    {
        public DbSet<Record> Records { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<FieldValue> FieldValues { get; set; }

        public Context() { }
        public Context(DbContextOptions<Context> options) : base(options) { }

        private void ApplyAuditFields()
        {
            var userId = UserSeed.SystemUserGuid;

            var updatedEntities = ChangeTracker.Entries()
                .Where(x => x.State == EntityState.Modified)
                .Where(x => x.Metadata.GetTableName() != "User")
                .Select(x => x.Entity)
                .OfType<Entity>().ToList();

            var createdEntities = ChangeTracker.Entries()
                .Where(x => x.State == EntityState.Added)
                .Select(x => x.Entity)
                .OfType<Entity>().ToList();

            foreach (var entry in updatedEntities)
            {
                entry.ModifiedOn = DateTime.UtcNow;
                entry.ModifiedById = userId;

                var createdOnProp = this.Entry(entry).Property(e => e.CreatedOn);
                var createdByProp = this.Entry(entry).Property(e => e.CreatedById);

                if (createdOnProp.IsModified)
                    createdOnProp.IsModified = false;

                if (createdByProp.IsModified)
                    createdByProp.IsModified = false;
            }

            foreach (var entry in createdEntities)
            {
                entry.CreatedOn = DateTime.UtcNow;
                entry.CreatedById = userId;
                entry.ModifiedOn = DateTime.UtcNow;
                entry.ModifiedById = userId;
            }
        }

        public override int SaveChanges()
        {
            ApplyAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            ApplyAuditFields();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private static Type[] GetSubclasses(Type type)
        {
            var types = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(s =>
                {
                    try
                    {
                        return s.GetTypes();
                    }
                    catch
                    {
                        return [];
                    }
                })
                .Where(p => p.Namespace?.StartsWith("UniversalItemManagement.EF.Domain.Models.Entities") ?? false)
                .Where(p => p != type && (p.BaseType == type || (type.ContainsGenericParameters && (p.BaseType?.Name.StartsWith(type.Name) ?? false))))
                .SelectMany(p => p.IsGenericType ? GetSubclasses(p) : [p])
                .ToArray();
            return types;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var types = GetSubclasses(typeof(Entity));
            foreach (var type in types)
            {
                modelBuilder.Entity(type).HasKey("Id");
                modelBuilder.Entity(type).Property("Id").IsRequired().ValueGeneratedOnAdd();
                modelBuilder.Entity(type).Property("CreatedOn").IsRequired().HasDefaultValueSql("NOW()");
                modelBuilder.Entity(type).Property("ModifiedOn").IsRequired().HasDefaultValueSql("NOW()");
                modelBuilder.Entity(type).HasOne("CreatedBy").WithMany().OnDelete(DeleteBehavior.ClientSetNull);
                modelBuilder.Entity(type).HasOne("ModifiedBy").WithMany().OnDelete(DeleteBehavior.ClientSetNull);
            }

            modelBuilder.Entity<User>().HasKey(e => e.Id);
            modelBuilder.Entity<User>().Property(e => e.Id).IsRequired().ValueGeneratedOnAdd();
            modelBuilder.Entity<User>().Property(e => e.CreatedOn).IsRequired().HasDefaultValueSql("NOW()");
            modelBuilder.Entity<User>().Property(e => e.ModifiedOn).IsRequired().HasDefaultValueSql("NOW()");

            modelBuilder.Entity<User>().HasData(UserSeed.Data);
            modelBuilder.Entity<Record>().HasData(RecordSeed.Data);

            modelBuilder.Entity<FieldProperty>()
                .Property(fp => fp.Type)
                .HasConversion(new EnumToStringConverter<FieldPropertyType>());

            // Configure Record -> Fields relationship
            modelBuilder.Entity<Record>()
                .HasMany(r => r.Fields)
                .WithOne(f => f.Record)
                .HasForeignKey(f => f.RecordId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Field -> FieldValue relationship
            modelBuilder.Entity<Field>()
                .HasOne(f => f.FieldValue)
                .WithMany()
                .HasForeignKey(f => f.ValueId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            base.OnModelCreating(modelBuilder);
        }
    }
}
