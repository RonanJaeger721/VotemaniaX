import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { subscribers } from '@/db/schema';

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request:Request){try{const body=await request.json() as {email?:unknown};const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';if(!emailPattern.test(email)||email.length>254)return NextResponse.json({message:'Enter a valid email address.'},{status:400});await getDb().insert(subscribers).values({email,active:true,createdAt:new Date()}).onConflictDoUpdate({target:subscribers.email,set:{active:true}});return NextResponse.json({ok:true,message:'You’re on the VoteManiaX list.'})}catch{return NextResponse.json({message:'Subscriptions are temporarily unavailable.'},{status:500})}}
