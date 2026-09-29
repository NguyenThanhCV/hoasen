module.exports = (value) =>
  String(value ?? "")
    .slice(0, 100)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
