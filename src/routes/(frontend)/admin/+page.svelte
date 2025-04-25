<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { SafeUser } from '$lib/types';
  

	let name = '';
	let type = '';
	let breed = '';
	let age = '';
	let description = '';
  
	let user: SafeUser | null = null;
	let error = '';
	let success = '';
  

	onMount(() => {
	  const unsubscribe = currentUser.subscribe(u => {
		user = u;
		if (!user) {
		  goto('/dashboard');
		} else if (!user.isAdmin) {
		  goto('/admin');
		}
	  });
	  return unsubscribe;
	});
  
	async function addPet() {
	  error = success = ''; // reset
	  if (!name || !type || !breed || !age || !description) {
		error = 'All fields are required.';
		return;
	  }
  
	  const res = await fetch('/api/pets', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
		  name,
		  type,
		  breed,
		  age: Number(age),
		  description
		})
	  });
  
	  if (res.ok) {
		success = '🎉 Pet added successfully!';
		name = type = breed = age = description = '';
	  } else {
		error = await res.text();
	  }
	}
  </script>
  
  <svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
  </svelte:head>
  
  <div class="admin-container">
	<h1>Add a New Pet</h1>
  
	{#if error}
	  <p class="error">{error}</p>
	{/if}
	{#if success}
	  <p class="success">{success}</p>
	{/if}
  
	<form on:submit|preventDefault={addPet}>
	  <label>
		Name
		<input type="text" bind:value={name} placeholder="Fluffy" />
	  </label>
  
	  <label>
		Type
		<select bind:value={type}>
		  <option value="" disabled selected>Select type</option>
		  <option value="puppy">Puppy</option>
		  <option value="kitten">Kitten</option>
		</select>
	  </label>
  
	  <label>
		Breed
		<input type="text" bind:value={breed} placeholder="Golden Retriever" />
	  </label>
  
	  <label>
		Age (years)
		<input type="number" min="0" bind:value={age} placeholder="1" />
	  </label>
  
	  <label>
		Description
		<textarea rows="3" bind:value={description} placeholder="A playful little pup..."></textarea>
	  </label>
  
	  <button type="submit">➕ Add Pet</button>
	</form>
  </div>
  
  <style>
	:global(body, html) {
	  margin: 0;
	  padding: 0;
	  font-family: 'Poppins', sans-serif;
	}
  
	.admin-container {
	  max-width: 500px;
	  margin: 4rem auto;
	  padding: 2rem;
	  background: #fff;
	  border-radius: 12px;
	  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
	}
  
	h1 {
	  text-align: center;
	  margin-bottom: 1.5rem;
	  color: #2c3e50;
	}
  
	form {
	  display: grid;
	  gap: 1rem;
	}
  
	label {
	  display: flex;
	  flex-direction: column;
	  font-weight: 600;
	  color: #444;
	}
  
	input, select, textarea {
	  margin-top: 0.25rem;
	  padding: 0.5rem;
	  border: 1px solid #ccc;
	  border-radius: 6px;
	  font-size: 1rem;
	  transition: border-color 0.2s;
	}
	input:focus, select:focus, textarea:focus {
	  border-color: #2c3e50;
	  outline: none;
	}
  
	button {
	  margin-top: 1rem;
	  padding: 0.75rem;
	  font-size: 1rem;
	  background: #2c3e50;
	  color: #fff;
	  border: none;
	  border-radius: 6px;
	  cursor: pointer;
	  transition: background 0.2s;
	}
	button:hover {
	  background: #1a242f;
	}
  
	.error {
	  color: #c0392b;
	  text-align: center;
	  margin-bottom: 0.5rem;
	}
	.success {
	  color: #27ae60;
	  text-align: center;
	  margin-bottom: 0.5rem;
	}
  </style>
  