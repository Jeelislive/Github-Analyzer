import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
    { params }: { params: Promise<{ repoId: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { repoId, fileId } = await params

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

    // Get the file with its imports and relationships
    const file = await prisma.repoFile.findFirst({
      where: {
        id: fileId,
        repoId
      },
      include: {
        imports: {
          include: {
            importedFile: {
              select: {
                id: true,
                name: true,
                path: true,
                language: true
              }
            }
          }
        },
        importedBy: {
          include: {
            importingFile: {
              select: {
                id: true,
                name: true,
                path: true,
                language: true
              }
            }
          }
        }
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Get components in this file
    const components = await prisma.repoComponent.findMany({
      where: {
        repoId,
        path: file.path
      },
      orderBy: {
        startLine: 'asc'
      }
    })

    return NextResponse.json({
      ...file,
      components
    })

  } catch (error) {
    console.error("File fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}