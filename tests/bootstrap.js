// Only the test page replaces time/RAF. Production loads neither of these files.
window.testClock = 1000;
window.testPendingFrame = null;
window.testFrameRequests = 0;
Object.defineProperty(performance, 'now', { value: () => window.testClock });
window.requestAnimationFrame = callback => {
  window.testPendingFrame = callback;
  return ++window.testFrameRequests;
};
