import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const repoId = params.repoId
    
    if (!repoId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      )
    }

    // Import Prisma client
    const { prisma } = await import('@/lib/prisma')
    
    // Check if the repository exists and belongs to the user
    const repository = await prisma.analyzedRepo.findFirst({
      where: {
        id: repoId,
        userId: session.user.id
      }
    })

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Delete the repository analysis
    await prisma.analyzedRepo.delete({
      where: {
        id: repoId
      }
    })


    return NextResponse.json({
      success: true,
      message: `Repository analysis for ${repository.owner}/${repository.repoName} has been deleted successfully`
    })

  } catch (error) {
    console.error("Delete repository error:", error)
    return NextResponse.json(
      { 
        error: "Failed to delete repository analysis", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}


