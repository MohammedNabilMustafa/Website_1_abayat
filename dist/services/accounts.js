/* DEMO ONLY. No credentials are stored or checked. Replace this provider at Firebase integration. */
(() => {
  const readJSON=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))??fallback}catch{return fallback}};
  let profiles=readJSON(localStorage,'abayat-demo-profiles',[]);
  let current=readJSON(sessionStorage,'abayat-demo-session',null);
  const safeProfile=p=>({uid:p.uid,name:p.name,email:p.email,phone:p.phone||'',role:p.role==='admin'?'admin':'client',demo:true});
  const writeProfiles=()=>localStorage.setItem('abayat-demo-profiles',JSON.stringify(profiles.map(safeProfile)));
  const start=p=>{current=safeProfile(p);sessionStorage.setItem('abayat-demo-session',JSON.stringify(current));return {...current}};
  const normalize=email=>String(email||'').trim().toLowerCase();
  const validEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  window.accountService={
    mode:'demo',
    getCurrentUser:()=>current?{...current}:null,
    listProfiles:()=>profiles.map(safeProfile),
    async signUp({name,email,password}){
      email=normalize(email);name=String(name||'').trim();
      if(name.length<2||!validEmail(email)||String(password||'').length<8)throw Error('راجعي الاسم والبريد وكلمة المرور (٨ أحرف على الأقل).');
      if(profiles.some(p=>p.email===email))throw Error('البريد موجود في ملفات العرض. جرّبي تسجيل الدخول.');
      const p={uid:'demo-'+crypto.randomUUID(),name,email,phone:'',role:'client',demo:true};
      profiles.push(p);writeProfiles();return start(p);
    },
    async signIn({email,password}){
      if(String(password||'').length<8)throw Error('استخدمي كلمة مرور تجريبية من ٨ أحرف على الأقل.');
      const p=profiles.find(p=>p.email===normalize(email));
      if(!p)throw Error('لا يوجد ملف عرض بهذا البريد. أنشئي حسابًا تجريبيًا أولًا.');
      return start(p);
    },
    async signOut(){current=null;sessionStorage.removeItem('abayat-demo-session')},
    async requestPasswordReset(email){if(!validEmail(normalize(email)))throw Error('اكتبي بريدًا إلكترونيًا صحيحًا.');return {sent:false,preview:true}},
    async confirmPasswordReset({password}){if(String(password||'').length<8)throw Error('كلمة المرور يجب أن تكون ٨ أحرف على الأقل.');return {changed:false,preview:true}},
    async updateProfile({name,phone}){
      if(!current)throw Error('سجّلي الدخول أولًا.');name=String(name||'').trim();if(name.length<2)throw Error('اكتبي اسمًا صحيحًا.');
      const next={...current,name,phone:String(phone||'').trim()};profiles=profiles.map(p=>p.uid===next.uid?next:p);writeProfiles();return start(next);
    },
    async enterPreview(role){
      if(!['client','admin'].includes(role))throw Error('نوع الحساب غير صالح.');
      const uid='demo-preview-'+role;
      let p=profiles.find(p=>p.uid===uid);
      if(!p){p={uid,name:role==='admin'?'مدير المتجر':'عميلة تجريبية',email:role+'@example.com',phone:'',role,demo:true};profiles.push(p);writeProfiles()}
      return start(p);
    }
  };
})();
