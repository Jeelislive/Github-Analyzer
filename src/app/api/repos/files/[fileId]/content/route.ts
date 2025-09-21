import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Octokit } from "@octokit/rest"

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
    const { searchParams } = new URL(request.url)
    const qsPath = searchParams.get('path') || undefined
    const qsRepoId = searchParams.get('repoId') || undefined

    // Get the component/file details
    const component = await prisma.repoComponent.findUnique({
      where: { id: fileId },
      include: {
        repo: true
      }
    })

    if (!component) {
      // Try fallback: maybe the fileId refers to RepoFile
      const file = await prisma.repoFile.findUnique({ where: { id: fileId } })
      if (file) {
        return NextResponse.json({
          content: file.content || '',
          startLine: 1,
          endLine: file.linesOfCode || (file.content ? file.content.split('\n').length : 1),
          totalLines: file.linesOfCode || (file.content ? file.content.split('\n').length : 1),
        })
      }
      // Try querystring path+repoId
      if (qsPath && qsRepoId) {
        const repo = await prisma.analyzedRepo.findUnique({ where: { id: qsRepoId } })
        if (!repo) {
          return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
        }
        const dbFile = await prisma.repoFile.findFirst({ where: { repoId: qsRepoId, path: qsPath } })
        if (dbFile?.content) {
          return NextResponse.json({
            content: dbFile.content,
            startLine: 1,
            endLine: dbFile.linesOfCode || dbFile.content.split('\n').length,
            totalLines: dbFile.linesOfCode || dbFile.content.split('\n').length,
          })
        }
        // As a last resort, fetch from GitHub
        const accessToken: string | undefined = (session as any)?.accessToken
        const octokit = new Octokit({ auth: accessToken || process.env.GITHUB_TOKEN })
        const { data: fileData } = await octokit.repos.getContent({ owner: repo.owner, repo: repo.repoName, path: qsPath })
        if ('content' in fileData) {
          const content = Buffer.from((fileData as any).content as string, 'base64').toString('utf-8')
          return NextResponse.json({ content, startLine: 1, endLine: content.split('\n').length, totalLines: content.split('\n').length })
        }
      }
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
      // Prefer the user's OAuth access token to avoid missing permissions
      const accessToken: string | undefined = (session as any)?.accessToken
      const octokit = new Octokit({ auth: accessToken || process.env.GITHUB_TOKEN })
      // Fetch the file content from GitHub
      const { data: fileData } = await octokit.repos.getContent({
        owner: component.repo.owner,
        repo: component.repo.repoName,
        path: component.path
      })

      if ('content' in fileData) {
        const content = Buffer.from(fileData.content as string, 'base64').toString('utf-8')
        
        // Extract the specific lines for this component (with safe defaults)
        const lines = content.split('\n')
        const start = Math.max(0, (component.startLine ?? 1) - 1)
        const end = component.endLine ?? lines.length
        const componentLines = lines.slice(start, end)
        
        return NextResponse.json({
          content: content, // return full file content as primary
          componentSnippet: componentLines.join('\n'),
          startLine: component.startLine ?? 1,
          endLine: component.endLine ?? lines.length,
          totalLines: lines.length
        })
      } else {
        // Fallback to RepoFile content stored in DB
        const dbFile = await prisma.repoFile.findFirst({ where: { repoId: component.repoId, path: component.path } })
        if (dbFile?.content) {
          return NextResponse.json({
            content: dbFile.content,
            startLine: 1,
            endLine: dbFile.linesOfCode || dbFile.content.split('\n').length,
            totalLines: dbFile.linesOfCode || dbFile.content.split('\n').length,
          })
        }
        return NextResponse.json(
          { error: "File is not a regular file or content unavailable" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Failed to fetch file content from GitHub:', error)
      // Fallback to RepoFile content stored in DB on API error
      const dbFile = await prisma.repoFile.findFirst({ where: { repoId: component.repoId, path: component.path } })
      if (dbFile?.content) {
        return NextResponse.json({
          content: dbFile.content,
          startLine: 1,
          endLine: dbFile.linesOfCode || dbFile.content.split('\n').length,
          totalLines: dbFile.linesOfCode || dbFile.content.split('\n').length,
        })
      }
      return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching component code:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



