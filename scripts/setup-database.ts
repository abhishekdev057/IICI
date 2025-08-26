import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up IIICI database...')

  // Create feature permissions for role-based access
  const featurePermissions = [
    // Super Admin permissions
    { role: 'SUPER_ADMIN', feature: 'user_management', canRead: true, canWrite: true, canDelete: true, canApprove: true },
    { role: 'SUPER_ADMIN', feature: 'admin_management', canRead: true, canWrite: true, canDelete: true, canApprove: true },
    { role: 'SUPER_ADMIN', feature: 'application_review', canRead: true, canWrite: true, canDelete: true, canApprove: true },
    { role: 'SUPER_ADMIN', feature: 'system_settings', canRead: true, canWrite: true, canDelete: true, canApprove: true },
    { role: 'SUPER_ADMIN', feature: 'reports', canRead: true, canWrite: true, canDelete: true, canApprove: true },

    // Admin permissions
    { role: 'ADMIN', feature: 'application_review', canRead: true, canWrite: true, canDelete: false, canApprove: true },
    { role: 'ADMIN', feature: 'reports', canRead: true, canWrite: false, canDelete: false, canApprove: false },

    // User permissions
    { role: 'USER', feature: 'application_management', canRead: true, canWrite: true, canDelete: false, canApprove: false },
    { role: 'USER', feature: 'certification_view', canRead: true, canWrite: false, canDelete: false, canApprove: false },
  ]

  for (const permission of featurePermissions) {
    await prisma.featurePermission.upsert({
      where: {
        role_feature: {
          role: permission.role,
          feature: permission.feature
        }
      },
      update: permission,
      create: permission
    })
  }

  console.log('✅ Feature permissions created')

  // Create a super admin user (you'll need to update this with real credentials)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@iiici.com' },
    update: {
      role: 'SUPER_ADMIN',
      isActive: true
    },
    create: {
      email: 'admin@iiici.com',
      name: 'IIICI Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  })

  console.log('✅ Super admin user created:', superAdmin.email)

  console.log('🎉 Database setup completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Database setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
