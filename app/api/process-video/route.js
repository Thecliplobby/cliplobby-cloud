import {NextResponse} from 'next/server';
import OpenAI,{toFile} from 'openai';

const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
const secLabel=s=>{s=Math.max(0,Math.round(Number(s)||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const cloudUrl=(cloud,publicId,start,end)=>{
 const id=publicId.split('/').map(encodeURIComponent).join('/');
 const t=`so_${Math.max(0,start).toFixed(2)},eo_${Math.max(start+.5,end).toFixed(2)},c_fill,g_auto,w_1080,h_1920,q_auto:good,f_mp4`;
 return `https://res.cloudinary.com/${cloud}/video/upload/${t}/${id}.mp4`;
};
export async function POST(req){
 try{
  const {publicId,duration,source}=await req.json(); const cloud=process.env.CLOUDINARY_CLOUD_NAME;
  if(!publicId||!cloud) return NextResponse.json({error:'Missing uploaded video.'},{status:400});
  if(Number(duration)>1500) return NextResponse.json({error:'For V2 testing, use a video under 25 minutes. Multi-hour VOD chunking comes next.'},{status:400});
  // Ask Cloudinary for a compressed audio-only derivative so the server does not ingest the original video.
  const id=publicId.split('/').map(encodeURIComponent).join('/');
  const audioUrl=`https://res.cloudinary.com/${cloud}/video/upload/ac_mp3,br_64k/${id}.mp3`;
  const ar=await fetch(audioUrl); if(!ar.ok) throw new Error('Cloud audio conversion is still processing. Wait ~15 seconds and try again.');
  const buf=Buffer.from(await ar.arrayBuffer()); if(buf.length>24*1024*1024) throw new Error('Audio is too large for this V2 test. Try a shorter source.');
  const audio=await toFile(buf,'source.mp3',{type:'audio/mpeg'});
  const tr=await openai.audio.transcriptions.create({file:audio,model:'whisper-1',response_format:'verbose_json',timestamp_granularities:['segment']});
  const segments=(tr.segments||[]).map(s=>`[${Number(s.start).toFixed(1)}-${Number(s.end).toFixed(1)}] ${s.text}`).join('\n');
  const prompt=`You are the clip editor for ClipLobby. Find up to 6 self-contained, genuinely entertaining short-form moments from this timestamped transcript. Prefer funny reactions, escalation, surprising statements, arguments, fails, scares, absurdity, or clear setup/payoff. Do not invent anything. Each clip should usually be 15-60 seconds and must fit within the source duration. Return ONLY JSON with shape {"clips":[{"start":number,"end":number,"score":number,"hook":string,"caption":string,"reason":string}]}. Score 0-100. Hook <= 9 words. Caption <= 140 chars. Source: ${source||'video'}\nDuration: ${duration}s\nTRANSCRIPT:\n${segments}`;
  const rr=await openai.chat.completions.create({model:'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'user',content:prompt}]});
  const parsed=JSON.parse(rr.choices[0].message.content||'{"clips":[]}');
  const clips=(parsed.clips||[]).slice(0,6).map(c=>{let start=Math.max(0,Number(c.start)||0),end=Math.min(Number(duration)||999999,Number(c.end)||start+30);if(end-start<5)end=Math.min(Number(duration)||999999,start+15);return {...c,start,end,startLabel:secLabel(start),endLabel:secLabel(end),previewUrl:cloudUrl(cloud,publicId,start,end),approved:false}});
  return NextResponse.json({clips,transcript:tr.text});
 }catch(e){console.error(e);return NextResponse.json({error:e.message||'Video processing failed.'},{status:500})}
}
