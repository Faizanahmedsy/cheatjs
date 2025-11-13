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
