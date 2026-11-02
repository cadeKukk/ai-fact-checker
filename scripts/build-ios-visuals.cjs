// Reuse the web's illustrations without a server or remote app wrapper.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const webpack = require('../web/node_modules/next/dist/compiled/webpack/webpack').webpack;
const out = path.join(root, 'AI Fact Checker/Resources');
const temp = path.join(root, '.ios-generated');
fs.mkdirSync(temp, {recursive:true});
const source = fs.readFileSync(path.join(root, 'web/components/GettingStartedView.tsx'), 'utf8');
const icons = source.slice(source.indexOf('import {\n'), source.indexOf("} from 'lucide-react'") + "} from 'lucide-react'".length);
const base = source.slice(source.indexOf('function useFadeIn'), source.indexOf('// MARK: - Main View')) + source.slice(source.indexOf('function TokenizerAnimation'));
fs.writeFileSync(path.join(temp, 'fundamentals.tsx'), `import {useState,useCallback,useEffect,useRef} from 'react';\n${icons}\nconst SPRING='cubic-bezier(0.2,0.8,0.2,1)';const SPRING_BOUNCE='cubic-bezier(0.34,1.56,0.64,1)';\nfunction hexToRgba(hex:string,a:number){const n=parseInt(hex.slice(1),16);return 'rgba('+[(n>>16)&255,(n>>8)&255,n&255,a].join(',')+')';}\n${base}\nexport {TokenizerAnimation,NextWordAnimation,ConfidenceMeterAnimation,RedFlagQuizAnimation,ParameterScaleAnimation,NeuralNetworkAnimation,EmbeddingFieldAnimation};`);
fs.writeFileSync(path.join(temp, 'entry.tsx'), `import React from 'react';import{createRoot}from'react-dom/client';import * as A from '../web/components/AdvancedVisuals';import * as F from './fundamentals';import TermVisual,{TERM_VISUAL_KEYFRAMES}from '../web/components/practice/TermVisuals';
const map={layerStack:A.LayerStack3D,attention:A.AttentionPlayground,moeRouter:A.MoERouter,trainingStages:A.TrainingStages,thinkingBudget:A.ThinkingBudget,agentLoop:A.AgentLoopSim,chartCrime:A.ChartCrime,injectionDemo:A.InjectionDemo,quantizeSlider:A.QuantizeSlider,tokenizer:F.TokenizerAnimation,nextWord:F.NextWordAnimation,confidenceMeter:F.ConfidenceMeterAnimation,quiz:F.RedFlagQuizAnimation,parameterScale:F.ParameterScaleAnimation,neuralNetwork:F.NeuralNetworkAnimation,embedding:F.EmbeddingFieldAnimation};
const p=new URLSearchParams(location.search);const type=p.get('type');const Widget=map[type];const color=p.get('color')||'#7065f0';createRoot(document.getElementById('root')).render(<><style>{TERM_VISUAL_KEYFRAMES}</style>{type==='term'?<TermVisual termId={p.get('id')} className="w-full h-auto"/>:Widget?<Widget color={color}/>:null}</>);
new ResizeObserver(()=>{window.webkit?.messageHandlers?.size?.postMessage(Math.ceil(document.getElementById('root').getBoundingClientRect().height))}).observe(document.getElementById('root'));
`);
async function build(){
 await new Promise((resolve,reject)=>webpack({mode:'production',optimization:{minimize:false},entry:path.join(temp,'entry.tsx'),output:{path:out,filename:'visuals.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':path.join(root,'web')},modules:[path.join(root,'web/node_modules'),'node_modules']},module:{rules:[{test:/\.tsx?$/,use:path.join(__dirname,'ios-typescript-loader.cjs')}]},performance:{hints:false}},(err,stats)=>{if(err||stats.hasErrors())reject(err||stats.toString({all:false,errors:true}));else resolve()}));
 const postcss=require('../web/node_modules/postcss'); const tailwind=require('../web/node_modules/@tailwindcss/postcss/dist/index.js');
 const css=await postcss([tailwind({base:root})]).process(`@import "tailwindcss"; @source "../web/components"; @source "../.ios-generated";`,{from:path.join(root,'web/ios-visuals.css')});
 fs.writeFileSync(path.join(out,'visuals.css'),css.css+`\n@font-face{font-family:Outfit;src:url('Outfit.ttf')}html,body{margin:0;background:#151517;color:#f5f5f5;font-family:Outfit,sans-serif}#root{padding:12px;overflow:hidden}button,input{touch-action:manipulation}svg{max-width:100%}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`);
 fs.writeFileSync(path.join(out,'visuals.html'),'<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; font-src \'self\'; img-src \'self\' data:; connect-src \'none\'"><link rel="stylesheet" href="visuals.css"></head><body><div id="root"></div><script src="visuals.js"></script></body></html>');
 console.log('Bundled offline course and practice illustrations.');
}
build().catch(e=>{console.error(e);process.exit(1)});
