import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
    LuTrendingUp,
    LuZap,
    LuSettings,
    LuFile,
    LuProjector,
    LuFileArchive,
    LuFileBadge
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
        label: "Manage Project",
        icons: LuFileBadge,
        path: '/admin/projects'
    },
    {
        id: "03",
        label: "Manage Tasks",
        icons: LuClipboardCheck,
        path: '/admin/tasks'
    },
    {
        id: "04",
        label: "Create Task",
        icons: LuSquarePlus,
        path: '/admin/create-task'
    },
    {
        id: "05",
        label: "Create Project",
        icons: LuFile,
        path: '/admin/create-project'
    },
    {
        id: "06",
        label: "Task Insights",
        icons: LuTrendingUp,
        path: '/admin/insights'
    },
    {
        id: "07",
        label: "Bulk Operations",
        icons: LuZap,
        path: '/admin/bulk-operations'
    },
    {
        id: "08",
        label: "Team Members",
        icons: LuUsers,
        path: '/admin/users'
    },
    {
        id: "09",
        label: "Ai-Dashboard",
        icons: GiSmart,
        path: '/admin/ai-dashboard'
    },
    {
        id: "10",
        label: "Setting",
        icons: LuSettings,
        path: '/admin/setting'
    },
    {
        id: "11",
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
        label: "Manage Project",
        icons: LuFileBadge,
        path: '/user/projects'
    },
    {
        id: "04",
        label: "Create Task",
        icons: LuSquarePlus,
        path: '/user/create-task'
    },
    {
        id: "05",
        label: "Team Members",
        icons: LuUsers,
        path: '/user/users'
    },

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

