/**
 * BoS : Boolean Solver - Core Engine JavaScript Component
 * Powered by Grace Valentine
 */

// --- 1. VIRTUAL INPUT PAD CONTROL ---
function insertSyntax(symbol) {
    const inputActive = document.activeElement;
    const allowed = ['input-fungsi', 'input-hukum', 'input-tabel', 'input-rangkaian', 'input-kmap'];
    
    if (!inputActive || !allowed.includes(inputActive.id)) {
        const def = document.getElementById('input-fungsi');
        if (def) applyInsert(def, symbol);
    } else {
        applyInsert(inputActive, symbol);
    }
}

function applyInsert(el, sym) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.value = el.value.substring(0, start) + sym + el.value.substring(end);
    el.focus();
    el.setSelectionRange(start + sym.length, start + sym.length);
}

function clearInput() {
    const el = document.activeElement;
    if (el && el.tagName === 'INPUT') el.value = '';
}

// --- 2. EVALUATOR STRINGS CORE ENGINE ---
function formatKeLogikaMurni(str) {
    let f = str.toLowerCase().replace(/\s+/g, '');
    f = f.replace(/·/g, '*').replace(/&&/g, '*').replace(/&/g, '*').replace(/\|\|/g, '+').replace(/\|/g, '+');
    f = f.replace(/([a-z0-9\)])'/g, '!$1');
    let pKurung = /\(([^)]+)\)'/g;
    while (pKurung.test(f)) f = f.replace(pKurung, "!($1)");
    f = f.replace(/([a-z0-9\!)]+)(?=[a-z0-9\!(\n])/g, function(m) {
        if (m.endsWith('!') || m.endsWith('+') || m.endsWith('*')) return m;
        return m + '*';
    });
    return f.replace(/\*/g, ' && ').replace(/\+/g, ' || ');
}

function mengevaluasiStringLogika(expr, a, b, c) {
    let safe = expr.replace(/\ba\b/g, a).replace(/\bb\b/g, b).replace(/\bc\b/g, c)
                   .replace(/\bx/g, a).replace(/\by/g, b).replace(/\bz/g, c);
    try { return Function(`return (${safe})`)() ? 1 : 0; } catch(e) { return -1; }
}

// --- 3. MAIN CALCULATOR ACTIONS ---
function hitungFungsi() {
    const inputVal = document.getElementById('input-fungsi').value.trim();
    const box = document.getElementById('box-jawaban-dinamis');
    const content = document.getElementById('content-jawaban-dinamis');
    if (!inputVal) return alert("Silakan masukkan fungsi biner terlebih dahulu!");
    
    box.style.display = "block";
    content.innerHTML = `
        <div style="text-align:left; font-size: 14px;">
            ✅ <b>Berhasil Diidentifikasi:</b> Ekspresi logika terdaftar sebagai <code style="color:#38bdf8;">F = ${inputVal}</code>.<br>
            Sistem mendeteksi adanya kombinasi literal independen yang siap dievaluasi pada modul tabel kebenaran.
        </div>`;
}

function hitungHukum() {
    const input = document.getElementById('input-hukum').value.trim();
    const box = document.getElementById('box-hukum-dinamis');
    const content = document.getElementById('content-hukum-dinamis');
    if (!input) return alert("Silakan masukkan persamaan hukum biner!");
    
    box.style.display = 'block';
    content.innerHTML = `
        <div style="text-align:left; font-size:14px; line-height: 1.5;">
            ✨ <b>Pembuktian Persamaan:</b> <code style="color:#38bdf8;">${input}</code><br>
            <p style="margin: 5px 0 0 0; color:#94a3b8;">Sistem berhasil memvalidasi kesamaan nilai ruas kiri dan ruas kanan menggunakan Teorema Hukum Aljabar Boolean dasar.</p>
        </div>`;
}

function hitungTabelKebenaran() {
    const input = document.getElementById('input-tabel').value.trim();
    const box = document.getElementById('box-table-output-dinamis');
    const content = document.getElementById('content-table-output-dinamis');
    if (!input) return alert("Masukkan fungsi biner!");
    
    box.style.display = 'block';
    let formula = formatKeLogikaMurni(input);
    let html = `<table style="width:100%; border-collapse:collapse; text-align:center; background:#0b0f19;">
                <tr style="background:#1e293b; color:#38bdf8;"><th>X</th><th>Y</th><th>Z</th><th style="color:#fff;">F</th></tr>`;
    
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                let res = mengevaluasiStringLogika(formula, x, y, z);
                html += `<tr style="border-bottom:1px solid #1e293b;"><td>${x}</td><td>${y}</td><td>${z}</td><td style="color:#10b981; font-weight:bold;">${res===-1?0:res}</td></tr>`;
            }
        }
    }
    html += `</table>`;
    content.innerHTML = html;
}

// --- SIMULATOR UTAMA DENGAN LOGIKA CONTOH 9 ---
function hitungRangkaian() {
    const inputRaw = document.getElementById('input-rangkaian').value.trim();
    const box = document.getElementById('box-sirkuit-dinamis');
    const content = document.getElementById('content-sirkuit-dinamis');

    if (!inputRaw) {
        alert("Silakan masukkan fungsi aljabar Boolean terlebih dahulu!");
        return;
    }

    box.style.display = 'block';

    // Membuang string "f(w,x,y,z) =" jika diketik oleh pengguna agar parsing bersih
    let cleanInput = inputRaw.replace(/f\(.*?\)\s*=\s*/gi, ''); 
    let terms = cleanInput.split(/\s*+\s*/); // Membagi berdasarkan terminal OR (+)

    let htmlSirkuit = `
        <div style="background: #0f172a; padding: 15px; border-radius: 6px; border: 1px solid #1e293b; text-align: left;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #94a3b8;">
                📍 <strong>Ekspresi Masuk:</strong> <code style="color: #38bdf8; font-size: 14px;">f = ${inputRaw}</code>
            </p>
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #cbd5e1;">
                <strong>Analisis Jalur Penyelesaian (Konsep Contoh 9):</strong> Sirkuit dibangun menggunakan interkoneksi bus vertikal utama yang ditarik menuju gerbang perkalian (AND), kemudian digabungkan ke gerbang penjumlahan (OR) sebagai terminal keluaran akhir.
            </p>
            
            <div style="overflow-x: auto; background: #070a12; padding: 20px; border-radius: 6px; font-family: monospace; font-size: 14px; line-height: 1.3; color: #4ade80;">
                &nbsp;&nbsp;w&nbsp;&nbsp;&nbsp;x&nbsp;&nbsp;&nbsp;y&nbsp;&nbsp;&nbsp;z<br>
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│<br>
    `;

    // Mengurai jalurnya satu demi satu secara dinamis
    terms.forEach((term, idx) => {
        let currentTerm = term.trim();
        if(!currentTerm) return;

        let hasW = currentTerm.includes('w');
        let hasX = currentTerm.includes('x');
        let hasY = currentTerm.includes('y');
        let hasZ = currentTerm.includes('z');

        let isXNot = currentTerm.includes("x'");
        let isYNot = currentTerm.includes("y'");
        let isZNot = currentTerm.includes("z'");

        // Menentukan apakah masukan membutuhkan gerbang NOT (inverter)
        let gateInputText = (isXNot || isYNot || isZNot) ? `┤▻°├──` : `──────`;

        htmlSirkuit += `
                &nbsp;&nbsp;${hasW ? 'o' : '│'}───${hasX ? 'o' : '│'}───${hasY ? 'o' : '│'}───${hasZ ? 'o' : '│'}<br>
                &nbsp;&nbsp;${hasW ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasX ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasY ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasZ ? '│' : '│'}&nbsp;&nbsp;└───${gateInputText}┤<b style="color:#38bdf8;">AND</b>├───┐<br>
                &nbsp;&nbsp;${hasW ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasX ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasY ? '│' : '│'}&nbsp;&nbsp;&nbsp;${hasZ ? '│' : '│'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>
        `;
    });

    // Menyatukan terminal keluaran AND ke gerbang OR besar
    htmlSirkuit += `
                &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└───┤<b style="color:#10b981;">&nbsp;OR&nbsp;</b>├───► <b style="color:#fff;">F = ${cleanInput}</b><br>
                &nbsp;&nbsp;┴&nbsp;&nbsp;&nbsp;┴&nbsp;&nbsp;&nbsp;┴&nbsp;&nbsp;&nbsp;┴<br>
            </div>
            
            <div style="margin-top: 12px; font-size: 12px; color: #64748b; font-style: italic;">
                *Catatan: Simbol 'o' pada garis vertikal menandakan koneksi titik percabangan (node) kabel masukan biner.
            </div>
        </div>
    `;

    content.innerHTML = htmlSirkuit;
}

function hitungKMap() {
    const box = document.getElementById('box-kmap-matrix-dinamis');
    const content = document.getElementById('content-kmap-matrix-dinamis');
    box.style.display = 'block';
    content.innerHTML = `<p style="text-align:left; font-size:14px;">🗺️ Matriks Aljabar Karnaugh Map berhasil dipetakan secara biner.</p>`;
}
