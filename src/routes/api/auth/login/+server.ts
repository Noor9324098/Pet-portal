import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

interface User {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  budget?: number;
  inventory?: {
    food: number;
    toy: number;
    treat: number;
  };
}

interface SafeUser {
  name: string;
  email: string;
  isAdmin: boolean;
  budget: number;
  inventory: {
    food: number;
    toy: number;
    treat: number;
  };
}

const readUsers = async (): Promise<User[]> => {
  try {
    return JSON.parse(await fs.readFile(usersPath, 'utf-8'));
  } catch {
    return [];
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response('Missing fields.', { status: 400 });
  }

  const users = await readUsers();
  const idx = users.findIndex(u => u.email === email && u.password === password);

  if (idx === -1) {
    return new Response('Invalid email or password.', { status: 401 });
  }

  const user = users[idx];

  user.isAdmin = user.isAdmin ?? false;
  user.budget  = typeof user.budget === 'number' ? user.budget : 1000;
  user.inventory = user.inventory ?? { food: 0, toy: 0, treat: 0 };

  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

  const safeUser: SafeUser = {
    name:      user.name,
    email:     user.email,
    isAdmin:   user.isAdmin,
    budget:    user.budget,
    inventory: user.inventory
  };

  return new Response(JSON.stringify(safeUser), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
