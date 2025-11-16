# Frontend UI TODOs for New Features

This document outlines the missing frontend UI elements and integrations required to fully utilize the recently implemented backend functionalities.

## 1. Project Management

### 1.1 Project Creation
*   **Missing:** A dedicated form/page for creating a new project.
*   **Backend Endpoint:** `POST /api/projects`
*   **Frontend Component:** `frontend/src/pages/Admin/CreateProject.jsx` (currently a placeholder).
*   **Integration:** The "Create New Project" button in `ProjectList.jsx` navigates to this page.

### 1.2 Project Details, Update, and Delete
*   **Missing:** A page to display details of a single project, with options to update its information or delete it.
*   **Backend Endpoints:**
    *   `GET /api/projects/:id`
    *   `PUT /api/projects/:id`
    *   `DELETE /api/projects/:id`
*   **Integration:** The "View Project" button in `ProjectList.jsx` should navigate to this page.

## 2. Issue Management

### 2.1 Issue Creation (Standard Form)
*   **Missing:** A standard form to manually create a new issue (title, description, project, type, status, priority, assignee, etc.).
*   **Backend Endpoint:** `POST /api/issues`
*   **Integration:** Could be linked from a project details page or a dedicated "Create Issue" button.

### 2.2 Issue Details, Update, and Delete
*   **Missing:** A page to display details of a single issue, with options to update its information or delete it.
*   **Backend Endpoints:**
    *   (Implicitly `GET /api/issues/:id` - though not explicitly created, it's a standard need)
    *   `PUT /api/issues/:id/status` (used by Kanban, but also needed for manual update)
    *   `PUT /api/issues/:id/assignee` (used by Kanban, but also needed for manual update)
    *   (Implicitly `DELETE /api/issues/:id` - standard need)
*   **Integration:** Clicking an issue card on the Kanban board or a list view should navigate to this page.

## 3. AI-Assisted Task Creation

### 3.1 AI Task Input Integration
*   **Missing:** Integration of the `AITaskInput.jsx` component into a relevant page.
*   **Backend Endpoint:** `POST /api/issues/ai-create`
*   **Frontend Component:** `frontend/src/components/AITaskInput.jsx`
*   **Integration:** Could be placed on a project dashboard, a dedicated issue creation page, or even within the `CreateProject.jsx` placeholder.

## 4. AI Sub-Task Generation

### 4.1 "Generate Sub-tasks" Button
*   **Missing:** A button on an issue details page (especially for 'Story' type issues) that, when clicked, calls the backend endpoint to generate sub-tasks.
*   **Backend Endpoint:** `POST /api/issues/:id/generate-subtasks`
*   **Integration:** Requires an issue details page (see 2.2).

## 5. Reporting Dashboard (Burndown Chart)

### 5.1 Burndown Chart Display
*   **Missing:** A frontend component to display the burndown chart. This component would need inputs for `projectId`, `startDate`, `endDate`, and a mechanism to fetch and render the chart data.
*   **Backend Endpoint:** `GET /api/reports/burndown/:projectId/:startDate/:endDate`
*   **Integration:** Could be a new page under `/admin/reports` or integrated into a project dashboard.

## 6. AI Predictive Insights

### 6.1 Insights Display
*   **Missing:** A frontend component on the main dashboard (e.g., `Admin/Dashboard.jsx` or `User/UserDashboard.jsx`) to fetch and display the latest predictive insights.
*   **Backend Endpoint:** `GET /api/insights`
*   **Integration:** A dedicated section or card on the dashboard.

---

Please let me know which of these UI elements you would like me to implement first.
