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
        'Build an editor where multiple users can type simultaneously, like Google Docs. This requires complex state synchronization and real-time communication to merge changes from different users without conflicts.',
      steps: [
        {
          title: 'Step 1: Choose a Synchronization Strategy',
          explanation:
            'To keep all users in sync, you need a strategy to merge changes without conflicts. The most common are Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDTs). CRDTs are often easier to start with, as they handle merging automatically.',
          code: `// We will use a library that implements a CRDT, like Yjs.
// Yjs provides data structures that automatically merge changes from multiple users.
// It works with a provider (like one for WebSockets) to sync the data.
npm install yjs y-webrtc
`,
          language: 'bash',
        },
        {
          title: 'Step 2: Initialize the Yjs Document',
          explanation: 'The Yjs document (Y.Doc) is the core of our collaborative state. We will also create a shared text type and connect it to a provider that will sync the data between clients, in this case using WebRTC for peer-to-peer communication.',
          code: `import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// Create a Yjs document
const ydoc = new Y.Doc();

// Create a shared text type
const ytext = ydoc.getText('my-text-editor');

// Set up a provider to sync the document.
// The room name must be the same for all clients who want to collaborate.
const provider = new WebrtcProvider('my-collaboration-room', ydoc);`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Bind to a Text Editor',
          explanation: 'Now we need to connect our shared Yjs text type to a rich text editor UI. There are pre-built bindings for many popular editors like TipTap, Quill, or Monaco that make this step easy.',
          code: `import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';

// In your React component
const editor = new Editor({
  extensions: [
    StarterKit,
    // Add the collaboration extension, passing the Yjs document and field name
    Collaboration.configure({
      document: ydoc,
      field: 'my-text-editor',
    }),
  ],
});
// Now any changes in the TipTap editor will be synced with other users!`,
          language: 'javascript',
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
        'Render and interact with 3D models directly in the browser. This involves managing a scene, camera, lighting, and user interactions. We will use React Three Fiber to make it easier.',
      steps: [
        {
          title: 'Step 1: Set up React Three Fiber',
          explanation:
            'React Three Fiber is a React renderer for Three.js, which makes it much easier to build declarative 3D scenes with components instead of using imperative Three.js code.',
          code: `npm install @react-three/fiber @react-three/drei three

// Now you can build 3D scenes with React components.
// @react-three/drei provides useful helpers like controls and loaders.`,
          language: 'bash',
        },
        {
          title: 'Step 2: Create a 3D Scene',
          explanation: 'The `Canvas` component from `@react-three/fiber` creates a WebGL canvas and a Three.js scene. Inside it, you can place your camera, lights, and 3D objects as if they were regular React components.',
          code: `import { Canvas } from '@react-three/fiber';

function Scene() {
  return (
    <Canvas>
      {/* Ambient light provides a soft, even light */}
      <ambientLight intensity={0.5} />
      {/* Directional light simulates a distant light source like the sun */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* We will place our 3D objects here */}
    </Canvas>
  );
}`,
          language: 'jsx',
        },
        {
          title: 'Step 3: Add and Animate an Object',
          explanation: 'Objects in Three.js are called "meshes". A mesh needs a geometry (its shape) and a material (its color and texture). We can use the `useFrame` hook to animate it on every frame.',
          code: `import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function SpinningBox() {
  // useRef allows us to get a direct reference to the mesh
  const meshRef = useRef();

  // useFrame runs on every rendered frame
  useFrame(() => {
    if (meshRef.current) {
      // Rotate the box
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
// Add <SpinningBox /> inside your <Canvas> to see it!
`,
          language: 'jsx',
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
        'Offload heavy computations to a background thread to keep the main UI responsive. This is perfect for video processing, complex calculations, or data fetching without freezing the page.',
      steps: [
        {
          title: 'Step 1: Create a Worker File',
          explanation:
            'A Web Worker runs in a separate file. This script will listen for messages from the main app, do some heavy work, and post the result back. It cannot access the `document` or `window` objects.',
          code: `// public/heavy-task.worker.js
// This file must be in the 'public' folder to be accessible.

self.onmessage = function(event) {
  console.log('Worker received:', event.data);
  
  // Simulate a heavy task that would block the main thread
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += Math.sqrt(i);
  }

  // Send the result back to the main thread
  self.postMessage(result);
};`,
          language: 'javascript',
        },
        {
          title: 'Step 2: Use the Worker in a React Component',
          explanation: 'In your React component, you can create a new `Worker` instance. You use `postMessage` to send data to the worker and `onmessage` to listen for results coming back from it.',
          code: `import { useState, useEffect } from 'react';

function HeavyTaskComponent() {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // Create a new worker instance
    const myWorker = new Worker('/heavy-task.worker.js');

    // Listen for messages from the worker
    myWorker.onmessage = (event) => {
      console.log('Main thread received:', event.data);
      setResult(event.data);
    };

    // Send a message to the worker to start the task
    myWorker.postMessage('start');

    // Clean up the worker when the component unmounts
    return () => {
      myWorker.terminate();
    };
  }, []);

  return (
    <div>
      {result ? \`Result: \${result}\` : 'Calculating in the background...'}
      <p>You can still interact with this text while the worker is busy!</p>
    </div>
  );
}`,
          language: 'jsx',
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
        'Make your web app feel like a native app by making it installable and functional even when the user is offline. This involves a service worker for caching and a manifest file.',
      steps: [
        {
          title: 'Step 1: Create a Web App Manifest',
          explanation:
            'The `manifest.json` file tells the browser about your PWA and how it should behave when installed. It includes the app name, icons, and start URL.',
          code: `// public/manifest.json
{
  "name": "My Awesome PWA",
  "short_name": "AwesomePWA",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
// Don't forget to link this in your main HTML file's <head> tag!`,
          language: 'json',
        },
        {
          title: 'Step 2: Create a Service Worker for Caching',
          explanation:
            'The service worker is a script that runs in the background. We can use it to intercept network requests and serve cached content when the user is offline. This is a simple "cache-first" strategy.',
          code: `// public/service-worker.js
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = ['/', '/styles/main.css', '/script/main.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if found, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Register the Service Worker',
          explanation: 'Finally, you need to register the service worker in your main application code. This should be done in a client-side script.',
          code: `// In your main app entry point (e.g., _app.js or a useEffect in your root layout)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
`,
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
            'Implementing virtualization from scratch is tricky. A library like TanStack Virtual makes it much simpler by giving you the hooks and logic to calculate which items should be visible.',
          code: `npm install @tanstack/react-virtual

// TanStack Virtual gives you the hooks and logic to calculate
// which items should be visible, and you provide the rendering.`,
          language: 'bash',
        },
        {
          title: 'Step 2: Set up the Virtualizer',
          explanation: 'First, create a ref for your scrollable parent element. Then, use the `useVirtualizer` hook, providing it with the total number of items, an estimate of their size, and the ref of the scrolling element.',
          code: `import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function MyVirtualizedList({ items }) {
  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: items.length, // Total number of items
    getScrollElement: () => parentRef.current, // The scrolling element
    estimateSize: () => 35, // An estimate of the height of each row in pixels
  });

  // ... rest of the component
}`,
          language: 'jsx',
        },
        {
          title: 'Step 3: Render the Virtual Items',
          explanation: 'The hook gives you an array of `virtualItems` to render. These items have the correct positioning styles applied. You need to wrap them in a container that has the correct total height to make the scrollbar work.',
          code: `return (
  <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
    {/* This inner div has the total height of all items combined */}
    <div style={{ height: \`\${rowVirtualizer.getTotalSize()}px\`, position: 'relative' }}>
      {/* We only render the virtual items */}
      {rowVirtualizer.getVirtualItems().map(virtualItem => (
        <div
          key={virtualItem.key}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: \`\${virtualItem.size}px\`,
            transform: \`translateY(\${virtualItem.start}px)\`,
          }}
        >
          {items[virtualItem.index]}
        </div>
      ))}
    </div>
  </div>
);`,
          language: 'jsx',
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
        'Implement a fast, in-browser search engine to perform complex queries on large amounts of client-side data without needing a server. This provides an instant search experience.',
      steps: [
        {
          title: 'Step 1: Choose a Search Library',
          explanation:
            'Libraries like Lunr.js or FlexSearch are designed to build a search index on the client and perform queries against it efficiently. We will use Lunr.js for this example.',
          code: `npm install lunr

// Lunr.js allows you to define the fields to be indexed
// and then add your documents to it.`,
          language: 'bash',
        },
        {
          title: 'Step 2: Build the Search Index',
          explanation: 'You need to create a search index from your data. This is typically done once when your component mounts. You define which fields are searchable and which field is the unique reference.',
          code: `import lunr from 'lunr';
import { useEffect, useMemo, useState } from 'react';

const documents = [
  { id: 'a', title: 'React for Beginners', text: 'Learn React basics.' },
  { id: 'b', title: 'Advanced React', text: 'Learn about hooks and context.' },
];

function SearchComponent() {
  const idx = useMemo(() => lunr(function () {
    this.ref('id'); // The unique identifier for each document
    this.field('title'); // A field to be searched
    this.field('text');  // Another field to be searched

    documents.forEach(doc => this.add(doc));
  }), []);

  // ...
}`,
          language: 'jsx',
        },
        {
          title: 'Step 3: Perform a Search',
          explanation: 'With the index built, you can now perform searches based on user input. The search returns an array of matching documents with a score.',
          code: `const [query, setQuery] = useState('');
const [results, setResults] = useState([]);

const handleSearch = (e) => {
  const q = e.target.value;
  setQuery(q);
  if (q) {
    const searchResults = idx.search(q); // Perform the search
    // The results contain refs, so we map them back to the original documents
    const foundDocs = searchResults.map(res => documents.find(d => d.id === res.ref));
    setResults(foundDocs);
  } else {
    setResults([]);
  }
};

return (
  <div>
    <input type="text" value={query} onChange={handleSearch} placeholder="Search..." />
    <ul>
      {results.map(doc => <li key={doc.id}>{doc.title}</li>)}
    </ul>
  </div>
);`,
          language: 'jsx',
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
      title: 'Physics-Based UI Animations',
      description:
        'Create more natural and interruptible UI animations using physics principles like springs and friction. This makes the UI feel more alive and responsive.',
      steps: [
        {
          title: 'Step 1: Use a Physics-Based Animation Library',
          explanation:
            'React Spring and Framer Motion are the go-to libraries in the React ecosystem for creating fluid, physics-based animations. We will use Framer Motion.',
          code: `npm install framer-motion

// Framer Motion provides a 'motion' component that you can
// use to easily animate any element with spring physics.
// You just replace your <div> with <motion.div>.`,
          language: 'bash',
        },
        {
          title: 'Step 2: Create a Basic Animation',
          explanation: 'The `motion` component accepts an `animate` prop where you define the target state. Framer Motion will automatically create a spring animation to get there.',
          code: `import { motion } from 'framer-motion';

function BouncingBall() {
  return (
    <motion.div
      style={{ 
        width: 100, 
        height: 100, 
        borderRadius: '50%', 
        backgroundColor: 'blue' 
      }}
      // Animate to these properties
      animate={{
        scale: [1, 1.2, 1, 1.2, 1], // Animate scale in a sequence
        y: [0, -50, 0, -50, 0], // Animate y-position
      }}
      // Define the transition properties
      transition={{
        duration: 2,
        repeat: Infinity, // Loop the animation forever
        ease: "easeInOut",
      }}
    />
  );
}`,
          language: 'jsx',
        },
        {
          title: 'Step 3: Make it Interactive',
          explanation: 'Animations become even better when they react to user input. You can use props like `whileHover` and `whileTap` to define different animation states for interactions.',
          code: `import { motion } from 'framer-motion';

function InteractiveButton() {
  return (
    <motion.button
      // Animate to a larger scale and shadow on hover
      whileHover={{ scale: 1.1, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
      // Animate to a smaller scale on tap/click
      whileTap={{ scale: 0.9 }}
      style={{ 
        padding: '1rem 2rem', 
        background: 'white', 
        color: 'black', 
        border: 'none', 
        borderRadius: '8px' 
      }}
    >
      Hover or Tap Me
    </motion.button>
  );
}`,
          language: 'jsx',
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
            'The foundation of dynamic theming is CSS Custom Properties (variables). You define your theme using variables in your `globals.css` file, and then change the variable values with JavaScript to update the theme instantly.',
          code: `/* globals.css */
/* Define a default theme using CSS variables */
:root {
  --primary-color: #6366f1; /* Indigo */
  --background-color: #f9fafb; /* Gray 50 */
  --text-color: #111827; /* Gray 900 */
}

/* You can also define a dark theme */
.dark {
  --primary-color: #818cf8; /* Indigo 400 */
  --background-color: #1f2937; /* Gray 800 */
  --text-color: #f9fafb; /* Gray 50 */
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}`,
          language: 'css',
        },
        {
          title: 'Step 2: Create a Theme Switcher Component',
          explanation: 'In React, you can create a component that toggles a class name on the `<html>` or `<body>` element. This will switch between your defined themes.',
          code: `import { useState, useEffect } from 'react';

function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Add or remove the 'dark' class from the root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <button onClick={() => setIsDarkMode(!isDarkMode)}>
      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
    </button>
  );
}`,
          language: 'jsx',
        },
        {
          title: 'Step 3: Allow Custom Colors',
          explanation: 'To allow users to pick any color, you can directly set the CSS variable style on the root element. This overrides the class-based themes.',
          code: `import { useState } from 'react';

function ColorPicker() {
  const [color, setColor] = useState('#6366f1');

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    // Directly set the CSS variable on the document root
    document.documentElement.style.setProperty('--primary-color', newColor);
  };

  return (
    <div>
      <label>Primary Color:</label>
      <input type="color" value={color} onChange={handleColorChange} />
    </div>
  );
}`,
          language: 'jsx',
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
        'Implement a robust undo/redo system for more than just text input, applying to any user action that changes the application state, like moving items or changing settings.',
      steps: [
        {
          title: 'Step 1: Use a State Management Library with History',
          explanation:
            'Implementing this from scratch is very complex. It is highly recommended to use a state management library with built-in support or middleware for handling state history. Zustand and Jotai are great options.',
          code: `// We will use Zustand with its 'temporal' middleware for history.
npm install zustand zundo

// 'zundo' is a middleware for Zustand that automatically adds
// undo/redo capabilities to your state store.`,
          language: 'bash',
        },
        {
          title: 'Step 2: Create a Temporal Store',
          explanation: 'Wrap your Zustand store definition with the `temporal` middleware. This will automatically track changes to your state and provide functions to travel through the history.',
          code: `import { create } from 'zustand';
import { temporal } from 'zundo';

const useStore = create(temporal(set => ({
  boxes: [],
  addBox: (newBox) => set(state => ({ boxes: [...state.boxes, newBox] })),
  moveBox: (boxId, newPosition) => set(state => ({
    boxes: state.boxes.map(b => b.id === boxId ? { ...b, ...newPosition } : b)
  })),
})));

// Now, your store has undo/redo logic built-in!`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Connect to the UI',
          explanation: 'The `temporal` middleware adds a `temporal` property to your store, which contains the `pastStates`, `futureStates`, and the `undo` and `redo` functions.',
          code: `function Controls() {
  // Get the temporal store and its functions
  const { undo, redo, pastStates, futureStates } = useStore(state => state.temporal);

  return (
    <div>
      <button onClick={undo} disabled={pastStates.length === 0}>
        Undo
      </button>
      <button onClick={redo} disabled={futureStates.length === 0}>
        Redo
      </button>
    </div>
  );
}

// Your other components can just use the state as normal.
function Boxes() {
  const boxes = useStore(state => state.boxes);
  // ... render the boxes
}
`,
          language: 'jsx',
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
          title: 'Step 1: Understand the Core Concept and Tools',
          explanation:
            'The goal is to have multiple teams work on different parts of the UI independently. A common approach is to use a "host" or "container" application that loads the micro-frontends. Webpack\'s Module Federation is a powerful tool for this.',
          code: `// This is a conceptual example of a Webpack config for a host app.
// webpack.config.js (Host App)
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    // 'search' is the name of the remote app
    // 'search@http://localhost:3001/remoteEntry.js' is its entry point
    search: 'search@http://localhost:3001/remoteEntry.js',
    cart: 'cart@http://localhost:3002/remoteEntry.js',
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
})
`,
          language: 'javascript',
        },
        {
          title: 'Step 2: Expose a Component from a Remote App',
          explanation: 'In your micro-frontend (the "remote" app), you need to configure Webpack to expose the components you want the host app to be able to import.',
          code: `// webpack.config.js (Remote App, e.g., the 'search' app)
new ModuleFederationPlugin({
  name: 'search',
  filename: 'remoteEntry.js',
  exposes: {
    // './SearchBar' is the alias the host will use.
    // './src/SearchBar' is the actual path to the component.
    './SearchBar': './src/SearchBar',
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
})`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Consume the Component in the Host App',
          explanation: 'In your host application, you can now dynamically import and render the component from the remote app as if it were a local component.',
          code: `// In your host application's code
import React, { Suspense } from 'react';

// Dynamically import the SearchBar from the 'search' remote app
const RemoteSearchBar = React.lazy(() => import('search/SearchBar'));

function App() {
  return (
    <div>
      <header>My Website Header</header>
      <Suspense fallback={<div>Loading Search...</div>}>
        <RemoteSearchBar />
      </Suspense>
      {/* ... other content */}
    </div>
  );
}`,
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
          title: 'Step 1: Define Rules and Events',
          explanation:
            'First, identify the key user actions you want to encourage ("events") and the rules for unlocking achievements. This logic typically lives on the backend to prevent cheating.',
          code: `// Example structure for achievement rules (could be a JSON file or in a database)
const achievements = {
  'FIRST_POST': {
    title: 'First Post!',
    description: 'You shared your first thought with the community.',
    event: 'USER_CREATED_POST',
    condition: (userPostCount) => userPostCount === 1,
  },
  'STREAK_5_DAYS': {
    title: '5-Day Streak',
    description: 'You visited for 5 days in a row.',
    event: 'USER_LOGGED_IN',
    condition: (userLoginStreak) => userLoginStreak === 5,
  }
};`,
          language: 'javascript',
        },
        {
          title: 'Step 2: Track Events',
          explanation: 'Create a function to track user actions. When a user performs a key action, you call this function, which would typically send the event to your backend.',
          code: `// frontend/services/analytics.js
export function trackEvent(eventName, userId, eventData) {
  // This would be an API call to your backend
  fetch('/api/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, userId, eventData }),
  });
  // The backend would then process this event against the achievement rules.
}

// Example usage in a component:
function NewPostForm() {
  const handleSubmit = () => {
    // ... logic to submit post ...
    trackEvent('USER_CREATED_POST', currentUser.id);
  }
}`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Display Achievements',
          explanation: 'Create a UI to show users the achievements they have unlocked. This could be a profile page or a toast notification that appears when an achievement is earned.',
          code: `import { useQuery } from '@tanstack/react-query'; // For fetching data

function UserAchievements({ userId }) {
  // Fetch the user's unlocked achievements from your backend
  const { data: unlocked } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => fetch(\`/api/users/\${userId}/achievements\`).then(res => res.json()),
  });

  return (
    <div>
      <h2>Your Achievements</h2>
      <ul>
        {unlocked?.map(ach => (
          <li key={ach.id}>
            <strong>{ach.title}</strong>: {ach.description}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
          language: 'jsx',
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
            "WebRTC needs a 'signaling' server to help two browsers find and connect with each other. This is usually done with WebSockets. The signaling server is like a phone operator connecting two people; it doesn't handle the actual conversation.",
          code: `// Conceptual signaling flow using a WebSocket server

// Browser A connects to WebSocket server
socket.on('connect', () => {
  socket.emit('join-room', 'my-video-room');
});

// Browser A -> Server: "Here is my connection info (SDP offer), send it to others in the room."
// Server -> Browser B: "Browser A wants to connect, here's their info."
// Browser B -> Server: "Got it. Here is MY info (SDP answer), send it to Browser A."
// Server -> Browser A: "Here is Browser B's info."

// ... now they can connect directly using the exchanged info.`,
          language: 'javascript',
        },
        {
          title: 'Step 2: Get User Media (Webcam/Microphone)',
          explanation: 'Before you can start a call, you need to get access to the user\'s camera and microphone. The `navigator.mediaDevices.getUserMedia` API is used for this.',
          code: `async function getMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // You can attach this stream to a <video> element to show a preview
    const myVideo = document.querySelector('#my-video');
    myVideo.srcObject = stream;
    return stream;
  } catch (err) {
    console.error("Error accessing media devices.", err);
  }
}`,
          language: 'javascript',
        },
        {
          title: 'Step 3: Create an RTCPeerConnection',
          explanation: 'This is the core WebRTC object that manages the connection to another peer. You add your local media stream to it and set up listeners to handle incoming streams and connection candidates.',
          code: `const peerConnection = new RTCPeerConnection();
const localStream = await getMediaStream();

// Add your local video/audio tracks to the connection to be sent
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});

// Listen for the remote user's stream
peerConnection.ontrack = event => {
  const remoteVideo = document.querySelector('#remote-video');
  remoteVideo.srcObject = event.streams[0];
};

// ... create an offer/answer and exchange ICE candidates via your signaling server`,
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
          explanation: 'Building a spreadsheet from scratch is extremely complex. It\'s best to use a powerful library like AG-Grid, Handsontable, or TanStack Table.',
          code: `npm install @tanstack/react-table

// TanStack Table is a "headless" UI library, meaning it gives you
// all the logic for sorting, filtering, and pagination, but you
// control the rendering and styling completely. This is great for custom spreadsheets.`,
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
// pressure-sensitive freehand strokes, making drawing feel
// very natural, even with a mouse.`,
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
          title: 'Step 1: Define Roles on the Backend',
          explanation: 'Roles should be managed and verified on your backend to ensure security. A common way to do this is with custom claims in a JWT (JSON Web Token), which can be provided by services like Firebase Authentication.',
          code: `// Example: Setting a custom claim with Firebase Admin SDK (on your server)
// This function would be triggered when you want to make a user an admin.
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin role set for user!');
  });
`,
          language: 'javascript'
        },
        {
          title: 'Step 2: Protect API Routes',
          explanation: 'In your backend, you must protect routes by checking the decoded token for the required role before allowing the action to proceed.',
          code: `// Example: Express middleware to check for admin role
function isAdmin(req, res, next) {
  const claims = req.user.claims; // Assuming user token is already decoded
  if (claims && claims.admin === true) {
    return next();
  }
  return res.status(403).send('Forbidden: requires admin role');
}

app.post('/api/admin/delete-everything', isAdmin, (req, res) => {
  // This code only runs if the user is an admin
});`,
          language: 'javascript'
        },
        {
          title: 'Step 3: Conditionally Render UI on the Frontend',
          explanation: 'On the client-side, you can read the claims from the user\'s token to show or hide UI elements. While this is good for UX, it is not a substitute for backend security.',
          code: `// React component
function MyComponent({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get the decoded claims from the ID token
    user.getIdTokenResult().then(idTokenResult => {
      setIsAdmin(!!idTokenResult.claims.admin);
    });
  }, [user]);

  return (
    <div>
      {/* This button is only visible to admins */}
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}`,
          language: 'jsx'
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
