import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Pet } from '$lib/types'; // adjust path as needed

function resolveStaticPath(filename: string) {
  return path.resolve('static/data', filename);
}

const petsFile = resolveStaticPath('pets.json');

async function readPets(): Promise<Pet[]> {
  try {
    return JSON.parse(await fs.readFile(petsFile, 'utf-8'));
  } catch {
    return [];
  }
}

async function writePets(pets: Pet[]): Promise<void> {
  await fs.writeFile(petsFile, JSON.stringify(pets, null, 2), 'utf-8');
}

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type')?.toLowerCase();
  const adoptedBy = url.searchParams.get('adoptedBy');

  let pets = await readPets();
  if (type) pets = pets.filter((p: Pet) => p.type?.toLowerCase() === type);
  if (adoptedBy) pets = pets.filter((p: Pet) => p.adoptedBy === adoptedBy);

  return new Response(JSON.stringify(pets), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const { name, type, breed, age, description } = await request.json();

  if (
    typeof name !== 'string' ||
    typeof type !== 'string' ||
    typeof breed !== 'string' ||
    typeof age !== 'number'
  ) {
    return new Response(JSON.stringify({ error: 'Missing or invalid fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newPet: Pet = {
    id: randomUUID(),
    name,
    type,
    breed,
    age,
    description: description ?? '',
    hunger: 5,
    happiness: 5,
    adoptedBy: null
  };

  const pets = await readPets();
  pets.push(newPet);
  await writePets(pets);

  return new Response(JSON.stringify(newPet), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { petId } = await request.json();

  if (!petId) {
    return new Response(JSON.stringify({ error: 'petId is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let pets = await readPets();
  const before = pets.length;
  pets = pets.filter(p => p.id !== petId);

  if (pets.length === before) {
    return new Response(JSON.stringify({ error: 'Pet not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  await writePets(pets);
  return new Response(null, { status: 204 });
};
