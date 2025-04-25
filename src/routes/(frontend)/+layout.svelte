<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';

	$: user = $currentUser;

	function logout() {
		currentUser.set(null);
		goto('/login');
	}
</script>

<nav>
	<div class="nav-left">
		<a href="/" class="logo"> 😼PetPet😼</a>
	</div>

	<div class="nav-center">
		<a href="/">Home</a>
		{#if user}
			<a href="/dashboard">Dashboard</a>
			<a href="/logs">Logs</a>
			<a href="/shop">Shop</a>
			{#if user.name === 'Nooraddeen Al-Haddad'}
				<a href="/admin">Admin</a>
			{/if}
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</div>

	{#if user}
		<div class="nav-right">
			<span class="user">👋 {user.name}</span>
			<button on:click={logout}>Logout</button>
		</div>
	{/if}
</nav>

<main>
	<slot />
</main>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;
		padding: 1rem 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 10;
		flex-wrap: wrap;
	}

	.logo {
		font-weight: bold;
		font-size: 1.2rem;
		color: #0077cc;
		text-decoration: none;
	}

	.nav-center {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.nav-center a {
		color: #333;
		text-decoration: none;
		font-weight: 500;
	}

	.nav-center a:hover {
		color: #0077cc;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-left: auto;
	}

	.user {
		font-weight: 500;
		color: #444;
	}

	button {
		border: none;
		background: #f5f5f5;
		padding: 0.5rem 0.75rem;
		border-radius: 5px;
		cursor: pointer;
		transition: background 0.2s ease;
		font-weight: 500;
		color: #333;
	}

	button:hover {
		background-color: #e2e2e2;
	}

	main {
		padding: 2rem;
	}
</style>
