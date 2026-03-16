(function(){"use strict";
var TOOLS=["ha-device-health","ha-trace-viewer","ha-automation-analyzer","ha-backup-manager","ha-network-map","ha-smart-reports","ha-energy-optimizer","ha-sentence-manager","ha-chore-tracker","ha-baby-tracker","ha-cry-analyzer","ha-data-exporter","ha-storage-monitor","ha-security-check"];
var bentoCSS=null;
var patched=new WeakSet();
function injectCSS(sr){
  if(!sr||!bentoCSS)return;
  if(patched.has(sr))return;
  if(sr.querySelector("#bento-injected")){
    patched.add(sr);
    return;
  }
  var ns=document.createElement("style");
  ns.id="bento-injected";
  ns.textContent=bentoCSS;
  sr.appendChild(ns);
  patched.add(sr);
}
function findPanel(){
  try{
    var ha=document.querySelector("home-assistant");
    var m=ha.shadowRoot.querySelector("home-assistant-main");
    var d=m.shadowRoot.querySelector("ha-drawer");
    var r=d.querySelector("partial-panel-resolver");
    var p=r.querySelector("ha-panel-custom");
    var t=p.querySelector("ha-tools-panel");
    return t&&t.shadowRoot?t.shadowRoot:null;
  }catch(e){return null;}
}
var debounceTimer=null;
function patchAll(){
  if(debounceTimer)return;
  debounceTimer=setTimeout(function(){
    debounceTimer=null;
    var sr=findPanel();
    if(!sr||!bentoCSS)return;
    injectCSS(sr);
    TOOLS.forEach(function(tag){
      var el=sr.querySelector(tag);
      if(el&&el.shadowRoot)injectCSS(el.shadowRoot);
    });
  },200);
}
function init(){
  fetch("/local/community/ha-bento-patcher/ha-bento-patcher.css?v="+Date.now(),{cache:"no-store"})
  .then(function(r){return r.ok?r.text():fetch("/local/community/ha-bento-patcher.css?v="+Date.now(),{cache:"no-store"}).then(function(r2){return r2.text();});})
  .then(function(css){
    bentoCSS=css;
    patchAll();
    setInterval(patchAll,3000);
    var obs=new MutationObserver(patchAll);
    if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  });
}
if(document.readyState==="complete")init();
else window.addEventListener("load",init);
})();
