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
        code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
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
        code: `import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Empty array means effect runs only once

  return <div>Timer: {seconds}s</div>;
}`,
        language: 'jsx',
      },
      {
        title: 'useContext Hook',
        description: 'Access context without nesting consumers.',
        code: `const ThemeContext = React.createContext('light');

function ThemedButton() {
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
        code: `import Link from 'next/link';

function Nav() {
  return (
    <nav>
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
        code: `// app/blog/[slug]/page.tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <div>My Post: {params.slug}</div>
}`,
        language: 'typescript',
      },
      {
        title: 'API Routes (Route Handlers)',
        description: 'Build your API with Route Handlers in the App Router.',
        code: `// app/api/hello/route.ts
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
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
        code: `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fetching data failed:', error);
  }
}`,
        language: 'javascript',
      },
      {
        title: 'Promise.all',
        description: 'Run multiple promises in parallel.',
        code: `const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values); // [3, 42, "foo"]
});`,
        language: 'javascript',
      },
      {
        title: 'Destructuring',
        description: 'Unpack values from arrays or properties from objects.',
        code: `const user = { id: 1, name: 'John Doe', age: 30 };
const { name, age } = user;
console.log(name); // "John Doe"
console.log(age); // 30

const numbers = [1, 2, 3, 4, 5];
const [first, second] = numbers;
console.log(first, second); // 1 2`,
        language: 'javascript',
      },
    ],
  },
];
