import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUniqueConstraint() {
  console.log('🔧 Adding unique constraint to applications table...')
  
  try {
    // Add unique constraint using raw SQL
    await prisma.$executeRaw`ALTER TABLE applications ADD CONSTRAINT applications_userId_key UNIQUE ("userId");`
    console.log('✅ Unique constraint added successfully!')
    
    // Verify the constraint was added
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'applications' AND constraint_type = 'UNIQUE'
    `
    console.log('Current unique constraints on applications table:', constraints)
    
  } catch (error) {
    if ((error as any).code === '23505') {
      console.log('⚠️ Constraint already exists or there are still duplicates')
    } else {
      console.error('❌ Error adding unique constraint:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addUniqueConstraint()
  .then(() => {
    console.log('🎉 Unique constraint script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unique constraint script failed:', error)
    process.exit(1)
  })
