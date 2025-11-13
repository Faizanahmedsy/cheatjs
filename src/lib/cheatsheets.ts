import { FileCode, ToyBrick, Zap, Share2 } from 'lucide-react';
import type { ElementType } from 'react';

export type Snippet = {
  title: string;
  description: string;
  code: string;
  language: string;
  visualization?: string; // e.g., 'HashMap'
  pros?: string[];
  cons?: string[];
};

export type SubCategory = {
  name: string;
  snippets: Snippet[];
}

export type Category = {
  name: string;
  icon: ElementType;
  snippets?: Snippet[];
  subCategories?: SubCategory[];
};

export const cheatsheets: Category[] = [
  {
    name: 'React',
    icon: ToyBrick,
    subCategories: [
      {
        name: 'Beginner',
        snippets: [
          {
            title: 'What is React?',
            description:
              "Imagine building with LEGOs. Instead of building a whole castle at once, you build small parts like a tower or a wall, and then put them together. React lets you build a website like that, using small, reusable 'pieces' called components.",
            code: `// Think of this as your main LEGO castle
function Castle() {
  return (
    <div>
      <Wall />  // One LEGO piece
      <Tower /> // Another LEGO piece
    </div>
  );
}

// This is your LEGO wall piece
function Wall() {
  return <p>This is a sturdy wall.</p>;
}

// This is your LEGO tower piece
function Tower() {
  return <p>This is a tall tower.</p>;
}`,
            language: 'jsx',
          },
          {
            title: 'Components',
            description:
              "Components are like special LEGO bricks. You can build a 'Button' brick or a 'ProfilePicture' brick, and then use them anywhere you want in your app, as many times as you like. It keeps your code organized!",
            code: `// This is a reusable Button component
function MyButton() {
  return <button>Click Me!</button>;
}

// You can use your special button anywhere
function App() {
  return (
    <div>
      <p>Here is a button:</p>
      <MyButton />
      <p>Here is another one:</p>
      <MyButton />
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'JSX',
            description:
              'JSX is a special way of writing HTML inside your JavaScript. It looks like HTML, but it lets you add JavaScript logic right in your layout, making it easy to create dynamic content.',
            code: `// This is JSX! It looks like HTML in JavaScript.
const name = 'Faizan';
const greeting = <h1>Hello, {name}!</h1>;
// We can use a JavaScript variable right inside our "HTML".

// It renders as: <h1>Hello, Faizan!</h1>`,
            language: 'jsx',
          },
          {
            title: 'useState Hook',
            description:
              "useState is like a component's memory. It lets your component remember things, like how many times a button has been clicked. When the state changes, React automatically re-renders the component to show the new value.",
            code: `import { useState } from 'react';

function Counter() {
  // 'count' is the memory, it starts at 0.
  // 'setCount' is how you update the memory.
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      {/* This click updates the memory */}
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Event Handling',
            description:
              'React can listen for user actions, like clicks, typing, or hovering. You give an HTML element a special prop like `onClick` and tell it which function to run when the event happens.',
            code: `function AlertButton() {
  // This function will run when the button is clicked
  function handleClick() {
    alert('You clicked the button!');
  }

  // We tell the button to listen for a 'click'
  // and run our handleClick function.
  return <button onClick={handleClick}>Click for an alert</button>;
}`,
            language: 'jsx',
          },
          {
            title: 'Conditional Rendering',
            description:
              'This is like playing peek-a-boo. You can show or hide things based on a condition. If a user is logged in, show their profile. If not, show a login button.',
            code: `function Greeting({ isLoggedIn }) {
  // If isLoggedIn is true...
  if (isLoggedIn) {
    // ...show the welcome message.
    return <p>Welcome back!</p>;
  }
  // Otherwise...
  // ...show the login prompt.
  return <p>Please log in.</p>;
}

// Using the component:
<Greeting isLoggedIn={true} /> // Shows "Welcome back!"
<Greeting isLoggedIn={false} /> // Shows "Please log in."
`,
            language: 'jsx',
          },
          {
            title: 'Handling Forms',
            description:
              "React can control what's inside form inputs like text boxes. You use state to 'remember' what the user is typing, and update the state every time they type a new character.",
            code: `import { useState } from 'react';

function NameForm() {
  // Use state to remember the value in the input
  const [name, setName] = useState('');

  return (
    <form>
      <label>
        Name:
        <input
          type="text"
          value={name}
          // When the user types, update the state
          onChange={e => setName(e.target.value)}
        />
      </label>
      <p>Your name is: {name}</p>
    </form>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'useEffect Hook',
            description:
              'useEffect lets your component do something *after* it has been rendered, like fetching data from the internet or setting up a timer. It helps manage side effects that are not directly related to rendering.',
            code: `import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  // This effect runs once after the first render
  useEffect(() => {
    // This code runs *after* the component is on the screen
    const intervalId = setInterval(() => {
      setSeconds(currentSeconds => currentSeconds + 1);
    }, 1000);

    // This is a cleanup function. It runs when the component disappears.
    return () => clearInterval(intervalId);
  }, []); // The empty [] means "only run this once".

  return <div>Timer: {seconds} seconds</div>;
}`,
            language: 'jsx',
          },
        ]
      },
      {
        name: 'Intermediate',
        snippets: [
          {
            title: 'Styling with Tailwind CSS',
            description: 'Tailwind CSS lets you write utility classes directly in your JSX for rapid styling, without leaving your HTML.',
            code: `// No need for a separate CSS file for styling this component.
// Classes like 'bg-blue-500', 'text-white', and 'p-2' are from Tailwind.
function TailwindButton() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      I'm styled with Tailwind!
    </button>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Using ShadCN UI',
            description: 'ShadCN UI provides beautifully designed, accessible components that you can easily copy and paste into your project.',
            code: `// Import a pre-built component from your project's ui folder.
import { Button } from "@/components/ui/button";

// Use it like any other React component.
function ShadcnExample() {
  return (
    <div>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="outline">Outline Button</Button>
    </div>
  )
}`,
            language: 'jsx',
          },
          {
            title: 'Forms with React Hook Form',
            description: 'React Hook Form makes form validation and state management simple and performant by using React hooks.',
            code: `import { useForm } from "react-hook-form";

function MyForm() {
  // register: connects an input to the form
  // handleSubmit: runs your code only if validation passes
  // formState: { errors } contains validation errors
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // This function runs on successful submission
  const onSubmit = (data) => console.log(data);

  return (
    // Pass your submit handler to handleSubmit
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Register the input with a name and validation rules */}
      <input defaultValue="test" {...register("example", { required: true })} />
      {/* Show an error if the 'required' rule fails */}
      {errors.example && <span>This field is required</span>}
      
      <input type="submit" />
    </form>
  );
}`,
            language: 'jsx'
          },
          {
            title: 'State Management with Zustand',
            description: "Zustand is a small, fast, and simple state management solution. It's like a global useState that any component can access.",
            code: `import { create } from 'zustand';

// Create a 'store' to hold your global state.
const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

function BearCounter() {
  // Use the hook to get the state from the store.
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  // You can also get the actions from the store.
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}`,
            language: 'jsx'
          },
          {
            title: 'Data Fetching with TanStack Query',
            description: 'TanStack Query (formerly React Query) simplifies fetching, caching, and updating data from a server in your React applications.',
            code: `import { useQuery } from '@tanstack/react-query';

function Todos() {
  // useQuery handles fetching, loading states, and error states for you.
  const { isLoading, error, data } = useQuery({
    queryKey: ['repoData'], // A unique key for this query
    queryFn: () =>
      fetch('https://api.github.com/repos/tannerlinsley/react-query')
        .then(res => res.json())
  });

  // It automatically gives you the loading state
  if (isLoading) return 'Loading...';

  // And the error state
  if (error) return 'An error has occurred: ' + error.message;

  // And finally, the data
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}`,
            language: 'jsx'
          }
        ]
      },
      {
        name: 'Advanced',
        snippets: [
          {
            title: 'Rendering Strategies',
            description: 'Different ways to render your app. CSR is standard React. Next.js enables SSR and SSG for better performance and SEO.',
            code: `// Client-Side Rendering (CSR): Browser builds the page. Good for web apps.
// Standard \`create-react-app\` is CSR.

// Server-Side Rendering (SSR): Server builds page on each request. Good for dynamic, user-specific content.
// In Next.js (pages router):
export async function getServerSideProps(context) {
  const data = await fetch(...); // Fetch data on each request
  return { props: { data } };
}

// Static Site Generation (SSG): Page is built once at build time. Super fast. Good for blogs, marketing pages.
// In Next.js (pages router):
export async function getStaticProps(context) {
  const data = await fetch(...); // Fetch data at build time
  return { props: { data } };
}`,
            language: 'javascript'
          },
          {
            title: 'Pixel-Perfect Figma to Code',
            description: 'To perfectly match a Figma design, pay close attention to spacing, typography, colors, and layout. Use a design system or a UI library like ShadCN to maintain consistency.',
            code: `// 1. Use variables for colors, fonts, and spacing (like in globals.css).
// 2. Measure everything in Figma: padding, margin, font size, line height.
// 3. Use Tailwind CSS to apply those exact measurements.
// 4. Use flexbox and grid for layouts. 'gap' is your best friend.

// Example of a button from a Figma design:
// Figma says: 12px padding top/bottom, 24px left/right, 16px font, bold, color #5A67D8
<button className="py-3 px-6 bg-[#5A67D8] text-white font-bold text-base rounded-lg">
  Click Me
</button>
// py-3 = 12px, px-6 = 24px, text-base = 16px`,
            language: 'jsx'
          },
          {
            title: 'Responsive Design',
            description: 'Use mobile-first responsive breakpoints in Tailwind to ensure your app looks great on all screen sizes. Design for mobile, then add styles for larger screens.',
            code: `// This div is a single column on mobile, and a 3-column grid on larger screens.
// 'grid-cols-1' is the default for small screens (mobile-first).
// 'md:grid-cols-3' applies only on medium screens and up (md = 768px).
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// You can hide elements on certain screens too.
// 'hidden' hides it by default.
// 'lg:block' makes it visible on large screens.
<div className="hidden lg:block">
  Only visible on large screens.
</div>`,
            language: 'jsx'
          },
          {
            title: 'Advanced State Management',
            description: "For complex apps, state can get tricky. Beyond component state (useState), you can use Context API for 'prop drilling' or a dedicated library like Zustand or Redux for a central, global state.",
            code: `// React Context for avoiding prop drilling
// Create a context
const ThemeContext = React.createContext('light');

function App() {
  // Use the Provider to pass the value down
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// A component in the middle doesn't need to know about the theme.
function Toolbar() { return <ThemedButton />; }

function ThemedButton() {
  // Use the Consumer to read the value from the context.
  const theme = useContext(ThemeContext);
  return <button className={theme}>I am {theme}</button>;
}
`,
            language: 'jsx'
          }
        ]
      }
    ],
  },
  {
    name: 'Next.js',
    icon: FileCode,
    snippets: [
      {
        title: 'Link Component',
        description: 'Client-side navigation between pages.',
        code: `// Import the Link component
import Link from 'next/link';

function Nav() {
  return (
    <nav>
      {/* Use Link for internal routing */}
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}`,
        language: 'jsx',
      },
      {
        title: 'Dynamic Routes (App Router)',
        description: 'Create pages with dynamic paths in the App Router.',
        code: `// File: app/blog/[slug]/page.tsx
// This component renders a page for a dynamic route
export default function Page({ params }: { params: { slug: string } }) {
  // The 'slug' parameter is extracted from the URL
  return <div>My Post: {params.slug}</div>
}`,
        language: 'typescript',
      },
      {
        title: 'API Routes (Route Handlers)',
        description: 'Build your API with Route Handlers in the App Router.',
        code: `// File: app/api/hello/route.ts
// Import NextResponse for sending JSON responses
import { NextResponse } from 'next/server';
 
// Define a GET request handler
export async function GET(request: Request) {
  // Return a JSON response
  return NextResponse.json({ message: 'Hello, World!' });
}`,
        language: 'typescript',
      },
    ],
  },
  {
    name: 'Frontend Concepts',
    icon: Zap,
    snippets: [
      {
        title: 'Async/Await',
        description: 'A modern way to handle asynchronous operations, making promise-based code look and behave more like synchronous code.',
        code: `// Define an async function
async function fetchData() {
  try {
    // Await the response from the fetch call
    const response = await fetch('https://api.example.com/data');
    // Await the parsing of the JSON response
    const data = await response.json();
    console.log(data);
  } catch (error) {
    // Handle any errors that occur during the try block
    console.error('Fetching data failed:', error);
  }
}

fetchData();`,
        language: 'javascript',
      },
      {
        title: 'Promise.all',
        description: 'Run multiple promises concurrently and wait for all of them to resolve. It rejects if any of the promises reject.',
        code: `// Create some promises
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

// Wait for all promises to resolve
Promise.all([promise1, promise2, promise3]).then((values) => {
  // Log the array of resolved values
  console.log(values); // [3, 42, "foo"]
});`,
        language: 'javascript',
      },
      {
        title: 'Destructuring',
        description: 'A convenient way to unpack values from arrays or properties from objects into distinct variables.',
        code: `// Object destructuring
const user = { id: 1, name: 'John Doe', age: 30 };
const { name, age } = user;
console.log(name); // "John Doe"
console.log(age); // 30

// Array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second] = numbers;
console.log(first, second); // 1 2`,
        language: 'javascript',
      },
      {
        title: 'Memoization (useMemo/useCallback)',
        description: 'A performance optimization technique. `useMemo` caches the result of a calculation, `useCallback` caches a function definition, preventing unnecessary re-renders in child components.',
        code: `import { useMemo, useCallback } from 'react';

// useMemo: Memoizes a calculated value.
// The expensive calculation only runs when 'a' or 'b' changes.
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback: Memoizes a function.
// The function is not recreated on every render, which is useful
// when passing callbacks to optimized child components.
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b], // The function is recreated only if a or b changes
);`,
        language: 'jsx',
      },
      {
        title: 'The Event Loop',
        description: "JavaScript has a single-threaded event loop that handles asynchronous operations. It consists of a call stack, a callback queue, and web APIs. Understanding it is key to understanding how JS handles async tasks like `setTimeout` or `fetch`.",
        code: `console.log('Start'); // 1. Added to stack, executed

// 2. setTimeout is a Web API. It's handed off to the browser.
// The browser starts a 0ms timer.
setTimeout(() => {
  console.log('Timeout'); // 5. Added to queue, then stack when empty.
}, 0);

// 3. Promise is created. The executor runs immediately.
Promise.resolve().then(() => {
  console.log('Promise'); // 4. Added to microtask queue, which runs before callback queue.
});

console.log('End'); // 3. Added to stack, executed

// Output order: Start, End, Promise, Timeout`,
        language: 'javascript',
      },
      {
        title: 'CORS (Cross-Origin Resource Sharing)',
        description: "A browser security feature that restricts how a web page from one domain can request resources from another domain. The server must include specific HTTP headers (like `Access-Control-Allow-Origin`) to allow the request.",
        code: `// Example of a server (e.g., Express.js) allowing requests
// from a specific origin. This is NOT frontend code, but it's
// essential for frontend developers to understand.

// On your Node.js/Express server:
const express = require('express');
const cors = require('cors'); // Using the 'cors' middleware
const app = express();

const corsOptions = {
  // The origin that is allowed to make requests
  origin: 'https://my-awesome-frontend.com',
};

app.use(cors(corsOptions)); // Enable CORS for the allowed origin

app.get('/api/data', (req, res) => {
  res.json({ message: 'This data is protected by CORS!' });
});`,
        language: 'javascript',
      },
    ],
  },
  {
    name: 'DSA',
    icon: Share2,
    snippets: [
      {
        title: 'Array',
        description: "The simplest data structure, an array is a collection of items stored at contiguous memory locations. It's great for fast access to elements at a specific position (known as an 'index').",
        visualization: 'Array',
        pros: [
          "Fast access: O(1) time complexity to access any element by its index.",
          "Memory efficient: Stores elements contiguously, which can be cache-friendly.",
        ],
        cons: [
          "Slow insertion/deletion: Adding or removing elements from the beginning or middle is slow (O(n)) because subsequent elements need to be shifted.",
          "Fixed size (in many languages): In languages like Java/C++, arrays have a fixed size, requiring a new array to be created for resizing.",
        ],
        code: `// JavaScript arrays are dynamic and can hold multiple types.
const fruits = ['Apple', 'Banana', 'Cherry'];

// Access by index (O(1))
console.log(fruits[1]); // "Banana"

// Add to the end (amortized O(1))
fruits.push('Date');

// Remove from the end (O(1))
fruits.pop();

// Add to the beginning (O(n))
fruits.unshift('Apricot');

// Iterate through the array
for (const fruit of fruits) {
  console.log(fruit);
}`,
        language: 'javascript'
      },
      {
        title: 'Stack',
        description: "A Stack is a linear data structure that follows a Last-In, First-Out (LIFO) principle. Think of it like a stack of plates: you add a new plate to the top, and you also remove a plate from the top.",
        visualization: 'Stack',
        pros: [
          "Fast operations: Push (add) and Pop (remove) are very fast (O(1)).",
          "Simple to implement: Can be easily built using an array or a linked list.",
          "Used in many algorithms: Essential for call stacks, parsing expressions, and backtracking (e.g., maze solving).",
        ],
        cons: [
          "Limited access: You can only access the top element.",
        ],
        code: `// You can easily implement a Stack in JS using an array.
class Stack {
  constructor() {
    this.items = [];
  }

  // push(item): Add an item to the top
  push(item) {
    this.items.push(item);
  }

  // pop(): Remove and return the top item
  pop() {
    if (this.items.length === 0) return "Underflow";
    return this.items.pop();
  }

  // peek(): View the top item without removing
  peek() {
    return this.items[this.items.length - 1];
  }

  // isEmpty(): Check if the stack is empty
  isEmpty() {
    return this.items.length === 0;
  }
}`,
        language: 'javascript'
      },
       {
        title: 'Queue',
        description: "A Queue is a linear data structure that follows a First-In, First-Out (FIFO) principle. It's like a checkout line at a grocery store: the first person to get in line is the first person to be served.",
        visualization: 'Queue',
        pros: [
          "Fast operations: Enqueue (add) and Dequeue (remove) are very fast (O(1)).",
          "Fairness: Maintains the order of elements, which is useful for processing tasks in sequence.",
          "Used in many scenarios: Breadth-First Search (BFS) in graphs, task scheduling, and handling requests.",
        ],
        cons: [
          "Limited access: You can only access the front and back elements.",
          "Array-based implementation can be inefficient for dequeue if not careful (O(n) if using `shift`)."
        ],
        code: `// A simple Queue implementation in JS.
class Queue {
  constructor() {
    this.items = [];
  }

  // enqueue(item): Add an item to the back
  enqueue(item) {
    this.items.push(item);
  }

  // dequeue(): Remove and return the front item
  dequeue() {
    if (this.isEmpty()) return "Underflow";
    return this.items.shift(); // .shift() can be O(n), but is simple for demonstration.
  }

  // front(): View the front item
  front() {
    if (this.isEmpty()) return "No items in Queue";
    return this.items[0];
  }

  // isEmpty(): Check if the queue is empty
  isEmpty() {
    return this.items.length === 0;
  }
}`,
        language: 'javascript'
      },
      {
        title: 'Hash Map (Object/Map)',
        description: "A Hash Map is a data structure that stores key-value pairs. It uses a 'hash function' to compute an index into an array of buckets or slots, from which the desired value can be found. This allows for very fast lookups, insertions, and deletions.",
        visualization: 'HashMap',
        pros: [
          "Fast Lookups: Average time complexity of O(1) for get, set, and delete.",
          "Flexible Keys: In JavaScript, Maps can use any value as a key (objects, functions), not just strings.",
        ],
        cons: [
          "Potential for Collisions: If two keys hash to the same index, performance can degrade.",
          "Unordered: In traditional hash maps (and JS Objects), keys are not stored in any particular order.",
        ],
        code: `// In JavaScript, you can use Objects or the Map class.
// Map is generally preferred for dedicated hash maps.

const myMap = new Map();

// Set values
myMap.set('name', 'Alice');
myMap.set('age', 30);
myMap.set({ id: 1 }, 'An object key!');

// Get values
console.log(myMap.get('name')); // "Alice"

// Check for a key
console.log(myMap.has('age')); // true

// Delete a key
myMap.delete('age');

// Get the size
console.log(myMap.size); // 2
`,
        language: 'javascript'
      }
    ]
  }
];
