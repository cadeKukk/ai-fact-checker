// Export the authoritative web catalog. Run: node scripts/sync-ios-content.cjs
const fs = require('fs');
const path = require('path');
const ts = require('../web/node_modules/typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', code)(id => load(path.resolve(path.dirname(file), id + '.ts')), module, module.exports);
  return module.exports;
}
const data = name => load(path.join(root, 'web/data', name + '.ts'));
const { companies, getAllSources } = data('companies');
const meta = load(path.join(root, 'web/lib/appMeta.ts'));
const visualSource = fs.readFileSync(path.join(root, 'web/components/practice/TermVisuals.tsx'), 'utf8');
const playableTermIDs = [...visualSource.matchAll(/['"]?(term-[a-z0-9-]+)['"]?:\s*\w+/g)].map(m => m[1]);
const catalog = { companies, sources: getAllSources(), facts: data('factcheck').factCheckQAs, terms: data('terms').allTerms, lessons: data('lessons').lessons, advancedLessons: data('advancedLessons').advancedLessons, benchmarks: data('benchmarks').benchmarks, playableTermIDs, version: meta.APP_VERSION, lastUpdated: meta.LAST_UPDATED, dataSnapshot: meta.DATA_SNAPSHOT };
for (const key of ['companies', 'sources', 'facts', 'terms', 'benchmarks']) {
  const ids = catalog[key].map(x => key === 'sources' ? x.url : x.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate IDs in ' + key);
}
if (playableTermIDs.length !== 46 || playableTermIDs.some(id => !catalog.terms.some(t => t.id === id))) throw new Error('Practice visual mapping changed; review exporter');
fs.writeFileSync(path.join(root, 'AI Fact Checker/Resources/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify({ companies: companies.length, models: companies.flatMap(c => c.models).length, facts: catalog.facts.length, sources: catalog.sources.length, terms: catalog.terms.length, lessons: catalog.lessons.length, advancedLessons: catalog.advancedLessons.length, playable: playableTermIDs.length }));
