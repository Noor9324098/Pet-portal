import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

const usersPath = path.resolve('static/data/users.json');
const petsPath = path.resolve('static/data/pets.json');
const logPath = path.resolve('static/data/log.json');

const prices: Record<'food' | 'toy' | 'treat', number> = {
  food: 10,
  toy: 15,
  treat: 5
};

type ShopItem = keyof typeof prices;

export const POST: RequestHandler = async ({ request }) => {
  const { userName, petId, action, item } = await request.json() as {
    userName?: string;
    petId?: string;
    action?: string;
    item?: string;
  };

  if (!userName || !action) return jsonError('Missing fields.', 400);

  const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
  const user = users.find((u: any) => u.name === userName);
  if (!user) return jsonError('User not found.', 404);

  user.budget ??= 1000;
  user.inventory ??= { food: 0, toy: 0, treat: 0 };

  const pets = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
  const pet = petId ? pets.find((p: any) => p.id === petId) : null;

  let message = '';
  let logMessage = '';

  if (action === 'buy') {
    const typedItem = item as ShopItem;

    if (!typedItem || !(typedItem in prices)) {
      return jsonError('Invalid item.', 400);
    }

    const cost = prices[typedItem];
    if (user.budget < cost) return jsonError('Insufficient budget.', 403);

    user.budget -= cost;
    user.inventory[typedItem] += 1;
    message = `You bought 1 ${typedItem}.`;
    logMessage = `${user.name} bought 1 ${typedItem} (−$${cost})`;

  } else {
    if (!petId || !pet) return jsonError('Pet not found.', 404);

    switch (action) {
      case 'feed':
        if (user.inventory.food <= 0) return jsonError('No food.', 403);
        user.inventory.food -= 1;
        pet.hunger = Math.max(0, pet.hunger - 3);
        pet.happiness += 1;
        message = `${pet.name} has been fed.`;
        logMessage = `${user.name} fed ${pet.name}`;
        break;

      case 'toy':
        if (user.inventory.toy <= 0) return jsonError('No toys.', 403);
        user.inventory.toy -= 1;
        pet.happiness += 2;
        message = `${pet.name} played happily.`;
        logMessage = `${user.name} played with ${pet.name}`;
        break;

      case 'return':
        if (pet.adoptedBy !== userName) return jsonError('You didn’t adopt this pet.', 403);
        const fee = 20;
        if (user.budget < fee) return jsonError('Not enough money to return.', 403);
        user.budget -= fee;
        pet.adoptedBy = null;
        message = `${pet.name} was returned.`;
        logMessage = `${user.name} returned ${pet.name} (−$${fee})`;
        break;

      case 'adopt':
        if (pet.adoptedBy && pet.adoptedBy !== userName)
          return jsonError('Already adopted.', 403);
        pet.adoptedBy = userName;
        message = `${pet.name} has been adopted!`;
        // ✅ Do NOT log this
        break;

      default:
        return jsonError('Unknown action.', 400);

      case 'treat':
        if (user.inventory.treat <= 0) return jsonError('No treats.', 403);
        user.inventory.treat -= 1;
        pet.hunger = Math.max(0, pet.hunger - 1);    // Slight hunger boost
        pet.happiness += 3;                          // Big happiness boost!
        message = `${pet.name} was treated with love.`;
        logMessage = `${user.name} gave ${pet.name} a treat`;
        break;

    }
  }

  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
  await fs.writeFile(petsPath, JSON.stringify(pets, null, 2));

  if (logMessage) {
    const logs = JSON.parse(await fs.readFile(logPath, 'utf-8').catch(() => '[]'));
    logs.push({
      id: randomUUID(),
      message: logMessage,
      timestamp: new Date().toISOString()
    });
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
  }

  return new Response(
    JSON.stringify({
      message,
      newBudget: user.budget,
      inventory: user.inventory
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

function jsonError(error: string, status = 400) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
