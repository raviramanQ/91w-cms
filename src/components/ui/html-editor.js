'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function HtmlEditor({ value, onChange, placeholder = 'Enter description...' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }

  if (!mounted) {
    return (
      <div className="h-40 border border-gray-300 rounded-md bg-gray-50 animate-pulse"></div>
    )
  }

  return (
    <ReactQuill
      theme="snow"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      className="bg-white"
    />
  )
}
