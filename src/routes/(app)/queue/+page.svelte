<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { STATUS_CONFIG, type CallerStatus } from '$lib/types';

  let { data, form } = $props();
  let search = $state('');
  let statusFilter = $state<CallerStatus | 'all'>('all');
  let showNewCallerModal = $state(false);
  let showInteractionModal = $state(false);

  const filteredCallers = $derived(
    data.callers.filter((c) => {
      const matchSearch =
        !search ||
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone_number.includes(search) ||
        c.account_reference?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
  );

  function selectCaller(id: string) {
    goto(`/queue?id=${id}`, { keepFocus: true });
  }

  function formatTime(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function formatDuration(s: number | null) {
    if (!s) return '—';
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  const statuses: CallerStatus[] = ['new', 'in-progress', 'follow-up', 'escalated', 'resolved'];
</script>

<div class="split" class:has-detail={!!data.selectedCaller}>
  <!-- LEFT PANEL: Caller list -->
  <div class="list-panel card">
    <div class="list-header">
      <div class="list-header-top">
        <h2>Call Queue</h2>
        <button class="btn btn-primary" onclick={() => (showNewCallerModal = true)}>
          + New Caller
        </button>
      </div>

      <input
        class="form-input search-input"
        type="text"
        placeholder="Search callers..."
        bind:value={search}
      />

      <div class="filters">
        <button
          class="filter-pill"
          class:active={statusFilter === 'all'}
          onclick={() => (statusFilter = 'all')}
        >All</button>
        {#each statuses as st}
          <button
            class="filter-pill"
            class:active={statusFilter === st}
            onclick={() => (statusFilter = st)}
          >{STATUS_CONFIG[st].label}</button>
        {/each}
      </div>
    </div>

    <div class="list-scroll">
      {#each filteredCallers as caller (caller.id)}
        <button
          class="caller-item"
          class:active={data.selectedCaller?.id === caller.id}
          onclick={() => selectCaller(caller.id)}
        >
          <div class="caller-item-top">
            <span class="caller-name">{caller.full_name ?? 'Unknown'}</span>
            <span class="badge {STATUS_CONFIG[caller.status]?.colorClass}">
              {STATUS_CONFIG[caller.status]?.label}
            </span>
          </div>
          <div class="caller-reason">{caller.reason}</div>
          <div class="caller-meta">
            <span>{caller.phone_number}</span>
            {#if caller.company}
              <span>· {caller.company.company_name}</span>
            {/if}
          </div>
        </button>
      {:else}
        <div class="empty-state">
          <p class="empty-title">No callers found</p>
          <p class="empty-sub">Adjust your search or filters</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- RIGHT PANEL: Caller detail -->
  {#if data.selectedCaller}
    {@const c = data.selectedCaller}
    <div class="detail-panel card">
      <div class="detail-header">
        <div>
          <h2 class="detail-name">{c.full_name ?? 'Unknown'}</h2>
          <div class="detail-meta">
            <span class="badge {STATUS_CONFIG[c.status]?.colorClass}">
              {STATUS_CONFIG[c.status]?.label}
            </span>
            <span class="detail-date">{formatTime(c.created_at)}</span>
          </div>
        </div>
        <button class="btn btn-outline" onclick={() => (showInteractionModal = true)}>
          + Log Interaction
        </button>
      </div>

      <div class="detail-body">
        <div class="info-grid">
          <div class="info-cell">
            <span class="info-label">Phone</span>
            <span class="info-value">{c.phone_number}</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Account</span>
            <span class="info-value">{c.account_reference ?? '—'}</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Company</span>
            <span class="info-value">{c.company?.company_name ?? '—'}</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Reason</span>
            <span class="info-value">{c.reason}</span>
          </div>
        </div>

        <!-- Status update -->
        <h3 class="section-label">Update Status</h3>
        <div class="status-pills">
          {#each statuses as st}
            <form method="POST" action="?/updateStatus&id={c.id}" use:enhance>
              <input type="hidden" name="caller_id" value={c.id} />
              <input type="hidden" name="status" value={st} />
              <button
                type="submit"
                class="status-pill"
                class:active={c.status === st}
                style="color: {st === 'new' ? 'var(--blue)' : st === 'in-progress' ? 'var(--amber)' : st === 'follow-up' ? 'var(--violet)' : st === 'escalated' ? 'var(--red)' : 'var(--green)'}"
              >
                {#if c.status === st}✓{/if}
                {STATUS_CONFIG[st].label}
              </button>
            </form>
          {/each}
        </div>

        <!-- Interaction timeline -->
        <h3 class="section-label">Interaction History</h3>
        {#each data.interactions as inter}
          <div class="timeline-item">
            <div class="timeline-top">
              <span class="type-badge">{inter.interaction_type}</span>
              <span class="dir-badge" class:inbound={inter.direction === 'inbound'}>
                {inter.direction === 'inbound' ? '↙ IN' : '↗ OUT'}
              </span>
              <span class="timeline-time">{formatTime(inter.started_at)}</span>
            </div>
            <div class="timeline-details">
              {#if inter.outcome}<span><strong>Outcome:</strong> {inter.outcome}</span>{/if}
              {#if inter.duration_seconds}<span><strong>Duration:</strong> {formatDuration(inter.duration_seconds)}</span>{/if}
            </div>
            {#if inter.notes}
              <p class="timeline-notes">{inter.notes}</p>
            {/if}
          </div>
        {:else}
          <p class="empty-text">No interactions recorded yet.</p>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- NEW CALLER MODAL -->
{#if showNewCallerModal}
  <div class="modal-overlay" onclick={() => (showNewCallerModal = false)} role="dialog">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="document">
      <div class="modal-inner">
        <div class="modal-title-row">
          <h3>New Caller</h3>
          <button class="modal-close" onclick={() => (showNewCallerModal = false)}>✕</button>
        </div>
        <form method="POST" action="?/createCaller" use:enhance={() => {
          return async ({ update }) => {
            await update();
            showNewCallerModal = false;
          };
        }}>
          <label class="form-field">
            <span class="form-label">Full Name</span>
            <input class="form-input" name="full_name" placeholder="e.g. Jordan Lee" required />
          </label>
          <label class="form-field">
            <span class="form-label">Phone Number</span>
            <input class="form-input" name="phone_number" placeholder="+1 (555) 000-0000" required />
          </label>
          <label class="form-field">
            <span class="form-label">Account Reference</span>
            <input class="form-input" name="account_reference" placeholder="ACCT-00000" />
          </label>
          <label class="form-field">
            <span class="form-label">Company</span>
            <select class="form-select" name="company_id">
              <option value="">— None —</option>
              {#each data.companies as co}
                <option value={co.id}>{co.company_name}</option>
              {/each}
            </select>
          </label>
          <label class="form-field">
            <span class="form-label">Reason</span>
            <input class="form-input" name="reason" placeholder="e.g. Billing question" />
          </label>
          <button class="btn btn-primary btn-lg" type="submit">Add Caller</button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- LOG INTERACTION MODAL -->
{#if showInteractionModal && data.selectedCaller}
  <div class="modal-overlay" onclick={() => (showInteractionModal = false)} role="dialog">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="document">
      <div class="modal-inner">
        <div class="modal-title-row">
          <h3>Log Interaction — {data.selectedCaller.full_name}</h3>
          <button class="modal-close" onclick={() => (showInteractionModal = false)}>✕</button>
        </div>
        <form method="POST" action="?/logInteraction&id={data.selectedCaller.id}" use:enhance={() => {
          return async ({ update }) => {
            await update();
            showInteractionModal = false;
          };
        }}>
          <input type="hidden" name="caller_id" value={data.selectedCaller.id} />
          <div class="form-row">
            <label class="form-field">
              <span class="form-label">Type</span>
              <select class="form-select" name="interaction_type">
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="note">Note</option>
              </select>
            </label>
            <label class="form-field">
              <span class="form-label">Direction</span>
              <select class="form-select" name="direction">
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </label>
          </div>
          <label class="form-field">
            <span class="form-label">Outcome</span>
            <input class="form-input" name="outcome" placeholder="e.g. Resolved, Callback scheduled" />
          </label>
          <label class="form-field">
            <span class="form-label">Duration (seconds)</span>
            <input class="form-input" name="duration_seconds" type="number" min="0" value="120" />
          </label>
          <label class="form-field">
            <span class="form-label">Notes</span>
            <textarea class="form-textarea" name="notes" placeholder="Add interaction notes..."></textarea>
          </label>
          <button class="btn btn-primary btn-lg" type="submit">Log Interaction</button>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  .split { display: grid; gap: 16px; height: calc(100vh - 80px); }
  .split.has-detail { grid-template-columns: 380px 1fr; }

  .list-panel { display: flex; flex-direction: column; overflow: hidden; }
  .list-header { padding: 18px 16px 14px; border-bottom: 1px solid var(--border-light); }
  .list-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .list-header-top h2 { font-size: 17px; font-weight: 700; }
  .search-input { margin-bottom: 10px; }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-pill {
    border: 1px solid var(--border); background: #fff;
    color: var(--text-muted); padding: 4px 11px;
    border-radius: var(--radius-full); font: 600 11px var(--font);
    cursor: pointer; transition: all 0.12s; text-transform: capitalize;
  }
  .filter-pill:hover { border-color: var(--accent); }
  .filter-pill.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent-dark); }

  .list-scroll { flex: 1; overflow: auto; padding: 8px 10px; }

  .caller-item {
    display: block; width: 100%; text-align: left;
    padding: 12px 14px; border-radius: 10px;
    cursor: pointer; margin-bottom: 3px;
    border: 1px solid transparent;
    background: none; font-family: var(--font);
    transition: all 0.1s;
  }
  .caller-item:hover { background: var(--bg-muted); }
  .caller-item.active { background: var(--accent-bg); border-color: var(--accent); }
  .caller-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
  .caller-name { font-size: 13px; font-weight: 600; }
  .caller-reason { font-size: 12px; color: var(--text-muted); }
  .caller-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); margin-top: 3px; }

  .detail-panel { overflow: auto; }
  .detail-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-light);
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .detail-name { font-size: 19px; font-weight: 700; margin-bottom: 6px; }
  .detail-meta { display: flex; align-items: center; gap: 10px; }
  .detail-date { font-size: 12px; color: var(--text-muted); }
  .detail-body { padding: 16px 24px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .info-cell { padding: 10px 12px; border-radius: 10px; background: var(--bg-muted); }
  .info-label { display: block; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { display: block; font-size: 13px; margin-top: 2px; }

  .section-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }

  .status-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: var(--radius-full);
    font: 600 12px var(--font); cursor: pointer;
    border: 1px solid var(--border); background: #fff;
    transition: all 0.12s;
  }
  .status-pill:hover { border-color: currentColor; }
  .status-pill.active { border-color: currentColor; }

  .timeline-item {
    padding: 12px 14px; border-radius: 10px;
    background: var(--bg-muted); margin-bottom: 6px;
    border-left: 3px solid var(--accent);
  }
  .timeline-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .type-badge {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    padding: 2px 8px; border-radius: var(--radius-full);
    background: var(--bg-surface); color: var(--text-secondary);
  }
  .dir-badge { font-size: 10px; font-weight: 600; }
  .dir-badge.inbound { color: var(--teal); }
  .timeline-time { font-size: 11px; color: var(--text-muted); margin-left: auto; }
  .timeline-details { display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; }
  .timeline-notes { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

  .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; color: var(--text-muted); }
  .empty-title { font-size: 15px; font-weight: 600; color: var(--text-secondary); }
  .empty-sub { font-size: 13px; }
  .empty-text { font-size: 13px; color: var(--text-muted); font-style: italic; padding: 12px; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .modal-box {
    background: #fff; border-radius: 16px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
    width: min(520px, 92vw); max-height: 85vh; overflow: auto;
  }
  .modal-inner { padding: 24px 28px; }
  .modal-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title-row h3 { font-size: 17px; font-weight: 700; }
  .modal-close { border: none; background: none; cursor: pointer; color: var(--text-muted); font-size: 18px; padding: 4px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-select { appearance: none; cursor: pointer; }

  @media (max-width: 900px) {
    .split.has-detail { grid-template-columns: 1fr; }
    .detail-panel { display: none; }
  }
</style>
