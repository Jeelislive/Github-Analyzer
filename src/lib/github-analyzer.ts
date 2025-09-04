import { Octokit } from "@octokit/rest"
import { prisma } from "./prisma"
import { analyzeCode, parseImports, calculateComplexity } from "./code-analyzer"
import { generateDocumentation } from "./documentation-generator"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

export interface RepositoryData {
  owner: string
  repo: string
  branch?: string
}

export async function analyzeRepository(
  repoId: string,
  owner: string,
  repoName: string,
  userId: string
) {
  try {
    console.log(`Starting analysis for ${owner}/${repoName}`)
    
    // Update status to analyzing
    await prisma.analyzedRepo.update({
      where: { id: repoId },
      data: { analysisStatus: "analyzing" }
    })

    // Get repository information with better error handling
    let repoInfo;
    try {
      const { data } = await octokit.repos.get({
        owner,
        repo: repoName
      })
      repoInfo = data;
    } catch (apiError: any) {
      await handleGitHubApiError(repoId, owner, repoName, apiError);
      return;
    }

    // Update basic repository information
    await prisma.analyzedRepo.update({
      where: { id: repoId },
      data: {
        description: repoInfo.description,
        defaultBranch: repoInfo.default_branch,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        size: repoInfo.size,
        lastCommit: repoInfo.pushed_at ? new Date(repoInfo.pushed_at) : null
      }
    })

    // Get repository tree with error handling
    let tree;
    try {
      const { data } = await octokit.git.getTree({
        owner,
        repo: repoName,
        tree_sha: repoInfo.default_branch,
        recursive: "1"
      })
      tree = data;
    } catch (treeError: any) {
      console.error(`Failed to get repository tree for ${owner}/${repoName}:`, treeError);
      await prisma.analyzedRepo.update({
        where: { id: repoId },
        data: { 
          analysisStatus: "failed",
          data: { 
            error: "Failed to access repository structure. The repository might be empty or have restricted access.",
            errorType: "tree_access_error"
          },
          updatedAt: new Date()
        }
      })
      return;
    }

    // Analyze files and structure
    await analyzeRepositoryStructure(repoId, owner, repoName, tree.tree)
    
    // Analyze dependencies
    await analyzeDependencies(repoId, owner, repoName)
    
    // Generate analytics
    await generateAnalytics(repoId)
    
    // Generate documentation
    await generateRepoDocumentation(repoId, owner, repoName)

    // Update status to completed
    await prisma.analyzedRepo.update({
      where: { id: repoId },
      data: { 
        analysisStatus: "completed",
        updatedAt: new Date()
      }
    })

    console.log(`Analysis completed for ${owner}/${repoName}`)

  } catch (error) {
    console.error(`Analysis failed for ${owner}/${repoName}:`, error)
    
    await prisma.analyzedRepo.update({
      where: { id: repoId },
      data: { 
        analysisStatus: "failed",
        data: { 
          error: "Unexpected error occurred during analysis",
          errorType: "general_error",
          details: error instanceof Error ? error.message : String(error)
        },
        updatedAt: new Date()
      }
    })
  }
}

async function handleGitHubApiError(repoId: string, owner: string, repoName: string, error: any) {
  let errorMessage = "Unknown error occurred";
  let errorType = "unknown_error";
  
  if (error.status === 404) {
    errorMessage = `Repository '${owner}/${repoName}' not found. Please check if the repository exists and is public.`;
    errorType = "repository_not_found";
  } else if (error.status === 403) {
    if (error.message?.includes('rate limit')) {
      errorMessage = "GitHub API rate limit exceeded. Please try again later.";
      errorType = "rate_limit_exceeded";
    } else {
      errorMessage = `Access denied to repository '${owner}/${repoName}'. The repository might be private or require authentication.`;
      errorType = "access_denied";
    }
  } else if (error.status === 401) {
    errorMessage = "GitHub authentication failed. Please check your GitHub token configuration.";
    errorType = "authentication_failed";
  } else if (error.status >= 500) {
    errorMessage = "GitHub API is experiencing issues. Please try again later.";
    errorType = "github_server_error";
  } else {
    errorMessage = `GitHub API error: ${error.message || 'Unknown error'}`;
    errorType = "github_api_error";
  }

  console.error(`GitHub API error for ${owner}/${repoName}:`, {
    status: error.status,
    message: error.message,
    errorType
  });

  await prisma.analyzedRepo.update({
    where: { id: repoId },
    data: { 
      analysisStatus: "failed",
      data: { 
        error: errorMessage,
        errorType,
        githubStatus: error.status
      },
      updatedAt: new Date()
    }
  })
}

async function analyzeRepositoryStructure(
  repoId: string,
  owner: string,
  repoName: string,
  tree: any[]
) {
  const filePromises = tree
    .filter(item => item.type === "blob")
    .slice(0, 500) // Limit to prevent rate limiting
    .map(async (file) => {
      try {
        const extension = file.path?.split('.').pop()?.toLowerCase()
        const language = getLanguageFromExtension(extension)
        
        // Skip binary files and very large files
        if (file.size > 1000000 || isBinaryFile(extension)) {
          return null
        }

        let content = null
        let linesOfCode = 0
        let complexity = 0

        // Get file content for analysis
        if (shouldAnalyzeFile(extension)) {
          try {
            const { data: fileData } = await octokit.repos.getContent({
              owner,
              repo: repoName,
              path: file.path!
            })

            if ('content' in fileData) {
              content = Buffer.from(fileData.content, 'base64').toString('utf-8')
              linesOfCode = content.split('\n').length
              complexity = calculateComplexity(content, language)
            }
          } catch (error) {
            console.warn(`Failed to get content for ${file.path}:`, error)
          }
        }

        return {
          repoId,
          path: file.path!,
          name: file.path!.split('/').pop()!,
          type: "file",
          extension,
          size: file.size,
          language,
          content,
          linesOfCode,
          complexity
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${file.path}:`, error)
        return null
      }
    })

  const files = (await Promise.all(filePromises)).filter(Boolean) as any[]
  
  // Batch insert files
  if (files.length > 0) {
    await prisma.repoFile.createMany({
      data: files,
      skipDuplicates: true
    })
  }

  // Analyze file relationships and imports
  await analyzeFileRelationships(repoId)
  
  // Identify and extract components
  await extractComponents(repoId)
}

async function analyzeFileRelationships(repoId: string) {
  const files = await prisma.repoFile.findMany({
    where: { 
      repoId,
      content: { not: null },
      language: { in: ['javascript', 'typescript', 'jsx', 'tsx'] }
    }
  })

  const imports: any[] = []

  for (const file of files) {
    if (!file.content) continue

    try {
      const fileImports = parseImports(file.content, file.language!)
      
      for (const imp of fileImports) {
        // Try to resolve the import to an actual file
        const importedFile = await resolveImport(repoId, file.path, imp.source)
        
        if (importedFile) {
          imports.push({
            importingFileId: file.id,
            importedFileId: importedFile.id,
            importPath: imp.source,
            importType: imp.type
          })
        }
      }
    } catch (error) {
      console.warn(`Failed to parse imports for ${file.path}:`, error)
    }
  }

  if (imports.length > 0) {
    await prisma.fileImport.createMany({
      data: imports,
      skipDuplicates: true
    })
  }
}

async function extractComponents(repoId: string) {
  const files = await prisma.repoFile.findMany({
    where: { 
      repoId,
      content: { not: null },
      language: { in: ['javascript', 'typescript', 'jsx', 'tsx'] }
    }
  })

  const components: any[] = []

  for (const file of files) {
    if (!file.content) continue

    try {
      const extractedComponents = analyzeCode(file.content, file.language!)
      
      for (const component of extractedComponents) {
        components.push({
          repoId,
          name: component.name,
          type: component.type,
          path: file.path,
          startLine: component.startLine,
          endLine: component.endLine,
          props: component.props,
          exports: component.exports,
          description: component.description,
          complexity: component.complexity
        })
      }
    } catch (error) {
      console.warn(`Failed to extract components from ${file.path}:`, error)
    }
  }

  if (components.length > 0) {
    await prisma.repoComponent.createMany({
      data: components,
      skipDuplicates: true
    })
  }
}

async function analyzeDependencies(repoId: string, owner: string, repoName: string) {
  try {
    // Check for package.json
    const packageJsons = ['package.json', 'packages/*/package.json']
    
    for (const pattern of packageJsons) {
      try {
        const { data: packageData } = await octokit.repos.getContent({
          owner,
          repo: repoName,
          path: 'package.json'
        })

        if ('content' in packageData) {
          const content = Buffer.from(packageData.content, 'base64').toString('utf-8')
          const packageJson = JSON.parse(content)
          
          const dependencies: any[] = []
          
          // Process dependencies
          Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
            dependencies.push({
              repoId,
              name,
              version: version as string,
              type: 'production'
            })
          })
          
          Object.entries(packageJson.devDependencies || {}).forEach(([name, version]) => {
            dependencies.push({
              repoId,
              name,
              version: version as string,
              type: 'development'
            })
          })
          
          Object.entries(packageJson.peerDependencies || {}).forEach(([name, version]) => {
            dependencies.push({
              repoId,
              name,
              version: version as string,
              type: 'peer'
            })
          })

          if (dependencies.length > 0) {
            await prisma.repoDependency.createMany({
              data: dependencies,
              skipDuplicates: true
            })
          }
        }
      } catch (error) {
        // package.json might not exist
      }
    }
    
    // TODO: Add support for other dependency files (requirements.txt, Cargo.toml, etc.)
    
  } catch (error) {
    console.warn('Failed to analyze dependencies:', error)
  }
}

async function generateAnalytics(repoId: string) {
  const files = await prisma.repoFile.findMany({
    where: { repoId }
  })

  const totalFiles = files.length
  const totalLinesOfCode = files.reduce((sum, file) => sum + (file.linesOfCode || 0), 0)
  
  // Calculate language distribution
  const languageDistribution: Record<string, number> = {}
  files.forEach(file => {
    if (file.language) {
      languageDistribution[file.language] = (languageDistribution[file.language] || 0) + (file.linesOfCode || 0)
    }
  })

  // Calculate complexity metrics
  const complexityScore = files.reduce((sum, file) => sum + (file.complexity || 0), 0) / totalFiles
  const maintainabilityIndex = calculateMaintainabilityIndex(files)

  await prisma.repoAnalytics.create({
    data: {
      repoId,
      totalFiles,
      totalLinesOfCode,
      languageDistribution,
      complexityScore,
      maintainabilityIndex,
      technicalDebtRatio: complexityScore > 10 ? 0.8 : 0.2
    }
  })
}

async function generateRepoDocumentation(repoId: string, owner: string, repoName: string) {
  try {
    // Get README
    let readme = null
    try {
      const { data: readmeData } = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path: 'README.md'
      })
      
      if ('content' in readmeData) {
        readme = Buffer.from(readmeData.content, 'base64').toString('utf-8')
      }
    } catch (error) {
      // README might not exist
    }

    // Generate API documentation
    const components = await prisma.repoComponent.findMany({
      where: { repoId }
    })
    
    const apiDocs = await generateDocumentation(components, repoId)

    await prisma.repoDocumentation.create({
      data: {
        repoId,
        readme,
        apiDocs
      }
    })
  } catch (error) {
    console.warn('Failed to generate documentation:', error)
  }
}

// Helper functions
function getLanguageFromExtension(extension?: string): string | null {
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'dart': 'dart',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql'
  }
  
  return extension ? languageMap[extension] || null : null
}

function isBinaryFile(extension?: string): boolean {
  const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib']
  return extension ? binaryExtensions.includes(extension) : false
}

function shouldAnalyzeFile(extension?: string): boolean {
  const analyzableExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'dart']
  return extension ? analyzableExtensions.includes(extension) : false
}

async function resolveImport(repoId: string, filePath: string, importPath: string): Promise<any | null> {
  // Simple import resolution logic
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    // Relative import
    const basePath = filePath.split('/').slice(0, -1).join('/')
    const resolvedPath = resolvePath(basePath, importPath)
    
    return await prisma.repoFile.findFirst({
      where: {
        repoId,
        OR: [
          { path: resolvedPath },
          { path: `${resolvedPath}.js` },
          { path: `${resolvedPath}.ts` },
          { path: `${resolvedPath}.jsx` },
          { path: `${resolvedPath}.tsx` },
          { path: `${resolvedPath}/index.js` },
          { path: `${resolvedPath}/index.ts` },
          { path: `${resolvedPath}/index.jsx` },
          { path: `${resolvedPath}/index.tsx` }
        ]
      }
    })
  }
  
  return null
}

function resolvePath(basePath: string, relativePath: string): string {
  const parts = basePath.split('/')
  const relativeParts = relativePath.split('/')
  
  for (const part of relativeParts) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '.') {
      parts.push(part)
    }
  }
  
  return parts.join('/')
}

function calculateMaintainabilityIndex(files: any[]): number {
  // Simplified maintainability index calculation
  const avgComplexity = files.reduce((sum, file) => sum + (file.complexity || 0), 0) / files.length
  const avgLinesOfCode = files.reduce((sum, file) => sum + (file.linesOfCode || 0), 0) / files.length
  
  return Math.max(0, 171 - 5.2 * Math.log(avgLinesOfCode) - 0.23 * avgComplexity)
}