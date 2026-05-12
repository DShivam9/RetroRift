import React, { useCallback } from 'react'
import { UploadCloud, FileType } from 'lucide-react'

export default function UploadRomArea({ onUpload, title = "Upload ROM" }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [onUpload])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      onUpload(arrayBuffer)
    } catch (err) {
      console.error("Failed to read file", err)
      alert("Failed to read the ROM file. Please try again.")
    }
  }

  return (
    <div 
      className="upload-rom-area flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer w-full aspect-video"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('rom-upload-input').click()}
    >
      <input 
        id="rom-upload-input"
        type="file" 
        accept=".gba,.gb,.gbc,.nes,.smc,.sfc,.z64,.n64,.gen,.md,.zip"
        className="hidden" 
        onChange={handleChange}
      />
      
      <div className="bg-indigo-500/20 p-4 rounded-full mb-4">
        <UploadCloud className="w-10 h-10 text-indigo-400" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-200 mb-2">Bring Your Own ROM</h3>
      <p className="text-slate-400 text-center max-w-sm mb-6">
        Drop your {title} game file here or click to browse.
      </p>
      
      <div className="flex gap-2 text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full">
        <FileType className="w-4 h-4" />
        <span>Supports .gba, .gbc, .nes, .sfc, .zip</span>
      </div>
    </div>
  )
}
