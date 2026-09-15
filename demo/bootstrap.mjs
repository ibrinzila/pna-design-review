import {createDemoApi} from './demo-api.mjs';
const scenario=new URLSearchParams(location.search).get('state')||'ready';
const role=document.getElementById('editorial-workspace')||document.getElementById('review-list')?'editor':'citizen';
window.fetch=createDemoApi(window.PNA_DEMO_FIXTURES,scenario,role);
document.addEventListener('click',event=>{
 const anchor=event.target.closest('a');if(!anchor)return;
 const url=new URL(anchor.href,location.href);
 if(url.origin!==location.origin)return;
 const routes={'/recipisa/':'receipt.html?state=pending','/revizuire/':'moderation.html','/revizuire/explicatii/':'editorial.html'};
 if(url.pathname.startsWith('/actiune/')){event.preventDefault();location.href='action.html';return;}
 if(routes[url.pathname]){event.preventDefault();location.href=routes[url.pathname]+url.hash;return;}
 if(url.pathname.startsWith('/signin-with-chatgpt')||url.pathname.startsWith('/signout-with-chatgpt')){event.preventDefault();location.href='editorial.html?state='+ (scenario==='denied'?'ready':'denied');}
});
const state=new URLSearchParams(location.search).get('state')||'ready';
document.getElementById('demo-state').textContent=state+' · '+(role==='editor'&&state!=='denied'?'rol editor simulat':'fără rol editorial');
await import('./app.js?demo=20260915-v2');
if(document.getElementById('editorial-workspace'))await import('./editorial.js');
