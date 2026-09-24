// Coalesce input bursts into one render using the latest state.
function createFrameScheduler(render, requestFrame = callback => requestAnimationFrame(callback), cancelFrame = id => cancelAnimationFrame(id)) {
  let frame = null;
  let latestArgs;
  return {
    schedule(...args) {
      latestArgs = args;
      if (frame !== null) return;
      frame = requestFrame(() => {
        frame = null;
        render(...latestArgs);
      });
    },
    cancel() {
      if (frame !== null) cancelFrame(frame);
      frame = null;
    }
  };
}
if (typeof module !== 'undefined') module.exports = {createFrameScheduler};
