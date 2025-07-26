# TaskFlow - Daily Task & Project Management

A modern, feature-rich daily task and project management application built with Next.js 15, React 19, and TypeScript. TaskFlow helps you organize, track, and manage your daily tasks and projects with an intuitive interface and powerful integrations.

![TaskFlow](https://img.shields.io/badge/Next.js-15.4.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

## 🏗️ Project Management

### 📂 Project Organization
- **Project Creation**: Create and manage multiple projects with custom details
- **Project Status Tracking**: Track project status (Active, On Hold, Completed, Cancelled)
- **Client Management**: Associate projects with clients
- **Color Coding**: Visual project identification with custom color selection
- **Date Tracking**: Monitor project start and end dates

### 🔄 Project Integration
- **Jira Integration**: Connect projects to Jira boards and track issues
- **Redmine Integration**: Link projects to Redmine for issue tracking
- **Unified View**: Access all project information in one place
- **Quick Access**: Direct links to project management tools from the tasks page

## 🎯 Task Management
- **Create Tasks**: Add new tasks with comprehensive details including task ID, type, description, hours, project, and notes
- **Edit Tasks**: Modify existing tasks with a user-friendly form interface
- **Delete Tasks**: Remove tasks with confirmation prompts to prevent accidental deletions
- **Task Status Tracking**: Track task progress with three status levels:
  - 📝 **To Do** - Tasks that haven't been started
  - 🔄 **In Progress** - Tasks currently being worked on
  - ✅ **Done** - Completed tasks

### 📊 Task & Project Organization
- **Project Categorization**: Organize tasks by different projects with visual indicators
- **Task Types**: Categorize tasks by type (Development, Testing, Design, Bug Fix, Documentation, Meeting)
- **Project Integration**: Link tasks to external project management tools (Jira, Redmine)
- **Monthly Tracking**: Track tasks by month for better time management
- **Hour Tracking**: Monitor both total hours and approved hours for each task
- **Integration Status**: View integration status and access external project links directly

### 🔍 Advanced Filtering & Search
- **Real-time Search**: Search across task IDs, descriptions, types, projects, and notes
- **Multi-level Filtering**: Filter tasks by:
  - Task Type (Development, Testing, Design, etc.)
  - Project name
  - Month
  - Status (To Do, In Progress, Done)
- **Active Filter Display**: Visual indicators showing currently applied filters
- **Quick Filter Clearing**: Easy removal of individual or all filters

### 📋 Customizable Table View
- **Column Visibility Control**: Show/hide columns based on your needs:
  - Task ID, Type, Description
  - Total Hours, Approved Hours
  - Project, Month, Status
  - Notes, Actions
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Sortable Interface**: Organized data presentation with clear visual hierarchy

### 📊 Analytics Dashboard
- **Productivity Metrics**: Track key performance indicators including:
  - Total tasks completed
  - Approved working hours
  - Total working days (including weekends)
  - Total working hours
  - Leave days taken
  - Overall productivity percentage
- **Interactive Visualizations**:
  - Productivity trends over time
  - Work days vs. working days comparison
  - Visual progress indicators
- **Time-based Analysis**:
  - Monthly productivity tracking
  - Working hours to days conversion (8 hours = 1 day)
  - Leave impact analysis on productivity

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between dark and light modes with system preference detection
- **Responsive Navigation**: Clean navbar with user profile dropdown and notifications
- **Modal Dialogs**: Smooth modal interactions for task creation and editing
- **Loading States**: Proper loading and error handling throughout the application
- **Accessibility**: Screen reader support and keyboard navigation

### 🔔 Smart Interface Elements
- **Notification System**: Bell icon with notification count in the navbar
- **User Profile Menu**: Dropdown with profile, settings, and logout options
- **Empty States**: Helpful guidance when no tasks are present
- **Confirmation Dialogs**: Safety prompts for destructive actions

## 🔌 Integration Features

### 🔗 External Tool Integration
- **Jira Integration**:
  - Connect to Jira Cloud or Server instances
  - Map projects to Jira boards
  - Track Jira issues alongside tasks
  - Direct links to Jira issues

- **Redmine Integration**:
  - Connect to Redmine instances
  - Associate projects with Redmine projects
  - Track Redmine issues
  - Direct links to Redmine issues

### 🔄 Synchronization
- Real-time status updates
- Two-way sync for task/project status
- Conflict resolution for concurrent changes
- Activity logging for all integration events

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 15.4.1** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Modern icon library
- **Framer Motion** - Smooth animations and transitions

### Form Handling & Validation
- **React Hook Form** - Performant form library
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Class Variance Authority** - Component variant management

## 📊 Analytics Dashboard Usage

### Key Features

#### Productivity Metrics
- **Total Tasks**: Track the number of tasks completed in the current month
- **Approved Hours**: Monitor the total hours approved for completed tasks
- **Working Days**: View total working days (including weekends)
- **Working Hours**: Track total hours worked
- **Leaves**: Monitor leave days taken
- **Productivity**: See your productivity percentage based on working days and leaves

#### Productivity Trends
- Interactive line chart showing productivity over the last 6 months
- Hover tooltips for detailed information
- Responsive design that works on all screen sizes

### How It Works
1. The analytics page automatically calculates productivity based on your task data
2. Working hours are converted to days (8 hours = 1 day)
3. Productivity is calculated as: (Work Days - Leaves) / Working Days in Month

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daily-task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── analytics/
│   │   │   ├── productivity-metrics.tsx  # Main analytics metrics component
│   │   │   └── productivity-trends.tsx   # Productivity trends chart component
│   │   │   └── (legacy)/                 # Archived analytics components
│   │   │       ├── dashboard-header.tsx
│   │   │       ├── metrics-overview.tsx
│   │   │       ├── task-completion-chart.tsx
│   │   │       └── time-analytics-chart.tsx
│   │   ├── badge.tsx     # Badge component
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card component
│   │   ├── checkbox.tsx  # Checkbox component
│   │   ├── dialog.tsx    # Modal dialog component
│   │   ├── form.tsx      # Form components
│   │   ├── input.tsx     # Input component
│   │   ├── useProductivityMetrics.ts  # Custom hook for productivity calculations
│   │   └── (legacy)/
│   │       └── useAnalyticsData.ts     # Legacy analytics data hook
│   │   ├── select.tsx    # Select dropdown component
│   │   └── table.tsx     # Table component
│   ├── theme/            # Theme management
│   │   └── provider.tsx  # Theme context provider
│   ├── navbar.tsx        # Navigation bar
│   ├── task-form.tsx     # Task creation/editing form
│   ├── task-list.tsx     # Task list with filtering
│   └── theme-toggle.tsx  # Dark/light mode toggle
└── lib/
    └── utils.ts          # Utility functions
```

## 🎯 Usage Guide

### Creating a New Task
1. Click the **"Add New Task"** button in the top-right corner
2. Fill in the task details:
   - **Task ID**: Unique identifier (auto-generated)
   - **Task Type**: Select from predefined categories
   - **Description**: Detailed task description
   - **Total Hours**: Estimated time required
   - **Approved Hours**: Approved time allocation
   - **Project**: Associated project name
   - **Month**: Task timeline
   - **Status**: Current progress status
   - **Notes**: Additional information (optional)
3. Click **"Add Task"** to save

### Managing Tasks
- **Edit**: Click the pencil icon to modify task details
- **Delete**: Click the trash icon to remove a task (with confirmation)
- **Filter**: Use the filter dropdown to narrow down tasks
- **Search**: Use the search bar to find specific tasks
- **Customize View**: Use "Customize Columns" to show/hide table columns

### Filtering Tasks
1. Click the **"Filters"** button
2. Hover over filter categories to see options:
   - **Type**: Filter by task type
   - **Project**: Filter by project name
   - **Month**: Filter by time period
   - **Status**: Filter by completion status
3. Active filters are displayed as badges below the filter controls
4. Clear individual filters or all filters at once

## 🎨 Theming

The application supports both light and dark themes:
- **Auto-detection**: Respects system preference on first visit
- **Manual Toggle**: Use the sun/moon icon in the navbar
- **Persistence**: Theme preference is saved in localStorage

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

TaskFlow is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layout
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Streamlined interface with collapsible elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Next.js 15+
- (Optional) Jira Cloud/Server account for Jira integration
- (Optional) Redmine instance for Redmine integration

### Configuration
1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev` or `yarn dev`

### Setting Up Integrations

#### Jira Integration
1. Navigate to Project Settings > Integration
2. Select Jira from the integration list
3. Enter your Jira URL (e.g., `https://your-domain.atlassian.net`)
4. Provide API credentials
5. Map projects to Jira boards

#### Redmine Integration
1. Navigate to Project Settings > Integration
2. Select Redmine from the integration list
3. Enter your Redmine URL and API key
4. Map projects to Redmine projects

## 🚀 Deployment

### Vercel (Recommended)
The easiest way to deploy TaskFlow is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
TaskFlow can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn React
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com) - Component library documentation

---

**Built with ❤️ using Next.js, React, and TypeScript**
