<script lang="ts">
  import { page } from '$app/stores';

  interface NavItem {
    href: string;
    label: string;
    icon: string;
    badge?: number;
  }

  let { items = [], userName = '', userEmail = '' }: {
    items: NavItem[];
    userName: string;
    userEmail: string;
  } = $props();
</script>

<aside class="sidebar">
  <div class="sb-brand">
    <div class="sb-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    </div>
    <div>
      <div class="sb-name">Telecrom</div>
      <div class="sb-sub">CRM System</div>
    </div>
  </div>

  <nav class="sb-nav">
    {#each items as item}
      {@const isActive = $page.url.pathname === item.href ||
        (item.href !== '/' && $page.url.pathname.startsWith(item.href))}
      <a
        href={item.href}
        class="nav-link"
        class:active={isActive}
        data-sveltekit-preload-data
      >
        <span class="nav-icon">{@html item.icon}</span>
        <span class="nav-label">{item.label}</span>
        {#if item.badge && item.badge > 0}
          <span class="nav-badge">{item.badge}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="sb-user">
    <div class="sb-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
    <div class="sb-user-info">
      <div class="sb-user-name">{userName}</div>
      <div class="sb-user-email">{userEmail}</div>
    </div>
    <form method="POST" action="/login?/logout" class="sb-logout">
      <button type="submit" title="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
      </button>
    </form>
  </div>
</aside>

<style>
  .sidebar {
    width: 228px;
    flex-shrink: 0;
    background: var(--bg-sidebar);
    display: flex;
    flex-direction: column;
    border-right: 1px solid #1e293b;
    user-select: none;
  }
  .sb-brand {
    padding: 20px 18px 16px;
    border-bottom: 1px solid #1e293b;
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .sb-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #c8a44e, #a07c2a);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(200, 164, 78, 0.3);
  }
  .sb-icon :global(svg) { width: 18px; height: 18px; color: #fff; }
  .sb-name { font-size: 16px; font-weight: 700; color: var(--text-inverse); letter-spacing: -0.3px; }
  .sb-sub { font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }

  .sb-nav { padding: 12px 10px; flex: 1; }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    color: #94a3b8;
    font: 500 13px var(--font);
    text-decoration: none;
    margin-bottom: 2px;
    transition: background 0.12s, color 0.12s;
  }
  .nav-link:hover { background: var(--bg-sidebar-hover); }
  .nav-link.active {
    background: var(--bg-sidebar-active);
    color: var(--accent);
    font-weight: 600;
  }
  .nav-icon { display: inline-flex; }
  .nav-icon :global(svg) { width: 17px; height: 17px; }
  .nav-label { flex: 1; }
  .nav-badge {
    font-size: 10px; font-weight: 700;
    padding: 2px 7px;
    border-radius: var(--radius-full);
    min-width: 20px; text-align: center;
    background: #334155; color: #94a3b8;
  }
  .nav-link.active .nav-badge {
    background: var(--accent);
    color: var(--bg-sidebar);
  }

  .sb-user {
    padding: 14px 18px;
    border-top: 1px solid #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-avatar {
    width: 32px; height: 32px;
    border-radius: var(--radius-full);
    background: #1e293b;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sb-avatar :global(svg) { width: 15px; height: 15px; color: #94a3b8; }
  .sb-user-info { flex: 1; min-width: 0; }
  .sb-user-name { font-size: 12px; font-weight: 600; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sb-user-email { font-size: 10px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sb-logout button {
    border: none; background: none; cursor: pointer; color: #64748b;
    padding: 4px; display: flex; transition: color 0.12s;
  }
  .sb-logout button:hover { color: var(--red); }
</style>
