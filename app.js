import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
const $ = (id) => document.getElementById(id);
let engine = null;
let recognition = null;
let speaking = false;

function setStatus(text){ $("status").textContent = text.toUpperCase(); }
function addMessage(role, text){
  const el=document.createElement("div");
  el.className=`bubble ${role}`;
  const label=document.createElement("b"); label.textContent=role==="assistant"?"JARVIS":"YOU";
  const p=document.createElement("p"); p.textContent=text;
  el.append(label,p); $("messages").append(el); $("messages").scrollTop=$("messages").scrollHeight;
}
function speak(text){
  if(!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  // Android/browser voice availability varies. Prefer Tamil voice when the reply contains Tamil.
  const tamil=/[\u0B80-\u0BFF]/.test(text);
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(v=>tamil && v.lang.toLowerCase().startsWith("ta")) ||
              voices.find(v=>!tamil && v.lang.toLowerCase().startsWith("en"));
  if(voice) utterance.voice=voice;
  utterance.lang=tamil?"ta-IN":"en-IN";
  utterance.rate=1; window.speechSynthesis.speak(utterance);
}
async function loadModel(){
  $("loadBtn").disabled=true; setStatus("Loading"); $("modelStatus").textContent="Downloading and preparing local model…";
  try{
    engine=await CreateMLCEngine(MODEL_ID,{
      initProgressCallback:(p)=>{
        const msg=p.text || "Preparing model…";
        $("modelStatus").textContent=msg;
        setStatus("Loading");
      }
    });
    $("modelStatus").textContent="Local AI ready • "+MODEL_ID;
    $("pulse")?.classList.add("ready"); setStatus("Online");
    addMessage("assistant","Local AI model loaded. கேளுங்கள்! Ask me in Tamil or English.");
  }catch(err){
    console.error(err); $("modelStatus").textContent="Could not load model. Check WebGPU, storage and connection.";
    setStatus("Error"); addMessage("assistant","I couldn't start the local model. Open this site in an up-to-date Chrome browser, check that WebGPU is supported, and try again. Details: "+err.message);
  }finally{$("loadBtn").disabled=false;}
}
async function send(text){
  const prompt=text.trim(); if(!prompt)return;
  addMessage("user",prompt); $("prompt").value="";
  if(!engine){addMessage("assistant","Please tap “Load local AI model” first.");return;}
  $("sendBtn").disabled=true; setStatus("Thinking"); $("modelStatus").textContent="Thinking locally…";
  try{
    const messages=[
      {role:"system",content:"You are JARVIS, a helpful, polite personal assistant. Understand Tamil and English. Reply in the same language the user uses. If the user mixes Tamil and English, respond naturally in Tanglish or mixed Tamil-English. Keep answers clear and concise. Do not claim to access phone apps, the internet, sensors, or live information unless a tool actually provides it."},
      {role:"user",content:prompt}
    ];
    const reply=await engine.chat.completions.create({messages,temperature:0.7,max_tokens:350});
    const answer=reply.choices?.[0]?.message?.content?.trim() || "I couldn't form a response.";
    addMessage("assistant",answer); speak(answer);
    $("modelStatus").textContent="Ready • running on this device"; setStatus("Online");
  }catch(err){console.error(err);addMessage("assistant","Something went wrong: "+err.message);setStatus("Error");}
  finally{$("sendBtn").disabled=false;}
}
function startVoice(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    addMessage("assistant","Voice recognition is not available in this browser. Please type your message, or use a supported Chrome browser.");
    return;
  }
  if(recognition){recognition.stop();recognition=null;}
  recognition=new SpeechRecognition();
  recognition.lang=$("voiceLanguage").value; // Choose Tamil or English voice input in the selector.
  recognition.interimResults=false; recognition.maxAlternatives=1;
  recognition.onstart=()=>{$("micBtn").classList.add("listening");$("micBtn").innerHTML="🔴 <span>Listening…</span>";setStatus("Listening");};
  recognition.onresult=(event)=>{const transcript=event.results[0][0].transcript;$("prompt").value=transcript;send(transcript);};
  recognition.onerror=(event)=>{addMessage("assistant","Voice input error: "+event.error+". You can type instead.");};
  recognition.onend=()=>{$("micBtn").classList.remove("listening");$("micBtn").innerHTML="🎙 <span>Speak</span>";if(engine)setStatus("Online");else setStatus("Ready");};
  recognition.start();
}
$("loadBtn").addEventListener("click",loadModel);
$("chatForm").addEventListener("submit",e=>{e.preventDefault();send($("prompt").value);});
$("micBtn").addEventListener("click",startVoice);
$("stopBtn").addEventListener("click",()=>window.speechSynthesis?.cancel());
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
if(!("gpu" in navigator)) $("modelStatus").textContent="WebGPU not detected • local AI may not run in this browser";

