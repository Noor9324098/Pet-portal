<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { currentUser } from "$lib/stores";

  interface LogEntry {
    id: string;
    message: string;
    timestamp: string;
  }

  let logs: LogEntry[] = [];
  let loading = true;

  onMount(() => {
    const unsub = currentUser.subscribe((user) => {
      if (!user) {
        goto("/login");
      }
    });
    return unsub;
  });

  onMount(async () => {
    const res = await fetch("/api/log");
    if (res.ok) {
      logs = await res.json();
      logs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    loading = false;
  });
</script>

<h1>Activity Log</h1>

{#if loading}
  <p>Loading activity…</p>
{:else if logs.length === 0}
  <p>No actions yet.</p>
{:else}
  <ul class="log-list">
    {#each logs as log (log.id)}
      <li>
        <div>{log.message}</div>
        <small>{new Date(log.timestamp).toLocaleString()}</small>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .log-list {
    list-style: none;
    padding: 0;
    margin-top: 1.5rem;
  }

  .log-list li {
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
  }

  .log-list small {
    color: #888;
    font-size: 0.85rem;
  }
</style>
