import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

interface User {
  name: string;
  email: string;
  password: string;
}

const readUsers = async (): Promise<User[]> => {
  try {
    return JSON.parse(await fs.readFile(usersPath, 'utf-8'));
  } catch {
    return [];
  }
};

const writeUsers = async (users: User[]): Promise<void> => {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');
};

export const POST: RequestHandler = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { name, email, password } = body;
  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({ error: 'Name, email & password are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const users = await readUsers();

  if (users.find(u => u.email === email)) {
    return new Response(
      JSON.stringify({ error: 'That email is already taken.' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  users.push({ name, email, password });
  await writeUsers(users);

  return new Response(
    JSON.stringify({ message: 'Registration successful!' }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
