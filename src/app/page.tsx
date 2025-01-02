'use client'

import { FileContentCopier } from '@/components/file-copier'

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">File Content Copier</h1>
      <FileContentCopier />
    </main>
  )
}