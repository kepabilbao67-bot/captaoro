// ========== CaptaOro — App de Captación Multi-Canal ==========
// Toda la lógica de la aplicación

// Estado global
let leads = JSON.parse(localStorage.getItem('captaoro_leads') || '[]');
let settings = JSON.parse(localStorage.getItem('captaoro_settings') || '{}');

// ========== NAVEGACIÓN ==========
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + page).classList.add('active');
    });
});

// Mobile menu
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});



// ========== LEADS ==========
function showAddLeadModal() {
    document.getElementById('add-lead-modal').classList.add('show');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}
document.getElementById('add-lead-btn').addEventListener('click', showAddLeadModal);

function addLead(e) {
    e.preventDefault();
    const lead = {
        id: Date.now(),
        name: document.getElementById('lead-name').value,
        phone: document.getElementById('lead-phone').value,
        email: document.getElementById('lead-email').value,
        channel: document.getElementById('lead-channel').value,
        status: document.getElementById('lead-status').value,
        notes: document.getElementById('lead-notes').value,
        created: new Date().toISOString(),
        lastContact: new Date().toISOString(),
    };
    leads.push(lead);
    saveLeads();
    renderLeads();
    updateDashboard();
    closeModal('add-lead-modal');
    e.target.reset();
    showToast('✅ Lead añadido: ' + lead.name);
}

function saveLeads() {
    localStorage.setItem('captaoro_leads', JSON.stringify(leads));
}

function renderLeads() {
    const tbody = document.getElementById('leads-tbody');
    const empty = document.getElementById('leads-empty');
    const statusFilter = document.getElementById('filter-status').value;
    const channelFilter = document.getElementById('filter-channel').value;
    const search = document.getElementById('search-leads').value.toLowerCase();

    let filtered = leads.filter(l => {
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (channelFilter !== 'all' && l.channel !== channelFilter) return false;
        if (search && !l.name.toLowerCase().includes(search)) return false;
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    const statusIcons = { nuevo:'🟡', contactado:'🔵', interesado:'🟠', presentacion:'🟢', caliente:'🔥', cliente:'✅', perdido:'❌' };
    const channelIcons = { instagram:'📸', linkedin:'💼', whatsapp:'📱', web:'🌐', tiktok:'🎵', telegram:'✈️', referido:'🤝', presencial:'🤝' };

    tbody.innerHTML = filtered.map(l => `
        <tr>
            <td><strong>${l.name}</strong>${l.phone ? '<br><small>' + l.phone + '</small>' : ''}</td>
            <td>${channelIcons[l.channel] || '🌐'} ${l.channel}</td>
            <td><span class="status-badge">${statusIcons[l.status] || '🟡'} ${l.status}</span></td>
            <td><small>${timeAgo(l.lastContact)}</small></td>
            <td>
                <select onchange="changeStatus(${l.id}, this.value)" style="font-size:0.75rem;padding:4px;">
                    <option value="nuevo" ${l.status==='nuevo'?'selected':''}>🟡 Nuevo</option>
                    <option value="contactado" ${l.status==='contactado'?'selected':''}>🔵 Contactado</option>
                    <option value="interesado" ${l.status==='interesado'?'selected':''}>🟠 Interesado</option>
                    <option value="presentacion" ${l.status==='presentacion'?'selected':''}>🟢 Presentación</option>
                    <option value="caliente" ${l.status==='caliente'?'selected':''}>🔥 Caliente</option>
                    <option value="cliente" ${l.status==='cliente'?'selected':''}>✅ Cliente</option>
                    <option value="perdido" ${l.status==='perdido'?'selected':''}>❌ Perdido</option>
                </select>
                <button onclick="deleteLead(${l.id})" class="btn-sm" style="color:var(--red);margin-left:5px;">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function changeStatus(id, status) {
    const lead = leads.find(l => l.id === id);
    if (lead) { lead.status = status; lead.lastContact = new Date().toISOString(); saveLeads(); renderLeads(); updateDashboard(); }
}
function deleteLead(id) {
    if (confirm('¿Eliminar este lead?')) { leads = leads.filter(l => l.id !== id); saveLeads(); renderLeads(); updateDashboard(); }
}

// Filters
document.getElementById('filter-status').addEventListener('change', renderLeads);
document.getElementById('filter-channel').addEventListener('change', renderLeads);
document.getElementById('search-leads').addEventListener('input', renderLeads);



// ========== DASHBOARD ==========
function updateDashboard() {
    document.getElementById('total-leads').textContent = leads.length;
    document.getElementById('hot-leads').textContent = leads.filter(l => l.status === 'caliente').length;
    document.getElementById('total-clients').textContent = leads.filter(l => l.status === 'cliente').length;
    // Conversion rate
    const rate = leads.length > 0 ? Math.round((leads.filter(l=>l.status==='cliente').length / leads.length) * 100) : 0;
    document.getElementById('conversion-rate').textContent = rate + '%';
}

// ========== IA CHAT ==========
function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const msg = input.value.trim();
    if (!msg) return;
    addAIMessage(msg, 'user');
    input.value = '';
    setTimeout(() => { addAIMessage(getAIResponse(msg), 'bot'); }, 800);
}
function askAI(question) {
    document.getElementById('ai-input').value = question;
    sendAIMessage();
}
document.getElementById('ai-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAIMessage(); });

function addAIMessage(text, type) {
    const container = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + type;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function getAIResponse(q) {
    q = q.toLowerCase();
    if (q.includes('caro') || q.includes('precio') || q.includes('objecion')) return '💬 Respuesta a "es caro":\n\n"Puedes empezar desde 25€/mes. Es menos de lo que gastas en café. Y cada euro compra oro real a precio mayorista. La diferencia es que el café desaparece en 5 minutos, tu oro puede estar aquí en 20 años valiendo el doble."';
    if (q.includes('whatsapp') || q.includes('mensaje')) return '📱 Mensaje para lead frío:\n\n"Hola! ¿Qué tal? Oye, te cuento algo rápido. He empezado con algo que creo que te puede interesar: puedes ahorrar en ORO FÍSICO desde 25€/mes, con una empresa alemana de 17 años. El oro ha subido +144% en 5 años. ¿Te suena interesante? Sin compromiso, si quieres te paso más info."';
    if (q.includes('instagram') || q.includes('publicar') || q.includes('post')) return '📸 Post para hoy:\n\n"🥇 144%. Eso es lo que ha subido el oro en 5 años. ¿Y tu cuenta del banco? Un 0,5%. ¿La inflación? Te ha quitado un -25%. Ahorrar en oro desde 25€/mes no es para ricos. Es para personas inteligentes. Escríbeme ORO por DM 👇 #oro #ahorro #orofisico"';
    if (q.includes('precio') || q.includes('oro actual')) return '📊 Precio actual del oro:\n\n~116€/gramo (Junio 2026)\nOnza: ~3.636€\nSubida 5 años: +144%\nSubida 1 año: +38%\n\nRatio oro/plata: ~66 (oro favorable cuando <80)';
    if (q.includes('tarifa') || q.includes('recomendar')) return '💰 Recomendación de tarifa:\n\n• 25-100€/mes → S-3 (entrada 300€)\n• 100-400€/mes → M-6 (entrada 600€, bonus 600€ = gratis)\n• 400-1000€/mes → L-12 (3% descuento + Switch Pilot)\n• +1000€/mes → XL-24 (6% descuento, máximo beneficio)';
    if (q.includes('cierre') || q.includes('cerrar')) return '🔥 Script de cierre:\n\n"Oye [nombre], ¿qué te parece? ¿Vamos? La S-3 son solo 300€ de entrada y luego pones lo que quieras. Si no te convence, vendes online y recuperas tu dinero. Sin penalización. ¿Lo hacemos? Te guío paso a paso ahora mismo."';
    return '🤖 Buena pregunta. Te recomiendo:\n\n1. Revisa tus plantillas de mensajes (pestaña Plantillas)\n2. Mira el calendario de contenido en tu carpeta de archivos\n3. Si la duda es sobre un cliente específico, cuéntame su situación y te digo qué decirle.\n\n¿Puedes darme más detalle?';
}

// ========== CAMPAÑAS ==========
function toggleCampaign(btn) {
    const status = btn.previousElementSibling;
    if (status.classList.contains('off')) { status.classList.remove('off'); status.classList.add('on'); status.textContent = 'Activa'; btn.textContent = 'Pausar'; showToast('🚀 Campaña activada'); }
    else { status.classList.remove('on'); status.classList.add('off'); status.textContent = 'Inactiva'; btn.textContent = 'Activar'; showToast('⏸️ Campaña pausada'); }
}

// ========== PLANTILLAS ==========
const templates = [
    "Hola! ¿Qué tal? 😊 Oye, te cuento algo rápido. He empezado con algo que creo que te puede interesar: puedes ahorrar en ORO FÍSICO desde 25€/mes con una empresa alemana de 17 años. El oro ha subido un 144% en 5 años. ¿Te suena interesante o no es lo tuyo?",
    "Hola, he visto tu perfil y me parece muy interesante lo que haces. Me dedico a ayudar a profesionales a proteger su patrimonio con ahorro en oro físico. Me encantaría conectar. ¡Un saludo!",
    "¡Hola! 👋 Genial que te interese el ahorro en oro. Te cuento en 30 seg: 🥇 Oro FÍSICO (lingote con tu nombre) 📈 +144% en 5 años 💰 Desde 25€/mes 🔐 Cámaras en Zúrich ✅ Sin permanencia. ¿Quieres saber más?",
    "Hola! Solo quería saber si pudiste ver la info que te envié sobre el ahorro en oro. Si te surge cualquier duda estoy aquí. Sin prisa 🙂",
    "¿Qué me dices? ¿Vamos con la S-3 para empezar? Son solo 300€ de entrada y luego pones lo que quieras desde 25€/mes. Te guío paso a paso ahora mismo si quieres 🙂",
    "Puedes empezar desde 25€/mes. Es menos de lo que gastas en café. Y cada euro compra oro real. La diferencia: el café desaparece en 5 min. Tu oro puede estar aquí en 20 años valiendo el doble."
];
function copyTemplate(idx) {
    navigator.clipboard.writeText(templates[idx]).then(() => showToast('📋 Plantilla copiada'));
}

// ========== SETTINGS ==========
function saveSettings() {
    settings = { name: document.getElementById('setting-name').value, whatsapp: document.getElementById('setting-whatsapp').value, email: document.getElementById('setting-email').value, ig: document.getElementById('setting-ig').value, ref: document.getElementById('setting-ref').value, apikey: document.getElementById('setting-apikey').value };
    localStorage.setItem('captaoro_settings', JSON.stringify(settings));
    showToast('✅ Ajustes guardados');
}

// ========== UTILIDADES ==========
function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return mins + ' min';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h';
    return Math.floor(hrs / 24) + 'd';
}
function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1a1a2e;color:white;padding:12px 20px;border-radius:8px;font-size:0.85rem;z-index:9999;animation:fadeIn 0.3s;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ========== INIT ==========
renderLeads();
updateDashboard();
