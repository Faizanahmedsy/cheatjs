import {
  MousePointer2,
  Lock,
  Sheet,
  Paintbrush,
  Puzzle,
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
