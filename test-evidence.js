const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEvidence() {
  try {
    console.log('🔍 Testing evidence retrieval for indicator 6.1.3...')
    
    // Get the application
    const application = await prisma.application.findUnique({
      where: { id: 'cmfpq7l060004i0m9qdgxv98d' },
      include: {
        indicatorResponses: {
          include: {
            evidence: true
          }
        }
      }
    })
    
    if (!application) {
      console.log('❌ Application not found')
      return
    }
    
    console.log('✅ Application found:', application.id)
    console.log('📊 Total indicator responses:', application.indicatorResponses.length)
    
    // Find indicator 6.1.3
    const indicatorResponse = application.indicatorResponses.find(
      r => r.indicatorId === '6.1.3'
    )
    
    if (!indicatorResponse) {
      console.log('❌ Indicator 6.1.3 not found')
      return
    }
    
    console.log('✅ Indicator 6.1.3 found:', {
      id: indicatorResponse.id,
      indicatorId: indicatorResponse.indicatorId,
      pillarId: indicatorResponse.pillarId,
      rawValue: indicatorResponse.rawValue,
      evidenceCount: indicatorResponse.evidence.length
    })
    
    if (indicatorResponse.evidence.length > 0) {
      console.log('📝 Evidence found:')
      indicatorResponse.evidence.forEach(ev => {
        console.log('  - Type:', ev.type)
        console.log('  - Description:', ev.description)
        console.log('  - URL:', ev.url)
        console.log('  - FileName:', ev.fileName)
        console.log('  - Created:', ev.uploadedAt)
      })
    } else {
      console.log('❌ No evidence found for indicator 6.1.3')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEvidence()
