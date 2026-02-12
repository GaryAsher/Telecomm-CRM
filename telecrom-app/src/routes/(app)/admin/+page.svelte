<script lang="ts">
  let { data } = $props();

  const stats = [
    { label: 'Total Callers', value: data.stats.callers },
    { label: 'Total Interactions', value: data.stats.interactions },
    { label: 'Companies Registered', value: data.stats.companies },
    { label: 'Contacts in Directory', value: data.stats.contacts },
  ];
</script>

<div class="page-header">
  <h1>Admin</h1>
  <p class="page-sub">System management and configuration</p>
</div>

<div class="grid-2">
  <div class="card panel">
    <h3 class="panel-title">Roles &amp; Permissions</h3>
    {#each data.roles as role}
      <div class="role-row">
        <div>
          <div class="role-name">{role.name}</div>
          <div class="role-desc">{role.description ?? ''}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="card panel">
    <h3 class="panel-title">System Stats</h3>
    {#each stats as stat}
      <div class="stat-row">
        <span class="stat-label">{stat.label}</span>
        <span class="stat-value">{stat.value}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .page-header { margin-bottom: 22px; }
  .page-header h1 { font-size: 22px; font-weight: 700; }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .panel { padding: 20px 24px; }
  .panel-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
  .role-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-radius: 10px; background: var(--bg-muted); margin-bottom: 6px;
  }
  .role-name { font-size: 13px; font-weight: 600; text-transform: capitalize; }
  .role-desc { font-size: 11px; color: var(--text-muted); }
  .stat-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-radius: 10px; background: var(--bg-muted); margin-bottom: 6px;
  }
  .stat-label { font-size: 13px; color: var(--text-secondary); }
  .stat-value { font-size: 15px; font-weight: 700; }
  @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
