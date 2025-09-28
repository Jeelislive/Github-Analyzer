'use client'

import React from 'react'
import { Card } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Trash2, AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  repository: {
    id: string
    owner: string
    repoName: string
    description?: string
    language?: string
    stars?: number
    forks?: number
  }
  isLoading?: boolean
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  repository,
  isLoading = false
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Repository Analysis</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Repository Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {repository.owner}/{repository.repoName}
                </h4>
                {repository.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {repository.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              {repository.language && (
                <Badge variant="outline" className="text-xs">
                  {repository.language}
                </Badge>
              )}
              {repository.stars !== undefined && (
                <Badge variant="outline" className="text-xs">
                  ⭐ {repository.stars}
                </Badge>
              )}
              {repository.forks !== undefined && (
                <Badge variant="outline" className="text-xs">
                  🍴 {repository.forks}
                </Badge>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-red-800 mb-1">Warning</h5>
                <p className="text-sm text-red-700">
                  This will permanently delete all analysis data for this repository, including:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Architecture analysis and diagrams</li>
                  <li>• Code quality metrics and insights</li>
                  <li>• Technology stack analysis</li>
                  <li>• Team collaboration data</li>
                  <li>• All generated documentation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Analysis
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}


