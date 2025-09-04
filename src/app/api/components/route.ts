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
    const type = searchParams.get('type') // component, function, class, hook, util
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!repoId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      )
    }

    // Verify the repo belongs to the user
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

    // Build filter conditions
    const where: any = { repoId }
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get components with pagination
    const [components, total] = await Promise.all([
      prisma.repoComponent.findMany({
        where,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.repoComponent.count({ where })
    ])

    return NextResponse.json({
      components,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Components fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}