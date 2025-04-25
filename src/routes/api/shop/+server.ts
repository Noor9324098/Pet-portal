import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const usersPath = path.resolve('static/data/users.json');

const prices: Record<'food' | 'toy' | 'treat', number> = {
	food: 10,
	toy: 15,
	treat: 5
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { userName, item } = body;

		if (!userName || !item) {
			return new Response('Missing userName or item.', { status: 400 });
		}

		if (!(item in prices)) {
			return new Response('Invalid item type.', { status: 400 });
		}

		const price = prices[item as keyof typeof prices];

		const usersData = await fs.readFile(usersPath, 'utf-8');
		const users = JSON.parse(usersData);
		const user = users.find((u: any) => u.name === userName);

		if (!user) {
			return new Response('User not found.', { status: 404 });
		}

		user.budget ??= 1000;
		user.inventory ??= { food: 0, toy: 0, treat: 0 };

		if (user.budget < price) {
			return new Response(JSON.stringify({ error: 'Insufficient budget' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		user.budget -= price;
		user.inventory[item] += 1;

		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

		return new Response(
			JSON.stringify({
				message: `You bought 1 ${item}.`,
				newBudget: user.budget,
				inventory: user.inventory
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		console.error('Error processing shop request:', err);
		return new Response('Server error.', { status: 500 });
	}
};
