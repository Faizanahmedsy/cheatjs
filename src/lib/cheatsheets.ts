import { FileCode, ToyBrick, Zap } from 'lucide-react';
import type { ElementType } from 'react';

export type Snippet = {
  title: string;
  description: string;
  code: string;
  language: string;
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
