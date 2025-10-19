import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { enhancedGitHubAnalyzer } from "@/lib/enhancedGithubAnalyzer"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    let requestBody;
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { repoUrl, options = {} } = requestBody
    
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      )
    }

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid GitHub URL format" },
        { status: 400 }
      )
    }

    const [, owner, repoName] = urlMatch

    const analysisOptions = {
      includeFileContent: true,
      includeCommitHistory: true,
      includeGeminiAnalysis: true,
      maxFiles: 100,
      maxCommits: 200,
      ...options
    }

    const enhancedData = await enhancedGitHubAnalyzer.analyzeRepository(
      owner, 
      repoName, 
      analysisOptions
    )

    const sanitizeData = (data: any): any => {
      if (data === null || data === undefined) return null
      if (typeof data === 'string') {
        return data.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      }
      if (Array.isArray(data)) {
        return data.map(sanitizeData)
      }
      if (typeof data === 'object') {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = sanitizeData(value)
        }
        return sanitized
      }
      return data
    }
    
    const sanitizedData = sanitizeData(enhancedData)
    
    const { prisma } = await import('@/lib/prisma')
    const repository = await prisma.analyzedRepo.upsert({
      where: {
        userId_owner_repoName: {
          userId: session.user.id,
          owner,
          repoName
        }
      },
      update: {
        description: enhancedData.repository.description,
        language: enhancedData.repository.language,
        stars: enhancedData.metrics.stargazers_count,
        forks: enhancedData.metrics.forks_count,
        analysisStatus: 'completed',
        lastCommit: enhancedData.activity.commits[0] ? new Date(enhancedData.activity.commits[0].author.date) : null,
        data: sanitizedData as any, // Store the full enhanced data
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        repoUrl: `https://github.com/${owner}/${repoName}`,
        owner,
        repoName,
        description: enhancedData.repository.description,
        language: enhancedData.repository.language,
        stars: enhancedData.metrics.stargazers_count,
        forks: enhancedData.metrics.forks_count,
        size: enhancedData.repository.size,
        analysisStatus: 'completed',
        lastCommit: enhancedData.activity.commits[0] ? new Date(enhancedData.activity.commits[0].author.date) : null,
        data: sanitizedData as any
      }
    })

    return NextResponse.json({
      success: true,
      repositoryId: repository.id,
      enhancedData,
      summary: {
        totalFiles: enhancedData.content.files.length,
        totalCommits: enhancedData.activity.commits.length,
        contributors: enhancedData.activity.contributors.length,
        issues: enhancedData.collaboration.issues.length,
        pullRequests: enhancedData.collaboration.pullRequests.length,
        geminiAnalysis: !!enhancedData.geminiInsights,
        overallQuality: enhancedData.geminiInsights?.codeQuality?.overallScore || 'N/A'
      }
    })

  } catch (error) {
    console.error("Enhanced analysis error:", error)
    return NextResponse.json(
      { 
        error: "Enhanced analysis failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}