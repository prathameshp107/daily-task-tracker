# TaskFlow - Daily Task & Project Management System

## Project Overview

TaskFlow is a comprehensive daily task and project management application built with modern web technologies. It provides a complete solution for tracking tasks, managing projects, analyzing productivity, and integrating with external project management tools like Jira and Redmine. The application features a clean, responsive interface with dark/light theme support and robust authentication system.

### Key Goals
- **Productivity Tracking**: Monitor daily tasks, working hours, and productivity metrics
- **Project Management**: Organize tasks by projects with status tracking and client management
- **Analytics Dashboard**: Visualize productivity trends and performance metrics
- **External Integrations**: Connect with Jira and Redmine for seamless workflow
- **User Experience**: Provide an intuitive, responsive interface for all devices

## Tech Stack

### Frontend Framework
- **Next.js 15.4.1** - React framework with App Router for server-side rendering and routing
- **React 19.1.0** - Latest React with concurrent features and improved performance
- **TypeScript 5** - Type-safe development with enhanced developer experience

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Accessible, unstyled component primitives for building design systems
- **Shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Lucide React** - Modern, customizable icon library
- **Framer Motion 12.23.6** - Smooth animations and transitions
- **Class Variance Authority** - Component variant management utility

### Backend & Database
- **MongoDB 6.17.0** - NoSQL database for flexible data storage
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication token management
- **bcryptjs 3.0.2** - Password hashing and security

### Form Handling & Validation
- **React Hook Form 7.60.0** - Performant form library with minimal re-renders
- **Zod 4.0.5** - TypeScript-first schema validation
- **@hookform/resolvers 5.1.1** - Form validation integration

### Data Visualization & Export
- **Recharts 3.1.0** - Composable charting library for React
- **ExcelJS 4.4.0** - Excel file generation and manipulation
- **json2csv 6.0.0** - CSV export functionality
- **date-fns 4.1.0** - Modern JavaScript date utility library

### Development Tools
- **ESLint 9** - Code linting and formatting
- **PostCSS** - CSS processing and optimization

## Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/           # User login
│   │   │   ├── register/        # User registration
│   │   │   └── logout/          # User logout
│   │   ├── tasks/               # Task management endpoints
│   │   ├── projects/            # Project management endpoints
│   │   ├── analytics/           # Analytics and metrics endpoints
│   │   ├── leaves/              # Leave management endpoints
│   │   ├── working-days/        # Working days configuration
│   │   ├── integrations/        # External tool integrations
│   │   └── user/                # User profile management
│   ├── dashboard/               # Main dashboard page
│   ├── analytics/               # Analytics dashboard page
│   ├── projects/                # Projects management page
│   ├── settings/                # Application settings page
│   ├── login/                   # Authentication pages
│   ├── signup/                  # User registration pages
│   ├── reset-password/          # Password reset functionality
│   ├── globals.css              # Global styles and CSS variables
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page with auth routing
├── components/                   # React components
│   ├── ui/                      # Reusable UI components (Shadcn/ui)
│   │   ├── button.tsx           # Button component variants
│   │   ├── card.tsx             # Card layout component
│   │   ├── dialog.tsx           # Modal dialog component
│   │   ├── form.tsx             # Form components with validation
│   │   ├── input.tsx            # Input field component
│   │   ├── select.tsx           # Dropdown select component
│   │   ├── table.tsx            # Data table component
│   │   └── ...                  # Other UI primitives
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx       # Login form component
│   │   ├── signup-form.tsx      # Registration form component
│   │   ├── protected-route.tsx  # Route protection wrapper
│   │   └── session-manager.tsx  # Session management
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── dashboard-content.tsx # Main dashboard layout
│   │   └── dashboard-skeleton.tsx # Loading skeleton
│   ├── analytics/               # Analytics components
│   │   ├── productivity-metrics.tsx # Metrics overview cards
│   │   └── productivity-trends.tsx  # Trend visualization charts
│   ├── settings/                # Settings page components
│   │   ├── projects-management.tsx    # Project CRUD interface
│   │   ├── leave-management.tsx       # Leave tracking interface
│   │   ├── working-days-form.tsx      # Working days configuration
│   │   └── project-tools-integration.tsx # External tool setup
│   ├── theme/                   # Theme management
│   │   └── provider.tsx         # Theme context provider
│   ├── navbar.tsx               # Main navigation component
│   ├── task-form.tsx            # Task creation/editing form
│   ├── task-list.tsx            # Task list with filtering
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── contexts/                    # React contexts
│   ├── auth-context.tsx         # Authentication state management
│   └── index.ts                 # Context exports
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   └── useProductivityMetrics.ts # Productivity calculations hook
├── lib/                         # Utility libraries
│   ├── api/                     # API client configuration
│   │   └── client.ts            # Axios-based API client
│   ├── db/                      # Database configuration
│   │   └── mongodb.ts           # MongoDB connection setup
│   ├── services/                # Business logic services
│   │   ├── auth.service.ts      # Authentication service
│   │   ├── task.service.ts      # Task management service
│   │   ├── project.service.ts   # Project management service
│   │   ├── analytics.service.ts # Analytics service
│   │   ├── leave.service.ts     # Leave management service
│   │   ├── integration.service.ts # External integrations service
│   │   └── index.ts             # Service exports
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts              # Authentication types
│   │   └── index.ts             # Common types (Task, Project, etc.)
│   ├── validations/             # Zod validation schemas
│   │   └── auth.ts              # Authentication validation
│   ├── middleware/              # Custom middleware
│   │   └── auth.ts              # JWT authentication middleware
│   ├── export/                  # Data export utilities
│   │   └── excel.ts             # Excel export functionality
│   ├── analytics/               # Analytics utilities
│   │   ├── calculations.ts      # Productivity calculations
│   │   ├── date-utils.ts        # Date manipulation utilities
│   │   └── types.ts             # Analytics type definitions
│   ├── auth.ts                  # Authentication utilities
│   └── utils.ts                 # General utility functions
└── scripts/                     # Utility scripts
    └── setup-test-user.js       # Test user creation script
```

## Key Features

### 🎯 Task Management
- **Comprehensive Task Creation**: Create tasks with detailed information including:
  - Task ID and type (Development, Testing, Design, Bug Fix, Documentation, Meeting)
  - Description and notes
  - Project association with visual color coding
  - Time tracking (total hours and approved hours)
  - Status tracking (To Do, In Progress, Done)
  - Monthly categorization
- **Advanced Filtering & Search**: 
  - Real-time search across all task fields
  - Multi-level filtering by type, project, month, and status
  - Visual filter indicators with easy removal
- **Task Operations**: Edit, delete, and toggle completion status with confirmation dialogs
- **Responsive Table View**: Customizable column visibility for optimal viewing

### 🏗️ Project Management
- **Project Organization**: Create and manage projects with:
  - Custom color coding for visual identification
  - Status tracking (Active, On Hold, Completed, Cancelled)
  - Client association and date tracking
  - Detailed descriptions and notes
- **External Tool Integration**:
  - **Jira Integration**: Connect to Jira Cloud/Server instances with project key mapping
  - **Redmine Integration**: Link to Redmine projects with direct access
  - Direct links to external tools from project listings
- **Project Analytics**: Track tasks and productivity metrics per project

### 📊 Analytics Dashboard
- **Productivity Metrics**: Comprehensive overview including:
  - Total tasks completed
  - Approved working hours
  - Working days calculation (8 hours = 1 day)
  - Leave days tracking
  - Productivity percentage calculation
- **Visual Analytics**:
  - Interactive productivity trend charts
  - Monthly performance tracking
  - Progress indicators and visual metrics
- **Time-based Analysis**: Working hours to days conversion with leave impact analysis

### 🔐 Authentication & Security
- **Secure Authentication**: JWT-based authentication with:
  - User registration and login
  - Password reset functionality
  - Session management and validation
  - Protected routes and middleware
- **User Management**: Profile management with avatar support

### 🎨 User Experience
- **Theme Support**: Dark/light mode toggle with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Skeleton loaders and proper error handling
- **Notifications**: Toast notifications for user feedback
- **Accessibility**: Screen reader support and keyboard navigation

### 📤 Data Export
- **Excel Export**: Export tasks and analytics data to Excel with:
  - Integration links included
  - Formatted productivity metrics
  - Project information and task details

### ⚙️ Settings & Configuration
- **Leave Management**: Track and manage leave days
- **Working Days Configuration**: Set up working day preferences
- **Project Tools Integration**: Configure Jira and Redmine connections
- **User Preferences**: Customize application settings

## Application Flow

### Data Flow Architecture

The application follows a modern client-server architecture with clear separation of concerns:

1. **Frontend (Next.js/React)**:
   - User interactions trigger React component state changes
   - Components use custom hooks for business logic
   - Services handle API communication
   - Context providers manage global state (auth, theme)

2. **API Layer (Next.js API Routes)**:
   - RESTful endpoints handle HTTP requests
   - JWT middleware validates authentication
   - Business logic processes data
   - Database operations through MongoDB client

3. **Database (MongoDB)**:
   - Document-based storage for flexible data models
   - Collections: users, tasks, projects, leaves, working_days
   - Indexed queries for performance optimization

### Request Flow Example (Creating a Task):
```
User Input → TaskForm Component → taskService.createTask() → 
POST /api/tasks → Auth Middleware → MongoDB Insert → 
Response → Service → Component State Update → UI Refresh
```

## User Flow Diagram

### Main Application Flow

```mermaid
flowchart TD
    A[User Visits App] --> B{Authenticated?}
    B -->|No| C[Login/Register Page]
    B -->|Yes| D[Dashboard]
    
    C --> E[Enter Credentials]
    E --> F{Valid Credentials?}
    F -->|No| G[Show Error Message]
    F -->|Yes| H[Store JWT Token]
    G --> C
    H --> D
    
    D --> I[View Tasks]
    D --> J[Create New Task]
    D --> K[View Analytics]
    D --> L[Manage Projects]
    D --> M[Settings]
    
    J --> N[Fill Task Form]
    N --> O[Select Project]
    O --> P[Set Task Details]
    P --> Q[Submit Task]
    Q --> R[Task Saved to DB]
    R --> S[Update Task List]
    S --> D
    
    K --> T[View Productivity Metrics]
    T --> U[Analyze Trends]
    U --> V[Export Data]
    
    L --> W[Create/Edit Projects]
    W --> X[Configure Integrations]
    X --> Y[Set Jira/Redmine Links]
    
    M --> Z[Manage Leaves]
    M --> AA[Configure Working Days]
    M --> BB[Update Profile]
```

**Alternative Text-Based Flow:**
```
┌─────────────────┐
│  User Visits    │
│      App        │
└─────────┬───────┘
          │
          ▼
    ┌─────────────┐      ┌──────────────────┐
    │Authenticated?├─No──►│ Login/Register   │
    │             │      │      Page        │
    └─────┬───────┘      └─────────┬────────┘
          │Yes                     │
          ▼                        ▼
    ┌─────────────┐           ┌─────────────┐
    │  Dashboard  │◄──────────┤Enter Creds  │
    │             │           │& Validate   │
    └─────┬───────┘           └─────────────┘
          │
          ├─── View Tasks ────────┐
          ├─── Create New Task ───┤
          ├─── View Analytics ────┤
          ├─── Manage Projects ───┤
          └─── Settings ──────────┘
```

> **📋 To View Mermaid Diagrams Properly:**
> 1. **GitHub** (Recommended): Upload this file to GitHub - native Mermaid support
> 2. **Online Tools**: Copy Mermaid code to https://mermaid.live/
> 3. **Desktop Apps**: Use Typora, Mark Text, or Obsidian
> 4. **VS Code**: Install Mermaid preview extensions
> 5. **GitLab/Bitbucket**: Both support Mermaid rendering

### Task Management Flow

```mermaid
graph LR
    A[Task List View] --> B{User Action}
    B -->|Create| C[Task Form]
    B -->|Edit| D[Edit Task Form]
    B -->|Delete| E[Confirm Delete]
    B -->|Filter| F[Apply Filters]
    B -->|Search| G[Search Tasks]
    
    C --> H[Validate Form]
    D --> H
    H -->|Valid| I[Save to Database]
    H -->|Invalid| J[Show Validation Errors]
    J --> C
    J --> D
    
    I --> K[Update Task List]
    K --> A
    
    E -->|Confirm| L[Delete from Database]
    E -->|Cancel| A
    L --> K
    
    F --> M[Filter Results]
    G --> N[Search Results]
    M --> A
    N --> A
    
    classDef listNode fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class A listNode
    class I successNode
    class J,L errorNode
```

### Project Integration Flow

```mermaid
graph TD
    A[Project Settings] --> B[Integration Setup]
    B --> C{Integration Type}
    
    C -->|Jira| D[Configure Jira]
    C -->|Redmine| E[Configure Redmine]
    
    D --> F[Enter Jira URL]
    F --> G[Enter Project Key]
    G --> H[Test Connection]
    
    E --> I[Enter Redmine URL]
    I --> J[Enter Project ID]
    J --> K[Test Connection]
    
    H -->|Success| L[Save Integration]
    H -->|Failed| M[Show Error]
    K -->|Success| L
    K -->|Failed| M
    
    L --> N[Enable Direct Links]
    N --> O[Project Dashboard]
    
    M --> P[Retry Configuration]
    P --> D
    P --> E
    
    classDef successNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef infoNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class L successNode
    class M errorNode
    class N infoNode
```

## Architecture Diagram

### System Architecture Overview
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Custom Hooks]
        C[Context Providers]
        D[UI Components]
    end
    
    subgraph "Service Layer"
        E[Auth Service]
        F[Task Service]
        G[Project Service]
        H[Analytics Service]
        I[Integration Service]
    end
    
    subgraph "API Layer"
        J[Auth Routes]
        K[Task Routes]
        L[Project Routes]
        M[Analytics Routes]
        N[Integration Routes]
    end
    
    subgraph "Middleware"
        O[JWT Authentication]
        P[Error Handling]
        Q[Request Validation]
    end
    
    subgraph "Database Layer"
        R[(MongoDB)]
        S[Users Collection]
        T[Tasks Collection]
        U[Projects Collection]
        V[Leaves Collection]
    end
    
    subgraph "External Services"
        W[Jira API]
        X[Redmine API]
    end
    
    A --> B
    B --> E
    E --> J
    J --> O
    O --> R
    
    F --> K
    G --> L
    H --> M
    I --> N
    
    K --> T
    L --> U
    M --> T
    N --> W
    N --> X
    
    R --> S
    R --> T
    R --> U
    R --> V
    
    style A fill:#e1f5fe
    style R fill:#f3e5f5
    style W fill:#fff3e0
    style X fill:#fff3e0
```

### Database Schema Relationships
```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string avatar
        Date createdAt
        Date updatedAt
    }
    
    PROJECTS {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string description
        string status
        string color
        Date startDate
        Date endDate
        string client
        object integrations
        Date createdAt
        Date updatedAt
    }
    
    TASKS {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId projectId FK
        string type
        string description
        number totalHours
        number approvedHours
        string status
        string note
        Date date
        string month
        string taskNumber
        Date createdAt
        Date updatedAt
    }
    
    LEAVES {
        ObjectId _id PK
        ObjectId userId FK
        Date date
        string type
        string reason
        Date createdAt
    }
    
    WORKING_DAYS {
        ObjectId _id PK
        ObjectId userId FK
        array workingDays
        number hoursPerDay
        Date createdAt
        Date updatedAt
    }
    
    USERS ||--o{ PROJECTS : "creates"
    USERS ||--o{ TASKS : "owns"
    USERS ||--o{ LEAVES : "takes"
    USERS ||--|| WORKING_DAYS : "configures"
    PROJECTS ||--o{ TASKS : "contains"
```

### Component Hierarchy
```mermaid
graph TD
    A[App Layout] --> B[Theme Provider]
    B --> C[Auth Provider]
    C --> D[Navbar]
    C --> E[Main Content]
    
    D --> F[User Menu]
    D --> G[Theme Toggle]
    D --> H[Notifications]
    
    E --> I{Route}
    I -->|/dashboard| J[Dashboard Page]
    I -->|/analytics| K[Analytics Page]
    I -->|/projects| L[Projects Page]
    I -->|/settings| M[Settings Page]
    I -->|/login| N[Login Page]
    
    J --> O[Dashboard Content]
    O --> P[Task List]
    O --> Q[Task Form Dialog]
    O --> R[Project Filter]
    
    P --> S[Task Table]
    P --> T[Search & Filters]
    P --> U[Column Customizer]
    
    K --> V[Productivity Metrics]
    K --> W[Productivity Trends]
    V --> X[Metric Cards]
    W --> Y[Trend Charts]
    
    L --> Z[Projects Management]
    Z --> AA[Project Form]
    Z --> BB[Project Table]
    Z --> CC[Integration Setup]
    
    M --> DD[Leave Management]
    M --> EE[Working Days Form]
    M --> FF[Profile Settings]
    
    style A fill:#e1f5fe
    style J fill:#e8f5e8
    style K fill:#f3e5f5
    style L fill:#e0f2f1
    style M fill:#fff3e0
```

### Analytics Data Flow
```mermaid
flowchart TD
    A[Task Data] --> B[Analytics Service]
    C[Leave Data] --> B
    D[Working Days Config] --> B
    
    B --> E[Calculate Metrics]
    E --> F[Total Tasks]
    E --> G[Working Hours]
    E --> H[Productivity %]
    E --> I[Leave Impact]
    
    F --> J[Productivity Metrics Component]
    G --> J
    H --> J
    I --> J
    
    B --> K[Generate Trends]
    K --> L[Monthly Data]
    K --> M[Historical Comparison]
    
    L --> N[Productivity Trends Component]
    M --> N
    
    J --> O[Analytics Dashboard]
    N --> O
    
    O --> P[Export to Excel]
    P --> Q[Download File]
    
    style B fill:#e1f5fe
    style E fill:#e8f5e8
    style K fill:#f3e5f5
    style O fill:#e0f2f1
```

## Authentication Flow

The application implements a comprehensive JWT-based authentication system:

### Authentication Process:

1. **User Registration/Login**:
   - User submits credentials via login/signup forms
   - Backend validates credentials against MongoDB users collection
   - Password hashing using bcryptjs for security
   - JWT token generated with user payload (userId, email, name)
   - Token stored in localStorage on client-side

2. **Session Management**:
   - AuthContext provides global authentication state
   - Automatic session validation on app initialization
   - Periodic token validation (every 5 minutes)
   - Token expiration handling with automatic logout

3. **Protected Routes**:
   - ProtectedRoute component wraps authenticated pages
   - Middleware validates JWT tokens on API requests
   - Automatic redirection to login for unauthorized access
   - Route guards prevent access to auth pages when logged in

4. **Token Security**:
   - JWT tokens include expiration timestamps
   - Secure token storage and retrieval utilities
   - Token validation on both client and server sides
   - Automatic cleanup on logout

### Authentication Flow Diagram:

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth API
    participant DB as MongoDB
    
    U->>C: Enter credentials
    C->>A: POST /api/auth/login
    A->>DB: Validate user
    DB-->>A: User data
    A->>A: Generate JWT
    A-->>C: JWT token + user data
    C->>C: Store token in localStorage
    C-->>U: Redirect to dashboard
    
    Note over C: For subsequent requests
    C->>A: API request with JWT header
    A->>A: Validate JWT
    A-->>C: Protected resource
```

### Complete API Request Flow
```mermaid
sequenceDiagram
    participant UI as React Component
    participant S as Service Layer
    participant API as Next.js API
    participant MW as Middleware
    participant DB as MongoDB
    participant EXT as External APIs
    
    UI->>S: Call service method
    S->>API: HTTP Request with JWT
    API->>MW: Validate authentication
    MW->>MW: Verify JWT token
    
    alt Token Valid
        MW->>API: Continue request
        API->>DB: Database operation
        DB-->>API: Data response
        
        opt External Integration
            API->>EXT: Call Jira/Redmine API
            EXT-->>API: Integration data
        end
        
        API-->>S: Success response
        S-->>UI: Update component state
        UI->>UI: Re-render with new data
    else Token Invalid
        MW-->>API: 401 Unauthorized
        API-->>S: Error response
        S-->>UI: Handle auth error
        UI->>UI: Redirect to login
    end
```

### State Management Flow
```mermaid
stateDiagram-v2
    [*] --> AppInitialization
    AppInitialization --> CheckingAuth: Load app
    
    CheckingAuth --> Authenticated: Valid token found
    CheckingAuth --> Unauthenticated: No/invalid token
    
    Unauthenticated --> LoginForm: Show login
    LoginForm --> Authenticating: Submit credentials
    Authenticating --> Authenticated: Success
    Authenticating --> LoginError: Failed
    LoginError --> LoginForm: Retry
    
    Authenticated --> Dashboard: Load main app
    Dashboard --> TaskManagement: Navigate
    Dashboard --> ProjectManagement: Navigate
    Dashboard --> Analytics: Navigate
    Dashboard --> Settings: Navigate
    
    TaskManagement --> TaskCreation: Add task
    TaskManagement --> TaskEditing: Edit task
    TaskManagement --> TaskDeletion: Delete task
    
    TaskCreation --> TaskManagement: Save success
    TaskEditing --> TaskManagement: Update success
    TaskDeletion --> TaskManagement: Delete success
    
    ProjectManagement --> ProjectCreation: Add project
    ProjectManagement --> IntegrationSetup: Configure tools
    
    Analytics --> DataVisualization: Show metrics
    Analytics --> DataExport: Export data
    
    Settings --> ProfileManagement: Update profile
    Settings --> LeaveManagement: Manage leaves
    Settings --> WorkingDaysConfig: Configure schedule
    
    Authenticated --> [*]: Logout
```

## Important Components/Modules

### Core Components

#### 1. **TaskForm Component** (`src/components/task-form.tsx`)
- **Purpose**: Handles task creation and editing with comprehensive form validation
- **Features**: 
  - React Hook Form integration with Zod validation
  - Project selection with color-coded options
  - Task type categorization
  - Time tracking inputs
  - Status management
- **Reusability**: Used in both create and edit modes with conditional rendering

#### 2. **TaskList Component** (`src/components/task-list.tsx`)
- **Purpose**: Displays tasks in a responsive table with advanced filtering
- **Features**:
  - Real-time search across multiple fields
  - Multi-level filtering (type, project, month, status)
  - Column visibility customization
  - Inline actions (edit, delete, toggle completion)
- **Performance**: Optimized rendering with proper key props and memoization

#### 3. **ProductivityMetrics Component** (`src/components/analytics/productivity-metrics.tsx`)
- **Purpose**: Displays comprehensive productivity analytics
- **Features**:
  - Key performance indicators (KPIs)
  - Visual progress indicators
  - Time-based calculations
  - Leave impact analysis
- **Data Source**: Integrates with useProductivityMetrics hook

#### 4. **Navbar Component** (`src/components/navbar.tsx`)
- **Purpose**: Main navigation with user management
- **Features**:
  - User profile dropdown
  - Theme toggle integration
  - Notification system
  - Responsive design
- **Authentication**: Integrates with AuthContext for user state

### Service Modules

#### 1. **Authentication Service** (`src/lib/services/auth.service.ts`)
- **Purpose**: Centralized authentication operations
- **Methods**:
  - `login()`: User authentication with credential validation
  - `register()`: New user registration
  - `logout()`: Session termination
  - `getCurrentUser()`: Profile retrieval
  - `forgotPassword()`: Password reset initiation
- **Security**: JWT token management and secure storage

#### 2. **Task Service** (`src/lib/services/task.service.ts`)
- **Purpose**: Task management operations
- **Methods**:
  - `getTasks()`: Retrieve tasks with filtering options
  - `createTask()`: Create new tasks with validation
  - `updateTask()`: Modify existing tasks
  - `deleteTask()`: Remove tasks with confirmation
  - `toggleTaskCompletion()`: Status management
- **Integration**: Works with project service for data enrichment

#### 3. **Project Service** (`src/lib/services/project.service.ts`)
- **Purpose**: Project management and integration handling
- **Methods**:
  - `getProjects()`: Retrieve user projects
  - `createProject()`: Create projects with integration setup
  - `updateProject()`: Modify project details and integrations
  - `deleteProject()`: Remove projects with dependency checks
- **Integrations**: Handles Jira and Redmine configuration

#### 4. **Analytics Service** (`src/lib/services/analytics.service.ts`)
- **Purpose**: Productivity analytics and reporting
- **Methods**:
  - `getProductivityOverview()`: Comprehensive metrics calculation
  - `getProductivityTrends()`: Historical trend analysis
  - `exportData()`: Data export in multiple formats
- **Performance**: Optimized queries and caching strategies

### Custom Hooks

#### 1. **useProductivityMetrics Hook** (`src/hooks/useProductivityMetrics.ts`)
- **Purpose**: Calculates productivity metrics from task data
- **Features**:
  - Real-time metric calculations
  - Leave impact analysis
  - Working day conversions
  - Productivity percentage computation
- **Optimization**: Memoized calculations to prevent unnecessary re-renders

#### 2. **useAuth Hook** (`src/hooks/use-auth.ts`)
- **Purpose**: Authentication state management
- **Features**:
  - Global authentication state
  - Login/logout operations
  - Session validation
  - Error handling
- **Integration**: Works with AuthContext for state consistency

### Database Models

#### Collections Structure:

1. **Users Collection**:
   ```typescript
   {
     _id: ObjectId,
     name: string,
     email: string,
     passwordHash: string,
     avatar?: string,
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **Tasks Collection**:
   ```typescript
   {
     _id: ObjectId,
     userId: ObjectId,
     projectId: ObjectId,
     type: string,
     description: string,
     totalHours: number,
     approvedHours: number,
     status: 'pending' | 'in-progress' | 'completed',
     note?: string,
     date: Date,
     month: string,
     taskNumber?: string,
     createdAt: Date,
     updatedAt: Date
   }
   ```

3. **Projects Collection**:
   ```typescript
   {
     _id: ObjectId,
     userId: ObjectId,
     name: string,
     description?: string,
     status: 'active' | 'on-hold' | 'completed' | 'cancelled',
     color: string,
     startDate: Date,
     endDate?: Date,
     client?: string,
     integrations?: {
       jira?: { url: string, projectKey: string },
       redmine?: { url: string, projectId: string }
     },
     createdAt: Date,
     updatedAt: Date
   }
   ```

## How to Run the Project

### Prerequisites
- **Node.js 18+** and npm/yarn/pnpm/bun
- **MongoDB** (local installation or cloud instance)
- **Git** for version control

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd daily-task-tracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/daily-task-tracker
   
   # JWT Secret (change for production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Next.js API Base URL
   NEXT_PUBLIC_API_BASE_URL=/api
   
   # Environment
   NODE_ENV=development
   ```

4. **Database Setup**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Database and collections will be created automatically
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get connection string and update `MONGODB_URI`

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create a new account or use the test user setup script

### Production Deployment

#### Vercel (Recommended)
1. **Connect Repository**
   - Push code to GitHub/GitLab/Bitbucket
   - Connect repository to Vercel
   
2. **Environment Variables**
   - Set production environment variables in Vercel dashboard
   - Ensure `JWT_SECRET` is a secure random string
   - Configure `MONGODB_URI` for production database

3. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Zero-configuration deployment

#### Other Platforms
- **Netlify**: Configure build settings and environment variables
- **AWS Amplify**: Set up hosting with environment configuration
- **Railway**: Connect repository and configure environment
- **DigitalOcean App Platform**: Deploy with managed database

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build optimized production bundle
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code quality checks

# Database
node scripts/setup-test-user.js  # Create test user for development
```

### Testing the Application

1. **Create Test User**
   ```bash
   node scripts/setup-test-user.js
   ```

2. **Login Credentials**
   - Email: test@example.com
   - Password: password123

3. **Test Features**
   - Create projects with different statuses
   - Add tasks with various types and time tracking
   - Test filtering and search functionality
   - Explore analytics dashboard
   - Configure external integrations (optional)

## Future Improvements

### Performance Optimizations
- **Database Indexing**: Implement compound indexes for frequently queried fields
- **Caching Strategy**: Add Redis caching for analytics calculations
- **Lazy Loading**: Implement code splitting for better initial load times
- **Image Optimization**: Add image compression and CDN integration
- **API Rate Limiting**: Implement rate limiting for API endpoints

### Feature Enhancements
- **Team Collaboration**: Multi-user project sharing and task assignment
- **Advanced Analytics**: 
  - Burndown charts and velocity tracking
  - Time tracking with start/stop functionality
  - Detailed reporting with custom date ranges
- **Mobile Application**: React Native app for mobile task management
- **Offline Support**: PWA capabilities with offline data synchronization
- **Advanced Integrations**:
  - GitHub integration for commit tracking
  - Slack notifications for task updates
  - Google Calendar integration for time blocking

### User Experience Improvements
- **Drag & Drop**: Task reordering and status updates via drag and drop
- **Keyboard Shortcuts**: Power user shortcuts for common actions
- **Advanced Search**: Full-text search with filters and saved searches
- **Customizable Dashboard**: Widget-based dashboard with user preferences
- **Bulk Operations**: Multi-select for bulk task operations

### Security Enhancements
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Role-Based Access Control**: Different permission levels for team members
- **Audit Logging**: Comprehensive activity logging for security monitoring
- **Data Encryption**: End-to-end encryption for sensitive data

### Infrastructure Improvements
- **Microservices Architecture**: Split into smaller, focused services
- **Container Deployment**: Docker containerization for consistent deployments
- **CI/CD Pipeline**: Automated testing and deployment workflows
- **Monitoring & Alerting**: Application performance monitoring and error tracking
- **Backup Strategy**: Automated database backups and disaster recovery

### Integration Expansions
- **Microsoft Project**: Integration with Microsoft Project for enterprise users
- **Asana/Trello**: Additional project management tool integrations
- **Time Tracking Tools**: Integration with Toggl, Harvest, or similar tools
- **Calendar Applications**: Sync with Outlook, Google Calendar for scheduling
- **Communication Tools**: Integration with Microsoft Teams, Discord

---

**Built with ❤️ using Next.js 15, React 19, TypeScript, and MongoDB**

*This documentation provides a comprehensive overview of the TaskFlow application architecture, features, and setup instructions. For specific implementation details, refer to the source code and inline documentation.*