Project
-------
task-dashboard is a react typescript application styled with tailwind css.

Features
--------
Built using React with TypeScript for robust and type-safe development.
Styled with Tailwind CSS for a highly customizable design system.
Deployed using Vercel for seamless hosting.

Demo
-----
Check out the live application here: `https://task-dashboard-cyan.vercel.app/`

Prerequisites
-------------
Before running this project, ensure you have the following installed on your machine:

Node.js (>= 14)
npm or yarn

Getting Started
---------------
Follow these steps to run the project locally:

1. Clone the repository -
    git clone `https://github.com/sreelakshmi367/Task-Dashboard.git`
    cd Task-Dashboard

2. Install dependencies-
    npm install

3. Run the development server-
    npm start
    The development server will be available at `http://localhost:3000`.


Scripts
-------
Here are the scripts available in the project:

npm start / yarn start - Runs the app in development mode.
npm build / yarn build - Builds the app for production.
npm test / yarn test - Launches the test runner.

Tech Stack
-----------
React: For building user interfaces.
TypeScript: Ensures type safety and better developer experience.
Tailwind CSS: Provides utility-first styling.
Vercel: Hosts the deployed application.

Architecture Overview
---------------------
1. Frontend Framework
    React(typescript) is used for building the ui.
    Functional components with hooks for managing state and side effects.
    Project is component-based for scalability and reusability.

 2. State Management
    Local component state is used for lightweight operations like modals and form inputs.
    Local storage is used as persistant storage for tasks to retain data across sessions.

 3. Drag-and-Drop
    Utilizes @dnd-kit for modern, flexible drag-and-drop interactions.
    Dragging a task across columns updates its status.
    Sortable and accessible drag behaviour.

 4. Core Features
    Task creation via a modal with fields for title,description,due date and status.
    Due date validation ensures tasks cannot be created with past dates.
    Snackbar notifications for user feedback.
    Status based filtering and due date sorting for task management.
    User authentication(basic)
    
             