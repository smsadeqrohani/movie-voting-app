// Session management utilities

const SESSION_KEY = 'movie_voting_session_id';

// Generate a unique session ID
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

// Clear session (for testing purposes)
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Check if session is valid (not expired)
export function isSessionValid(): boolean {
  const sessionId = localStorage.getItem(SESSION_KEY);
  return sessionId !== null;
}
