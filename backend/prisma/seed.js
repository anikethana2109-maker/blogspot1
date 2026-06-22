const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@blog.com',
      password: adminPassword,
      role: 'admin',
      bio: 'Blog administrator and content curator.'
    }
  });

  // Create sample users
  const userPassword = await bcrypt.hash('user123', 12);
  const jane = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      bio: 'Frontend developer and tech writer. Passionate about creating beautiful user interfaces.'
    }
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      bio: 'Full-stack developer and open source enthusiast. Love building things that matter.'
    }
  });

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with React in 2024',
        content: `React continues to be one of the most popular frontend libraries, and 2024 brings exciting new features and patterns that make building user interfaces more intuitive than ever.

## Why React?

React's component-based architecture allows you to build encapsulated components that manage their own state, then compose them to make complex UIs. With the introduction of Server Components and improved hooks, React is more powerful than ever.

## Setting Up Your First Project

The recommended way to start a new React project in 2024 is using Vite:

\`\`\`bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
\`\`\`

## Key Concepts

1. **Components** - The building blocks of any React application
2. **Props** - How data flows between components
3. **State** - Managing dynamic data within components
4. **Hooks** - Functions that let you "hook into" React features

## Best Practices

- Keep components small and focused
- Use TypeScript for better developer experience
- Implement proper error boundaries
- Use React.memo() for performance optimization

React's ecosystem continues to grow, making it an excellent choice for both beginners and experienced developers alike.`,
        excerpt: 'A comprehensive guide to starting your React journey in 2024 with modern best practices and tooling.',
        authorId: jane.id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Understanding the Node.js Event Loop',
        content: `The event loop is the heart of Node.js, enabling it to perform non-blocking I/O operations despite JavaScript being single-threaded.

## How It Works

The event loop continuously checks the call stack and the callback queue. When the call stack is empty, it takes the first event from the queue and pushes it to the call stack.

## Phases of the Event Loop

1. **Timers** - Executes callbacks scheduled by setTimeout() and setInterval()
2. **Pending Callbacks** - Executes I/O callbacks deferred to the next loop iteration
3. **Idle, Prepare** - Used internally by Node.js
4. **Poll** - Retrieves new I/O events and executes I/O related callbacks
5. **Check** - setImmediate() callbacks are invoked here
6. **Close Callbacks** - Close event callbacks (e.g., socket.on('close'))

## Common Pitfalls

- Blocking the event loop with synchronous operations
- Not handling errors in async callbacks
- Memory leaks from unresolved promises

Understanding the event loop is crucial for writing performant Node.js applications.`,
        excerpt: 'Deep dive into how the Node.js event loop works under the hood and why it matters.',
        authorId: john.id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Modern CSS Techniques You Should Know',
        content: `CSS has evolved dramatically from simple stylesheets to a powerful styling language with features that were previously only possible with JavaScript.

## Container Queries

Container queries allow you to style elements based on the size of their container rather than the viewport:

\`\`\`css
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
\`\`\`

## CSS Nesting

Native CSS nesting is now supported in modern browsers:

\`\`\`css
.card {
  background: white;

  & .title {
    font-size: 1.5rem;
  }

  &:hover {
    transform: translateY(-2px);
  }
}
\`\`\`

## The :has() Selector

Often called the "parent selector," :has() allows you to select elements based on their descendants:

\`\`\`css
.card:has(img) {
  grid-template-rows: auto 1fr;
}
\`\`\`

## Scroll-Driven Animations

Create animations tied to scroll position without JavaScript:

\`\`\`css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element {
  animation: fade-in linear;
  animation-timeline: view();
}
\`\`\`

These techniques represent the future of CSS and can significantly reduce your reliance on JavaScript for styling.`,
        excerpt: 'Explore the latest CSS features including container queries, nesting, :has() selector, and scroll-driven animations.',
        authorId: jane.id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Building REST APIs with Express.js',
        content: `Express.js remains one of the most popular frameworks for building REST APIs in Node.js. Its minimalist approach gives you the flexibility to structure your application however you want.

## Project Structure

A well-organized Express project typically follows this structure:

\`\`\`
src/
├── routes/      # Route definitions
├── middleware/   # Custom middleware
├── utils/        # Utility functions
└── index.js      # Entry point
\`\`\`

## Creating Your First Route

\`\`\`javascript
const express = require('express');
const router = express.Router();

router.get('/api/posts', async (req, res) => {
  const posts = await Post.findAll();
  res.json(posts);
});
\`\`\`

## Middleware Best Practices

1. **Authentication** - Verify JWT tokens before protected routes
2. **Validation** - Validate request body using express-validator
3. **Error Handling** - Centralized error handling middleware
4. **CORS** - Configure cross-origin resource sharing

## Security Considerations

- Always validate and sanitize user input
- Use helmet.js for HTTP header security
- Implement rate limiting
- Store sensitive data in environment variables

Express.js combined with a good ORM like Prisma makes building robust APIs a breeze.`,
        excerpt: 'A practical guide to building robust and secure REST APIs with Express.js and best practices.',
        authorId: admin.id
      }
    }),
    prisma.post.create({
      data: {
        title: 'The Complete Guide to Git Branching Strategies',
        content: `Choosing the right Git branching strategy is crucial for team productivity and code quality. Let's explore the most popular strategies.

## Git Flow

Git Flow uses multiple long-lived branches:
- **main** - Production-ready code
- **develop** - Integration branch for features
- **feature/** - New features
- **release/** - Release preparation
- **hotfix/** - Emergency fixes

## GitHub Flow

A simpler alternative:
1. Create a branch from main
2. Make changes and commit
3. Open a pull request
4. Review and discuss
5. Merge to main and deploy

## Trunk-Based Development

The simplest strategy:
- Everyone commits to the main branch
- Use feature flags for incomplete features
- Deploy frequently

## Which One to Choose?

- **Small teams**: GitHub Flow
- **Large teams with releases**: Git Flow
- **Continuous deployment**: Trunk-Based Development

The best strategy depends on your team size, release cadence, and deployment pipeline.`,
        excerpt: 'Compare Git Flow, GitHub Flow, and Trunk-Based Development to find the right strategy for your team.',
        authorId: john.id
      }
    })
  ]);

  // Create sample comments
  await Promise.all([
    prisma.comment.create({
      data: { content: 'Great article! This really helped me understand React hooks better. Looking forward to more content like this.', authorId: john.id, postId: posts[0].id }
    }),
    prisma.comment.create({
      data: { content: 'Thanks for explaining the event loop so clearly! I finally understand why my async code was behaving unexpectedly.', authorId: jane.id, postId: posts[1].id }
    }),
    prisma.comment.create({
      data: { content: 'I had no idea CSS had come so far. Container queries are a game changer!', authorId: admin.id, postId: posts[2].id }
    }),
    prisma.comment.create({
      data: { content: 'Perfect timing — I was just about to set up Express for a new project. This guide is exactly what I needed.', authorId: john.id, postId: posts[3].id }
    }),
    prisma.comment.create({
      data: { content: 'We switched to trunk-based development last year and it has been fantastic for our CI/CD pipeline.', authorId: jane.id, postId: posts[4].id }
    }),
    prisma.comment.create({
      data: { content: 'Really well written. Could you do a follow-up on React Server Components?', authorId: admin.id, postId: posts[0].id }
    }),
    prisma.comment.create({
      data: { content: 'The CSS nesting example is so clean. Native nesting removes the need for preprocessors for most projects.', authorId: john.id, postId: posts[2].id }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Admin:  admin@blog.com / admin123');
  console.log('   User 1: jane@example.com / user123');
  console.log('   User 2: john@example.com / user123');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
