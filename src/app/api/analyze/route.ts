import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeRepository } from "@/lib/githubAnalyzer"
import { z } from "zod"

const analyzeSchema = z.object({
  repoUrl: z.string().url("Invalid repository URL"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { repoUrl } = analyzeSchema.parse(body)

    const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/
    const match = repoUrl.match(urlPattern)
    
    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      )
    }

    const [, owner, repoName] = match
    const cleanRepoName = repoName.replace(/\.git$/, '')
    const existingRepo = await prisma.analyzedRepo.findUnique({
      where: {
        userId_owner_repoName: {
          userId: session.user.id,
          owner,
          repoName: cleanRepoName,
        }
      }
    })

    if (existingRepo) {
      if (existingRepo.analysisStatus === "analyzing") {
        return NextResponse.json(
          { error: "Repository is already being analyzed" },
          { status: 409 }
        )
      }
      
      if (existingRepo.analysisStatus === "failed" || existingRepo.analysisStatus === "completed") {
        await prisma.analyzedRepo.update({
          where: { id: existingRepo.id },
          data: { analysisStatus: "analyzing", updatedAt: new Date() }
        })
        
        analyzeRepository(existingRepo.id, owner, cleanRepoName, session.user.id)
          .catch(console.error)
        
        return NextResponse.json({
          repoId: existingRepo.id,
          status: "analyzing",
          message: "Repository re-analysis started"
        })
      }
    }

    const newRepo = await prisma.analyzedRepo.create({
      data: {
        userId: session.user.id,
        repoUrl,
        owner,
        repoName: cleanRepoName,
        analysisStatus: "analyzing"
      }
    })

    analyzeRepository(newRepo.id, owner, cleanRepoName, session.user.id)
      .catch(console.error)

    return NextResponse.json({
      repoId: newRepo.id,
      status: "analyzing",
      message: "Repository analysis started"
    })

  } catch (error) {
    console.error("Analysis error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    if (repoId) {
      // Get specific repository analysis status
      const repo = await prisma.analyzedRepo.findFirst({
        where: {
          id: repoId,
          userId: session.user.id
        },
        include: {
          analytics: true
        }
      })

      if (!repo) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(repo)
    }

    // Get all user's analyzed repositories
    const repos = await prisma.analyzedRepo.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        analytics: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(repos)

  } catch (error) {
    console.error("Get analysis error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}