type Call = (operation:string,body:Record<string,unknown>)=>Promise<any>;
const identity=(value:string)=>{if(!/^https?:\/\//i.test(value))return value;const url=new URL(value);url.search='';return url.toString();};
/** Resolve only persisted references. Never guess a bucket from a raw key. */
export async function deleteAttachment(input:{token:string;documentId:string;group:string;reference:string;originalKey?:string},call:Call){
 const snapshot=await call('attachments_state',{token:input.token,documentId:input.documentId});
 if(snapshot.error||!Number.isSafeInteger(snapshot.data?.attachmentRevision))throw new Error('ATTACHMENT_STATE_UNAVAILABLE');
 const group=snapshot.data.attachments?.find((g:any)=>g.name===input.group);
 const files=group?.files||[];
 const candidates=new Set<string>(files.filter((value:string)=>identity(value)===identity(input.originalKey||input.reference)));
 for(const alias of group?.references||[])if(files.includes(alias.key)&&identity(alias.url)===identity(input.reference))candidates.add(alias.key);
 const matches=Array.from(candidates);
 const pending=matches.length===0&&input.originalKey?.startsWith('lifecycle/sealed/');
 if(matches.length!==1&&!pending)throw new Error('ATTACHMENT_REFERENCE_UNRESOLVED');
 const result=await call('attachments_delete',{token:input.token,documentId:input.documentId,group:input.group,key:matches[0]||input.originalKey,attachmentRevision:snapshot.data.attachmentRevision});
 if(result.error||result.data?.storageObjectDeleted!==false)throw new Error('ATTACHMENT_DELETE_NOT_CONFIRMED');
 return result.data;
}
