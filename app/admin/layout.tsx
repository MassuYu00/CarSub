import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* サイドバー (デスクトップ用) */}
            <div className="hidden md:block">
                <AdminSidebar />
            </div>

            {/* メインコンテンツ */}
            <div className="flex-1 flex flex-col min-h-screen">
                <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
            </div>
        </div>
    )
}
