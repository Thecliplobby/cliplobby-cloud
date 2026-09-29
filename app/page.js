'use client';
import {useState} from 'react';
export default function Home(){
 const [source,setSource]=useState(''); const [transcript,setTranscript]=useState(''); const [clips,setClips]=useState([]); const [busy,setBusy]=useState(false); const [err,setErr]=useState('');
 async function analyze(){setBusy(true);setErr('');try{const r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({source,transcript})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Analysis failed');setClips(j.clips||[])}catch(e){setErr(e.message)}finally{setBusy(false)}}
 function toggle(i){setClips(c=>c.map((x,n)=>n===i?{...x,approved:!x.approved}:x))}
 return <main><header><div className="brand"><span>CL</span><div><b>ClipLobby</b><small>CONTENT DESK</small></div></div><div className="pill">● CLOUD V1</div></header>
 <section className="hero"><p className="eyebrow">AI-ASSISTED SHORT-FORM WORKFLOW</p><h1>Find the moments.<br/><em>You make the call.</em></h1><p>Analyze authorized source material, generate candidate hooks and timestamps, then approve the clips worth producing.</p></section>
 <section className="panel"><h2>New source</h2><label>Source label or authorized URL</label><input value={source} onChange={e=>setSource(e.target.value)} placeholder="Creator / VOD title / authorized URL"/><label>Transcript</label><textarea value={transcript} onChange={e=>setTranscript(e.target.value)} placeholder="Paste a transcript here. V1 analyzes transcript text so no software needs to run on your Mac."/><button disabled={busy||transcript.trim().length<80} onClick={analyze}>{busy?'Finding moments…':'Find clip candidates'}</button>{err&&<p className="error">{err}</p>}</section>
 {clips.length>0&&<section><div className="row"><h2>Candidate queue</h2><span>{clips.filter(x=>x.approved).length} approved</span></div><div className="grid">{clips.map((c,i)=><article key={i} className={c.approved?'approved':''}><div className="score">{c.score||'—'}</div><h3>{c.hook}</h3><p>{c.reason}</p><div className="meta">{c.start} → {c.end}</div><p className="caption">{c.caption}</p><button className="secondary" onClick={()=>toggle(i)}>{c.approved?'✓ Approved':'Approve'}</button></article>)}</div></section>}
 <footer>ClipLobby Cloud V1 · Use only source material you’re authorized to repurpose.</footer></main>
}
