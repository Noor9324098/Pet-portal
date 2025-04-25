import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const usersFile = path.resolve('static/data/users.json');
const petsFile  = path.resolve('static/data/pets.json');
const logsFile  = path.resolve('static/data/logs.json');

interface User {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  budget: number;
  inventory: {
    food: number;
    toy: number;
    treat: number;
  };
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  description: string;
  adoptedBy: string | null;
  hunger: number;
  happiness: number;
}

interface LogEntry {
  id: string;
  userName: string;
  action: 'adopt';
  petId: string;
  timestamp: string;
}

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userName, petId } = (await request.json()) as {
      userName?: string;
      petId?: string;
    };

    if (!userName || !petId) {
      return new Response(
        JSON.stringify({ error: 'Missing userName or petId.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const users = await readJson<User>(usersFile);
    const user = users.find(u => u.name === userName);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pets = await readJson<Pet>(petsFile);
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return new Response(
        JSON.stringify({ error: 'Pet not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (pet.adoptedBy && pet.adoptedBy !== userName) {
      return new Response(
        JSON.stringify({ error: 'Pet already adopted.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    pet.adoptedBy = userName;

    await writeJson(usersFile, users);
    await writeJson(petsFile, pets);

    const logs = await readJson<LogEntry>(logsFile);
    logs.push({
      id:        randomUUID(),
      userName,
      action:    'adopt',
      petId,
      timestamp: new Date().toISOString()
    });
    await writeJson(logsFile, logs);

    return new Response(
      JSON.stringify({
        message:   `${pet.name} has been adopted!`,
        newBudget: user.budget,
        inventory: user.inventory
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error in POST /api/adopt:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
