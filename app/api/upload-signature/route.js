import {NextResponse} from 'next/server';
import crypto from 'crypto';
export async function POST(){
 try{
  const cloudName=process.env.CLOUDINARY_CLOUD_NAME, apiKey=process.env.CLOUDINARY_API_KEY, secret=process.env.CLOUDINARY_API_SECRET;
  if(!cloudName||!apiKey||!secret) return NextResponse.json({error:'Cloudinary is not configured yet.'},{status:500});
  const timestamp=Math.floor(Date.now()/1000); const toSign=`folder=cliplobby&timestamp=${timestamp}${secret}`; const signature=crypto.createHash('sha1').update(toSign).digest('hex');
  return NextResponse.json({cloudName,apiKey,timestamp,signature});
 }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
