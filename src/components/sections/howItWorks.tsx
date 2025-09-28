'use client'

import { useState } from 'react'
import { GitBranch, Brain, FileText, ArrowRight, ArrowDown } from 'lucide-react'

export default function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  const steps = [
    {
      number: "1",
      title: "Clone & Parse",
      description: "We securely clone your repository and analyze the code structure",
      icon: GitBranch,
    },
    {
      number: "2", 
      title: "AI Analysis",
      description: "Our AI understands your code and generates comprehensive documentation",
      icon: Brain,
    },
    {
      number: "3",
      title: "Generate & Export", 
      description: "Get beautiful docs ready to share with your team or community",
      icon: FileText,
    }
  ]

  return (
    <section id="how-it-works" className="w-full py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Three simple steps to beautiful documentation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div 
                className={`
                  bg-card border rounded-lg p-8 space-y-6 transition-all duration-300 ease-out
                  hover:shadow-md hover:border-primary/20
                  ${hoveredStep === index ? 'shadow-md border-primary/20' : ''}
                `}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{step.number}</div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Pipeline Connector - Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-border"></div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Pipeline Connector - Mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-6 mb-2">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Process Flow Visualization */}
      <div className="bg-card border rounded-2xl p-8 max-w-5xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-8">See the transformation</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
          {/* Input */}
          <div className="flex-1 space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground text-center">Your Repository</h4>
            <div className="bg-muted/50 rounded-lg p-6 border">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-sm font-mono">src/components/</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm font-mono">README.md</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm font-mono">package.json</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span className="text-sm font-mono">types/index.ts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Arrow */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
            </div>
            <div className="md:hidden flex flex-col items-center space-y-2">
              <div className="h-8 w-0.5 bg-border"></div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div className="h-8 w-0.5 bg-border"></div>
            </div>
          </div>

          {/* Output */}
          <div className="flex-1 space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground text-center">Generated Documentation</h4>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">Component Overview</p>
                    <p className="text-xs text-muted-foreground">Complete API documentation with props and methods</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">Usage Examples</p>
                    <p className="text-xs text-muted-foreground">Code snippets and integration guides</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">Setup Guide</p>
                    <p className="text-xs text-muted-foreground">Installation and configuration instructions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                  <div>
                    <p className="font-medium text-sm">Export Options</p>
                    <p className="text-xs text-muted-foreground">PDF, Markdown, and web formats available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}