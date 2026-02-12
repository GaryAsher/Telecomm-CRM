<script lang="ts">
  import { enhance } from '$app/forms';
  let { data } = $props();
  let search = $state('');
  let showModal = $state(false);

  const filtered = $derived(
    data.contacts.filter((c) => {
      const s = search.toLowerCase();
      return !s || c.full_name.toLowerCase().includes(s) || c.title.toLowerCase().includes(s);
    })
  );
</script>

<div class="card full-card">
  <div class="card-header">
    <div class="header-top">
      <h2>Contacts</h2>
      <button class="btn btn-primary" onclick={() => (showModal = true)}>+ Add Contact</button>
    </div>
    <input class="form-input" placeholder="Search contacts..." bind:value={search} />
  </div>
  <div class="table-scroll">
    <table class="data-table">
      <thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Phone</th><th>Email</th></tr></thead>
      <tbody>
        {#each filtered as c (c.id)}
          <tr>
            <td class="td-name">{c.full_name}{#if c.is_primary}<span class="star">★</span>{/if}</td>
            <td>{c.title}</td>
            <td>{c.company?.company_name ?? '—'}</td>
            <td>{c.phone}</td>
            <td>{c.email}</td>
          </tr>
        {:else}
          <tr><td colspan="5" class="empty-cell">No contacts found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if showModal}
  <div class="modal-overlay" onclick={() => (showModal = false)} role="dialog">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="document">
      <div class="modal-inner">
        <div class="modal-title-row"><h3>Add Contact</h3><button class="modal-close" onclick={() => (showModal = false)}>✕</button></div>
        <form method="POST" action="?/createContact" use:enhance={() => { return async ({ update }) => { await update(); showModal = false; }; }}>
          <label class="form-field"><span class="form-label">Full Name</span><input class="form-input" name="full_name" required /></label>
          <label class="form-field"><span class="form-label">Title</span><input class="form-input" name="title" /></label>
          <label class="form-field"><span class="form-label">Company</span><select class="form-select" name="company_id">{#each data.companies as co}<option value={co.id}>{co.company_name}</option>{/each}</select></label>
          <div class="form-row">
            <label class="form-field"><span class="form-label">Phone</span><input class="form-input" name="phone" /></label>
            <label class="form-field"><span class="form-label">Email</span><input class="form-input" name="email" /></label>
          </div>
          <label class="form-check"><input type="checkbox" name="is_primary" /> Primary contact</label>
          <button class="btn btn-primary btn-lg" type="submit">Add Contact</button>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  .full-card { overflow: hidden; }
  .card-header { padding: 18px 20px 14px; border-bottom: 1px solid var(--border-light); }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  h2 { font-size: 17px; font-weight: 700; }
  .table-scroll { overflow: auto; max-height: calc(100vh - 200px); }
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table thead { background: var(--bg-muted); }
  .data-table th { padding: 10px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 11px 16px; border-bottom: 1px solid var(--border-light); }
  .data-table tbody tr:hover { background: #fafbfc; }
  .td-name { font-weight: 600; }
  .star { color: var(--accent-dark); font-size: 11px; margin-left: 5px; }
  .empty-cell { text-align: center; color: var(--text-muted); padding: 32px 16px !important; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 25px 60px rgba(0,0,0,0.18); width: min(520px, 92vw); max-height: 85vh; overflow: auto; }
  .modal-inner { padding: 24px 28px; }
  .modal-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title-row h3 { font-size: 17px; font-weight: 700; }
  .modal-close { border: none; background: none; cursor: pointer; color: var(--text-muted); font-size: 18px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-select { appearance: none; cursor: pointer; width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font: 13px var(--font); background: var(--bg-muted); }
  .form-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; cursor: pointer; }
</style>
