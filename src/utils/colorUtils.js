const languageColorCache = new Map();

const commonLanguageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  Ruby: "#701516",
  Go: "#00ADD8",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Rust: "#dea584",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Jupyter Notebook": "#DA5B0B",
  Vue: "#2c3e50",
  R: "#198CE7",
  Other: "#8b8b8b",
};

export const getColorForLanguage = (lang) => {
  if (commonLanguageColors[lang]) return commonLanguageColors[lang];
  if (languageColorCache.has(lang)) return languageColorCache.get(lang);

  let hash = 0;
  for (let i = 0; i < lang.length; i++) {
    hash = lang.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xff) % 200 + 55;
  const g = ((hash >> 8) & 0xff) % 200 + 55;
  const b = ((hash >> 16) & 0xff) % 200 + 55;
  const color = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  languageColorCache.set(lang, color);
  return color;
};

export const getLanguageColors = (languages) => {
  return languages.reduce((acc, lang) => {
    acc[lang] = getColorForLanguage(lang);
    return acc;
  }, {});
};
