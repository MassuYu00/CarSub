"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Trash2 } from "lucide-react"
import Image from "next/image"

interface MultiImageUploadProps {
    value: string[]
    onChange: (urls: string[]) => void
    onRemove: (url: string) => void
    disabled?: boolean
}

export function MultiImageUpload({ value = [], onChange, onRemove, disabled }: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        try {
            const newUrls: string[] = []

            // Upload each file sequentially
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || "アップロードに失敗しました")
                }

                const result = await response.json()
                newUrls.push(result.url)
            }

            onChange([...value, ...newUrls])
        } catch (error) {
            console.error("アップロードエラー:", error)
            alert("画像のアップロードに失敗しました")
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = async (urlToRemove: string) => {
        try {
            await fetch("/api/delete-image", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: urlToRemove }),
            })
        } catch (error) {
            console.error("画像削除エラー:", error)
        }

        onRemove(urlToRemove)
    }

    return (
        <div className="space-y-4">
            <Label>車両画像（複数登録可）</Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {value.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group">
                        <Image src={url || "/placeholder.svg"} alt={`車両画像 ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemove(url)}
                                disabled={disabled}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="aspect-video border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center">
                        {uploading ? "アップロード中..." : "画像を追加"}
                    </span>
                </div>
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
            />
        </div>
    )
}
