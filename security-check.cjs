/* Bounded heuristic for accidental checked-in credentials. Never prints matched values. */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const findings=[];
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}\b/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{40,}\b/];
function inspect(label,text){
  if(patterns.some(pattern=>pattern.test(text)))findings.push({location:label,kind:'possible embedded credential'});
  for(const found of text.matchAll(/postgres(?:ql)?:\/\/([^:\s]+):([^@\s]+)@([^\s/'"`]+)/g))if(!/^(USER|username|user)$/i.test(found[1])&&!/^(PASSWORD|password|placeholder)$/i.test(found[2]))findings.push({location:label,kind:'possible database URL with password'});
}
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
for(const name of tracked)if(fs.existsSync(name)&&/\.(?:js|cjs|json|md|html|css)$|\.env/.test(name))inspect(name,fs.readFileSync(name,'utf8'));
for(const name of fs.readdirSync('public'))if(/\.(?:js|json|html|css)$/.test(name))inspect('public/'+name,fs.readFileSync(path.join('public',name),'utf8'));
const commits=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const commit of commits){
  const names=execFileSync('git',['ls-tree','-rz','--name-only',commit],{encoding:'utf8'}).split('\0').filter(name=>/\.(?:js|cjs|json|md|html|css)$|\.env/.test(name));
  for(const name of names)inspect(`${commit.slice(0,8)}:${name}`,execFileSync('git',['show',`${commit}:${name}`],{encoding:'utf8',maxBuffer:10*1024*1024}));
}
if(tracked.some(name=>/(?:^|\/)\.env$|\.sqlite(?:-wal|-shm)?$/.test(name)))findings.push({location:'tracked file list',kind:'environment or user database tracked'});
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/secret-scan.json',JSON.stringify({at:new Date().toISOString(),kind:'heuristic only',trackedFiles:tracked.length,historyCommits:commits.length,findings},null,2));
console.log(JSON.stringify({trackedFiles:tracked.length,historyCommits:commits.length,findings},null,2));if(findings.length)process.exitCode=1;
