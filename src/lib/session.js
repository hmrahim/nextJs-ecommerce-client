// Generates / persists a guest session id used to identify the
// guest's cart on the backend before they log in.

const KEY = 'moom24_session_id';

export function getSessionId() {
  if (typeof window === 'undefined') return null;

  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function clearSessionId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}