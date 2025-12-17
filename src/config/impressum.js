/**
 * Impressum configuration loaded from environment variables.
 * Set these in .env (local) or GitHub secrets (production).
 */
export const impressum = {
  name: import.meta.env.VITE_IMPRESSUM_NAME || '',
  address: (import.meta.env.VITE_IMPRESSUM_ADDRESS || '').replace(/\\n/g, '\n'),
  phone: import.meta.env.VITE_IMPRESSUM_PHONE || '',
  email: import.meta.env.VITE_IMPRESSUM_EMAIL || '',
};
