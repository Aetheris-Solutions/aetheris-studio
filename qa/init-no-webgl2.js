const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
  if (type === 'webgl2') return null;
  return originalGetContext.call(this, type, ...args);
};
