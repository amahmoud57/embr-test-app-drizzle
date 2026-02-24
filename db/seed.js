const { db, pool } = require('../db');
const { users, todos, posts } = require('../drizzle/schema');

async function seed() {
  console.log('Seeding database...');

  // Insert users
  const [alice, bob] = await db.insert(users).values([
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
  ]).onConflictDoNothing().returning();

  console.log(`Inserted ${alice ? 2 : 0} users`);

  // Insert todos
  await db.insert(todos).values([
    { title: 'Learn Drizzle ORM', completed: true },
    { title: 'Build a REST API', completed: true },
    { title: 'Deploy to Embr', completed: true },
    { title: 'Write documentation', completed: false },
    { title: 'Add more features', completed: false },
  ]).onConflictDoNothing();

  console.log('Inserted todos');

  // Insert posts (need user IDs)
  const allUsers = await db.select().from(users);
  const aliceUser = allUsers.find(u => u.email === 'alice@example.com');
  const bobUser = allUsers.find(u => u.email === 'bob@example.com');

  if (aliceUser && bobUser) {
    await db.insert(posts).values([
      { title: 'Getting Started with Drizzle', content: 'Drizzle ORM is a lightweight TypeScript ORM...', published: true, authorId: aliceUser.id },
      { title: 'Best Practices for Node.js', content: 'Here are some tips for building Node.js applications...', published: true, authorId: bobUser.id },
      { title: 'Draft: Advanced Topics', content: 'Coming soon: advanced database optimization techniques...', published: false, authorId: aliceUser.id },
    ]).onConflictDoNothing();

    console.log('Inserted posts');
  }

  await pool.end();
  console.log('Seed complete!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
