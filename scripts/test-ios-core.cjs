// Differential tests against the actual web scoring functions, plus Swift state tests.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ts=require('../web/node_modules/typescript');
const root=path.resolve(__dirname,'..');process.chdir(root);
fs.mkdirSync('.ios-generated',{recursive:true});
const file=ts.createSourceFile('compare.tsx',fs.readFileSync('web/components/CompareView.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const names=['parseSpeed','qualityScore','speedScore','contextScore','valueScore','versatilityScore','scoreModel'];
const code=file.statements.filter(s=>ts.isFunctionDeclaration(s)&&names.includes(s.name?.text)).map(s=>s.getText(file)).join('\n');
const dims=[...fs.readFileSync('web/components/CompareView.tsx','utf8').matchAll(/id: '(\w+)', label: '[^']+', icon: \w+, weight: ([\d.]+)/g)].map(m=>({id:m[1],weight:Number(m[2])}));
if(dims.length!==5)throw Error('Scoring dimensions changed');
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
const score=new Function('ratingValue','DIMENSIONS',`const SPEED_MIN=5,SPEED_MAX=250;${js};return scoreModel;`)({poor:1,fair:2,good:3,excellent:4,exceptional:5},dims);
const models=JSON.parse(fs.readFileSync('AI Fact Checker/Resources/catalog.json')).companies.flatMap(c=>c.models);
fs.writeFileSync('.ios-generated/web-scores.json',JSON.stringify(Object.fromEntries(models.map(m=>[m.id,score(m)]))));
const env={...process.env,DEVELOPER_DIR:'/Applications/Xcode.app/Contents/Developer'};
const sdk=cp.execFileSync('xcrun',['--sdk','macosx','--show-sdk-path'],{env,encoding:'utf8'}).trim();
cp.execFileSync('xcrun',['swiftc','-sdk',sdk,'-target','arm64-apple-macos14.0','-module-cache-path','/tmp/aifc-test-module-cache','AI Fact Checker/Models.swift','AI Fact Checker/AIData.swift','AI Fact Checker/ModelScores.swift','AI Fact Checker/QuizSession.swift','tests/IOSCoreTests.swift','-o','.ios-generated/ios-core-tests'],{env,stdio:'inherit'});
cp.execFileSync('.ios-generated/ios-core-tests',[],{stdio:'inherit'});
