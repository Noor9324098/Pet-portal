<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { Pet, SafeUser } from '$lib/types';
	import { fade } from 'svelte/transition';

	let allPets: Pet[] = [];
	let puppies: Pet[] = [];
	let kittens: Pet[] = [];
	let user: SafeUser | null = null;
	let loading = false;

	let adoptionMessage = '';
	let showToast = false;

	$: user = $currentUser;

	async function loadPets() {
		loading = true;
		try {
			const res = await fetch('/api/pets');
			const data = (await res.json()) as Pet[];
			const available = data.filter((p: Pet) => !p.adoptedBy);
			puppies = available.filter(p => p.type.toLowerCase() === 'puppy');
			kittens = available.filter(p => p.type.toLowerCase() === 'kitten');
			allPets = available;
		} catch {
			allPets = [];
			puppies = [];
			kittens = [];
		}
		loading = false;
	}

	async function adopt(petId: string) {
		if (!user?.name) {
			goto('/login');
			return;
		}

		const res = await fetch('/api/adopt', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ petId, userName: user.name })
		});

		if (res.ok) {
			const { message } = await res.json();
			adoptionMessage = message;
			showToast = true;
			await loadPets();
			setTimeout(() => (showToast = false), 3000);
		} else {
			const err = await res.text();
			alert(`Error: ${err}`);
		}
	}

	async function deletePet(petId: string) {
		if (!user?.isAdmin) return;
		if (!confirm('Are you sure you want to delete this pet?')) return;

		const res = await fetch('/api/pets', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ petId })
		});

		if (res.status === 204) {
			adoptionMessage = 'Pet deleted.';
			showToast = true;
			await loadPets();
			setTimeout(() => (showToast = false), 3000);
		} else {
			alert('Failed to delete pet.');
		}
	}

	onMount(() => {
		const unsub = currentUser.subscribe(v => (user = v));
		loadPets();
		return unsub;
	});
</script>


{#if loading}
	<p class="loading">Loading pets…</p>
{:else if allPets.length === 0}
	<p class="empty">No pets available right now.</p>
{:else}
	{#if puppies.length > 0}
		<h2 class="section-title">🐶 Puppies</h2>
		<div class="pets-grid">
			{#each puppies as pet (pet.id)}
				<div class="pet-card">
					<h2>{pet.name}</h2>
					<p><strong>Breed:</strong> {pet.breed}</p>
					<p><strong>Age:</strong> {pet.age} years</p>
					<p><strong>Hunger:</strong> {pet.hunger}</p>
					<p><strong>Happiness:</strong> {pet.happiness}</p>
					<p class="desc">{pet.description}</p>
					<button on:click={() => adopt(pet.id)}>Adopt</button>
					{#if user?.isAdmin}
						<button class="delete-btn" on:click={() => deletePet(pet.id)}>Delete</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if kittens.length > 0}
		<h2 class="section-title">🐱 Kittens</h2>
		<div class="pets-grid">
			{#each kittens as pet (pet.id)}
				<div class="pet-card">
					<h2>{pet.name}</h2>
					<p><strong>Breed:</strong> {pet.breed}</p>
					<p><strong>Age:</strong> {pet.age} years</p>
					<p><strong>Hunger:</strong> {pet.hunger}</p>
					<p><strong>Happiness:</strong> {pet.happiness}</p>
					<p class="desc">{pet.description}</p>
					<button on:click={() => adopt(pet.id)}>Adopt</button>
					{#if user?.isAdmin}
						<button class="delete-btn" on:click={() => deletePet(pet.id)}>Delete</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
{/if}


{#if showToast}
	<div class="toast" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
		🐾 {adoptionMessage}
	</div>
{/if}

<style>
	.loading,
	.empty {
		text-align: center;
		color: #555;
		margin-top: 2rem;
	}

	.pets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
		padding: 2rem;
	}

	.pet-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		text-align: center;
	}

	.pet-card h2 {
		color: #2a9d8f;
		margin-bottom: 0.5rem;
	}

	.pet-card p {
		margin: 0.3rem 0;
	}

	.pet-card .desc {
		font-style: italic;
		color: #555;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
	}

	button {
		padding: 0.6rem 1.2rem;
		background-color: #2a9d8f;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background-color: #21867a;
	}

	.toast {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		background: #2c3e50;
		color: #fff;
		padding: 0.8rem 1.2rem;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		
	}

	.delete-btn {
	margin-top: 0.5rem;
	background-color: #e63946;
	color: white;
	border: none;
	padding: 0.6rem 1.2rem;
	border-radius: 6px;
	font-weight: bold;
	cursor: pointer;
	transition: background 0.2s;
}

.delete-btn:hover {
	background-color: #c7323c;
}

</style>
