"use client"

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
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CancelReservationButtonProps {
  reservationId: string
  disabled?: boolean
}

export function CancelReservationButton({ reservationId, disabled = false }: CancelReservationButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/reservations/${reservationId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to cancel reservation")
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          キャンセル
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>予約をキャンセルしますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消すことができません。予約をキャンセルしてもよろしいですか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>戻る</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
            {isLoading ? "キャンセル中..." : "キャンセルする"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
