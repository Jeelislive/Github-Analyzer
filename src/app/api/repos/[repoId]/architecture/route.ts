import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateArchitectureDiagram } from "@/lib/documentation-generator"

// Simple in-memory cache for architecture diagrams
const architectureCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { repoId } = await params
    console.log(`Generating architecture diagram for repo: ${repoId}`)
    
    // Check cache first
    const cacheKey = `${repoId}-${session.user.id}`
    const cached = architectureCache.get(cacheKey)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached architecture diagram')
      return NextResponse.json(cached.data)
    }
    
    const diagram = await generateArchitectureDiagram(repoId)
    console.log(`Architecture diagram generated:`, {
      totalNodes: diagram.nodes.length,
      totalEdges: diagram.edges.length,
      sampleNodes: diagram.nodes.slice(0, 3)
    })

    // Cache the result
    architectureCache.set(cacheKey, { data: diagram, timestamp: now })
    
    // Clean up old cache entries periodically
    if (architectureCache.size > 100) {
      const cutoff = now - CACHE_DURATION
      for (const [key, value] of architectureCache.entries()) {
        if (value.timestamp < cutoff) {
          architectureCache.delete(key)
        }
      }
    }

    // If no data found, return empty structure with helpful message
    if (!diagram.nodes.length) {
      console.log('No nodes found in architecture diagram')
      return NextResponse.json({
        nodes: [],
        edges: [],
        stats: {
          totalNodes: 0,
          totalEdges: 0,
          averageConnections: 0
        },
        message: "No files found for architecture visualization. The repository may need to be re-analyzed."
      })
    }

    return NextResponse.json(diagram)

  } catch (error) {
    console.error("Architecture diagram error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}