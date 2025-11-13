import { FileCode, ToyBrick, Zap } from 'lucide-react';
import type { ElementType } from 'react';

export type Snippet = {
  title: string;
  description: string;
  code: string;
  language: string;
};

export type Category = {
  name: string;
  icon: ElementType;
  snippets: Snippet[];
};

export const cheatsheets: Category[] = [
  {
    name: 'React',
    icon: ToyBrick,
    snippets: [
      {
        title: 'useState Hook',
        description: 'Declare a state variable in a function component.',
        code: `// Import the useState hook from React
import { useState } from 'react';

// Define a function component
function Counter() {
  // Declare a state variable 'count' and a function 'setCount' to update it
  const [count, setCount] = useState(0);

  // Return JSX to render
  return (
    <div>
      <p>You clicked {count} times</p>
      {/* Update state on button click */}
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
        language: 'jsx',
      },
      {
        title: 'useEffect Hook',
        description: 'Perform side effects in function components.',
        code: `// Import hooks from React
import { useState, useEffect } from 'react';

function Timer() {
  // State for the timer
  const [seconds, setSeconds] = useState(0);

  // useEffect runs after every render
  useEffect(() => {
    // Set up an interval
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);
    // Cleanup function runs on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means it runs only once

  return <div>Timer: {seconds}s</div>;
}`,
        language: 'jsx',
      },
      {
        title: 'useContext Hook',
        description: 'Access context without nesting consumers.',
        code: `// Create a context object
const ThemeContext = React.createContext('light');

function ThemedButton() {
  // Consume the context value
  const theme = useContext(ThemeContext);
  return <button className={theme}>I'm a {theme} button</button>;
}`,
        language: 'jsx',
      },
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
        description: 'A modern way to handle asynchronous operations.',
        code: `// Define an async function
async function fetchData() {
  try {
    // Await the response from the fetch call
    const response = await fetch('https://api.example.com/data');
    // Await the parsing of the JSON response
    const data = await response.json();
    console.log(data);
  } catch (error) {
    // Handle any errors that occur
    console.error('Fetching data failed:', error);
  }
}`,
        language: 'javascript',
      },
      {
        title: 'Promise.all',
        description: 'Run multiple promises in parallel.',
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
        description: 'Unpack values from arrays or properties from objects.',
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
    ],
  },
];