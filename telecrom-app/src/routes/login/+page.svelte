<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let mode = $state<'login' | 'signup'>('login');
</script>

<div class="login-page">
  <div class="login-card">
    <div class="login-brand">
      <div class="login-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </div>
      <h1>Telecrom</h1>
      <p>CRM System</p>
    </div>

    {#if form?.error}
      <div class="login-error">{form.error}</div>
    {/if}

    {#if form?.success}
      <div class="login-success">{form.success}</div>
    {/if}

    <form method="POST" action="?/{mode}" use:enhance>
      {#if mode === 'signup'}
        <label class="form-field">
          <span class="form-label">Display Name</span>
          <input class="form-input" type="text" name="display_name" placeholder="Your name" required />
        </label>
      {/if}

      <label class="form-field">
        <span class="form-label">Email</span>
        <input
          class="form-input"
          type="email"
          name="email"
          placeholder="agent@company.com"
          value={form?.email ?? ''}
          required
        />
      </label>

      <label class="form-field">
        <span class="form-label">Password</span>
        <input
          class="form-input"
          type="password"
          name="password"
          placeholder="••••••••"
          minlength="8"
          required
        />
      </label>

      <button class="btn btn-primary btn-lg" type="submit">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>

    <p class="login-toggle">
      {#if mode === 'login'}
        Don't have an account?
        <button class="btn-ghost" onclick={() => (mode = 'signup')}>Sign up</button>
      {:else}
        Already have an account?
        <button class="btn-ghost" onclick={() => (mode = 'login')}>Sign in</button>
      {/if}
    </p>
  </div>
</div>

<style>
  .login-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-app);
    overflow: auto;
  }
  .login-card {
    width: min(420px, 90vw);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 36px 32px;
    box-shadow: var(--shadow-md);
  }
  .login-brand {
    text-align: center;
    margin-bottom: 28px;
  }
  .login-icon {
    width: 48px; height: 48px;
    margin: 0 auto 12px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(200, 164, 78, 0.3);
  }
  .login-icon svg { width: 22px; height: 22px; color: #fff; }
  .login-brand h1 {
    font-size: 22px; font-weight: 700; color: var(--text-primary);
  }
  .login-brand p {
    font-size: 12px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 1px; font-weight: 500;
  }
  .login-error {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: var(--red-bg);
    color: var(--red);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .login-success {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: var(--green-bg);
    color: var(--green);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .login-toggle {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
