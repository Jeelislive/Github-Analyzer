import * as ts from 'typescript'
import * as babel from '@babel/parser'
import traverse from '@babel/traverse'
import type { Node } from '@babel/types'

export interface CodeComponent {
  name: string
  type: 'component' | 'function' | 'class' | 'hook' | 'util'
  startLine: number
  endLine: number
  props?: Record<string, unknown>
  exports?: Record<string, unknown>
  description?: string
  complexity: number
}

export interface ImportInfo {
  source: string
  type: 'default' | 'named' | 'namespace' | 'dynamic'
  imports: string[]
}

export function analyzeCode(content: string, language: string): CodeComponent[] {
  const components: CodeComponent[] = []
  
  try {
    if (language === 'typescript' || language === 'tsx') {
      return analyzeTypeScript(content)
    } else if (language === 'javascript' || language === 'jsx') {
      return analyzeJavaScript(content)
    }
  } catch (error) {
    console.warn('Failed to analyze code:', error)
  }
  
  return components
}

export function parseImports(content: string, language: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  
  try {
    if (language === 'typescript' || language === 'tsx') {
      return parseTypeScriptImports(content)
    } else if (language === 'javascript' || language === 'jsx') {
      return parseJavaScriptImports(content)
    }
  } catch (error) {
    console.warn('Failed to parse imports:', error)
  }
  
  return imports
}

export function calculateComplexity(content: string, language: string | null): number {
  if (!language) return 0
  
  try {
    // Simple cyclomatic complexity calculation
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\s*:/g, // ternary operator
      /&&/g,
      /\|\|/g
    ]
    
    let complexity = 1 // Base complexity
    
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    })
    
    return complexity
  } catch (error) {
    return 0
  }
}

function analyzeTypeScript(content: string): CodeComponent[] {
  const components: CodeComponent[] = []
  
  try {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      content,
      ts.ScriptTarget.Latest,
      true
    )
    
    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
        const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
        
        components.push({
          name: node.name.text,
          type: isReactComponent(node) ? 'component' : 'function',
          startLine,
          endLine,
          complexity: calculateNodeComplexity(node),
          description: getJSDocDescription(node)
        })
      }
      
      if (ts.isClassDeclaration(node) && node.name) {
        const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
        const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
        
        components.push({
          name: node.name.text,
          type: isReactComponent(node) ? 'component' : 'class',
          startLine,
          endLine,
          complexity: calculateNodeComplexity(node),
          description: getJSDocDescription(node)
        })
      }
      
      if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
          const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
          const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
          
          const name = node.name.text
          let type: CodeComponent['type'] = 'function'
          
          if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
            type = 'hook'
          } else if (isReactComponent(node.initializer)) {
            type = 'component'
          }
          
          components.push({
            name,
            type,
            startLine,
            endLine,
            complexity: calculateNodeComplexity(node.initializer),
            props: extractReactProps(node.initializer) || undefined,
            description: getJSDocDescription(node)
          })
        }
      }
      
      ts.forEachChild(node, visit)
    }
    
    visit(sourceFile)
  } catch (error) {
    console.warn('TypeScript analysis failed:', error)
  }
  
  return components
}

function analyzeJavaScript(content: string): CodeComponent[] {
  const components: CodeComponent[] = []
  
  try {
    const ast = babel.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    })
    
    traverse(ast, {
      FunctionDeclaration(path: any) {
        const node = path.node
        if (node.id) {
          components.push({
            name: node.id.name,
            type: isReactComponentAST(node) ? 'component' : 'function',
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0,
            complexity: calculateASTComplexity(node),
            props: extractReactPropsAST(node) || undefined,
            description: getLeadingComments(path)
          })
        }
      },
      
      ClassDeclaration(path: any) {
        const node = path.node
        if (node.id) {
          components.push({
            name: node.id.name,
            type: isReactComponentAST(node) ? 'component' : 'class',
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0,
            complexity: calculateASTComplexity(node),
            description: getLeadingComments(path)
          })
        }
      },
      
      VariableDeclarator(path: any) {
        const node = path.node
        if (node.id.type === 'Identifier' && 
            (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')) {
          
          const name = node.id.name
          let type: CodeComponent['type'] = 'function'
          
          if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
            type = 'hook'
          } else if (isReactComponentAST(node.init)) {
            type = 'component'
          }
          
          components.push({
            name,
            type,
            startLine: node.loc?.start.line || 0,
            endLine: node.loc?.end.line || 0,
            complexity: calculateASTComplexity(node.init),
            props: extractReactPropsAST(node.init) || undefined,
            description: getLeadingComments(path)
          })
        }
      }
    })
  } catch (error) {
    console.warn('JavaScript analysis failed:', error)
  }
  
  return components
}

function parseTypeScriptImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  
  try {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      content,
      ts.ScriptTarget.Latest,
      true
    )
    
    function visit(node: ts.Node) {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const source = node.moduleSpecifier.text
        const importClause = node.importClause
        
        if (importClause) {
          if (importClause.name) {
            // Default import
            imports.push({
              source,
              type: 'default',
              imports: [importClause.name.text]
            })
          }
          
          if (importClause.namedBindings) {
            if (ts.isNamedImports(importClause.namedBindings)) {
              // Named imports
              const namedImports = importClause.namedBindings.elements.map(element => 
                element.propertyName ? element.propertyName.text : element.name.text
              )
              imports.push({
                source,
                type: 'named',
                imports: namedImports
              })
            } else if (ts.isNamespaceImport(importClause.namedBindings)) {
              // Namespace import
              imports.push({
                source,
                type: 'namespace',
                imports: [importClause.namedBindings.name.text]
              })
            }
          }
        }
      }
      
      ts.forEachChild(node, visit)
    }
    
    visit(sourceFile)
  } catch (error) {
    console.warn('TypeScript import parsing failed:', error)
  }
  
  return imports
}

function parseJavaScriptImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  
  try {
    const ast = babel.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    })
    
    traverse(ast, {
      ImportDeclaration(path: any) {
        const node = path.node
        const source = node.source.value
        
        node.specifiers.forEach((specifier: any) => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            imports.push({
              source,
              type: 'default',
              imports: [specifier.local.name]
            })
          } else if (specifier.type === 'ImportSpecifier') {
            imports.push({
              source,
              type: 'named',
              imports: [specifier.imported.name || specifier.local.name]
            })
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            imports.push({
              source,
              type: 'namespace',
              imports: [specifier.local.name]
            })
          }
        })
      }
    })
  } catch (error) {
    console.warn('JavaScript import parsing failed:', error)
  }
  
  return imports
}

// Helper functions
function isReactComponent(node: ts.Node): boolean {
  // Simple heuristic to detect React components
  const nodeText = node.getText ? node.getText() : ''
  return nodeText.includes('JSX') || nodeText.includes('React') || nodeText.includes('return (')
}

function isReactComponentAST(node: Node): boolean {
  // Check if function returns JSX
  return JSON.stringify(node).includes('JSXElement') || JSON.stringify(node).includes('JSXFragment')
}

function calculateNodeComplexity(node: ts.Node): number {
  // Simple complexity calculation for TypeScript nodes
  const nodeText = node.getText ? node.getText() : ''
  return calculateComplexity(nodeText, 'typescript')
}

function calculateASTComplexity(node: Node): number {
  // Simple complexity calculation for Babel AST nodes
  let complexity = 1
  
  traverse(node, {
    IfStatement: () => complexity++,
    ConditionalExpression: () => complexity++,
    LogicalExpression: () => complexity++,
    WhileStatement: () => complexity++,
    ForStatement: () => complexity++,
    ForInStatement: () => complexity++,
    ForOfStatement: () => complexity++,
    SwitchCase: () => complexity++,
    CatchClause: () => complexity++
  })
  
  return complexity
}

function extractReactProps(node: ts.Node): Record<string, unknown> | undefined {
  try {
    // Extract React component props from TypeScript function
    if (ts.isFunctionLike(node) && node.parameters && node.parameters.length > 0) {
      const firstParam = node.parameters[0]
      if (firstParam.type) {
        return {
          type: firstParam.type.getText ? firstParam.type.getText() : 'unknown'
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return undefined
}

function extractReactPropsAST(node: Node): Record<string, unknown> | undefined {
  try {
    // Extract React component props from Babel AST
    if ((node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') && 
        'params' in node && node.params && node.params.length > 0) {
      const firstParam = node.params[0]
      if ('typeAnnotation' in firstParam && firstParam.typeAnnotation) {
        return {
          type: 'TypeScript',
          annotation: firstParam.typeAnnotation.type
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return undefined
}

function getJSDocDescription(node: ts.Node): string | undefined {
  try {
    // Extract JSDoc comments from TypeScript nodes
    const sourceFile = node.getSourceFile()
    const fullText = sourceFile.getFullText()
    const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart())
    
    if (commentRanges && commentRanges.length > 0) {
      const lastComment = commentRanges[commentRanges.length - 1]
      const commentText = fullText.substring(lastComment.pos, lastComment.end)
      
      // Extract description from JSDoc
      const descMatch = commentText.match(/\*\s*(.+?)(?:\n|\*\/)/)
      return descMatch ? descMatch[1].trim() : undefined
    }
  } catch {
    // Ignore errors
  }
  return undefined
}

function getLeadingComments(path: any): string | undefined {
  try {
    // Extract leading comments from Babel AST
    const comments = path.node.leadingComments
    if (comments && comments.length > 0) {
      const lastComment = comments[comments.length - 1]
      return lastComment.value.trim()
    }
  } catch {
    // Ignore errors
  }
  return undefined
}