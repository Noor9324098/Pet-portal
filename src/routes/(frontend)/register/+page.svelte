<script lang="ts">
	import { goto } from '$app/navigation';

	let name = '';
	let email = '';
	let password = '';

	const handleRegister = async () => {
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});

			const payload = await res.json().catch(() => ({}));

			if (res.ok) {

				window.dispatchEvent(new CustomEvent('sveltekit:notification', {
					detail: { message: payload.message || 'Registration successful!', type: 'success' }
				}));
				setTimeout(() => goto('/login'), 1000);
			} else {
			
				window.dispatchEvent(new CustomEvent('sveltekit:notification', {
					detail: {
						message: payload.error || 'Registration failed. Try again.',
						type: 'error'
					}
				}));
			}
		} catch (err) {
		
			window.dispatchEvent(new CustomEvent('sveltekit:notification', {
				detail: {
					message: 'Network error. Please check your connection.',
					type: 'error'
				}
			}));
		}
	};
</script>


<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="split-screen">
	<!-- left: “new here” illustration -->
	<div class="illustration-pane">
		<img src="/src/data/Registration.png" alt="New here illustration" />
	</div>

	<!-- right: registration form -->
	<div class="form-pane">
		<div class="form-box">
			<h2>Create Account</h2>
			<form on:submit|preventDefault={handleRegister}>
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Your name"
					required
				/>

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

				<button type="submit">Register</button>
			</form>
			<p class="redirect">
				Already have an account?
				<a href="/login">Sign in →</a>
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

	/* illustration pane */
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

	/* form pane */
	.form-pane {
		flex: 1;
		background: #f4b400;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	.form-box {
		background: #fff;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 380px;
		animation: slideIn 0.6s ease-out;
	}

	.form-box h2 {
		margin: 0 0 1.5rem;
		color: #2c3e50;
		font-size: 1.75rem;
		text-align: center;
	}

	.form-box form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-box label {
		font-weight: 600;
		color: #444;
	}

	.form-box input {
		padding: 0.6rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		transition: border-color 0.2s;
	}
	.form-box input:focus {
		border-color: #2c3e50;
		outline: none;
	}

	.form-box button {
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
	.form-box button:hover {
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
</style>
