import { Code, FileText, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DocumentationPreview() {
  return (
    <section className="w-full py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6"># Generated Documentation</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Installation Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">## Installation</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 font-mono text-lg">
                    npm install my-package
                  </code>
                </div>
              </div>

              {/* Usage Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">## Usage</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-blue-400 font-mono text-lg">
                    import {`{ MyComponent }`} from 'my-package';
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}