<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { Pet, SafeUser } from '$lib/types';

	let user: SafeUser | null = null;
	let pets: Pet[] = [];
	let error = '';
	let success = '';
	let initialized = false;

	$: user = $currentUser;

	async function loadPets() {
		try {
			const res = await fetch(`/api/pets?adoptedBy=${user?.name}`);
			if (!res.ok) throw new Error('Failed to load pets');
			pets = await res.json();
		} catch (e) {
			error = 'Failed to load your pets.';
		}
	}

	async function handleAction(petId: string, action: 'feed' | 'toy' | 'return'| 'treat') {
		if (!user || !user.name) {
			error = 'You must be logged in to perform this action.';
			goto('/login');
			return;
		}

		try {
	const res = await fetch('/api/actions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ petId, action, userName: user.name })
	});

	const result = await res.json();

	if (!res.ok) {
		error = result.error || 'Something went wrong.';
		return;
	}

	currentUser.update((u) => {
		if (!u) return u;
		return {
			...u,
			budget: result.newBudget,
			inventory: result.inventory
		};
	});

	success = result.message;
	error = '';
	await loadPets();

} catch (e) {
	error = 'Something went wrong.';
}

	}

	onMount(() => {
		const unsubscribe = currentUser.subscribe((u) => {
			user = u;

			if (!initialized) {
				initialized = true;

				setTimeout(() => {
					if (!user || !user.name) {
						goto('/login');
					} else {
						loadPets();
					}
				}, 50);
			}
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
</svelte:head>

<div class="container">
	<h1 class="title">🐾 Your Dashboard</h1>

	{#if user}
		<h2>💰 Budget: ${user.budget}</h2>
		<h3>🎒 Inventory:</h3>
		<ul>
			<li>🍖 Food: {user.inventory?.food ?? 0}</li>
			<li>🧸 Toy: {user.inventory?.toy ?? 0}</li>
			<li>🍬 Treat: {user.inventory?.treat ?? 0}</li>
		</ul>
	{/if}

	{#if error}
		<p class="error">{error}</p>
	{/if}
	{#if success}
		<p class="success">{success}</p>
	{/if}

	{#if pets.length > 0}
		<ul class="pets">
			{#each pets as pet}
				<li class="pet-card">
					<h2>{pet.name}</h2>
					<p>{pet.description}</p>
					<p><strong>Hunger:</strong> {pet.hunger}</p>
					<p><strong>Happiness:</strong> {pet.happiness}</p>
					<div class="actions">
						<button on:click={() => handleAction(pet.id, 'feed')}>🍖 Feed</button>
						<button on:click={() => handleAction(pet.id, 'toy')}>🧸 Play</button>
						<button on:click={() => handleAction(pet.id, 'treat')}>🍬 Treat</button>
						<button
							on:click={() => {
								if (confirm('Returning this pet will cost $20. Are you sure?')) {
									handleAction(pet.id, 'return');
								}
							}}
						>
							🚪 Return
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No adopted pets yet. Go to the home page to adopt!</p>
	{/if}
</div>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
		background: #fef6e4;
		color: #333;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.title {
		text-align: center;
		font-size: 2.5rem;
		color: #2a9d8f;
		margin-bottom: 2rem;
	}

	h2, h3 {
		margin-top: 1rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	.pets {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.pet-card {
		background: #fff;
		padding: 1rem 1.5rem;
		border-radius: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.pet-card h2 {
		color: #e76f51;
		margin-bottom: 0.5rem;
	}

	.actions {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	button {
		padding: 0.4rem 0.8rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		background: #007bff;
		color: white;
		font-weight: 600;
		transition: background-color 0.2s ease;
	}

	button:hover {
		background: #005fcc;
	}

	.success {
		color: green;
		margin: 1rem 0;
	}

	.error {
		color: red;
		margin: 1rem 0;
	}
</style>
