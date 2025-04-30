// src/server.ts
import app from './app';

const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Schedule cleanup of expired sessions (every hour)
  const { cleanupExpiredSessions } = require('./utils/db');
  setInterval(() => {
    const removed = cleanupExpiredSessions();
    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired sessions`);
    }
  }, 60 * 60 * 1000); // 1 hour
});