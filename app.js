// ========== CaptaOro v1.1 — COMPLETA ==========
let leads = JSON.parse(localStorage.getItem('captaoro_leads') || '[]');
let settings = JSON.parse(localStorage.getItem('captaoro_settings') || '{"name":"Kepa Bilbao","whatsapp":"611918310","email":"kepabilbao67@gmail.com","ig":"@kepabilbao","ref":"43667"}');

// === NAVEGACIÓN ===
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + item.dataset.page).classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
    });
});
document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

// === LEADS ===
function showAddLeadModal() { document.getElementById('add-lead-modal').classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.getElementById('add-lead-btn').addEventListener('click', showAddLeadModal);

function addLead(e) {
    e.preventDefault();
    const lead = { id:Date.now(), name:document.getElementById('lead-name').value, phone:document.getElementById('lead-phone').value, email:document.getElementById('lead-email').value, channel:document.getElementById('lead-channel').value, status:document.getElementById('lead-status').value, notes:document.getElementById('lead-notes').value, created:new Date().toISOString(), lastContact:new Date().toISOString() };
    leads.push(lead);
    saveLeads(); renderLeads(); updateDashboard();
    closeModal('add-lead-modal');
    e.target.reset();
    showToast('✅ Lead añadido: ' + lead.name);
}
function saveLeads() { localStorage.setItem('captaoro_leads', JSON.stringify(leads)); }
function changeStatus(id, status) { const l=leads.find(x=>x.id===id); if(l){l.status=status;l.lastContact=new Date().toISOString();saveLeads();renderLeads();updateDashboard();} }
function deleteLead(id) { if(confirm('¿Eliminar?')){leads=leads.filter(x=>x.id!==id);saveLeads();renderLeads();updateDashboard();} }

function renderLeads() {
    const tbody=document.getElementById('leads-tbody'), empty=document.getElementById('leads-empty');
    const sf=document.getElementById('filter-status').value, cf=document.getElementById('filter-channel').value, search=document.getElementById('search-leads').value.toLowerCase();
    let filtered=leads.filter(l=>{if(sf!=='all'&&l.status!==sf)return false;if(cf!=='all'&&l.channel!==cf)return false;if(search&&!l.name.toLowerCase().includes(search))return false;return true;});
    if(!filtered.length){tbody.innerHTML='';empty.style.display='block';return;}
    empty.style.display='none';
    const si={nuevo:'🟡',contactado:'🔵',interesado:'🟠',presentacion:'🟢',caliente:'🔥',cliente:'✅',perdido:'❌'};
    const ci={instagram:'📸',linkedin:'💼',whatsapp:'📱',web:'🌐',tiktok:'🎵',telegram:'✈️',referido:'🤝',presencial:'🤝'};
    tbody.innerHTML=filtered.map(l=>`<tr><td><strong>${l.name}</strong>${l.phone?'<br><small>'+l.phone+'</small>':''}</td><td>${ci[l.channel]||'🌐'} ${l.channel}</td><td>${si[l.status]||'🟡'} ${l.status}</td><td><small>${timeAgo(l.lastContact)}</small></td><td><select onchange="changeStatus(${l.id},this.value)" style="font-size:0.75rem;padding:4px"><option value="nuevo" ${l.status==='nuevo'?'selected':''}>🟡 Nuevo</option><option value="contactado" ${l.status==='contactado'?'selected':''}>🔵 Contactado</option><option value="interesado" ${l.status==='interesado'?'selected':''}>🟠 Interesado</option><option value="presentacion" ${l.status==='presentacion'?'selected':''}>🟢 Presentación</option><option value="caliente" ${l.status==='caliente'?'selected':''}>🔥 Caliente</option><option value="cliente" ${l.status==='cliente'?'selected':''}>✅ Cliente</option><option value="perdido" ${l.status==='perdido'?'selected':''}>❌ Perdido</option></select> <button onclick="deleteLead(${l.id})" style="color:#ef4444;border:none;background:none;cursor:pointer">🗑️</button></td></tr>`).join('');
}
document.getElementById('filter-status').addEventListener('change',renderLeads);
document.getElementById('filter-channel').addEventListener('change',renderLeads);
document.getElementById('search-leads').addEventListener('input',renderLeads);

// === DASHBOARD ===
function updateDashboard() {
    document.getElementById('total-leads').textContent=leads.length;
    document.getElementById('hot-leads').textContent=leads.filter(l=>l.status==='caliente').length;
    document.getElementById('total-clients').textContent=leads.filter(l=>l.status==='cliente').length;
    const rate=leads.length>0?Math.round((leads.filter(l=>l.status==='cliente').length/leads.length)*100):0;
    document.getElementById('conversion-rate').textContent=rate+'%';
    document.getElementById('weekly-leads').textContent=leads.filter(l=>{const d=new Date(l.created);const w=new Date();w.setDate(w.getDate()-7);return d>w;}).length;
}

// === IA CHAT ===
function sendAIMessage(){const input=document.getElementById('ai-input');const msg=input.value.trim();if(!msg)return;addAIMsg(msg,'user');input.value='';setTimeout(()=>addAIMsg(getAIResponse(msg),'bot'),800);}
function askAI(q){document.getElementById('ai-input').value=q;sendAIMessage();}
document.getElementById('ai-input').addEventListener('keypress',(e)=>{if(e.key==='Enter')sendAIMessage();});
document.getElementById('ai-send').addEventListener('click',sendAIMessage);
function addAIMsg(text,type){const c=document.getElementById('ai-messages');const d=document.createElement('div');d.className='ai-msg '+type;d.innerHTML=text.replace(/\n/g,'<br>');c.appendChild(d);c.scrollTop=c.scrollHeight;}
function getAIResponse(q){q=q.toLowerCase();if(q.includes('caro')||q.includes('objecion'))return'💬 <strong>Respuesta a "es caro":</strong>\n\n"Puedes empezar desde 25€/mes. Es menos de lo que gastas en café. Y cada euro compra oro real. La diferencia es que el café desaparece en 5 minutos, tu oro puede estar aquí en 20 años valiendo el doble."';if(q.includes('whatsapp')||q.includes('mensaje'))return'📱 <strong>Mensaje para lead frío:</strong>\n\n"Hola! He empezado con algo que creo que te puede interesar: puedes ahorrar en ORO FÍSICO desde 25€/mes con una empresa alemana de 17 años. El oro ha subido +144% en 5 años. ¿Te suena interesante?"';if(q.includes('instagram')||q.includes('post')||q.includes('publicar'))return'📸 <strong>Post para hoy:</strong>\n\n"🥇 144%. Eso es lo que ha subido el oro en 5 años. ¿Y tu cuenta del banco? Un 0,5%. Ahorrar en oro desde 25€/mes no es para ricos. Es para personas inteligentes. Escríbeme ORO por DM 👇 #oro #ahorro #orofisico"';if(q.includes('precio')||q.includes('actual'))return'📊 <strong>Precio actual:</strong>\n\n• Oro: ~116€/gramo\n• Onza: ~3.636€\n• Subida 5 años: +144%\n• Ratio oro/plata: ~66';if(q.includes('tarifa')||q.includes('recomendar'))return'💰 <strong>Recomendación:</strong>\n\n• 25-100€/mes → S-3 (entrada 300€)\n• 100-400€/mes → M-6 (entrada 600€, bonus cubre entrada)\n• 400-1000€/mes → L-12 (3% dto + Switch Pilot)\n• +1000€/mes → XL-24 (6% dto)';if(q.includes('cierre')||q.includes('cerrar'))return'🔥 <strong>Script cierre:</strong>\n\n"¿Qué me dices? ¿Vamos con la S-3? Son 300€ y luego pones lo que quieras. Si no te convence, vendes online y recuperas. Sin penalización. ¿Lo hacemos? Te guío ahora mismo."';if(q.includes('segur')||q.includes('estafa'))return'🔐 <strong>Argumento seguridad:</strong>\n\n"AUVESTA es una sociedad anónima alemana con 17 años. +200.000 inversores. Certificada Trusted Shops. Auditada cada 3 meses. Tu lingote con número de serie a TU nombre. Si la empresa cerrara, tu oro sigue siendo tuyo en la cámara."';return'🤖 No tengo una respuesta preparada para eso. Prueba a preguntar sobre:\n• Objeciones (es caro, no me fío...)\n• Mensajes para leads\n• Posts para redes\n• Precios del oro\n• Tarifas\n• Scripts de cierre';}

// === CAMPAÑAS ===
function toggleCampaign(btn){const s=btn.previousElementSibling;if(s.classList.contains('off')){s.classList.remove('off');s.classList.add('on');s.textContent='Activa';btn.textContent='Pausar';showToast('🚀 Campaña activada');}else{s.classList.remove('on');s.classList.add('off');s.textContent='Inactiva';btn.textContent='Activar';showToast('⏸️ Campaña pausada');}}

// === PLANTILLAS ===
const templates=["Hola! ¿Qué tal? 😊 He empezado con algo que creo que te puede interesar: puedes ahorrar en ORO FÍSICO desde 25€/mes con una empresa alemana de 17 años. El oro ha subido un 144% en 5 años. ¿Te suena interesante?","Hola, he visto tu perfil y me parece muy interesante. Me dedico a ayudar a profesionales a proteger su patrimonio con ahorro en oro físico. Me encantaría conectar!","¡Hola! 👋 Genial que te interese. Te cuento: 🥇 Oro FÍSICO desde 25€/mes 📈 +144% en 5 años 🔐 Cámaras en Zúrich ✅ Sin permanencia. ¿Quieres saber más?","Hola! Solo quería saber si pudiste ver la info sobre el ahorro en oro. Si te surge cualquier duda estoy aquí. Sin prisa 🙂","¿Qué me dices? ¿Vamos con la S-3? Son 300€ de entrada y luego pones lo que quieras desde 25€/mes. Te guío paso a paso ahora mismo 🙂","Puedes empezar desde 25€/mes. Menos que café. La diferencia: el café desaparece en 5 min. Tu oro puede estar aquí en 20 años valiendo el doble."];
function copyTemplate(idx){navigator.clipboard.writeText(templates[idx]).then(()=>showToast('📋 Copiado al portapapeles'));}

// === SETTINGS ===
function saveSettings(){settings={name:document.getElementById('setting-name').value,whatsapp:document.getElementById('setting-whatsapp').value,email:document.getElementById('setting-email').value,ig:document.getElementById('setting-ig').value,ref:document.getElementById('setting-ref').value,apikey:document.getElementById('setting-apikey').value};localStorage.setItem('captaoro_settings',JSON.stringify(settings));showToast('✅ Guardado');}

// === UTILS ===
function timeAgo(d){const diff=Date.now()-new Date(d).getTime();const m=Math.floor(diff/60000);if(m<1)return'Ahora';if(m<60)return m+'min';const h=Math.floor(m/60);if(h<24)return h+'h';return Math.floor(h/24)+'d';}
function showToast(msg){const t=document.createElement('div');t.style.cssText='position:fixed;bottom:20px;right:20px;background:#1a1a2e;color:white;padding:12px 20px;border-radius:8px;font-size:0.85rem;z-index:9999;';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);}

// === EXPORT LEADS (CSV) ===
function exportLeadsCSV(){if(!leads.length){showToast('No hay leads');return;}const h=['Nombre','Teléfono','Email','Canal','Estado','Fecha','Notas'];const rows=leads.map(l=>[l.name,l.phone,l.email,l.channel,l.status,l.created,l.notes]);const csv=[h,...rows].map(r=>r.join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='leads-captaoro-'+new Date().toISOString().split('T')[0]+'.csv';a.click();showToast('📥 CSV descargado');}

// === INIT ===
renderLeads(); updateDashboard();

// === DASHBOARD CHANNELS ===
function updateChannelsOverview() {
    const channelCounts = {};
    const channels = ['instagram','linkedin','whatsapp','web','tiktok','telegram','referido'];
    channels.forEach(c => channelCounts[c] = leads.filter(l => l.channel === c).length);
    const max = Math.max(...Object.values(channelCounts), 1);
    const icons = {instagram:'📸',linkedin:'💼',whatsapp:'📱',web:'🌐',tiktok:'🎵',telegram:'✈️',referido:'🤝'};
    const container = document.getElementById('channels-overview');
    if (!container) return;
    container.innerHTML = channels.map(c => `
        <div class="channel-bar">
            <span class="ch-name">${icons[c]} ${c}</span>
            <div class="ch-bar-track"><div class="ch-bar-fill" style="width:${(channelCounts[c]/max)*100}%"></div></div>
            <span class="ch-count">${channelCounts[c]} leads</span>
        </div>
    `).join('');
}

// === ACTIVITY LOG ===
function updateActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;
    const recent = [...leads].sort((a,b) => new Date(b.lastContact) - new Date(a.lastContact)).slice(0, 5);
    if (!recent.length) { container.innerHTML = '<p class="empty-msg">Añade tu primer lead para empezar</p>'; return; }
    const si = {nuevo:'🆕',contactado:'📤',interesado:'💬',presentacion:'📞',caliente:'🔥',cliente:'✅',perdido:'❌'};
    container.innerHTML = recent.map(l => `
        <div class="activity-item">
            <span class="activity-icon">${si[l.status]||'🆕'}</span>
            <div><strong>${l.name}</strong> — ${l.status}</div>
            <span class="activity-time">${timeAgo(l.lastContact)}</span>
        </div>
    `).join('');
}

// === IMPROVED DASHBOARD UPDATE ===
const _origUpdate = updateDashboard;
updateDashboard = function() {
    _origUpdate();
    updateChannelsOverview();
    updateActivity();
    // Weekly leads
    const weekLeads = leads.filter(l => { const d = new Date(l.created); const w = new Date(); w.setDate(w.getDate()-7); return d > w; }).length;
    const el = document.getElementById('weekly-leads');
    if (el) el.textContent = weekLeads;
    // Best channel
    const channels = {};
    leads.filter(l=>l.status==='cliente').forEach(l => { channels[l.channel] = (channels[l.channel]||0) + 1; });
    const best = Object.entries(channels).sort((a,b)=>b[1]-a[1])[0];
    const bestEl = document.getElementById('best-channel');
    if (bestEl) bestEl.textContent = best ? best[0] : '—';
};

// Re-init
renderLeads(); updateDashboard();
