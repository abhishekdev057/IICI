# Database Migration Guidelines

## ⚠️ IMPORTANT: Database Reset Commands are BANNED

**NEVER use the following commands in production or development:**

- `npx prisma db push --force-reset`
- `npx prisma migrate reset`
- `npx prisma db push --force-reset --accept-data-loss`
- Any command that drops or resets the database

## ✅ Proper Migration Workflow

### 1. Schema Changes

When making changes to the Prisma schema:

1. **Edit the schema file** (`prisma/schema.prisma`)
2. **Create a migration** using:
   ```bash
   npx prisma migrate dev --name descriptive-migration-name
   ```
3. **Review the migration** in `prisma/migrations/` folder
4. **Test the migration** on a development database first

### 2. Data Updates

If you need to update existing data:

1. **Create a SQL script** in `scripts/` folder
2. **Run the script** using:
   ```bash
   npx prisma db execute --file scripts/your-script.sql --schema prisma/schema.prisma
   ```
3. **Then apply schema changes** with migrations

### 3. Example Migration Process

```bash
# 1. Make schema changes in prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name remove-gold-certification

# 3. If data updates needed, create and run script first
npx prisma db execute --file scripts/update-data.sql --schema prisma/schema.prisma

# 4. Apply schema changes
npx prisma migrate dev --name your-changes
```

## 🚫 Banned Commands

These commands will **LOSE ALL DATA** and are strictly prohibited:

- `prisma db push --force-reset`
- `prisma migrate reset`
- `prisma db push --accept-data-loss` (without proper data migration)
- Any command that drops tables or resets the database

## ✅ Safe Commands

These commands are safe to use:

- `npx prisma migrate dev --name migration-name`
- `npx prisma db push` (for development only, with caution)
- `npx prisma db execute --file script.sql`
- `npx prisma generate`
- `npx prisma studio`

## 📋 Migration Checklist

Before applying any schema changes:

- [ ] Backup the database (if production)
- [ ] Test changes on development database
- [ ] Create data migration scripts if needed
- [ ] Run data migration scripts first
- [ ] Create and apply schema migration
- [ ] Test the application thoroughly
- [ ] Update any code that references changed fields

## 🔄 Current Migration Status

The database was initially created with `db push` instead of migrations. Going forward, all changes should use proper migrations.

**Last Migration**: Removed GOLD certification level (2024-01-XX)

- Updated existing GOLD records to CERTIFIED
- Removed GOLD from CertificationLevel enum
- Updated all frontend components to remove GOLD references
