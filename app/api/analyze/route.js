import OpenAI from 'openai';
export async function POST(req){
 try{const {source='',transcript=''}=await req.json(); if(!transcript||transcript.length<80)return Response.json({error:'Paste a longer transcript first.'},{status:400}); if(!process.env.OPENAI_API_KEY)return Response.json({error:'OPENAI_API_KEY is not configured on the host.'},{status:500});
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const prompt=`You are the editorial producer for ClipLobby, a short-form entertainment page. Analyze ONLY the supplied transcript from authorized source material. Find up to 8 self-contained funny, surprising, tense, awkward, high-energy, or payoff-heavy moments. Do not invent timestamps. If timestamps are absent, use descriptive markers like "near: exact opening words". Favor moments understandable without deep context. Return JSON object {"clips":[{"start":"...","end":"...","hook":"...","caption":"...","reason":"...","score":1-100}]}. Hooks should be punchy but not misleading. Source: ${source}\nTRANSCRIPT:\n${transcript.slice(0,100000)}`;
 const out=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-5-mini',input:prompt,text:{format:{type:'json_object'}}});
 const parsed=JSON.parse(out.output_text); return Response.json(parsed);
 }catch(e){return Response.json({error:e.message||'Unexpected error'},{status:500})}
}
