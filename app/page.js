'use client';
import {useRef,useState} from 'react';

export default function Home(){
 const fileRef=useRef(null);
 const [file,setFile]=useState(null); const [source,setSource]=useState(''); const [clips,setClips]=useState([]); const [busy,setBusy]=useState(false); const [status,setStatus]=useState(''); const [err,setErr]=useState('');
 async function uploadAndProcess(){
  if(!file)return;
  setBusy(true);setErr('');setClips([]);
  try{
   setStatus('Preparing secure upload…');
   const sr=await fetch('/api/upload-signature',{method:'POST'}); const sig=await sr.json(); if(!sr.ok) throw new Error(sig.error||'Could not prepare upload');
   setStatus('Uploading video to the cloud…');
   const fd=new FormData(); fd.append('file',file); fd.append('api_key',sig.apiKey); fd.append('timestamp',String(sig.timestamp)); fd.append('signature',sig.signature); fd.append('folder','cliplobby'); fd.append('resource_type','video');
   const ur=await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`,{method:'POST',body:fd}); const up=await ur.json(); if(!ur.ok) throw new Error(up.error?.message||'Video upload failed');
   setStatus('Transcribing and finding funny moments…');
   const pr=await fetch('/api/process-video',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({publicId:up.public_id,duration:up.duration,source:source||file.name})});
   const out=await pr.json(); if(!pr.ok) throw new Error(out.error||'Processing failed');
   setClips(out.clips||[]); setStatus('');
  }catch(e){setErr(e.message);setStatus('')}finally{setBusy(false)}
 }
 function toggle(i){setClips(c=>c.map((x,n)=>n===i?{...x,approved:!x.approved}:x))}
 return <main><header><div className="brand"><span>CL</span><div><b>ClipLobby</b><small>CONTENT DESK</small></div></div><div className="pill">● CLOUD V2</div></header>
 <section className="hero"><p className="eyebrow">AI-ASSISTED SHORT-FORM WORKFLOW</p><h1>Upload the stream.<br/><em>Find the moments.</em></h1><p>Upload authorized source video. ClipLobby transcribes it, finds candidate moments, and builds vertical previews you can approve.</p></section>
 <section className="panel"><h2>Process a video</h2><label>Source / creator label</label><input value={source} onChange={e=>setSource(e.target.value)} placeholder="e.g. Creator — Horror Stream"/>
 <label>Authorized video file</label><div className="drop" onClick={()=>fileRef.current?.click()}><input ref={fileRef} type="file" accept="video/*" hidden onChange={e=>setFile(e.target.files?.[0]||null)}/><b>{file?file.name:'Choose a video'}</b><small>{file?`${(file.size/1024/1024).toFixed(1)} MB`:'MP4, MOV, M4V or other browser-supported video'}</small></div>
 <button disabled={busy||!file} onClick={uploadAndProcess}>{busy?'Working…':'Upload & find clips'}</button>{status&&<p className="status">{status}</p>}{err&&<p className="error">{err}</p>}<p className="hint">V2 is best for shorter test videos first. Long multi-hour VOD chunking is the next upgrade.</p></section>
 {clips.length>0&&<section><div className="row"><h2>Candidate queue</h2><span>{clips.filter(x=>x.approved).length} approved</span></div><div className="grid">{clips.map((c,i)=><article key={i} className={c.approved?'approved':''}><video src={c.previewUrl} controls playsInline preload="metadata"/><div className="score">{c.score||'—'}</div><h3>{c.hook}</h3><p>{c.reason}</p><div className="meta">{c.startLabel} → {c.endLabel}</div><p className="caption">{c.caption}</p><button className="secondary" onClick={()=>toggle(i)}>{c.approved?'✓ Approved':'Approve'}</button><a className="link" href={c.previewUrl} target="_blank" rel="noreferrer">Open vertical preview ↗</a></article>)}</div></section>}
 <footer>ClipLobby Cloud V2 · Upload only source material you’re authorized to repurpose.</footer></main>
}
