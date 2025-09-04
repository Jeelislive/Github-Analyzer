import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch all repositories for the current user
    const repositories = await prisma.analyzedRepo.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        owner: true,
        repoName: true,
        description: true,
        language: true,
        stars: true,
        forks: true,
        analysisStatus: true,
        updatedAt: true,
        data: true // This contains the enhanced data
      }
    })

    // Transform the data to match the expected format
    const formattedRepos = repositories.map(repo => ({
      id: repo.id,
      owner: repo.owner,
      repoName: repo.repoName,
      description: repo.description || '',
      language: repo.language || '',
      stars: repo.stars,
      forks: repo.forks,
      analysisStatus: repo.analysisStatus,
      lastAnalyzed: repo.updatedAt.toISOString(),
      enhancedData: repo.data as any // Enhanced data from Gemini analysis
    }))

    return NextResponse.json(formattedRepos)

  } catch (error) {
    console.error("Failed to fetch repositories:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch repositories", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}