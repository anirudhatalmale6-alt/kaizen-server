export function makeSlug(title, fullName) {
  const normalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  return `${normalize(title)}_${normalize(fullName)}`;
}