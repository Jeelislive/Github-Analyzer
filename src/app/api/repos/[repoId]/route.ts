import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include') // files, components, dependencies, analytics, documentation

    // Build include object based on query params
    const includeOptions: any = {}
    
    if (include) {
      const includeItems = include.split(',')
      includeItems.forEach(item => {
        switch (item.trim()) {
          case 'files':
            includeOptions.files = {
              orderBy: { path: 'asc' },
              take: 100 // Limit for performance
            }
            break
          case 'components':
            includeOptions.components = {
              orderBy: { name: 'asc' }
            }
            break
          case 'dependencies':
            includeOptions.dependencies = {
              orderBy: { name: 'asc' }
            }
            break
          case 'analytics':
            includeOptions.analytics = true
            break
          case 'documentation':
            includeOptions.documentation = true
            break
        }
      })
    }

    const repo = await prisma.analyzedRepo.findFirst({
      where: {
        id: repoId,
        userId: session.user.id
      },
      include: includeOptions
    })

    if (!repo) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(repo)

  } catch (error) {
    console.error("Repository fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}