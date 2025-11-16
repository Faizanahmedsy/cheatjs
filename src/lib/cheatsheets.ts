

import { FileCode, ToyBrick, Zap, Share2, Component, Puzzle } from 'lucide-react';
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

export type Section = {
  heading: string;
  snippets: Snippet[];
};

export type SubCategory = {
  name: string;
  snippets?: Snippet[];
  sections?: Section[];
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
        sections: [
          {
            heading: 'Concepts',
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

function App() {
  // Try changing this to false!
  const isUserLoggedIn = true;
  return (
    <div>
      <Greeting isLoggedIn={isUserLoggedIn} />
    </div>
  );
}`,
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
          {
            title: 'useEffect Dependency Array',
            description:
              'The dependency array controls when useEffect runs. An empty array [] runs once on mount. With dependencies [count, name], it runs when those values change. No array means it runs after every render.',
            code: `import { useState, useEffect } from 'react';

function DependencyExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');

  // 1. No dependency array - runs after EVERY render
  useEffect(() => {
    console.log('Runs after every render');
  });

  // 2. Empty array [] - runs ONCE on mount
  useEffect(() => {
    console.log('Runs only once when component mounts');
  }, []);

  // 3. With dependencies - runs when 'count' changes
  useEffect(() => {
    console.log('Count changed to:', count);
    document.title = \`Count: \${count}\`;
  }, [count]); // Only re-run when count changes

  // 4. Multiple dependencies - runs when 'count' OR 'name' changes
  useEffect(() => {
    console.log(\`\${name} clicked \${count} times\`);
  }, [count, name]); // Re-run when either changes

  return (
    <div>
      <p>{name}: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setName(name === 'Alice' ? 'Bob' : 'Alice')}>
        Toggle Name
      </button>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'useEffect Cleanup Function',
            description:
              'The cleanup function runs before the component unmounts or before the effect runs again. Use it to cancel subscriptions, clear timers, or remove event listeners to prevent memory leaks.',
            code: `import { useState, useEffect } from 'react';

function CleanupExample() {
  const [count, setCount] = useState(0);

  // Example 1: Cleanup a timer
  useEffect(() => {
    const timerId = setInterval(() => {
      console.log('Timer tick');
    }, 1000);

    // Cleanup: Clear the timer when component unmounts
    return () => {
      clearInterval(timerId);
      console.log('Timer cleaned up');
    };
  }, []);

  // Example 2: Cleanup event listener
  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized');
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: Remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('Event listener removed');
    };
  }, []);

  // Example 3: Cleanup that runs before effect re-runs
  useEffect(() => {
    console.log('Effect running for count:', count);

    // This cleanup runs BEFORE the next effect
    return () => {
      console.log('Cleaning up previous effect for count:', count);
    };
  }, [count]); // Runs every time count changes

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Why cleanup matters:
// Without cleanup, you'd have memory leaks from:
// - Timers that keep running
// - Event listeners that pile up
// - Subscriptions that never close`,
            language: 'jsx',
          },
          {
            title: 'Props',
            description:
              'Props (short for "properties") are how you pass data from a parent component to a child component. Think of them like function arguments. They make components reusable by letting you customize them with different data.',
            code: `// Parent component passes data to child via props
function App() {
  return (
    <div>
      <Greeting name="Alice" age={25} />
      <Greeting name="Bob" age={30} />
    </div>
  );
}

// Child component receives props as an object
function Greeting(props) {
  return (
    <div>
      <p>Hello, {props.name}!</p>
      <p>You are {props.age} years old.</p>
    </div>
  );
}

// You can also destructure props directly
function Greeting({ name, age }) {
  return (
    <div>
      <p>Hello, {name}!</p>
      <p>You are {age} years old.</p>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Prop Drilling',
            description:
              'Prop drilling is when you pass props through multiple layers of components to reach a deeply nested child. It can make your code messy. Solutions include Context API, state management libraries (Zustand, Redux), or component composition.',
            code: `// Problem: Prop drilling through multiple levels
function App() {
  const user = { name: 'Alice', theme: 'dark' };
  return <Parent user={user} />;
}

function Parent({ user }) {
  // Parent doesn't use 'user', just passes it down
  return <Child user={user} />;
}

function Child({ user }) {
  // Child doesn't use 'user', just passes it down
  return <GrandChild user={user} />;
}

function GrandChild({ user }) {
  // Finally used here!
  return <p>Hello {user.name}, theme: {user.theme}</p>;
}

// Solution: Use Context API to avoid drilling
import { createContext, useContext } from 'react';

const UserContext = createContext();

function App() {
  const user = { name: 'Alice', theme: 'dark' };
  return (
    <UserContext.Provider value={user}>
      <Parent />
    </UserContext.Provider>
  );
}

function GrandChild() {
  // Access user directly without drilling
  const user = useContext(UserContext);
  return <p>Hello {user.name}, theme: {user.theme}</p>;
}`,
            language: 'jsx',
          },
          {
            title: 'Lists and Keys',
            description:
              'When rendering lists in React, each item needs a unique "key" prop. Keys help React identify which items have changed, been added, or removed, making updates more efficient.',
            code: `function TodoList() {
  const todos = [
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' },
    { id: 3, text: 'Get a job' }
  ];

  return (
    <ul>
      {todos.map((todo) => (
        // The 'key' should be a unique identifier
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// ❌ Don't use array index as key if list can change
// ✅ Use a unique ID from your data`,
            language: 'jsx',
          },
          {
            title: 'Fragments',
            description:
              'Fragments let you group multiple elements without adding extra nodes to the DOM. Use <></> shorthand or <React.Fragment> when you need to return multiple elements from a component.',
            code: `import React from 'react';

// ❌ Without Fragment - adds unnecessary <div> to DOM
function BadExample() {
  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph</p>
    </div>
  );
}

// ✅ With Fragment shorthand - no extra DOM node
function GoodExample() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph</p>
    </>
  );
}

// ✅ With React.Fragment - use when you need to add a key
function ListExample() {
  const items = [
    { id: 1, term: 'React', desc: 'A JavaScript library' },
    { id: 2, term: 'JSX', desc: 'JavaScript XML' }
  ];

  return (
    <dl>
      {items.map(item => (
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.desc}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Children Prop',
            description:
              'The children prop lets you pass content between component tags. It makes components flexible and reusable, like creating a custom Card or Button that can wrap any content.',
            code: `// Children prop allows you to wrap content
function Card({ children }) {
  return (
    <div style={{ border: '1px solid gray', padding: '20px' }}>
      {children}
    </div>
  );
}

// Use it like this:
function App() {
  return (
    <div>
      <Card>
        <h2>My Card Title</h2>
        <p>This is the card content!</p>
      </Card>

      <Card>
        <img src="photo.jpg" alt="Photo" />
        <button>Click me</button>
      </Card>
    </div>
  );
}

// You can also use children with other props
function Button({ children, color }) {
  return (
    <button style={{ backgroundColor: color }}>
      {children}
    </button>
  );
}

// Usage:
<Button color="blue">Click Me!</Button>`,
            language: 'jsx',
          },
          {
            title: 'Default Props & PropTypes',
            description:
              'Default props provide fallback values when props are not passed. PropTypes help catch bugs by validating prop types during development.',
            code: `import PropTypes from 'prop-types';

// Define a component with default props
function Greeting({ name, age, role }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
      <p>Role: {role}</p>
    </div>
  );
}

// Set default values for props
Greeting.defaultProps = {
  name: 'Guest',
  age: 18,
  role: 'User'
};

// Validate prop types (install: npm install prop-types)
Greeting.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  role: PropTypes.string.isRequired // This prop is required
};

// Modern way with default parameters
function ModernGreeting({ name = 'Guest', age = 18, role = 'User' }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
      <p>Role: {role}</p>
    </div>
  );
}

// Usage:
<Greeting /> // Uses all defaults
<Greeting name="Alice" age={25} /> // Overrides some defaults`,
            language: 'jsx',
          },
          {
            title: 'Ternary Operator in JSX',
            description:
              'The ternary operator (condition ? true : false) is perfect for inline conditional rendering in JSX. Use it when you need to choose between two different outputs.',
            code: `function UserStatus({ isLoggedIn, isPremium }) {
  return (
    <div>
      {/* Simple ternary */}
      <p>Status: {isLoggedIn ? 'Online' : 'Offline'}</p>

      {/* Ternary with components */}
      {isLoggedIn ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}

      {/* Nested ternary (use sparingly!) */}
      <p>
        {isLoggedIn 
          ? isPremium 
            ? 'Premium User' 
            : 'Free User'
          : 'Guest'
        }
      </p>

      {/* Ternary with styling */}
      <div style={{ color: isLoggedIn ? 'green' : 'red' }}>
        {isLoggedIn ? '✓ Connected' : '✗ Disconnected'}
      </div>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Logical && Operator',
            description:
              'The && operator is great for conditional rendering when you only want to show something if a condition is true. If the condition is false, nothing renders.',
            code: `function Notifications({ messages, isAdmin }) {
  return (
    <div>
      {/* Show element only if condition is true */}
      {messages.length > 0 && (
        <p>You have {messages.length} new messages</p>
      )}

      {/* Multiple conditions */}
      {isAdmin && messages.length > 0 && (
        <button>Delete All Messages</button>
      )}

      {/* Common pattern: check if array has items before mapping */}
      {messages.length > 0 && (
        <ul>
          {messages.map(msg => (
            <li key={msg.id}>{msg.text}</li>
          ))}
        </ul>
      )}

      {/* ⚠️ Be careful with numbers! 0 is falsy */}
      {/* ❌ Bad: If count is 0, it will render "0" */}
      {messages.length && <p>Messages: {messages.length}</p>}
      
      {/* ✅ Good: Explicitly check */}
      {messages.length > 0 && <p>Messages: {messages.length}</p>}
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Component Lifecycle Basics',
            description:
              'Components go through three phases: Mounting (appearing), Updating (changing), and Unmounting (disappearing). With hooks, useEffect handles all lifecycle events.',
            code: `import { useState, useEffect } from 'react';

function LifecycleDemo() {
  const [count, setCount] = useState(0);

  // 1. MOUNTING: Runs once when component appears
  useEffect(() => {
    console.log('Component mounted!');
    // Good for: API calls, subscriptions, timers
  }, []); // Empty array = mount only

  // 2. UPDATING: Runs when 'count' changes
  useEffect(() => {
    console.log('Count updated to:', count);
    // Good for: Reacting to state/prop changes
  }, [count]); // Runs when count changes

  // 3. UNMOUNTING: Cleanup runs when component disappears
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    // This cleanup runs on unmount
    return () => {
      clearInterval(timer);
      console.log('Component unmounted, timer cleared');
    };
  }, []);

  // 4. ALL RENDERS: Runs after every render
  useEffect(() => {
    console.log('Component rendered');
  }); // No dependency array

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Controlled vs Uncontrolled Components',
            description:
              'Controlled components have their value controlled by React state. Uncontrolled components store their own state internally. Controlled is preferred for most cases.',
            code: `import { useState, useRef } from 'react';

// ✅ CONTROLLED: React controls the input value
function ControlledForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', { name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name} // Value is controlled by state
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ❌ UNCONTROLLED: DOM controls the input value
function UncontrolledForm() {
  const nameRef = useRef();
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Access values directly from DOM
    console.log('Submitted:', {
      name: nameRef.current.value,
      email: emailRef.current.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} type="text" placeholder="Name" />
      <input ref={emailRef} type="email" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}

// Use controlled when you need:
// - Validation, formatting, or instant feedback
// - To disable submit button based on input
// - Multiple inputs that depend on each other`,
            language: 'jsx',
          },
          {
            title: 'Immutability in React',
            description:
              'Never mutate state directly! Always create new copies when updating arrays or objects. This ensures React detects changes and re-renders properly.',
            code: `import { useState } from 'react';

function ImmutabilityExample() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  const [todos, setTodos] = useState(['Learn React', 'Build app']);

  // ❌ WRONG: Mutating state directly
  const badUpdateObject = () => {
    user.age = 26; // Don't do this!
    setUser(user); // React won't detect the change
  };

  const badUpdateArray = () => {
    todos.push('New todo'); // Don't do this!
    setTodos(todos); // React won't detect the change
  };

  // ✅ CORRECT: Create new copies

  // Update object - use spread operator
  const goodUpdateObject = () => {
    setUser({ ...user, age: 26 }); // Creates new object
  };

  // Update nested object
  const updateNested = () => {
    setUser({
      ...user,
      address: { ...user.address, city: 'New York' }
    });
  };

  // Add to array
  const addTodo = () => {
    setTodos([...todos, 'New todo']); // Creates new array
  };

  // Remove from array
  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  // Update array item
  const updateTodo = (index, newText) => {
    setTodos(todos.map((todo, i) => 
      i === index ? newText : todo
    ));
  };

  return <div>Check the code for examples!</div>;
}`,
            language: 'jsx',
          },
          {
            title: 'Spread Operator',
            description:
              'The spread operator (...) is essential in React for creating copies of arrays and objects when updating state. It helps maintain immutability.',
            code: `import { useState } from 'react';

function SpreadOperatorExamples() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    hobbies: ['reading', 'coding']
  });

  // 1. Copy and update object properties
  const updateName = () => {
    setUser({ ...user, name: 'Bob' });
    // Equivalent to: { name: 'Bob', age: 25, hobbies: [...] }
  };

  // 2. Update multiple properties
  const updateMultiple = () => {
    setUser({ ...user, name: 'Charlie', age: 30 });
  };

  // 3. Add to array
  const addHobby = () => {
    setUser({ ...user, hobbies: [...user.hobbies, 'gaming'] });
  };

  // 4. Merge objects
  const address = { city: 'NYC', country: 'USA' };
  const updateWithAddress = () => {
    setUser({ ...user, ...address });
  };

  // 5. Copy array and add item
  const [numbers, setNumbers] = useState([1, 2, 3]);
  const addNumber = () => {
    setNumbers([...numbers, 4]); // [1, 2, 3, 4]
  };

  // 6. Combine arrays
  const moreNumbers = [5, 6, 7];
  const combineArrays = () => {
    setNumbers([...numbers, ...moreNumbers]); // [1,2,3,5,6,7]
  };

  // 7. Copy array and modify
  const doubleNumbers = () => {
    setNumbers([...numbers].map(n => n * 2));
  };

  return <div>Check the code for examples!</div>;
}`,
            language: 'jsx',
          },
          {
            title: 'Array Methods in React',
            description:
              'Master these array methods for rendering lists and updating state: .map() for rendering, .filter() for removing items, .find() for searching, and .reduce() for calculations.',
            code: `import { useState } from 'react';

function ArrayMethodsExample() {
  const [products] = useState([
    { id: 1, name: 'Laptop', price: 1000, inStock: true },
    { id: 2, name: 'Phone', price: 500, inStock: false },
    { id: 3, name: 'Tablet', price: 300, inStock: true }
  ]);

  // 1. .map() - Transform and render each item
  const productList = products.map(product => (
    <li key={product.id}>
      {product.name} - {product.price}
    </li>
  ));

  // 2. .filter() - Show only items that match condition
  const inStockProducts = products.filter(p => p.inStock);
  const affordableProducts = products.filter(p => p.price < 600);

  // 3. .find() - Get first item that matches
  const laptop = products.find(p => p.name === 'Laptop');
  const cheapest = products.find(p => p.price < 400);

  // 4. .reduce() - Calculate total
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  // 5. Chaining methods
  const totalInStockPrice = products
    .filter(p => p.inStock)
    .reduce((sum, p) => sum + p.price, 0);

  // 6. .some() - Check if any item matches
  const hasExpensive = products.some(p => p.price > 800);

  // 7. .every() - Check if all items match
  const allInStock = products.every(p => p.inStock);

  return (
    <div>
      <h2>All Products</h2>
      <ul>{productList}</ul>

      <h2>In Stock ({inStockProducts.length})</h2>
      <ul>
        {inStockProducts.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      <p>Total Price: {totalPrice}</p>
      <p>Has Expensive Item: {hasExpensive ? 'Yes' : 'No'}</p>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Import/Export Modules',
            description:
              'ES6 modules let you split your code into separate files. Use export to share components/functions and import to use them elsewhere.',
            code: `// ===== Button.jsx =====
// Named export
export function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// Another named export in same file
export function IconButton({ icon, onClick }) {
  return <button onClick={onClick}>{icon}</button>;
}

// Default export (one per file)
export default function PrimaryButton({ children }) {
  return <button className="primary">{children}</button>;
}

// ===== utils.js =====
// Export multiple utilities
export const formatDate = (date) => {
  return date.toLocaleDateString();
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ===== App.jsx =====
// Import default export
import PrimaryButton from './Button';

// Import named exports
import { Button, IconButton } from './Button';
import { formatDate, capitalize } from './utils';

// Import everything as an object
import * as utils from './utils';

// Import with alias
import { Button as CustomButton } from './Button';

function App() {
  return (
    <div>
      <PrimaryButton>Click Me</PrimaryButton>
      <Button>Regular Button</Button>
      <CustomButton>Aliased Button</CustomButton>
      <p>{utils.formatDate(new Date())}</p>
    </div>
  );
}

// Quick reference:
// export default Component  →  import Component from './file'
// export { Component }      →  import { Component } from './file'
// export const name = ...   →  import { name } from './file'`,
            language: 'jsx',
          },
            ]
          },
          {
            heading: 'Styling',
            snippets: [
              {
                title: 'Inline Styles',
                description:
                  'Apply styles directly to elements using the style prop with a JavaScript object. Property names are camelCase (backgroundColor instead of background-color).',
                code: `function InlineStylesExample() {
  // Define styles as an object
  const containerStyle = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '0 auto'
  };

  const headingStyle = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
  };

  // Dynamic styles based on state
  const [isActive, setIsActive] = useState(false);
  
  const buttonStyle = {
    backgroundColor: isActive ? 'green' : 'gray',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Inline Styles</h1>
      
      {/* Inline object directly */}
      <p style={{ color: 'blue', fontSize: '16px' }}>
        This text is styled inline
      </p>

      <button 
        style={buttonStyle}
        onClick={() => setIsActive(!isActive)}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
}

// Note: Use inline styles for dynamic styling
// For static styles, prefer CSS files or CSS Modules`,
                language: 'jsx',
              },
              {
                title: 'CSS Modules',
                description:
                  'CSS Modules scope your styles to a specific component, preventing naming conflicts. Create a .module.css file and import it as an object.',
                code: `// ===== Button.module.css =====
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary {
  background-color: #007bff;
  color: white;
}

.secondary {
  background-color: #6c757d;
  color: white;
}

.button:hover {
  opacity: 0.8;
}

// ===== Button.jsx =====
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  // Access styles as object properties
  return (
    <button className={styles.button + ' ' + styles[variant]}>
      {children}
    </button>
  );
}

// Better way with template literals
function BetterButton({ variant = 'primary', children }) {
  return (
    <button className={\`\${styles.button} \${styles[variant]}\`}>
      {children}
    </button>
  );
}

// With conditional classes
function ConditionalButton({ isPrimary, children }) {
  const className = isPrimary ? styles.primary : styles.secondary;
  
  return (
    <button className={\`\${styles.button} \${className}\`}>
      {children}
    </button>
  );
}

// Usage:
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// Benefits:
// ✅ Scoped styles (no conflicts)
// ✅ Works with Vite/CRA out of the box
// ✅ Better than inline styles for static CSS`,
                language: 'jsx',
              },
              {
                title: 'Tailwind CSS Integration',
                description:
                  'Tailwind CSS is a utility-first framework that lets you style components using pre-defined classes. Fast, flexible, and no CSS files needed!',
                code: `// Step 1: Install Tailwind (already covered in Practice section)
// npm install -D tailwindcss postcss autoprefixer
// npx tailwindcss init -p

// Step 2: Use Tailwind classes in your components
function TailwindExample() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Tailwind CSS
      </h1>
      
      <p className="text-gray-600 mb-6">
        Style with utility classes directly in JSX!
      </p>

      {/* Responsive design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded">Card 1</div>
        <div className="bg-white p-4 rounded">Card 2</div>
      </div>

      {/* Hover and focus states */}
      <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded 
                         hover:bg-blue-600 focus:outline-none focus:ring-2 
                         focus:ring-blue-400 transition-colors">
        Hover Me
      </button>

      {/* Conditional classes */}
      <div className={\`mt-4 p-4 rounded \${
        isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
      }\`}>
        Status: {isActive ? 'Active' : 'Inactive'}
      </div>

      <button 
        onClick={() => setIsActive(!isActive)}
        className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
      >
        Toggle
      </button>
    </div>
  );
}

// Common Tailwind patterns:
// Spacing: p-4 (padding), m-4 (margin), gap-4 (gap)
// Colors: bg-blue-500, text-white, border-gray-300
// Layout: flex, grid, grid-cols-3
// Responsive: sm:, md:, lg:, xl: prefixes`,
                language: 'jsx',
              },
            ]
          },
          {
            heading: 'Forms',
            snippets: [
              {
                title: 'Form Submission',
                description:
                  'Handle form submissions properly by preventing the default browser behavior and processing the data in React. Always use preventDefault() to avoid page reload.',
                code: `import { useState } from 'react';

function FormSubmission() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload!
    
    // Validate data
    if (!formData.username || !formData.email) {
      alert('Please fill in all fields');
      return;
    }

    // Process the data (API call, etc.)
    console.log('Form submitted:', formData);
    
    // Show success message
    setSubmitted(true);
    
    // Reset form
    setFormData({ username: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Submit</button>
      </form>

      {submitted && <p>Form submitted successfully!</p>}
    </div>
  );
}`,
                language: 'jsx',
              },
              {
                title: 'Multiple Input Handling',
                description:
                  'Manage multiple form inputs efficiently using a single state object and a reusable change handler. Use the input name attribute to update the correct field.',
                code: `import { useState } from 'react';

function MultipleInputForm() {
  // Single state object for all inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    country: 'USA',
    subscribe: false,
    gender: 'male'
  });

  // Single handler for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      // Use checkbox 'checked' property, otherwise use 'value'
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Text inputs */}
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />

      {/* Email input */}
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />

      {/* Number input */}
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Age"
      />

      {/* Select dropdown */}
      <select name="country" value={formData.country} onChange={handleChange}>
        <option value="USA">USA</option>
        <option value="Canada">Canada</option>
        <option value="UK">UK</option>
      </select>

      {/* Checkbox */}
      <label>
        <input
          type="checkbox"
          name="subscribe"
          checked={formData.subscribe}
          onChange={handleChange}
        />
        Subscribe to newsletter
      </label>

      {/* Radio buttons */}
      <label>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={formData.gender === 'male'}
          onChange={handleChange}
        />
        Male
      </label>
      <label>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={formData.gender === 'female'}
          onChange={handleChange}
        />
        Female
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}`,
                language: 'jsx',
              },
            ]
          },
          {
            heading: 'Practice',
            snippets: [
              {
                title: 'Create a React App with Vite',
                description:
                  'Vite is a modern, fast build tool for React. Follow these steps to create your first React app and get started with development.',
                code: `# Step 1: Create a new React project with Vite
npm create vite@latest my-react-app -- --template react

# Step 2: Navigate to your project folder
cd my-react-app

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev

# Your app will be running at http://localhost:5173
# Open it in your browser to see the default Vite + React page!

# Project structure:
# my-react-app/
# ├── src/
# │   ├── App.jsx       # Main component
# │   ├── main.jsx      # Entry point
# │   └── App.css       # Styles
# ├── index.html        # HTML template
# └── package.json      # Dependencies`,
                language: 'bash',
              },
              {
                title: 'Build a Todo List App',
                description:
                  'A classic beginner project! This todo list teaches you state management, event handling, conditional rendering, and working with lists. Follow along step by step.',
                code: `import { useState } from 'react';

function TodoApp() {
  // State to store the list of todos
  const [todos, setTodos] = useState([]);
  // State to store the current input value
  const [input, setInput] = useState('');

  // Add a new todo
  const addTodo = () => {
    if (input.trim() === '') return; // Don't add empty todos
    
    const newTodo = {
      id: Date.now(), // Simple unique ID
      text: input,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setInput(''); // Clear input after adding
  };

  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <h1>My Todo List</h1>
      
      {/* Input section */}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {/* Todo list */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Show message if no todos */}
      {todos.length === 0 && (
        <p>No todos yet. Add one above!</p>
      )}
    </div>
  );
}

export default TodoApp;`,
                language: 'jsx',
              },
              {
                title: 'Step 1: Integrate Tailwind CSS',
                description:
                  'Install and configure Tailwind CSS in your React project. Follow these steps to get Tailwind up and running.',
                code: `# 1. Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# 2. Initialize Tailwind configuration
npx tailwindcss init -p

# 3. Configure your tailwind.config.js file
# Add the paths to all of your template files:
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

# 4. Add Tailwind directives to your CSS
# In your src/index.css or src/App.css file:
@tailwind base;
@tailwind components;
@tailwind utilities;

# 5. Start your dev server
npm run dev

# You're ready to use Tailwind!`,
                language: 'bash',
              },
              {
                title: 'Step 2: Style Your Todo List with Tailwind',
                description:
                  'Now use Tailwind utility classes to style your todo list. No separate CSS file needed - just add classes directly to your JSX!',
                code: `function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        My Todo List
      </h1>
      
      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md 
                     focus:outline-none focus:border-blue-500 text-base"
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-green-500 text-white rounded-md 
                     hover:bg-green-600 transition-colors font-medium"
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      {todos.length === 0 ? (
        <p className="text-center text-gray-400 italic py-8">
          No todos yet. Add one above!
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-white rounded-md 
                         border border-gray-200 hover:shadow-md transition-shadow"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}\`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded 
                           hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
                language: 'jsx',
              },
            ]
          }
        ]
      },
      {
        name: 'Intermediate',
        snippets: [
          {
            title: 'useRef Hook',
            description:
              'useRef creates a mutable reference that persists across renders without causing re-renders when changed. Use it to access DOM elements directly or store values that should not trigger re-renders.',
            code: `import { useRef, useEffect } from 'react';

function TextInputWithFocusButton() {
  // Create a ref to hold the input element
  const inputRef = useRef(null);

  const handleClick = () => {
    // Access the DOM element and focus it
    inputRef.current.focus();
  };

  return (
    <div>
      {/* Attach the ref to the input */}
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Focus Input</button>
    </div>
  );
}

// useRef for storing values without re-rendering
function Counter() {
  const countRef = useRef(0);
  const [, forceRender] = useState();

  const increment = () => {
    countRef.current += 1;
    // This doesn't cause a re-render!
    console.log('Count:', countRef.current);
  };

  return <button onClick={increment}>Increment (check console)</button>;
}`,
            language: 'jsx',
          },
          {
            title: 'useCallback Hook',
            description:
              'useCallback returns a memoized version of a callback function that only changes if dependencies change. This prevents unnecessary re-renders of child components that receive the function as a prop.',
            code: `import { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // Without useCallback, this function is recreated on every render
  // With useCallback, it's only recreated when 'count' changes
  const handleClick = useCallback(() => {
    console.log('Count is:', count);
  }, [count]); // Only recreate if count changes

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setOtherState(otherState + 1)}>
        Other State
      </button>
      {/* Child won't re-render when otherState changes */}
      <Child onClick={handleClick} />
    </div>
  );
}

// Wrap in React.memo to prevent re-renders when props don't change
const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});`,
            language: 'jsx',
          },
          {
            title: 'useMemo Hook',
            description:
              'useMemo memoizes the result of an expensive calculation and only recalculates when dependencies change. This optimizes performance by avoiding unnecessary computations on every render.',
            code: `import { useState, useMemo } from 'react';

function ExpensiveComponent({ items }) {
  const [count, setCount] = useState(0);

  // This expensive calculation only runs when 'items' changes
  const total = useMemo(() => {
    console.log('Calculating total...');
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]); // Only recalculate when items array changes

  return (
    <div>
      <p>Total: {total}</p>
      <p>Count: {count}</p>
      {/* Clicking this won't recalculate total */}
      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Custom Hooks',
            description:
              'Custom hooks let you extract component logic into reusable functions. They must start with "use" and can call other hooks. This helps keep your components clean and logic shareable.',
            code: `import { useState, useEffect } from 'react';

// Custom hook for fetching data
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Use the custom hook in a component
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(
    \`https://api.example.com/users/\${userId}\`
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <div>User: {data.name}</div>;
}`,
            language: 'jsx',
          },
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
          },
          {
            title: 'React Developer Tools',
            description:
              'React DevTools is a browser extension that helps you inspect React components, view props and state, and debug performance issues. Essential for every React developer!',
            code: `// Installation:
// 1. Chrome: https://chrome.google.com/webstore (search "React Developer Tools")
// 2. Firefox: https://addons.mozilla.org/firefox/ (search "React Developer Tools")

// After installation, open your React app and press F12 (DevTools)
// You'll see two new tabs: "Components" and "Profiler"

// ===== Components Tab =====
// - View component tree hierarchy
// - Inspect props and state of any component
// - Edit props/state in real-time to test changes
// - See which component rendered and why
// - Find components by name using search

// Example: Debugging a component
function UserProfile({ name, age }) {
  const [count, setCount] = useState(0);
  
  // In DevTools Components tab, you can:
  // 1. Click on "UserProfile" in the tree
  // 2. See props: { name: "Alice", age: 25 }
  // 3. See hooks: State(0)
  // 4. Edit the count value directly to test
  
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// ===== Profiler Tab =====
// - Record and analyze component render performance
// - See which components re-render and how long they take
// - Identify performance bottlenecks
// - Useful for optimizing slow components

// Tips:
// - Use the "eye dropper" tool to select components on the page
// - Enable "Highlight updates" to see which components re-render
// - Use search to quickly find components in large apps
// - Right-click components to "Show in Elements" or "View source"`,
            language: 'javascript',
          },
          {
            title: 'Folder Structure',
            description:
              'Organize your React project with a clear folder structure. This makes your code easier to navigate, maintain, and scale as your app grows.',
            code: `// ===== Basic Structure (Small Projects) =====
my-react-app/
├── public/              # Static files
│   └── images/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Navbar.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── App.css          # Global styles
└── package.json

// ===== Intermediate Structure (Medium Projects) =====
src/
├── components/          # Reusable UI components
│   ├── common/          # Shared components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   └── layout/          # Layout components
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Sidebar.jsx
├── pages/               # Page components (routes)
│   ├── Home.jsx
│   ├── About.jsx
│   └── Dashboard.jsx
├── hooks/               # Custom hooks
│   ├── useFetch.js
│   └── useAuth.js
├── utils/               # Helper functions
│   ├── formatDate.js
│   └── validation.js
├── App.jsx
└── main.jsx

// ===== Advanced Structure (Large Projects) =====
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── features/        # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.jsx
│       │   └── SignupForm.jsx
│       └── dashboard/
│           ├── Stats.jsx
│           └── Chart.jsx
├── pages/
├── hooks/
├── context/             # Context providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── services/            # API calls
│   ├── api.js
│   └── authService.js
├── store/               # State management (Zustand/Redux)
│   └── userStore.js
├── styles/              # Global styles
│   ├── globals.css
│   └── variables.css
├── utils/
├── constants/           # Constants and config
│   └── config.js
├── types/               # TypeScript types
│   └── user.types.ts
├── App.jsx
└── main.jsx

// Best Practices:
// ✅ Group by feature, not by file type
// ✅ Keep components small and focused
// ✅ Use index.js for cleaner imports
// ✅ Separate business logic from UI
// ✅ Co-locate related files (component + styles + tests)`,
            language: 'javascript',
          },
          {
            title: 'Environment Variables',
            description:
              'Store sensitive data and configuration in environment variables. In Vite, prefix variables with VITE_ to make them accessible in your React app.',
            code: `// ===== .env file (in project root) =====
// Variables must start with VITE_ to be exposed to your app
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_api_key_here
VITE_APP_NAME=My Awesome App
VITE_ENABLE_ANALYTICS=true

// ⚠️ Never commit .env to git! Add it to .gitignore
// Create .env.example for team reference

// ===== .env.example =====
VITE_API_URL=
VITE_API_KEY=
VITE_APP_NAME=

// ===== Using environment variables in React =====
function App() {
  // Access with import.meta.env (Vite)
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  const appName = import.meta.env.VITE_APP_NAME;

  console.log('API URL:', apiUrl);
  console.log('App Name:', appName);

  return <h1>{appName}</h1>;
}

// ===== API Service Example =====
// services/api.js
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function fetchUsers() {
  const response = await fetch(\`\${API_URL}/users\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`
    }
  });
  return response.json();
}

// ===== Different environments =====
// .env.development  (used with: npm run dev)
VITE_API_URL=http://localhost:3000

// .env.production   (used with: npm run build)
VITE_API_URL=https://api.production.com

// ===== Check current mode =====
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const mode = import.meta.env.MODE; // 'development' or 'production'

if (isDevelopment) {
  console.log('Running in development mode');
}

// Important Notes:
// ✅ Only VITE_ prefixed variables are exposed
// ✅ Never store secrets in client-side env vars (they're visible!)
// ✅ Restart dev server after changing .env
// ✅ Use .env.local for local overrides (git ignored by default)`,
            language: 'javascript',
          }
        ]
      },
      {
        name: 'Advanced',
        snippets: [
          {
            title: 'useReducer Hook',
            description:
              'useReducer is an alternative to useState for managing complex state logic. It works like Redux: you dispatch actions to a reducer function that returns the new state. Great for state with multiple sub-values or complex transitions.',
            code: `import { useReducer } from 'react';

// Define the reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('Unknown action type');
  }
}

function Counter() {
  // Initialize with reducer function and initial state
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      {/* Dispatch actions to update state */}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'React.memo',
            description:
              'React.memo is a higher-order component that prevents a component from re-rendering if its props have not changed. This is a performance optimization for expensive components.',
            code: `import React from 'react';

// Without React.memo, this component re-renders every time parent renders
function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  // Imagine some expensive calculations here
  return <div>{data}</div>;
}

// With React.memo, it only re-renders when 'data' prop changes
const MemoizedComponent = React.memo(ExpensiveComponent);

// Custom comparison function (optional)
const MemoizedWithCustomCompare = React.memo(
  ExpensiveComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    // Return false if props are different (re-render)
    return prevProps.data === nextProps.data;
  }
);`,
            language: 'jsx',
          },
          {
            title: 'Error Boundaries',
            description:
              'Error Boundaries catch JavaScript errors in child components, log them, and display a fallback UI instead of crashing the whole app. They only work in class components (for now).',
            code: `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Usage: Wrap components that might throw errors
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}`,
            language: 'jsx',
          },
          {
            title: 'Portals',
            description:
              'Portals let you render children into a DOM node that exists outside the parent component hierarchy. Perfect for modals, tooltips, and dropdowns that need to break out of overflow:hidden containers.',
            code: `import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;

  // Render into a different part of the DOM tree
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // Target DOM node
  );
}

// In your HTML, add: <div id="modal-root"></div>

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      <Modal isOpen={showModal}>
        <h2>I'm in a portal!</h2>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  );
}`,
            language: 'jsx',
          },
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
            code: `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    subCategories: [
      {
        name: 'Visualizations',
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
            title: 'Linked List',
            description: "A Linked List is a linear data structure where elements are not stored at contiguous memory locations. Instead, each element (a 'node') contains a pointer to the next element in the sequence.",
            visualization: 'LinkedList',
            pros: [
              "Efficient insertion/deletion: Adding or removing nodes is fast (O(1)) if you have a reference to the node, as it only requires changing a few pointers.",
              "Dynamic size: Can grow and shrink easily without needing to reallocate the entire structure.",
            ],
            cons: [
              "Slow access: To find an element, you must traverse the list from the beginning (O(n)).",
              "Extra memory: Each node requires extra memory to store its pointer(s).",
            ],
            code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  // Add a node to the end
  append(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
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
          },
          {
            title: 'Binary Search Tree',
            description: "A Binary Search Tree (BST) is a node-based binary tree data structure which has the following properties: the left subtree of a node contains only nodes with keys lesser than the node's key; the right subtree of a node contains only nodes with keys greater than the node's key; the left and right subtree each must also be a binary search tree.",
            visualization: 'BinarySearchTree',
            pros: [
              "Fast search, insertion, and deletion on average: O(log n).",
              "Keeps elements in sorted order, allowing for efficient range queries.",
            ],
            cons: [
              "Can become unbalanced, degrading performance to O(n) in the worst case (essentially becoming a linked list).",
              "No O(1) access to elements.",
            ],
            code: `class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(data) {
    const newNode = new Node(data);
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    if (newNode.data < node.data) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }
}`
            ,
            language: 'javascript'
          }
        ]
      },
      {
        name: 'Algorithms',
        snippets: []
      },
      {
        name: 'Patterns',
        snippets: []
      }
    ]
  }
];
