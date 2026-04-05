import chokidar from "chokidar";

export function createWatcher(companyDir, onChange) {
  let debounceTimer = null;

  const watcher = chokidar.watch(companyDir, {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  const handleChange = (eventType, filePath) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onChange(eventType, filePath);
    }, 300);
  };

  watcher
    .on("add", (p) => handleChange("add", p))
    .on("change", (p) => handleChange("change", p))
    .on("unlink", (p) => handleChange("unlink", p));

  return watcher;
}
