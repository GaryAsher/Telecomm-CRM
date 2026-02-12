<script lang="ts">
  import { STATUS_CONFIG } from '$lib/types';

  let { data } = $props();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const statCards = [
    { label: 'Active Queue', value: data.stats.active, color: 'var(--blue-bg)' },
    { label: 'Escalated', value: data.stats.escalated, color: 'var(--red-bg)' },
    { label: 'Resolved Today', value: data.stats.resolved, color: 'var(--green-bg)' },
    { label: 'Total Companies', value: data.stats.companies, color: 'var(--violet-bg)' },
  ];
</script>

<div class="page-header">
  <h1>Dashboard</h1>
  <p class="page-sub">{dateStr}</p>
</div>

<div class="stat-grid">
  {#each statCards as stat, i}
    <div class="stat-card" style="animation-delay: {i * 0.04}s">
      <div class="stat-header">
        <span class="stat-label">{stat.label}</span>
        <div class="stat-icon" style="background: {stat.color}"></div>
      </div>
      <div class="stat-value">{stat.value}</div>
    </div>
  {/each}
</div>

<div class="grid-2">
  <div class="card">
    <div class="card-header">
      <span class="card-title">Active Queue</span>
      <a href="/queue" class="btn btn-ghost">View all →</a>
    </div>
    <div class="card-body">
      {#each data.recentCallers as caller}
        <a href="/queue?id={caller.id}" class="queue-item">
          <div>
            <div class="queue-name">{caller.full_name ?? 'Unknown'}</div>
            <div class="queue-reason">{caller.reason}</div>
          </div>
          <span class="badge {STATUS_CONFIG[caller.status]?.colorClass ?? ''}">
            {STATUS_CONFIG[caller.status]?.label ?? caller.status}
          </span>
        </a>
      {:else}
        <p class="empty-text">No active callers in queue.</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .page-header { margin-bottom: 22px; }
  .page-header h1 { font-size: 22px; font-weight: 700; }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 22px;
  }
  .stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    animation: fadeSlideUp 0.35s ease both;
  }
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .stat-label {
    font-size: 11px; font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .stat-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
  }
  .stat-value { font-size: 28px; font-weight: 700; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .card-header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-title { font-size: 15px; font-weight: 700; }
  .card-body { padding: 10px 12px; }

  .queue-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    transition: background 0.1s;
    margin-bottom: 2px;
  }
  .queue-item:hover { background: var(--bg-muted); }
  .queue-name { font-size: 13px; font-weight: 600; }
  .queue-reason { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .empty-text { font-size: 13px; color: var(--text-muted); padding: 16px 12px; }

  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
  }
</style>
