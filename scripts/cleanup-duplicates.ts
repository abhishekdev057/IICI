import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateApplications() {
  console.log('🔍 Checking for duplicate applications...')
  
  try {
    // Find users with multiple applications
    const duplicates = await prisma.$queryRaw`
      SELECT "userId", COUNT(*) as app_count 
      FROM applications 
      GROUP BY "userId" 
      HAVING COUNT(*) > 1
    `
    
    console.log('Found duplicate applications:', duplicates)
    
    if (Array.isArray(duplicates) && duplicates.length > 0) {
      for (const duplicate of duplicates) {
        const userId = duplicate.userId
        console.log(`\n🧹 Cleaning up duplicates for user: ${userId}`)
        
        // Get all applications for this user, ordered by creation date
        const userApplications = await prisma.application.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          include: {
            indicatorResponses: true,
            evidence: true,
            scoreAudits: true,
            certifications: true,
            adminReviews: true
          }
        })
        
        console.log(`Found ${userApplications.length} applications for user ${userId}`)
        
        if (userApplications.length > 1) {
          // Keep the first (oldest) application and merge data from others
          const keepApplication = userApplications[0]
          const deleteApplications = userApplications.slice(1)
          
          console.log(`Keeping application: ${keepApplication.id} (created: ${keepApplication.createdAt})`)
          
          // Merge data from applications to be deleted
          for (const appToDelete of deleteApplications) {
            console.log(`Merging data from application: ${appToDelete.id} (created: ${appToDelete.createdAt})`)
            
            // Merge indicator responses
            if (appToDelete.indicatorResponses.length > 0) {
              for (const response of appToDelete.indicatorResponses) {
                // Check if response already exists in keep application
                const existingResponse = await prisma.indicatorResponse.findFirst({
                  where: {
                    applicationId: keepApplication.id,
                    indicatorId: response.indicatorId,
                    pillarId: response.pillarId
                  }
                })
                
                if (!existingResponse) {
                  // Move response to keep application
                  await prisma.indicatorResponse.update({
                    where: { id: response.id },
                    data: { applicationId: keepApplication.id }
                  })
                  console.log(`  Moved indicator response: ${response.indicatorId}`)
                } else {
                  // Delete duplicate response
                  await prisma.indicatorResponse.delete({
                    where: { id: response.id }
                  })
                  console.log(`  Deleted duplicate indicator response: ${response.indicatorId}`)
                }
              }
            }
            
            // Merge evidence
            if (appToDelete.evidence.length > 0) {
              for (const evidence of appToDelete.evidence) {
                // Check if evidence already exists
                const existingEvidence = await prisma.evidence.findFirst({
                  where: {
                    applicationId: keepApplication.id,
                    type: evidence.type
                  }
                })
                
                if (!existingEvidence) {
                  // Move evidence to keep application
                  await prisma.evidence.update({
                    where: { id: evidence.id },
                    data: { applicationId: keepApplication.id }
                  })
                  console.log(`  Moved evidence: ${evidence.id}`)
                } else {
                  // Delete duplicate evidence
                  await prisma.evidence.delete({
                    where: { id: evidence.id }
                  })
                  console.log(`  Deleted duplicate evidence: ${evidence.id}`)
                }
              }
            }
            
            // Delete the duplicate application
            await prisma.application.delete({
              where: { id: appToDelete.id }
            })
            console.log(`  Deleted duplicate application: ${appToDelete.id}`)
          }
        }
      }
      
      console.log('\n✅ Duplicate cleanup completed!')
    } else {
      console.log('✅ No duplicate applications found.')
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDuplicateApplications()
  .then(() => {
    console.log('🎉 Duplicate cleanup script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Duplicate cleanup script failed:', error)
    process.exit(1)
  })
