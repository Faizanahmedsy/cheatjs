import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';

const guideContent = {
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
};

export default function FeaturesPage() {
  return (
    <div className="bg-slate-900 text-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl font-bold text-slate-100">
            {guideContent.title}
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            {guideContent.description}
          </p>
        </div>

        <div className="space-y-8">
          {guideContent.steps.map((step, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 border border-slate-700/50"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-cyan-300">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">{step.explanation}</p>
                <CodeBlock code={step.code} language={step.language} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
