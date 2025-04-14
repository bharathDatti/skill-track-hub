
import React, { createContext, useContext, useState } from 'react';

// Demo users
export const demoUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@devmastery.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=2563EB&color=fff',
  },
  tutor: {
    id: '2',
    name: 'Tutor User',
    email: 'tutor@devmastery.com',
    role: 'tutor',
    avatar: 'https://ui-avatars.com/api/?name=Tutor+User&background=0D9488&color=fff',
  },
  student: {
    id: '3',
    name: 'Student User',
    email: 'student@devmastery.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Student+User&background=F59E0B&color=fff',
  },
};

// Define module interface
export interface ModuleTask {
  id: string;
  title: string;
  complete: boolean;
  dueDate: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  complete: boolean;
  courseType?: string;
  duration_weeks?: number;
  tasks: ModuleTask[];
}

// Demo roadmap modules
export const demoModules: Module[] = [
  {
    id: '1',
    title: 'Month 1: Web Fundamentals',
    description: 'HTML, CSS, JavaScript basics and core web concepts',
    progress: 100,
    complete: true,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '101', title: 'HTML Structure & Semantics', complete: true, dueDate: '2023-01-07' },
      { id: '102', title: 'CSS Layouts & Responsive Design', complete: true, dueDate: '2023-01-14' },
      { id: '103', title: 'JavaScript Fundamentals', complete: true, dueDate: '2023-01-21' },
      { id: '104', title: 'DOM Manipulation', complete: true, dueDate: '2023-01-28' },
    ],
  },
  {
    id: '2',
    title: 'Month 2: React Fundamentals',
    description: 'React component architecture, props, state, and hooks',
    progress: 75,
    complete: false,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '201', title: 'React Components & JSX', complete: true, dueDate: '2023-02-07' },
      { id: '202', title: 'Props & State Management', complete: true, dueDate: '2023-02-14' },
      { id: '203', title: 'React Hooks', complete: true, dueDate: '2023-02-21' },
      { id: '204', title: 'Context API & Advanced Patterns', complete: false, dueDate: '2023-02-28' },
    ],
  },
  {
    id: '3',
    title: 'Month 3: Backend with Node.js',
    description: 'Building REST APIs with Express and Node.js',
    progress: 50,
    complete: false,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '301', title: 'Node.js Basics', complete: true, dueDate: '2023-03-07' },
      { id: '302', title: 'Express Framework', complete: true, dueDate: '2023-03-14' },
      { id: '303', title: 'RESTful API Design', complete: false, dueDate: '2023-03-21' },
      { id: '304', title: 'Authentication & Authorization', complete: false, dueDate: '2023-03-28' },
    ],
  },
  {
    id: '4',
    title: 'Month 4: MongoDB & Mongoose',
    description: 'Database design, operations, and modeling with MongoDB',
    progress: 25,
    complete: false,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '401', title: 'MongoDB Introduction', complete: true, dueDate: '2023-04-07' },
      { id: '402', title: 'Mongoose Schema Design', complete: false, dueDate: '2023-04-14' },
      { id: '403', title: 'CRUD Operations', complete: false, dueDate: '2023-04-21' },
      { id: '404', title: 'Advanced Queries & Aggregation', complete: false, dueDate: '2023-04-28' },
    ],
  },
  {
    id: '5',
    title: 'Month 5: Full-Stack Integration',
    description: 'Connecting frontend and backend, deployment strategies',
    progress: 0,
    complete: false,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '501', title: 'API Integration with React', complete: false, dueDate: '2023-05-07' },
      { id: '502', title: 'State Management with Context/Redux', complete: false, dueDate: '2023-05-14' },
      { id: '503', title: 'Authentication Flow', complete: false, dueDate: '2023-05-21' },
      { id: '504', title: 'Deployment Preparation', complete: false, dueDate: '2023-05-28' },
    ],
  },
  {
    id: '6',
    title: 'Month 6: Advanced Topics & Project',
    description: 'Real-time features, testing, and final project',
    progress: 0,
    complete: false,
    courseType: 'Web Development',
    duration_weeks: 4,
    tasks: [
      { id: '601', title: 'WebSockets & Real-time Features', complete: false, dueDate: '2023-06-07' },
      { id: '602', title: 'Testing & Quality Assurance', complete: false, dueDate: '2023-06-14' },
      { id: '603', title: 'Performance Optimization', complete: false, dueDate: '2023-06-21' },
      { id: '604', title: 'Capstone Project Completion', complete: false, dueDate: '2023-06-28' },
    ],
  },
];

// Demo announcements
export const demoAnnouncements = [
  {
    id: '1',
    title: 'Welcome to the MERN Stack Course!',
    content: 'We\'re excited to have you join us on this learning journey.',
    date: '2023-01-01',
    author: 'Admin User',
  },
  {
    id: '2',
    title: 'React Module Starting Soon',
    content: 'Get ready for our deep dive into React fundamentals next week.',
    date: '2023-02-01',
    author: 'Tutor User',
  },
  {
    id: '3',
    title: 'Monthly Coding Challenge',
    content: 'Join our monthly coding challenge to test your skills and win prizes!',
    date: '2023-02-15',
    author: 'Admin User',
  },
];

// Create context
interface DemoDataContextType {
  users: typeof demoUsers;
  modules: Module[];
  announcements: typeof demoAnnouncements;
  addModule: (module: Module) => void;
  updateModule: (id: string, updatedModule: Partial<Module>) => void;
  deleteModule: (id: string) => void;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [modules, setModules] = useState<Module[]>(demoModules);
  
  // Add a new module
  const addModule = (module: Module) => {
    setModules(prevModules => [...prevModules, module]);
  };
  
  // Update an existing module
  const updateModule = (id: string, updatedModule: Partial<Module>) => {
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === id ? { ...module, ...updatedModule } : module
      )
    );
  };
  
  // Delete a module
  const deleteModule = (id: string) => {
    setModules(prevModules => prevModules.filter(module => module.id !== id));
  };
  
  return (
    <DemoDataContext.Provider 
      value={{ 
        users: demoUsers, 
        modules, 
        announcements: demoAnnouncements,
        addModule,
        updateModule,
        deleteModule
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
};

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  
  return context;
};
