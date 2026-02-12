<script lang="ts">
  let { data } = $props();

  function formatTime(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function formatDuration(s: number | null) {
    if (!s) return '—';
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }
</script>

<div class="card full-card">
  <div class="card-header">
    <h2>Call Log</h2>
    <p class="sub">{data.interactions.length} interactions recorded</p>
  </div>
  <div class="table-scroll">
    <table class="data-table">
      <thead><tr><th>Caller</th><th>Type</th><th>Direction</th><th>Outcome</th><th>Duration</th><th>Date</th></tr></thead>
      <tbody>
        {#each data.interactions as i (i.id)}
          <tr>
            <td class="td-name">{i.caller?.full_name ?? 'Unknown'}</td>
            <td><span class="type-badge">{i.interaction_type}</span></td>
            <td><span class="dir-badge" class:inbound={i.direction === 'inbound'}>{i.direction === 'inbound' ? '↙ IN' : '↗ OUT'}</span></td>
            <td>{i.outcome ?? '—'}</td>
            <td>{formatDuration(i.duration_seconds)}</td>
            <td class="date-cell">{formatTime(i.started_at)}</td>
          </tr>
        {:else}
          <tr><td colspan="6" class="empty-cell">No interactions recorded.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .full-card { overflow: hidden; }
  .card-header { padding: 18px 20px 14px; border-bottom: 1px solid var(--border-light); }
  h2 { font-size: 17px; font-weight: 700; }
  .sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .table-scroll { overflow: auto; max-height: calc(100vh - 180px); }
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table thead { background: var(--bg-muted); }
  .data-table th { padding: 10px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 11px 16px; border-bottom: 1px solid var(--border-light); }
  .data-table tbody tr:hover { background: #fafbfc; }
  .td-name { font-weight: 600; }
  .type-badge { font-size: 10px; font-weight: 600; text-transform: uppercase; padding: 2px 8px; border-radius: var(--radius-full); background: var(--bg-muted); color: var(--text-secondary); }
  .dir-badge { font-size: 10px; font-weight: 600; color: var(--indigo); }
  .dir-badge.inbound { color: var(--teal); }
  .date-cell { color: var(--text-muted); font-size: 12px; }
  .empty-cell { text-align: center; color: var(--text-muted); padding: 32px !important; }
</style>
