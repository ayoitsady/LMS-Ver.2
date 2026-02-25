"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Star,
  GraduationCap,
  IndianRupee,
  Tag,
  Bell,
  ShoppingCart,
  MessageSquare,
  User,
  Lock,
  LogOut,
  Menu,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  {
    href: "/instructor/dashboard/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/instructor/courses/",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/instructor/quiz-manage/",
    label: "Quiz Manage",
    icon: FileText,
  },
  {
    href: "/instructor/create-course/",
    label: "Create Course",
    icon: Plus,
  },
  {
    href: "/instructor/reviews/",
    label: "Review",
    icon: Star,
  },
  {
    href: "/instructor/students/",
    label: "Students",
    icon: GraduationCap,
  },
  {
    href: "/instructor/earning/",
    label: "Earning",
    icon: IndianRupee,
  },
  {
    href: "/instructor/coupon/",
    label: "Coupons",
    icon: Tag,
  },
  {
    href: "/instructor/notifications/",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/instructor/orders/",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/instructor/question-answer/",
    label: "Q/A",
    icon: MessageSquare,
  },
];

const accountNavItems: NavItem[] = [
  {
    href: "/instructor/profile/",
    label: "Edit Profile",
    icon: User,
  },
  {
    href: "/instructor/change-password/",
    label: "Change Password",
    icon: Lock,
  },
  {
    href: "/login/",
    label: "Sign Out",
    icon: LogOut,
  },
];

function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-64">
      <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between lg:hidden mb-4">
          <span className="font-semibold text-gray-900">Menu</span>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-buttonsCustom-50 text-buttonsCustom-600"
                        : "text-gray-700 hover:bg-buttonsCustom-50/50 hover:text-buttonsCustom-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="px-3 text-sm font-semibold text-gray-900 mb-2">
              Account Settings
            </h3>
            <ul className="space-y-1">
              {accountNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-buttonsCustom-50 text-buttonsCustom-600"
                        : "text-gray-700 hover:bg-buttonsCustom-50/50 hover:text-buttonsCustom-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default InstructorSidebar;
