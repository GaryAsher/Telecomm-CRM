<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let { data } = $props();
  let search = $state('');
  let showModal = $state(false);

  const filtered = $derived(
    data.companies.filter((c) => {
      const s = search.toLowerCase();
      return !s || c.company_name.toLowerCase().includes(s) || c.location.toLowerCase().includes(s);
    })
  );

  function select(id: string) {
    goto(`/companies?id=${id}`, { keepFocus: true });
  }
</script>

<div class="split" class:has-detail={!!data.selectedCompany}>
  <div class="list-panel card">
    <div class="list-header">
      <div class="list-header-top">
        <h2>Companies</h2>
        <button class="btn btn-primary" onclick={() => (showModal = true)}>+ Add Company</button>
      </div>
      <input class="form-input" placeholder="Search companies..." bind:value={search} />
    </div>
    <div class="list-scroll">
      {#each filtered as co (co.id)}
        <button
          class="company-item"
          class:active={data.selectedCompany?.id === co.id}
          onclick={() => select(co.id)}
        >
          <div class="co-name">{co.company_name}</div>
          <div class="co-meta">{co.location} · {co.company_type}</div>
        </button>
      {:else}
        <p class="empty">No companies found.</p>
      {/each}
    </div>
  </div>

  {#if data.selectedCompany}
    {@const c = data.selectedCompany}
    <div class="detail-panel card">
      <div class="detail-header">
        <h2>{c.company_name}</h2>
        <span class="type-tag">{c.company_type}</span>
      </div>
      <div class="detail-body">
        <div class="info-grid">
          <div class="info-cell"><span class="info-label">Location</span><span class="info-value">{c.location || '—'}</span></div>
          <div class="info-cell"><span class="info-label">Hours</span><span class="info-value">{c.hours || '—'}</span></div>
          <div class="info-cell"><span class="info-label">Phone</span><span class="info-value">{c.phone || '—'}</span></div>
          <div class="info-cell"><span class="info-label">Employees</span><span class="info-value">{c.employee_count}</span></div>
        </div>
        <h3 class="section-label">Contacts ({data.contacts.length})</h3>
        {#each data.contacts as ct}
          <div class="contact-row">
            <div>
              <strong>{ct.full_name}</strong>
              {#if ct.is_primary}<span class="primary-star">★ Primary</span>{/if}
              <div class="contact-title">{ct.title}</div>
            </div>
            <div class="contact-info">
              <div>{ct.phone}</div>
              <div>{ct.email}</div>
            </div>
          </div>
        {:else}
          <p class="empty">No contacts for this company.</p>
        {/each}
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay" onclick={() => (showModal = false)} role="dialog">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="document">
      <div class="modal-inner">
        <div class="modal-title-row">
          <h3>Add Company</h3>
          <button class="modal-close" onclick={() => (showModal = false)}>✕</button>
        </div>
        <form method="POST" action="?/createCompany" use:enhance={() => {
          return async ({ update }) => { await update(); showModal = false; };
        }}>
          <label class="form-field"><span class="form-label">Company Name</span><input class="form-input" name="company_name" required /></label>
          <label class="form-field"><span class="form-label">Location</span><input class="form-input" name="location" /></label>
          <label class="form-field"><span class="form-label">Hours</span><input class="form-input" name="hours" /></label>
          <label class="form-field"><span class="form-label">Phone</span><input class="form-input" name="phone" /></label>
          <div class="form-row">
            <label class="form-field"><span class="form-label">Type</span>
              <select class="form-select" name="company_type">
                <option>Healthcare</option><option>Insurance</option><option>Legal</option><option>Finance</option><option>Technology</option><option>Other</option>
              </select>
            </label>
            <label class="form-field"><span class="form-label">Employees</span><input class="form-input" name="employee_count" type="number" min="0" value="0" /></label>
          </div>
          <button class="btn btn-primary btn-lg" type="submit">Add Company</button>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  .split { display: grid; gap: 16px; height: calc(100vh - 80px); }
  .split.has-detail { grid-template-columns: 400px 1fr; }
  .list-panel { display: flex; flex-direction: column; overflow: hidden; }
  .list-header { padding: 18px 16px 14px; border-bottom: 1px solid var(--border-light); }
  .list-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .list-header h2 { font-size: 17px; font-weight: 700; }
  .list-scroll { flex: 1; overflow: auto; padding: 8px 10px; }
  .company-item {
    display: block; width: 100%; text-align: left;
    padding: 12px 14px; border-radius: 10px; border: 1px solid transparent;
    background: none; font-family: var(--font); cursor: pointer; margin-bottom: 3px; transition: all 0.1s;
  }
  .company-item:hover { background: var(--bg-muted); }
  .company-item.active { background: var(--accent-bg); border-color: var(--accent); }
  .co-name { font-size: 13px; font-weight: 600; }
  .co-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .detail-panel { overflow: auto; }
  .detail-header { padding: 20px 24px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
  .detail-header h2 { font-size: 19px; font-weight: 700; }
  .type-tag { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-full); background: var(--bg-muted); color: var(--text-muted); text-transform: uppercase; }
  .detail-body { padding: 16px 24px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .info-cell { padding: 10px 12px; border-radius: 10px; background: var(--bg-muted); }
  .info-label { display: block; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { display: block; font-size: 13px; margin-top: 2px; }
  .section-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  .contact-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; background: var(--bg-muted); margin-bottom: 6px; }
  .contact-row strong { font-size: 13px; }
  .primary-star { font-size: 10px; color: var(--accent-dark); margin-left: 6px; }
  .contact-title { font-size: 11px; color: var(--text-muted); }
  .contact-info { text-align: right; font-size: 11px; color: var(--text-muted); }
  .empty { font-size: 13px; color: var(--text-muted); padding: 16px 12px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 25px 60px rgba(0,0,0,0.18); width: min(520px, 92vw); max-height: 85vh; overflow: auto; }
  .modal-inner { padding: 24px 28px; }
  .modal-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title-row h3 { font-size: 17px; font-weight: 700; }
  .modal-close { border: none; background: none; cursor: pointer; color: var(--text-muted); font-size: 18px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-select { appearance: none; cursor: pointer; }
  @media (max-width: 900px) { .split.has-detail { grid-template-columns: 1fr; } .detail-panel { display: none; } }
</style>
