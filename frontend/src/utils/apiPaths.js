
export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
    },
    USERS: {
        GET_ALL_USERS: "/api/users",
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
        GET_USER_STATS: (userId) => `/api/users/${userId}/stats`,
        CREATE_USER: "/api/users",
        UPDATE_USER: (userId) => `/api/users/${userId}`,
        DELETE_USER: (userId) => `/api/users/${userId}`,
    },
    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data",
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",
        GET_ALL_TASKS: "/api/tasks",
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`,
        CREATE_TASK: "/api/tasks",
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,
        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`
    },
    ANALYTICS: {
        GET_INSIGHTS: "/api/analytics/insights",
        GET_TEAM_ANALYTICS: "/api/analytics/team",
        GET_SUGGESTED_PRIORITIES: "/api/analytics/suggested-priorities"
    },
    ACTIVITIES: {
        GET_FEED: "/api/activities/feed",
        GET_TEAM_FEED: "/api/activities/team-feed",
        GET_UNREAD_COUNT: "/api/activities/unread-count",
        MARK_READ: "/api/activities/mark-read",
        MARK_ALL_READ: "/api/activities/mark-all-read"
    },
    BULK_OPERATIONS: {
        UPDATE_STATUS: "/api/bulk-operations/status",
        UPDATE_PRIORITY: "/api/bulk-operations/priority",
        ASSIGN_TASKS: "/api/bulk-operations/assign",
        DELETE_TASKS: "/api/bulk-operations/delete",
        UPDATE_DUE_DATE: "/api/bulk-operations/due-date"
    },
    SEARCH: {
        SEARCH_TASKS: "/api/search/tasks",
        FILTER_OPTIONS: "/api/search/filter-options",
        SEARCH_USERS: "/api/search/users",
        QUICK_FILTERS: "/api/search/quick-filters"
    },
    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks",
        EXPORT_USERS: "/api/reports/export/users"
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image"
    }
}
