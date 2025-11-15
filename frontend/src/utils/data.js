import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
    LuTrendingUp,
    LuZap,
    LuSettings
} from "react-icons/lu"
import { GiSmart } from "react-icons/gi"

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icons: LuLayoutDashboard,
        path: '/admin/dashboard'
    },
    {
        id: "02",
        label: "Manage Tasks",
        icons: LuClipboardCheck,
        path: '/admin/tasks'
    },
    {
        id: "03",
        label: "Create Task",
        icons: LuSquarePlus,
        path: '/admin/create-task'
    },
    {
        id: "04",
        label: "Task Insights",
        icons: LuTrendingUp,
        path: '/admin/insights'
    },
    {
        id: "05",
        label: "Bulk Operations",
        icons: LuZap,
        path: '/admin/bulk-operations'
    },
    {
        id: "06",
        label: "Team Members",
        icons: LuUsers,
        path: '/admin/users'
    },
    {
        id: "07",
        label: "Ai-Dashboard",
        icons: GiSmart,
        path: '/admin/ai-dashboard'
    },
    {
        id: "08",
        label: "Setting",
        icons: LuSettings,
        path: '/admin/setting'
    },
    {
        id: "09",
        label: "Logout",
        icons: LuLogOut,
        path: 'logout'
    }
]

export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icons: LuLayoutDashboard,
        path: '/user/dashboard'
    },
    {
        id: "02",
        label: "Manage Tasks",
        icons: LuClipboardCheck,
        path: '/user/tasks'
    },
    {
        id: "03",
        label: "Create Task",
        icons: LuSquarePlus,
        path: '/user/create-task'
    }, 
    {
        id: "04",
        label: "Team Members",
        icons: LuUsers,
        path: '/user/users'
    },
    // {
    //     id: "05",
    //     label: "Ai-Dashboard",
    //     icons: GiSmart,
    //     path: '/user/ai-dashboard'
    // },
    {
        id: "06",
        label: "Setting",
        icons: LuSettings,
        path: '/user/setting'
    },
    {
        id: "07",
        label: "Logout",
        icons: LuLogOut,
        path: 'logout'
    }

]

export const PRIORITY_DATA = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
]


export const STATUS_DATA = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
]

