import {
  MousePointer2,
  Lock,
  Sheet,
  Paintbrush,
  Puzzle,
  Users,
  Box,
  Cpu,
  Globe,
  List,
  Search,
  Wind,
  Palette,
  Undo2,
  Library,
  Trophy,
  Share2,
  type LucideIcon,
} from 'lucide-react';

type GuideStep = {
  title: string;
  explanation: string;
  code: string;
  language: string;
};

export type Feature = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  content: {
    title: string;
    description: string;
    steps: GuideStep[];
  };
};

export const features: Feature[] = [
  {
    id: 'drag-and-drop',
    label: 'Drag and Drop',
    icon: MousePointer2,
    href: '/features?topic=drag-and-drop',
    content: {
      title: 'Implementing Drag and Drop',
      description:
        "Let's build an intuitive drag-and-drop interface. This feature allows users to move items around, reorder lists, or upload files with a simple click and drag. It's a great way to make your app more interactive and user-friendly.",
      steps: [
        {
          title: 'Step 1: Setting Up Your Draggable Items',
          explanation:
            "First, we need to define which items are draggable. Think of these as your digital LEGO bricks. We'll wrap each item in a special component that tells our app, 'Hey, you can pick me up!'. We'll use a simple library to handle the tricky parts.",
          code: `// YourItem.tsx
import { useDraggable } from '@dnd-kit/core';

export function Draggable({ id, children }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
  });
  const style = transform ? {
    transform: \`translate3d(\${transform.x}px, \${transform.y}px, 0)\`,
  } : undefined;
  
  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
}`,
          language: 'jsx',
        },
        {
          title: 'Step 2: Creating Drop Zones',
          explanation:
            "Now that we can pick things up, we need a place to put them down. These are our 'drop zones'. We'll define areas on the screen that can accept our draggable items.",
          code: `// YourDropZone.tsx
import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, children }) {
  const {isOver, setNodeRef} = useDroppable({
    id: id,
  });
  
  const style = {
    opacity: isOver ? 1 : 0.5,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}`,
          language: 'jsx',
        },
        {
          title: "Step 3: Putting It All Together",
          explanation:
            "Finally, we'll create a main component that manages the state of our drag-and-drop world. This component will listen for when an item is dropped and decide what to do with it.",
          code: `// App.tsx
import { DndContext } from '@dnd-kit/core';
import { Draggable } from './Draggable';
import { Droppable } from './Droppable';

export default function App() {
  function handleDragEnd(event) {
    if (event.over) {
      alert(\`Item \${event.active.id} was dropped over \${event.over.id}\`);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Draggable id="draggable-1">Drag me</Draggable>
      <Droppable id="droppable-1">
        Drop here
      </Droppable>
    </DndContext>
  );
}`,
          language: 'jsx',
        },
      ],
    },
  },
  {
    id: 'collaborative-editor',
    label: 'Collaborative Editor',
    icon: Users,
    href: '/features?topic=collaborative-editor',
    content: {
      title: 'Real-time Collaborative Text Editor',
      description:
        'Build an editor where multiple users can type simultaneously, like Google Docs. This requires complex state synchronization and real-time communication.',
      steps: [
        {
          title: 'Step 1: Choose a Synchronization Strategy',
          explanation:
            'To keep all users in sync, you need a strategy to merge changes without conflicts. The most common are Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDTs). CRDTs are often easier to start with.',
          code: `// We will use a library that implements a CRDT, like Yjs.
// Yjs provides data structures that automatically merge changes from multiple users.
npm install yjs
`,
          language: 'bash',
        },
      ],
    },
  },
  {
    id: 'interactive-3d',
    label: 'Interactive 3D',
    icon: Box,
    href: '/features?topic=interactive-3d',
    content: {
      title: 'Interactive 3D Graphics with Three.js',
      description:
        'Render and interact with 3D models directly in the browser. This involves managing a scene, camera, lighting, and user interactions.',
      steps: [
        {
          title: 'Step 1: Set up React Three Fiber',
          explanation:
            'React Three Fiber is a React renderer for Three.js, which makes it much easier to build declarative 3D scenes with components.',
          code: `npm install @react-three/fiber @react-three/drei three

// Now you can build 3D scenes with React components.`,
          language: 'bash',
        },
      ],
    },
  },
  {
    id: 'web-workers',
    label: 'Web Workers',
    icon: Cpu,
    href: '/features?topic=web-workers',
    content: {
      title: 'Multi-threaded Apps with Web Workers',
      description:
        'Offload heavy computations to a background thread to keep the main UI responsive. This is perfect for video processing, complex calculations, or data fetching.',
      steps: [
        {
          title: 'Step 1: Create a Worker File',
          explanation:
            'A Web Worker runs in a separate file. This script will listen for messages from the main app, do some heavy work, and post the result back.',
          code: `// heavy-task.worker.js
self.onmessage = function(event) {
  console.log('Worker received:', event.data);
  const result = event.data * 2; // Simulate a heavy task
  self.postMessage(result);
};`,
          language: 'javascript',
        },
      ],
    },
  },
  {
    id: 'pwa-offline',
    label: 'PWA & Offline Support',
    icon: Globe,
    href: '/features?topic=pwa-offline',
    content: {
      title: 'Progressive Web App with Offline Support',
      description:
        'Go beyond basic caching to allow complex offline functionality, background sync, and push notifications, making your web app feel like a native app.',
      steps: [
        {
          title: 'Step 1: Create a Service Worker',
          explanation:
            'The service worker is a script that runs in the background and intercepts network requests. This allows you to serve cached content when the user is offline.',
          code: `// service-worker.js
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});`,
          language: 'javascript',
        },
      ],
    },
  },
  {
    id: 'virtualized-lists',
    label: 'Virtualized Lists',
    icon: List,
    href: '/features?topic=virtualized-lists',
    content: {
      title: 'High-Performance Virtualized Lists',
      description:
        'Render massive datasets (millions of rows) in a scrollable list without crashing the browser, by only rendering the items currently visible in the viewport.',
      steps: [
        {
          title: 'Step 1: Use a Virtualization Library',
          explanation:
            'Implementing virtualization from scratch is tricky. A library like TanStack Virtual makes it much simpler.',
          code: `npm install @tanstack/react-virtual

// TanStack Virtual gives you the hooks and logic to calculate
// which items should be visible, and you provide the rendering.`,
          language: 'bash',
        },
      ],
    },
  },
  {
    id: 'client-side-search',
    label: 'Client-Side Search',
    icon: Search,
    href: '/features?topic=client-side-search',
    content: {
      title: 'Client-Side Full-Text Search',
      description:
        'Implement a fast, in-browser search engine to perform complex queries on large amounts of client-side data without needing a server.',
      steps: [
        {
          title: 'Step 1: Choose a Search Library',
          explanation:
            'Libraries like Lunr.js or FlexSearch are designed to build a search index on the client and perform queries against it efficiently.',
          code: `npm install lunr

// Lunr.js allows you to define the fields to be indexed
// and then add your documents to it.`,
          language: 'bash',
        },
      ],
    },
  },
  {
    id: 'physics-animations',
    label: 'Physics Animations',
    icon: Wind,
    href: '/features?topic=physics-animations',
    content: {
      title: 'Custom Animation System with Physics',
      description:
        'Build a performant animation library that uses physics principles (e.g., spring, gravity) for more natural and interruptible UI animations.',
      steps: [
        {
          title: 'Step 1: Use a Physics-Based Animation Library',
          explanation:
            'React Spring and Framer Motion are the go-to libraries in the React ecosystem for creating fluid, physics-based animations.',
          code: `npm install framer-motion

// Framer Motion provides a 'motion' component that you can
// use to easily animate any element with spring physics.`,
          language: 'bash',
        },
      ],
    },
  },
  {
    id: 'dynamic-theming',
    label: 'Dynamic Theming',
    icon: Palette,
    href: '/features?topic=dynamic-theming',
    content: {
      title: 'Dynamic Theming and Style Editor',
      description:
        "Allow users to customize the application's entire look and feel, including colors, fonts, and spacing, and persist those themes.",
      steps: [
        {
          title: 'Step 1: Use CSS Variables',
          explanation:
            'The foundation of dynamic theming is CSS Custom Properties (variables). You define your theme using variables, and then change the variable values with JavaScript to update the theme instantly.',
          code: `/* globals.css */
:root {
  --primary-color: #6366f1;
  --background-color: #f9fafb;
}

/* In your component */
function ThemeSwitcher() {
  const changeTheme = () => {
    document.documentElement.style.setProperty('--primary-color', '#ec4899');
  }
  return <button onClick={changeTheme}>Change Theme</button>;
}`,
          language: 'css',
        },
      ],
    },
  },
  {
    id: 'undo-redo',
    label: 'Undo/Redo',
    icon: Undo2,
    href: '/features?topic=undo-redo',
    content: {
      title: 'Undo/Redo for Complex State',
      description:
        'Implement a robust undo/redo system for more than just text input, applying to any user action that changes the application state.',
      steps: [
        {
          title: 'Step 1: Use a State Management Library with History',
          explanation:
            'Libraries like Zustand or Jotai have middleware or utilities for handling state history, making undo/redo much easier to implement.',
          code: `import { create } from 'zustand'
import { temporal } from 'zundo'

const useStore = create(temporal(set => ({
  fishes: 0,
  addFish: () => set(state => ({ fishes: state.fishes + 1 })),
})))

// This automatically gives you access to past states!`,
          language: 'javascript',
        },
      ],
    },
  },
  {
    id: 'micro-frontends',
    label: 'Micro-Frontends',
    icon: Library,
    href: '/features?topic=micro-frontends',
    content: {
      title: 'Micro-Frontends Architecture',
      description:
        'Break down a large monolithic frontend into smaller, independently deployable applications that are composed together to form a single, cohesive user experience.',
      steps: [
        {
          title: 'Step 1: Understand the Core Concept',
          explanation:
            'The goal is to have multiple teams work on different parts of the UI independently. A common approach is to use a container application that loads the micro-frontends.',
          code: `// This is a conceptual example
// Container App
import Products from 'productsApp/Products';
import Cart from 'cartApp/Cart';

function App() {
  return (
    <div>
      <Header />
      <Products />
      <Cart />
    </div>
  );
}
`,
          language: 'jsx',
        },
      ],
    },
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Trophy,
    href: '/features?topic=gamification',
    content: {
      title: 'Gamified User Interface with Achievements',
      description:
        'Design and implement a system for tracking user actions and rewarding them with badges or points to encourage engagement and guide them through your application.',
      steps: [
        {
          title: 'Step 1: Define Trackable Events',
          explanation:
            'First, identify the key user actions you want to encourage. These will be your "events." For example: "completed-profile", "posted-first-comment", "visited-10-days".',
          code: `// event-tracker.js
function trackEvent(eventName, userId) {
  // Logic to send this event to your backend or analytics service
  console.log(\`User \${userId} triggered event: \${eventName}\`);
  // Your backend would then check if this event unlocks an achievement.
}`,
          language: 'javascript',
        },
      ],
    },
  },
  {
    id: 'p2p-webrtc',
    label: 'P2P with WebRTC',
    icon: Share2,
    href: '/features?topic=p2p-webrtc',
    content: {
      title: 'Peer-to-Peer Communication with WebRTC',
      description:
        'Enable direct browser-to-browser communication for video chat, voice calls, or file sharing, reducing server costs and latency.',
      steps: [
        {
          title: 'Step 1: Understand the Signaling Process',
          explanation:
            "WebRTC needs a 'signaling' server to help two browsers find and connect with each other. This is usually done with WebSockets. The signaling server is like a phone operator connecting two people.",
          code: `// Conceptual signaling flow
// Browser A -> Server: "Here is my connection info (SDP), send it to Browser B."
// Server -> Browser B: "Browser A wants to connect, here's their info."
// Browser B -> Server: "Got it. Here is MY info, send it to Browser A."
// Server -> Browser A: "Here is Browser B's info."
// ... now they can connect directly.`,
          language: 'javascript',
        },
      ],
    },
  },
  {
    id: 'spreadsheet-ui',
    label: 'Spreadsheet UI',
    icon: Sheet,
    href: '/features?topic=spreadsheet-ui',
    content: {
      title: 'Building a Spreadsheet UI',
      description: 'Create an interactive, Excel-like interface in your web application. This is great for data entry, financial applications, and configuration tools.',
      steps: [
        {
          title: 'Step 1: Choose a Library',
          explanation: 'Building a spreadsheet from scratch is complex. It\'s best to use a powerful library like AG-Grid, Handsontable, or TanStack Table.',
          code: `npm install @tanstack/react-table

// TanStack Table is a "headless" UI library, meaning it gives you
// all the logic for sorting, filtering, and pagination, but you
// control the rendering and styling completely.`,
          language: 'bash'
        }
      ],
    },
  },
    {
    id: 'drawing-ui',
    label: 'Drawing UI',
    icon: Paintbrush,
    href: '/features?topic=drawing-ui',
    content: {
      title: 'Creating a Drawing UI',
      description: 'Implement a canvas-based drawing interface where users can sketch, annotate, or create diagrams. This is perfect for whiteboarding, design tools, or educational apps.',
      steps: [
        {
          title: 'Step 1: Use a Canvas Library',
          explanation: 'Directly manipulating the HTML <canvas> element can be verbose. Libraries like Fabric.js, Konva.js, or Perfect Freehand make it much easier.',
          code: `npm install perfect-freehand

// Perfect Freehand is excellent for creating beautiful,
// pressure-sensitive freehand strokes, making it feel
// very natural.`,
          language: 'bash'
        }
      ],
    },
  },
  {
    id: 'role-based-auth',
    label: 'Role-based Auth',
    icon: Lock,
    href: '/features?topic=role-based-auth',
    content: {
      title: 'Role-based Authentication',
      description: 'Control what users can see and do based on their roles (e.g., admin, editor, viewer). This is crucial for building secure and scalable applications.',
      steps: [
        {
          title: 'Step 1: Define Roles',
          explanation: 'First, decide on the roles your application needs. This is often done on your backend or in a user management system like Firebase Authentication custom claims.',
          code: `// Example: Firebase custom claims
// functions/index.js (run on your server)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  // Add a custom claim 'admin: true' to a user
  return admin.auth().setCustomUserClaims(data.uid, { admin: true });
});`,
          language: 'javascript'
        },
        {
          title: 'Step 2: Protect Routes',
          explanation: 'In Next.js, you can use Middleware to protect entire routes based on the user\'s role, which you can get from their authentication token.',
          code: `// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const user = /* logic to get user from token */;
  
  if (request.nextUrl.pathname.startsWith('/admin') && !user?.isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
 
  return NextResponse.next();
}
`,
          language: 'typescript'
        }
      ],
    },
  },
  {
    id: 'other-features',
    label: 'Other Features',
    icon: Puzzle,
    href: '/features?topic=other-features',
    content: {
      title: 'More Exciting Features',
      description: 'This starter kit is packed with other powerful features to help you build modern web applications faster.',
      steps: [
        {
          title: 'Code Highlighting',
          explanation: 'Includes a beautiful, server-rendered code highlighting component using `react-syntax-highlighter` to make your code snippets pop.',
          code: `<CodeBlock code={someCodeString} language="jsx" />`,
          language: 'jsx'
        }
      ],
    },
  },
];
