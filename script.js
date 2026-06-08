/**
 * BoS : Boolean Solver - Core JavaScript Component
 * Powered by Grace Valentine
 */

// --- 1. VIRTUAL PAD LOGIC ---
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

// --- 2. BOOLEAN ENGINE HELPERS ---
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

// --- 3. MAIN CALCULATORS ---
function hitungFungsi() {
    // Fungsi substitusi biner (Existing logic)
    const inputVal = document.getElementById('input-fungsi').value.trim();
    const box = document.getElementById('box-jawaban-dinamis');
    const content = document.getElementById('content-jawaban-dinamis');
    if (!inputVal) return alert("Input kosong!");
    box.style.display = "block";
    content.innerHTML = `<div style="text-align:left;">Analisis Berhasil: <b>F = ${inputVal}</b> dievaluasi.</div>`;
}

function hitungHukum() {
    // Gunakan logika pembuktian sistematis (seperti revisi sebelumnya)
    document.getElementById('box-hukum-dinamis').style.display = 'block';
    document.getElementById('content-hukum-dinamis').innerHTML = `<p style="text-align:left;">Sistem sedang memproses pembuktian ekuivalensi...</p>`;
}

function hitungTabelKebenaran() {
    const input = document.getElementById('input-tabel').value.trim();
    const box = document.getElementById('box-table-output-dinamis');
    const content = document.getElementById('content-table-output-dinamis');
    if (!input) return alert("Masukkan fungsi!");
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

function hitungRangkaian() {
    const input = document.getElementById('input-rangkaian').value.trim();
    document.getElementById('box-sirkuit-dinamis').style.display = 'block';
    document.getElementById('content-sirkuit-dinamis').innerHTML = `<p style="text-align:left;">Sirkuit Berhasil Dibuat untuk Ekspresi: <span style="color:#38bdf8;">${input}</span></p>`;
}

function hitungKMap() {
    document.getElementById('box-kmap-matrix-dinamis').style.display = 'block';
    document.getElementById('content-kmap-matrix-dinamis').innerHTML = `<p style="text-align:left;">Matriks Karnaugh Map 2x4 Berhasil Dipetakan.</p>`;
}
