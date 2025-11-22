"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Car, Calendar, Users, BarChart3, LogOut, Settings } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

const sidebarItems = [
    {
        title: "ダッシュボード",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "車両管理",
        href: "/admin/vehicles",
        icon: Car,
    },
    {
        title: "予約管理",
        href: "/admin/reservations",
        icon: Calendar,
    },
    {
        title: "ユーザー管理",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "分析",
        href: "/admin/analytics",
        icon: BarChart3,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white">
            <div className="flex h-14 items-center border-b border-slate-800 px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">CarSub Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
                                pathname === item.href ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800",
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t border-slate-800 p-4">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-white">
                            <LogOut className="mr-2 h-4 w-4" />
                            ユーザー画面に戻る
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
