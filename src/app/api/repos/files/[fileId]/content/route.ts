import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Octokit } from "@octokit/rest"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { fileId } = await params

    // Get the component/file details
    const component = await prisma.repoComponent.findUnique({
      where: { id: fileId },
      include: {
        repo: true
      }
    })

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 }
      )
    }

    // Verify the component belongs to a repo owned by the user
    if (component.repo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    try {
      // Fetch the file content from GitHub
      const { data: fileData } = await octokit.repos.getContent({
        owner: component.repo.owner,
        repo: component.repo.repoName,
        path: component.path
      })

      if ('content' in fileData) {
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
        
        // Extract the specific lines for this component
        const lines = content.split('\n')
        const componentLines = lines.slice(
          Math.max(0, component.startLine - 1), 
          component.endLine
        )
        
        return NextResponse.json({
          content: componentLines.join('\n'),
          fullContent: content,
          startLine: component.startLine,
          endLine: component.endLine,
          totalLines: lines.length
        })
      } else {
        return NextResponse.json(
          { error: "File is not a regular file" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Failed to fetch file content from GitHub:', error)
      return NextResponse.json(
        { error: "Failed to fetch file content" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error fetching component code:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



