import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const petsPath = path.resolve('static/data/pets.json');

async function readJson<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export const GET: RequestHandler = async ({ url }) => {
  const type      = url.searchParams.get('type')?.toLowerCase();
  const adoptedBy = url.searchParams.get('adoptedBy');

  try {
    let pets = await readJson<any>(petsPath);

    if (type)      pets = pets.filter(p => p.type?.toLowerCase()    === type);
    if (adoptedBy) pets = pets.filter(p => p.adoptedBy === adoptedBy);

    return new Response(JSON.stringify(pets), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('GET /api/pets error:', e);
    return new Response('Failed to load pets', { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const { name, type, breed, age, description } = await request.json();

  if (
    typeof name  !== 'string' ||
    typeof type  !== 'string' ||
    typeof breed !== 'string' ||
    typeof age   !== 'number'
  ) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid fields.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const pets = await readJson<any>(petsPath);

    const newPet = {
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

    pets.push(newPet);
    await writeJson(petsPath, pets);

    return new Response(JSON.stringify(newPet), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('POST /api/pets error:', e);
    return new Response('Failed to save pet', { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { petId } = await request.json();
  if (!petId) {
    return new Response(
      JSON.stringify({ error: 'petId is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const pets = await readJson<any>(petsPath);
    const filtered = pets.filter(p => p.id !== petId);

    if (filtered.length === pets.length) {
      
      return new Response(null, { status: 404 });
    }

    await writeJson(petsPath, filtered);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/pets error:', e);
    return new Response('Failed to delete pet', { status: 500 });
  }
};
