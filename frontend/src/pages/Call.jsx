import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, CameraOff, Check, Maximize2, Mic, MicOff, MessageCircle, PhoneOff, Send, ShieldCheck, Volume2, X, Video, Phone, MoreHorizontal } from 'lucide-react';
import { onChildAdded, onDisconnect, onValue, push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth, realtimeDb, firebaseConfigured, firebaseStorage } from '../firebase';
import { useAuth } from '../context/AuthContext'; import api from '../api'; import './Call.css';
const randomId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`; const chatId=(a,b)=>[Number(a),Number(b)].sort((x,y)=>x-y).join('_');
const initials=(name='Student')=>name.split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'S';
async function ensureFirebase(){if(!firebaseConfigured||!firebaseAuth||!realtimeDb)throw new Error('Realtime calling is not configured. Add Firebase variables and enable Anonymous Authentication.');if(!firebaseAuth.currentUser)await signInAnonymously(firebaseAuth);}
export default function Call(){const {user}=useAuth();const navigate=useNavigate();const location=useLocation();const [params]=useSearchParams();const incoming=params.get('incoming')==='1';const callId=params.get('callId')||useMemo(randomId,[]);const targetId=Number(params.get('userId'));const targetName=params.get('name')||'SkillSwap student';const sessionId=params.get('sessionId');const initialMode=location.pathname.includes('video-call')?'video':'audio';
const pcRef=useRef(null),streamRef=useRef(null),localVideoRef=useRef(null),remoteVideoRef=useRef(null),remoteAudioRef=useRef(null),remoteStreamRef=useRef(null),cleanupRef=useRef([]),chatCleanupRef=useRef([]),candidateQueueRef=useRef([]),remoteReadyRef=useRef(false),endedRef=useRef(false),connectedRef=useRef(false),completingRef=useRef(false),startedAtRef=useRef(0),callGenerationRef=useRef(0),finishRef=useRef(null);
const callRef=useMemo(()=>realtimeDb?ref(realtimeDb,`calls/${callId}`):null,[callId]);
const [mode,setMode]=useState(initialMode),[status,setStatus]=useState(incoming?'Connecting':'Calling'),[error,setError]=useState(''),[muted,setMuted]=useState(false),[cameraOff,setCameraOff]=useState(initialMode==='audio'),[chatOpen,setChatOpen]=useState(false),[elapsed,setElapsed]=useState(0),[messages,setMessages]=useState([]),[message,setMessage]=useState(''),[chatReady,setChatReady]=useState(false),[fullscreen,setFullscreen]=useState(false),[switching,setSwitching]=useState(false),[remoteReady,setRemoteReady]=useState(false),[speakerOn,setSpeakerOn]=useState(false);
const [sessionMeta,setSessionMeta]=useState(null),[sessionRemaining,setSessionRemaining]=useState(null),[sessionSummary,setSessionSummary]=useState(null);
const cleanup=useCallback(()=>{cleanupRef.current.forEach(fn=>{try{fn()}catch{}});cleanupRef.current=[]},[]);
const cleanupChat=useCallback(()=>{chatCleanupRef.current.forEach(fn=>{try{fn()}catch{}});chatCleanupRef.current=[]},[]);
const stopMedia=useCallback(()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(localVideoRef.current)localVideoRef.current.srcObject=null;if(remoteVideoRef.current)remoteVideoRef.current.srcObject=null;if(remoteAudioRef.current)remoteAudioRef.current.srcObject=null;const pc=pcRef.current;pcRef.current=null;if(pc){try{pc.ontrack=null;pc.onicecandidate=null;pc.onconnectionstatechange=null;pc.oniceconnectionstatechange=null;pc.close()}catch{}}},[]);
const completeSession=useCallback(async(reason='COMPLETED')=>{if(!sessionId||completingRef.current)return;completingRef.current=true;try{await api.put(`/sessions/${sessionId}/complete`,{reason})}catch{}},[sessionId]);
const finish=useCallback(async(remote=false,reason='USER_ENDED')=>{if(endedRef.current)return;endedRef.current=true;callGenerationRef.current+=1;const completesLesson=reason==='USER_ENDED'||reason==='TIME_EXPIRED';setStatus(reason==='TIME_EXPIRED'?'Time is up':remote?'Participant left':'Ending session');try{if(callRef)await update(callRef,{status:'ENDED',endReason:reason,endedAt:serverTimestamp(),endedBy:Number(user.id)});if(callRef){await remove(ref(realtimeDb,`incomingCalls/${user.id}/${callId}`));await remove(ref(realtimeDb,`incomingCalls/${targetId}/${callId}`))}}catch{}if(sessionId&&completesLesson)await completeSession(reason);const usedSeconds=sessionMeta?.started_at?Math.max(0,Math.floor((Date.now()-new Date(sessionMeta.started_at).getTime())/1000)):elapsed;setSessionSummary(completesLesson?{reason,duration:usedSeconds}:null);cleanup();cleanupChat();stopMedia();window.setTimeout(()=>navigate(sessionId?'/sessions':'/messages',{replace:true}),completesLesson&&sessionId?2500:300)},[callRef,callId,cleanup,cleanupChat,completeSession,navigate,sessionId,stopMedia,targetId,user.id,sessionMeta,elapsed]);
finishRef.current=finish;
useEffect(()=>{if(!sessionId)return;let active=true;const loadSession=async()=>{try{const r=await api.get(`/sessions/${sessionId}`);if(active)setSessionMeta(r.data.session)}catch{if(active)setError('Could not load the session timer.')}};loadSession();const poll=setInterval(loadSession,5000);return()=>{active=false;clearInterval(poll)}},[sessionId]);

useEffect(()=>{if(!sessionId||!sessionMeta||sessionMeta.status==='COMPLETED'||sessionMeta.status==='CANCELLED')return;const start=new Date(sessionMeta.scheduled_at).getTime();const now=Date.now();if(now>=start){api.put(`/sessions/${sessionId}/start`).then(()=>api.get(`/sessions/${sessionId}`)).then(r=>setSessionMeta(r.data.session)).catch(e=>{if(e?.response?.status!==400&&e?.response?.status!==409)setError(e?.response?.data?.message||'This lesson cannot be started yet.')});}},[sessionId,sessionMeta?.scheduled_at,sessionMeta?.status]);

useEffect(()=>{if(!sessionMeta?.started_at||!sessionMeta?.duration_minutes)return;const tick=()=>{const start=new Date(sessionMeta.started_at).getTime();const end=start+Number(sessionMeta.duration_minutes)*60000;const now=Date.now();const remaining=Math.max(0,end-now);setSessionRemaining(Math.ceil(remaining/1000));setElapsed(Math.max(0,Math.floor((now-start)/1000)));if(remaining<=0&&!endedRef.current)finish(false,'TIME_EXPIRED')};tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer)},[sessionMeta,finish]);

useEffect(()=>{if(sessionMeta?.status==='COMPLETED'&&!endedRef.current)finish(true,sessionMeta.end_reason||'TIME_EXPIRED')},[sessionMeta,finish]);

const buildPeer=useCallback(async()=>{
  await ensureFirebase();
  if(!callRef||!targetId)throw new Error('The other participant is missing.');
  if(pcRef.current&&!['closed','failed'].includes(pcRef.current.connectionState))return;

  const generation=++callGenerationRef.current;
  const isLive=()=>generation===callGenerationRef.current&&!endedRef.current;
  const isOpen=pc=>isLive()&&pcRef.current===pc&&pc.signalingState!=='closed'&&pc.connectionState!=='closed';
  const iceServers=[
    {urls:'stun:stun.l.google.com:19302'},
    {urls:'stun:stun1.l.google.com:19302'},
    {urls:'stun:stun2.l.google.com:19302'},
    ...(import.meta.env.VITE_TURN_URL&&import.meta.env.VITE_TURN_USERNAME&&import.meta.env.VITE_TURN_CREDENTIAL
      ? [{urls:import.meta.env.VITE_TURN_URL,username:import.meta.env.VITE_TURN_USERNAME,credential:import.meta.env.VITE_TURN_CREDENTIAL}]
      : [])
  ];

  const pc=new RTCPeerConnection({iceServers,bundlePolicy:'max-bundle',rtcpMuxPolicy:'require'});
  pcRef.current=pc;
  remoteReadyRef.current=false;
  candidateQueueRef.current=[];
  remoteStreamRef.current=new MediaStream();

  const audioTransceiver=pc.addTransceiver('audio',{direction:'sendrecv'});
  const videoTransceiver=initialMode==='video'
    ? pc.addTransceiver('video',{direction:'sendrecv'})
    : null;

  const closeIfCurrent=()=>{
    if(pcRef.current!==pc)return;
    try{
      pc.ontrack=null;pc.onicecandidate=null;pc.onconnectionstatechange=null;pc.oniceconnectionstatechange=null;
      pc.close();
    }catch{}
    pcRef.current=null;
  };
  const failIfStale=()=>!isOpen(pc);

  try{
    const constraints=initialMode==='video'
      ? {audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:{width:{ideal:1280,max:1920},height:{ideal:720,max:1080},facingMode:'user'}}
      : {audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false};

    let media;
    try{
      media=await navigator.mediaDevices.getUserMedia(constraints);
    }catch(error){
      if(error?.name==='AbortError'){
        await new Promise(resolve=>setTimeout(resolve,350));
        if(failIfStale())return;
        media=await navigator.mediaDevices.getUserMedia(constraints);
      }else throw error;
    }

    if(failIfStale()){media.getTracks().forEach(t=>t.stop());closeIfCurrent();return;}
    streamRef.current=media;

    const audioTrack=media.getAudioTracks()[0];
    if(!audioTrack)throw new Error('Microphone was not available. Allow microphone access and try again.');
    if(failIfStale()){media.getTracks().forEach(t=>t.stop());return;}
    await audioTransceiver.sender.replaceTrack(audioTrack);
    if(failIfStale()){media.getTracks().forEach(t=>t.stop());return;}

    if(videoTransceiver){
      const videoTrack=media.getVideoTracks()[0];
      if(!videoTrack)throw new Error('Camera was not available. Allow camera access and try again.');
      await videoTransceiver.sender.replaceTrack(videoTrack);
    }
    if(failIfStale()){media.getTracks().forEach(t=>t.stop());return;}

    if(localVideoRef.current)localVideoRef.current.srcObject=media;

    pc.ontrack=event=>{
      if(!isOpen(pc))return;
      const remote=remoteStreamRef.current||new MediaStream();
      remoteStreamRef.current=remote;
      if(event.streams?.[0]){
        for(const track of event.streams[0].getTracks()){
          if(!remote.getTracks().some(t=>t.id===track.id))remote.addTrack(track);
        }
      }else if(!remote.getTracks().some(t=>t.id===event.track.id))remote.addTrack(event.track);
      if(remoteVideoRef.current)remoteVideoRef.current.srcObject=remote;
      if(remoteAudioRef.current)remoteAudioRef.current.srcObject=remote;
      setRemoteReady(true);
      remoteAudioRef.current?.play().catch(()=>{});
      remoteVideoRef.current?.play().catch(()=>{});
    };

    const markConnected=()=>{
      if(!isOpen(pc))return;
      if(pc.connectionState==='connected'||pc.iceConnectionState==='connected'||pc.iceConnectionState==='completed'){
        if(!connectedRef.current){connectedRef.current=true;startedAtRef.current=Date.now();}
        setStatus('Connected');
      }
    };
    pc.onconnectionstatechange=()=>{
      if(!isOpen(pc))return;
      markConnected();
      if(pc.connectionState==='disconnected')setStatus('Reconnecting…');
      if(pc.connectionState==='failed'&&!endedRef.current){
        setStatus('Connection failed');
        setError(import.meta.env.VITE_TURN_URL
          ? 'The network could not establish a media path. Check your TURN server credentials.'
          : 'Phone-to-laptop calls may require a TURN server on different networks. Add VITE_TURN_URL, VITE_TURN_USERNAME and VITE_TURN_CREDENTIAL to your frontend environment.');
      }
    };
    pc.oniceconnectionstatechange=()=>{
      if(!isOpen(pc))return;
      markConnected();
      if(pc.iceConnectionState==='disconnected')setStatus('Reconnecting…');
      if(pc.iceConnectionState==='failed'&&!endedRef.current){
        setStatus('Connection failed');
        setError(import.meta.env.VITE_TURN_URL
          ? 'ICE failed. Verify the TURN server and credentials.'
          : 'ICE failed between these networks. A TURN server is required for reliable phone-to-laptop calls across restrictive networks.');
      }
    };

    const ownCandidates=incoming?'receiverCandidates':'callerCandidates';
    const remoteCandidates=incoming?'callerCandidates':'receiverCandidates';
    pc.onicecandidate=event=>{
      if(!event.candidate||!isOpen(pc))return;
      push(ref(realtimeDb,`calls/${callId}/${ownCandidates}`),event.candidate.toJSON()).catch(()=>{});
    };

    const addCandidate=async candidate=>{
      if(!isOpen(pc)||!candidate)return;
      try{await pc.addIceCandidate(new RTCIceCandidate(candidate));}
      catch(error){
        if(error?.name!=='InvalidStateError'&&isOpen(pc))console.warn('ICE candidate rejected',error);
      }
    };
    const flushCandidates=async()=>{
      if(!isOpen(pc)||!remoteReadyRef.current)return;
      const pending=candidateQueueRef.current.splice(0);
      for(const candidate of pending){if(!isOpen(pc))break;await addCandidate(candidate);}
    };

    const applyRemoteDescription=async description=>{
      if(!isOpen(pc)||!description)return false;
      try{
        if(description.type==='offer'&&pc.signalingState!=='stable')return false;
        if(description.type==='answer'&&pc.signalingState!=='have-local-offer')return false;
        await pc.setRemoteDescription(new RTCSessionDescription(description));
        if(!isOpen(pc))return false;
        remoteReadyRef.current=true;
        await flushCandidates();
        return true;
      }catch(error){
        if(isOpen(pc)&&error?.name!=='InvalidStateError')setError(`WebRTC negotiation failed: ${error?.message||error?.name||'unknown error'}`);
        return false;
      }
    };

    const callUnsub=onValue(callRef,async snap=>{
      const data=snap.val();
      if(!data||!isLive())return;
      if(data.status==='ENDED'){
        finishRef.current?.(true,data.endReason||'REMOTE_ENDED');
        return;
      }
      try{
        if(incoming){
          if(data.offer&&!remoteReadyRef.current){
            const applied=await applyRemoteDescription(data.offer);
            if(!applied||!isOpen(pc))return;
            const answer=await pc.createAnswer();
            if(!isOpen(pc))return;
            await pc.setLocalDescription(answer);
            if(!isOpen(pc))return;
            await update(callRef,{answer:{type:answer.type,sdp:answer.sdp},status:'ACTIVE',answeredAt:serverTimestamp()});
            if(isOpen(pc))setStatus('Connecting');
          }
        }else if(data.answer&&!remoteReadyRef.current){
          await applyRemoteDescription(data.answer);
        }
      }catch(error){
        if(isOpen(pc)&&!endedRef.current)setError(`Could not complete the call setup: ${error?.message||error?.name||'unknown error'}`);
      }
    });
    cleanupRef.current.push(callUnsub);

    const candidateUnsub=onChildAdded(ref(realtimeDb,`calls/${callId}/${remoteCandidates}`),async snap=>{
      const candidate=snap.val();
      if(!candidate||!isOpen(pc))return;
      if(!remoteReadyRef.current)candidateQueueRef.current.push(candidate);
      else await addCandidate(candidate);
    });
    cleanupRef.current.push(candidateUnsub);

    await onDisconnect(callRef).update({status:'ENDED',endReason:'DISCONNECTED',endedAt:serverTimestamp(),endedBy:Number(user.id)});
    if(failIfStale())return;

    if(!incoming){
      const offer=await pc.createOffer({offerToReceiveAudio:true,offerToReceiveVideo:initialMode==='video'});
      if(failIfStale())return;
      await pc.setLocalDescription(offer);
      if(failIfStale())return;
      await update(callRef,{
        callerId:Number(user.id),calleeId:targetId,callerName:user.name,
        type:initialMode==='video'?'video':'voice',status:'RINGING',
        offer:{type:offer.type,sdp:offer.sdp},createdAt:serverTimestamp()
      });
      if(failIfStale())return;
      await set(ref(realtimeDb,`incomingCalls/${targetId}/${callId}`),{
        callerId:Number(user.id),callerName:user.name,type:initialMode==='video'?'video':'voice',status:'RINGING',createdAt:Date.now()
      });
    }
  }catch(error){
    if(isLive()){
      const msg=error?.name==='NotAllowedError'
        ? 'Microphone/camera permission was denied. Allow access and try again.'
        : error?.name==='AbortError'
          ? 'The browser aborted media access. Close any other app using the microphone/camera and try again.'
          : error?.message||'Could not start the call.';
      setError(msg);setStatus('Unavailable');
    }
    closeIfCurrent();
  }
},[callId,callRef,incoming,initialMode,targetId,user.id,user.name]);

useEffect(()=>{
  let disposed=false;
  (async()=>{
    try{
      await buildPeer();
      if(disposed){callGenerationRef.current+=1;cleanup();stopMedia();}
    }catch(error){
      if(!disposed&&!endedRef.current){setError(error?.message||'Could not start the call.');setStatus('Unavailable');}
    }
  })();
  return()=>{
    disposed=true;
    callGenerationRef.current+=1;
    cleanup();
    stopMedia();
  };
},[buildPeer,cleanup,stopMedia]);

useEffect(()=>{
  if(sessionId)return;
  const timer=setInterval(()=>{
    if(connectedRef.current&&startedAtRef.current)setElapsed(Math.floor((Date.now()-startedAtRef.current)/1000));
  },1000);
  return()=>clearInterval(timer);
},[sessionId]);

useEffect(()=>{
  if(!chatOpen||!targetId)return;
  let off=false;
  ensureFirebase().then(()=>{
    if(off)return;
    setChatReady(true);
    const unsub=onValue(ref(realtimeDb,`chats/${chatId(user.id,targetId)}/messages`),s=>{
      const v=s.val()||{};
      setMessages(Object.entries(v).map(([id,x])=>({id,...x})).sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0)));
    });
    chatCleanupRef.current.push(unsub);
  }).catch(error=>{if(!off)setError(error.message)});
  return()=>{off=true;setChatReady(false);cleanupChat()};
},[chatOpen,targetId,user.id,cleanupChat]);

const toggleMute=()=>{const t=streamRef.current?.getAudioTracks()[0];if(!t)return;t.enabled=!t.enabled;setMuted(!t.enabled)};
const toggleSpeaker=async()=>{
  const audio=remoteAudioRef.current;if(!audio)return;
  try{
    if(typeof audio.setSinkId!=='function'){setError('This browser does not expose speaker/output selection. Use the phone or computer audio-output control.');return;}
    if(!speakerOn){
      let sinkId='default';
      if(typeof navigator.mediaDevices?.selectAudioOutput==='function'){
        try{const device=await navigator.mediaDevices.selectAudioOutput();if(device?.deviceId)sinkId=device.deviceId}catch(e){if(e?.name==='NotAllowedError')return;throw e}
      }
      await audio.setSinkId(sinkId);setSpeakerOn(true);
    }else{await audio.setSinkId('default');setSpeakerOn(false)}
    await audio.play().catch(()=>{});
  }catch(e){setError(e?.message||'Could not change the call audio output.');}
};
const switchMode=async()=>{
  // Voice and video are separate negotiated call types. Do not mutate an audio-only
  // SDP session into video without a full renegotiation; that was causing one-way
  // media and closed-peer errors on phone/laptop calls.
  if(mode==='audio'){
    setError('This is an audio-only call. End this call and start a Video Call for two-way audio + video.');
    return;
  }
  const pc=pcRef.current;
  if(switching||!pc||endedRef.current||pc.signalingState==='closed'||pc.connectionState==='closed')return;
  setSwitching(true);
  try{
    const sender=pc.getSenders().find(s=>s.track?.kind==='video');
    if(!sender){setError('The video channel is not available. Start a new Video Call.');return;}
    const oldTrack=sender.track;
    if(pcRef.current!==pc||pc.signalingState==='closed')return;
    await sender.replaceTrack(null);
    oldTrack?.stop();
    const audio=streamRef.current?.getAudioTracks()[0];
    streamRef.current=audio?new MediaStream([audio]):new MediaStream();
    if(localVideoRef.current)localVideoRef.current.srcObject=streamRef.current;
    setMode('audio');setCameraOff(true);
  }catch(e){
    if(e?.name==='InvalidStateError')setError('The call connection closed. Please start the call again.');
    else setError(e?.message||'Could not switch to audio.');
  }finally{setSwitching(false)}
};
const toggleCamera=()=>{const t=streamRef.current?.getVideoTracks()[0];if(!t)return;t.enabled=!t.enabled;setCameraOff(!t.enabled)};
const uploadAttachment=async file=>{if(!firebaseStorage)throw new Error('File sharing is not configured. Enable Firebase Storage.');if(file.size>20*1024*1024)throw new Error('Files must be 20 MB or smaller.');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=storageRef(firebaseStorage,`chat-files/${chatId(user.id,targetId)}/${Date.now()}-${safe}`);await uploadBytes(path,file,{contentType:file.type||'application/octet-stream'});return {url:await getDownloadURL(path),name:file.name,size:file.size,type:file.type||'application/octet-stream'};};
const sendAttachment=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file||!targetId)return;try{setError('');await ensureFirebase();const fileInfo=await uploadAttachment(file);await push(ref(realtimeDb,`chats/${chatId(user.id,targetId)}/messages`),{senderId:Number(user.id),senderName:user.name,attachment:fileInfo,createdAt:Date.now()});}catch(e){setError(e.message||'Could not send the file.')}};
const sendMessage=async e=>{e.preventDefault();if(!message.trim()||!targetId)return;try{await ensureFirebase();await push(ref(realtimeDb,`chats/${chatId(user.id,targetId)}/messages`),{senderId:Number(user.id),senderName:user.name,text:message.trim(),createdAt:Date.now()});setMessage('')}catch(e){setError(e.message||'Could not send message.')}};
const time=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;const remainingSeconds=sessionRemaining??null;const remainingText=remainingSeconds===null?'—':`${String(Math.floor(remainingSeconds/60)).padStart(2,'0')}:${String(remainingSeconds%60).padStart(2,'0')}`;const durationLabel=sessionMeta?.duration_minutes?`${sessionMeta.duration_minutes} min`:'';
return <>{sessionSummary&&<div className="session-summary-overlay"><div className="session-summary-card"><div className="session-summary-check"><Check size={28}/></div><span className="call-overline">SESSION FINISHED</span><h2>{sessionSummary.reason==='TIME_EXPIRED'?'Time is up':'Session ended'}</h2><p>Your SkillSwap session has been marked completed for both participants.</p><div className="session-summary-stats"><div><strong>{String(Math.floor(sessionSummary.duration/60)).padStart(2,'0')}:{String(sessionSummary.duration%60).padStart(2,'0')}</strong><span>time spent</span></div><div><strong>{durationLabel||'Session'}</strong><span>scheduled duration</span></div></div><div className="session-summary-note">You can now rate your partner and confirm your learning progress.</div></div></div>}<main className={`call-room-v2 ${mode} ${chatOpen?'chat-open':''} ${fullscreen?'is-fullscreen':''}`}><header className="call-top"><div className="call-identity"><button className="call-icon-btn" onClick={()=>finish(false,'LEFT_CALL_SCREEN')}><ArrowLeft size={18}/></button><div className="call-avatar">{initials(targetName)}</div><div><div className="call-overline">LIVE SKILLSWAP SESSION</div><h1>{targetName}</h1><div className="call-status"><i className={status==='Connected'?'live':''}/>{status}{status==='Connected'&&<span>· {time}</span>}</div>{sessionMeta&&<div className={`session-countdown ${remainingSeconds!==null&&remainingSeconds<=60?'urgent':''}`}><span>TIME LEFT</span><strong>{remainingText}</strong></div>}</div></div><div className="call-top-actions"><div className="secure-label"><ShieldCheck size={14}/> Secure session</div><button className={`call-icon-btn ${chatOpen?'active':''}`} onClick={()=>setChatOpen(v=>!v)}><MessageCircle size={18}/></button><button className="call-icon-btn"><MoreHorizontal size={18}/></button></div></header>{error&&<div className="call-error-v2"><span>{error}</span><button onClick={()=>setError('')}><X size={15}/></button></div>}<div className="call-body"><section className="call-stage-v2">{mode==='video'?<><video ref={remoteVideoRef} className="remote-video-v2" autoPlay playsInline/><div className="video-placeholder" style={{opacity:remoteReady?0:1,pointerEvents:remoteReady?'none':'auto'}}><div className="pulse-avatar">{initials(targetName)}</div><h2>{status==='Calling'?`Calling ${targetName}`:status}</h2><p>{status==='Calling'?'Waiting for your peer to join the session…':'Video will appear when the connection is ready.'}</p></div><video ref={localVideoRef} className={`local-video-v2 ${cameraOff?'is-off':''}`} autoPlay playsInline muted/><div className="local-label">You</div><button className="expand-btn" onClick={()=>setFullscreen(v=>!v)}><Maximize2 size={16}/></button></>:<div className="audio-stage"><div className="audio-rings"><div className="audio-avatar">{initials(targetName)}</div></div><div className="audio-name">{targetName}</div><div className="audio-state">{status}{status==='Connected'&&` · ${time}`}</div><div className="audio-bars"><i/><i/><i/><i/><i/></div><audio ref={remoteAudioRef} autoPlay playsInline /></div>}</section>{chatOpen&&<aside className="call-chat-v2"><div className="call-chat-top"><div><span>SESSION CHAT</span><strong>{targetName}</strong></div><button onClick={()=>setChatOpen(false)}><X size={17}/></button></div><div className="call-chat-list">{messages.length?messages.map(m=><div className={`call-msg ${Number(m.senderId)===Number(user.id)?'mine':''}`} key={m.id}>{m.text&&<span>{m.text}</span>}{m.attachment&&<a className="chat-file" href={m.attachment.url} target="_blank" rel="noreferrer">{m.attachment.type?.startsWith('image/')?<img src={m.attachment.url} alt={m.attachment.name}/>:<>📎</>}<strong>{m.attachment.name}</strong><small>{Math.max(1,Math.round((m.attachment.size||0)/1024))} KB</small></a>}<small>{m.createdAt?new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}</small></div>):<div className="chat-empty"><MessageCircle size={25}/><strong>Keep learning while you talk</strong><span>Send links, questions and quick notes without leaving the session.</span></div>}</div><form onSubmit={sendMessage} className="call-composer"><label className="chat-attach" title="Send photo or document">📎<input type="file" onChange={sendAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" hidden/></label><input value={message} onChange={e=>setMessage(e.target.value)} disabled={!chatReady} placeholder={chatReady?'Write a message…':'Connecting…'}/><button disabled={!message.trim()||!chatReady}><Send size={16}/></button></form></aside>}</div><footer className="call-bottom"><div className="call-controls-left"><button className={muted?'selected':''} onClick={toggleMute}><span className="control-icon">{muted?<MicOff/>:<Mic/>}</span><span>{muted?'Unmute':'Mute'}</span></button><button className={cameraOff?'selected':''} onClick={mode==='video'?toggleCamera:switchMode} disabled={switching}><span className="control-icon">{mode==='video'?(cameraOff?<CameraOff/>:<Camera/>):<Video/>}</span><span>{mode==='video'?(cameraOff?'Camera on':'Camera'):switching?'Switching…':'Start video'}</span></button><button className={chatOpen?'selected':''} onClick={()=>setChatOpen(v=>!v)}><span className="control-icon"><MessageCircle/></span><span>Chat</span></button><button onClick={switchMode} disabled={switching}><span className="control-icon">{mode==='video'?<Phone/>:<Video/>}</span><span>{mode==='video'?'Audio only':'Video'}</span></button><button className={speakerOn?'selected':''} onClick={toggleSpeaker}><span className="control-icon"><Volume2/></span><span>{speakerOn?'Speaker on':'Speaker'}</span></button></div><div className="session-time-chip"><span>{durationLabel||'Live session'}</span><strong>{remainingText}</strong></div><button className="end-session-btn" onClick={()=>finish(false,'USER_ENDED')}><PhoneOff size={18}/><span>End for both</span></button><div className="connection-chip"><Check size={13}/><span>{status==='Connected'?'Connection stable':'Waiting for participant'}</span></div></footer></main></>;
}
