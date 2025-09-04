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

    const { searchParams } = new URL(request.url)
    const repoId = searchParams.get('repoId')

    if (!repoId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      )
    }

    // First verify the repo belongs to the user
    const repo = await prisma.analyzedRepo.findFirst({
      where: {
        id: repoId,
        userId: session.user.id
      }
    })

    if (!repo) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      )
    }

    // Get related data separately to avoid TypeScript issues
    const [analytics, files, components, dependencies] = await Promise.all([
      prisma.repoAnalytics.findUnique({
        where: { repoId }
      }),
      prisma.repoFile.findMany({
        where: { repoId },
        select: {
          path: true,
          name: true,
          language: true,
          linesOfCode: true,
          complexity: true
        }
      }),
      prisma.repoComponent.findMany({
        where: { repoId },
        select: {
          type: true,
          complexity: true
        }
      }),
      prisma.repoDependency.findMany({
        where: { repoId },
        select: {
          type: true,
          name: true
        }
      })
    ])

    // Calculate additional analytics
    const filesByLanguage = files.reduce((acc: Record<string, number>, file) => {
      if (file.language) {
        acc[file.language] = (acc[file.language] || 0) + 1
      }
      return acc
    }, {})

    const componentsByType = components.reduce((acc: Record<string, number>, component) => {
      acc[component.type] = (acc[component.type] || 0) + 1
      return acc
    }, {})

    const dependenciesByType = dependencies.reduce((acc: Record<string, number>, dep) => {
      acc[dep.type] = (acc[dep.type] || 0) + 1
      return acc
    }, {})

    const complexityDistribution = files.reduce((acc, file) => {
      const complexity = file.complexity || 0
      if (complexity <= 5) acc.low++
      else if (complexity <= 10) acc.medium++
      else if (complexity <= 20) acc.high++
      else acc.veryHigh++
      return acc
    }, { low: 0, medium: 0, high: 0, veryHigh: 0 })

    // Top complex files
    const topComplexFiles = files
      .filter(f => f.complexity && f.complexity > 0)
      .sort((a, b) => (b.complexity || 0) - (a.complexity || 0))
      .slice(0, 10)
      .map(f => ({
        path: f.path,
        name: f.name,
        language: f.language,
        complexity: f.complexity,
        linesOfCode: f.linesOfCode
      }))

    return NextResponse.json({
      repository: {
        id: repo.id,
        name: repo.repoName,
        owner: repo.owner,
        description: repo.description,
        stars: repo.stars,
        forks: repo.forks,
        language: repo.language,
        analysisStatus: repo.analysisStatus
      },
      analytics,
      insights: {
        filesByLanguage,
        componentsByType,
        dependenciesByType,
        complexityDistribution,
        topComplexFiles
      }
    })

  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}