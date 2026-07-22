Object.defineProperty(Navigator.prototype, 'connection', {
  configurable: true,
  get() {
    return { saveData: true };
  }
});
