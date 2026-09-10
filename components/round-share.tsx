'use client';
import {useState} from 'react';
import {Share2} from 'lucide-react';
export function RoundShare({title,endAt}:{title:string;endAt:string}){const [label,setLabel]=useState('Share');async function act(){const days=Math.max(0,Math.ceil((new Date(endAt).getTime()-Date.now())/86400000));const text=`${title} on VoteManiaX. Voting closes in ${days} day${days===1?'':'s'}.`;try{if(navigator.share)await navigator.share({title,text,url:location.href});else{await navigator.clipboard.writeText(`${text}\n${location.href}`);setLabel('Link copied');setTimeout(()=>setLabel('Share'),1800)}}catch{}}return <button className="share-button" onClick={act}><Share2 size={16}/>{label}</button>}
