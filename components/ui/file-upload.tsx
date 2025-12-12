"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, User } from "lucide-react"

interface FileUploadProps {
  value?: string
  onChange: (value: string) => void
  accept?: string
  placeholder?: string
}

export function FileUpload({ value, onChange, accept = "image/*", placeholder = "Upload Photo" }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        onChange(base64)
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />

      {preview ? (
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-muted">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <User className="h-8 w-8 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground mt-1">Upload</span>
            </>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        <Upload className="h-4 w-4" />
        {placeholder}
      </Button>
    </div>
  )
}
