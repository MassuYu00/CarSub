"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MultiImageUpload } from "@/components/multi-image-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const EQUIPMENT_OPTIONS = [
  { id: "navigation", label: "カーナビ" },
  { id: "etc", label: "ETC" },
  { id: "backup_camera", label: "バックカメラ" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "dash_cam", label: "ドライブレコーダー" },
  { id: "leather_seats", label: "本革シート" },
  { id: "sunroof", label: "サンルーフ" },
  { id: "nonsmoking", label: "禁煙車" },
  { id: "pet_friendly", label: "ペット可" },
]

export default function AddVehiclePage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    license_plate: "",
    fuel_type: "",
    transmission: "",
    seats: "",
    daily_rate: "",
    description: "",
    images: [] as string[],
    equipment: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("vehicles").insert([
        {
          ...formData,
          year: Number.parseInt(formData.year),
          seats: Number.parseInt(formData.seats),
          daily_rate: Number.parseFloat(formData.daily_rate),
          status: "available",
          image_url: formData.images[0] || "", // Main image is the first one
        },
      ])

      if (error) throw error

      router.push("/admin/vehicles")
    } catch (error) {
      console.error("車両の追加に失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEquipmentChange = (id: string, checked: boolean) => {
    setFormData((prev) => {
      const newEquipment = checked
        ? [...prev.equipment, id]
        : prev.equipment.filter((item) => item !== id)
      return { ...prev, equipment: newEquipment }
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          車両管理に戻る
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新しい車両を追加</CardTitle>
          <CardDescription>レンタル用の新しい車両情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <MultiImageUpload
              value={formData.images}
              onChange={(urls) => handleChange("images", urls)}
              onRemove={(url) => handleChange("images", formData.images.filter((u) => u !== url))}
              disabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">メーカー</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                  placeholder="トヨタ"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">モデル</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="プリウス"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">年式</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  placeholder="2023"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">色</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="白"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">ナンバープレート</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => handleChange("license_plate", e.target.value)}
                  placeholder="品川 123 あ 4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">燃料タイプ</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => handleChange("fuel_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="燃料タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">ガソリン</SelectItem>
                    <SelectItem value="hybrid">ハイブリッド</SelectItem>
                    <SelectItem value="electric">電気</SelectItem>
                    <SelectItem value="diesel">ディーゼル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">トランスミッション</Label>
                <Select value={formData.transmission} onValueChange={(value) => handleChange("transmission", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="トランスミッションを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">オートマチック</SelectItem>
                    <SelectItem value="manual">マニュアル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">座席数</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => handleChange("seats", e.target.value)}
                  placeholder="5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_rate">1日料金（円）</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => handleChange("daily_rate", e.target.value)}
                  placeholder="8000"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>装備・オプション</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={formData.equipment.includes(item.id)}
                      onCheckedChange={(checked) => handleEquipmentChange(item.id, checked as boolean)}
                    />
                    <Label htmlFor={item.id} className="cursor-pointer font-normal">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="車両の詳細説明を入力してください"
                rows={4}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "追加中..." : "車両を追加"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}