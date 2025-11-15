# GEMINI.md

## Project Overview

This is a full-stack AI-powered task management system. The backend is built with Node.js, Express, and MongoDB. The frontend is built with React, Vite, and Tailwind CSS.

The application provides a comprehensive suite of features for managing tasks, including:

*   **Task Management:** Create, read, update, and delete tasks.
*   **AI-Powered Features:** Leverage AI to break down tasks, suggest assignees, and schedule tasks intelligently.
*   **Collaboration:** Comment on tasks and react to comments.
*   **Time Management:** Use the Pomodoro timer to stay focused and track your work.
*   **Visualization:** View tasks on a Kanban board.
*   **Personalization:** Customize your experience with user settings and preferences.

## Building and Running

### Backend

1.  **Install dependencies:**
    ```bash
    cd backend
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in the `backend` directory and add the following:

    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/task-manager
    JWT_SECRET=your_jwt_secret_key
    ADMIN_INVITE_TOKEN=your_admin_token
    NODE_ENV=development
    ```

3.  **Start the server:**

    *   To start the server, run:
        ```bash
        npm start
        ```
    *   To start the server in development mode with auto-reload, run:
        ```bash
        npm run dev
        ```

### Frontend

1.  **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

## Development Conventions

*   **Architecture:** The project follows a standard MERN (MongoDB, Express, React, Node.js) stack architecture.
*   **Frontend:** The frontend is built with React and utilizes a component-based architecture. State management is handled with React hooks and context.
*   **Backend:** The backend is built with Node.js and Express and follows a controller-service-repository pattern. Mongoose is used as the ODM for MongoDB.
*   **Linting:** The project uses ESLint to enforce code quality and consistency.
*   **Styling:** The frontend uses Tailwind CSS for styling.
