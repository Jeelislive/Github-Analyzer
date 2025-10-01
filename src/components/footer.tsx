'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import DotLottieIcon from '@/components/DotLottieIcon'

export default function Footer() {
  return (
    <footer className="bg-background">
      {/* Gradient top border for visual separation */}
      <div className="h-px w-full bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-cyan-500/50" />
      <div className="w-full px-4 md:px-8 lg:px-12 py-10">
        {/* Top row: brand + newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <DotLottieIcon src="/icons/Purple%20Git%20Cat.json" size={22} />
            </div>
            <div>
              <div className="text-xl font-bold">GitHub Analyzer</div>
              <p className="text-sm text-muted-foreground">Actionable insights for contributions, PRs, issues, and repos.</p>
            </div>
          </div>
          <form className="flex w-full lg:w-auto items-center gap-2" onSubmit={(e) => e.preventDefault()} aria-label="newsletter">
            <Input placeholder="Your email" type="email" className="w-full lg:w-72" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>

        {/* Link groups */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-8">
          <div className="col-span-2 lg:col-span-2">
            <p className="text-sm text-muted-foreground max-w-md">
              Track your open-source impact in real-time. Visualize trends, discover top repositories, and set goals to level up your contributions.
            </p>
            <div className="flex mt-4 gap-4 text-muted-foreground">
              <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-5 w-5"/></a>
              <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-5 w-5"/></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-5 w-5"/></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/prs" className="hover:text-foreground">Pull Requests</Link></li>
              <li><Link href="/issues" className="hover:text-foreground">Issues</Link></li>
              <li><Link href="/repos" className="hover:text-foreground">Repositories</Link></li>
              <li><Link href="/goals" className="hover:text-foreground">Goals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              <li><Link href="/changelog" className="hover:text-foreground">Changelog</Link></li>
              <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} GitHub Analyzer. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span className="hidden md:inline">•</span>
            <span>Built with ♥ for developers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}