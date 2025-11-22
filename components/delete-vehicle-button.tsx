"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { Trash2 } from "lucide-react"

interface DeleteVehicleButtonProps {
  vehicleId: string
  vehicleName: string
}

export function DeleteVehicleButton({ vehicleId, vehicleName }: DeleteVehicleButtonProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      // まず、この車両に関連する予約があるかチェック
      const { data: reservations, error: reservationError } = await supabase
        .from("reservations")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .eq("status", "confirmed")

      if (reservationError) throw reservationError

      if (reservations && reservations.length > 0) {
        alert("この車両には確定済みの予約があるため削除できません。")
        return
      }

      // 車両を削除
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId)

      if (error) throw error

      // ページをリフレッシュ
      router.refresh()
    } catch (error) {
      console.error("車両の削除に失敗しました:", error)
      alert("車両の削除に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={loading}>
          <Trash2 className="h-4 w-4 mr-1" />
          削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>車両を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{vehicleName}」を削除します。この操作は取り消すことができません。
            確定済みの予約がある場合は削除できません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
