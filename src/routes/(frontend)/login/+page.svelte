<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
  
	let email = '';
	let password = '';
	let loginState: 'idle' | 'error' | 'success' = 'idle';
  
	async function handleLogin() {
	  loginState = 'idle';
  
	  const res = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	  });
  
	  if (!res.ok) {
		
		loginState = 'error';
		
		setTimeout(() => (loginState = 'idle'), 600);
		return;
	  }
  

	  loginState = 'success';
  
	  const user = await res.json();
	  currentUser.set(user);
  
	  
	  await tick();
  
	
	  setTimeout(() => {
		if (user.isAdmin) goto('/admin');
		else goto('/dashboard');
	  }, 800);
	}
  </script>
  
  <svelte:head>
	<link
	  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
	  rel="stylesheet"
	/>
  </svelte:head>
  
  <div class="split-screen">
	<div class="illustration-pane">
	  <img src="/src/data/login.png" alt="Welcome illustration" />
	</div>
	<div class="form-pane">
	  <div class="login-box {loginState}">
		<h2>Welcome Back</h2>
  
		<form on:submit|preventDefault={handleLogin}>
		  <label for="email">Email</label>
		  <input
			type="email"
			id="email"
			bind:value={email}
			placeholder="you@example.com"
			required
		  />
  
		  <label for="password">Password</label>
		  <input
			type="password"
			id="password"
			bind:value={password}
			placeholder="••••••••"
			required
		  />
  
		  <button type="submit">
			{#if loginState === 'success'}
			  ✓
			{:else}
			  Sign In
			{/if}
		  </button>
		</form>
  
		<p class="redirect">
		  Don't have an account?
		  <a href="/register">Create one →</a>
		</p>
	  </div>
	</div>
  </div>
  
  <style>
	:global(body, html) {
	  margin: 0;
	  padding: 0;
	  height: 100%;
	  font-family: 'Poppins', sans-serif;
	}
	.split-screen {
	  display: flex;
	  min-height: 100vh;
	}
	.illustration-pane {
	  flex: 1;
	  background: #2c3e50;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
	.illustration-pane img {
	  max-width: 80%;
	  animation: fadeIn 1s ease-out;
	}
	.form-pane {
	  flex: 1;
	  background: #f4b400;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  padding: 2rem;
	}
  
	.login-box {
	  background: #fff;
	  padding: 2rem;
	  border-radius: 12px;
	  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	  width: 100%;
	  max-width: 380px;
	  animation: slideIn 0.6s ease-out;
	  /* prepare for animations */
	  transform-origin: center;
	}
	.login-box.error {
	  animation: shake 0.6s;
	}
	.login-box.success {
	  animation: pulse 0.8s forwards;
	}
  
	.login-box h2 {
	  margin: 0 0 1.5rem;
	  color: #2c3e50;
	  font-size: 1.75rem;
	  text-align: center;
	}
	.login-box form {
	  display: flex;
	  flex-direction: column;
	  gap: 1rem;
	}
	.login-box label {
	  font-weight: 600;
	  color: #444;
	}
	.login-box input {
	  padding: 0.6rem;
	  font-size: 1rem;
	  border: 1px solid #ccc;
	  border-radius: 6px;
	  transition: border-color 0.2s;
	}
	.login-box input:focus {
	  border-color: #2c3e50;
	  outline: none;
	}
	.login-box button {
	  margin-top: 0.5rem;
	  padding: 0.75rem;
	  font-size: 1rem;
	  font-weight: 600;
	  color: #fff;
	  background: #2c3e50;
	  border: none;
	  border-radius: 6px;
	  cursor: pointer;
	  transition: background 0.2s;
	}
	.login-box button:hover {
	  background: #1a242f;
	}
	.redirect {
	  text-align: center;
	  margin-top: 1rem;
	  font-size: 0.9rem;
	  color: #666;
	}
	.redirect a {
	  color: #2c3e50;
	  text-decoration: none;
	  font-weight: 600;
	}
	.redirect a:hover {
	  text-decoration: underline;
	}
  
	/* Animations */
	@keyframes fadeIn {
	  from {
		opacity: 0;
		transform: translateY(-10%);
	  }
	  to {
		opacity: 1;
		transform: translateY(0);
	  }
	}
	@keyframes slideIn {
	  from {
		opacity: 0;
		transform: translateX(20%);
	  }
	  to {
		opacity: 1;
		transform: translateX(0);
	  }
	}
  
	/* shake on error */
	@keyframes shake {
	  0%, 100% { transform: translateX(0) }
	  20%, 60% { transform: translateX(-10px) }
	  40%, 80% { transform: translateX(10px) }
	}
	/* pulse + scale up on success */
	@keyframes pulse {
	  0%   { transform: scale(1) }
	  50%  { transform: scale(1.1) }
	  100% { transform: scale(1) }
	}
  </style>
  