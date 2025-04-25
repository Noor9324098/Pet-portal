<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { SafeUser } from '$lib/types';

	let user: SafeUser | null = null;
	$: user = $currentUser;

	const prices: Record<'food' | 'toy' | 'treat', number> = {
		food: 10,
		toy: 15,
		treat: 5
	};

	let successMessage = '';
	let showToast = false;

	async function buy(item: 'food' | 'toy' | 'treat') {
		if (!user) {
			goto('/login');
			return;
		}

		const res = await fetch('/api/actions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userName: user.name,
				action: 'buy',
				item
			})
		});

		if (res.ok) {
			const result = await res.json();

			// ✅ Show success toast
			successMessage = result.message;
			showToast = true;
			setTimeout(() => (showToast = false), 2500);

			// ✅ Update user store
			currentUser.update((u) => {
				if (!u) return u;
				return {
					...u,
					budget: result.newBudget,
					inventory: result.inventory
				};
			});
		} else {
			const err = await res.json();
			alert(err.error || 'Something went wrong.');
		}
	}
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
</svelte:head>

<div class="shop-container">
	<h1 class="shop-title">🛍️ Pet Shop</h1>

	{#if user}
		<div class="shop-info">
			<p><strong>💰 Budget:</strong> ${user.budget}</p>

			<h2>🎒 Inventory:</h2>
			<ul>
				<li>🍖 Food: {user.inventory?.food ?? 0}</li>
				<li>🧸 Toy: {user.inventory?.toy ?? 0}</li>
				<li>🍬 Treat: {user.inventory?.treat ?? 0}</li>
			</ul>

			<h2>🧾 Buy Items</h2>
			<div class="buy-buttons">
				<button on:click={() => buy('food')}>Buy Food (${prices.food})</button>
				<button on:click={() => buy('toy')}>Buy Toy (${prices.toy})</button>
				<button on:click={() => buy('treat')}>Buy Treat (${prices.treat})</button>
			</div>
		</div>
	{:else}
		<p>Please log in to use the shop.</p>
	{/if}

	{#if showToast}
		<div class="toast" transition:fade>
			🎉 {successMessage}
		</div>
	{/if}
</div>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
		background: #fef6e4;
		color: #333;
	}

	.shop-container {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem;
		position: relative;
	}

	.shop-title {
		text-align: center;
		font-size: 2.5rem;
		color: #2a9d8f;
		margin-bottom: 2rem;
	}

	.shop-info p {
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	h2 {
		margin-top: 1.5rem;
		font-size: 1.4rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin-bottom: 1rem;
	}

	ul li {
		margin: 0.5rem 0;
	}

	.buy-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	button:hover {
		background-color: #005fcc;
	}

	.toast {
		position: fixed;
		top: 20px;
		right: 20px;
		background-color: #2ecc71;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		font-weight: 600;
		font-size: 1rem;
		z-index: 999;
	}
</style>
