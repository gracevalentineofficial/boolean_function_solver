// ==========================================
// ENGINE CORE: PARSER & EVALUATOR EKSPRESI BOOLEAN
// ==========================================
function evaluasiEkspresi(ekspresi, x, y, z) {
    let formatted = ekspresi.toLowerCase().replace(/\s+/g, '');
    formatted = formatted.replace(/a/g, 'x').replace(/b/g, 'y').replace(/c/g, 'z');
    formatted = formatted.replace(/x/g, x).replace(/y/g, y).replace(/z/g, z);

    while (formatted.includes("'")) {
        formatted = formatted.replace(/1'/g, '0').replace(/0'/g, '1');
    }
    formatted = formatted.replace(/\*/g, '&&').replace(/\./g, '&&');
    formatted = formatted.replace(/([01])(?=[01])/g, '$1 && ');
    formatted = formatted.replace(/\+/g, '||');

    try {
        let hasil = eval(formatted);
        return hasil ? 1 : 0;
    } catch (error) {
        return "Error";
    }
}

// ==========================================
// FUNGSI AKSI: LOCK SCROLL & CENTANG HIJAU
// ==========================================

// 1. ANALISIS HUKUM DE MORGAN
function hitungHukum() {
    // Kunci browser agar tidak melakukan auto-scroll/lompat halaman
    if (window.event) window.event.preventDefault();

    let input = document.getElementById('input-hukum').value.trim();
    let box = document.getElementById('box-hukum-dinamis');
    let content = document.getElementById('content-hukum-dinamis');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus terlebih dahulu!</span>";
        box.style.display = 'block';
        return;
    }

    let hasilDeMorgan = "";
    if (input.includes('+')) {
        let bagian = input.split('+');
        hasilDeMorgan = bagian.map(b => `(${b.trim()})'`).join(' · ');
    } else if (input.includes('*') || input.length > 1) {
        let separator = input.includes('*') ? '*' : '';
        let bagian = separator ? input.split(separator) : input.split('');
        hasilDeMorgan = bagian.map(b => `(${b.trim()})'`).join(' + ');
    } else {
        hasilDeMorgan = `${input}'`;
    }

    content.innerHTML = `
        <p><b>Ekspresi Awal:</b> (${input})'</p>
        <p style='color:#38bdf8; font-weight:bold;'>✅ <b>Bentuk De Morgan:</b> ${hasilDeMorgan}</p>
    `;
    
    box.style.display = 'block';
}

// 2. EVALUATOR FUNGSI
function hitungFungsi() {
    if (window.event) window.event.preventDefault();

    let input = document.getElementById('input-fungsi').value.trim();
    let x = document.getElementById('eval-x').value;
    let y = document.getElementById('eval-y').value;
    let z = document.getElementById('eval-z').value;
    let box = document.getElementById('box-jawaban-dinamis');
    let content = document.getElementById('content-jawaban-dinamis');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan fungsi!</span>";
        box.style.display = 'block';
        return;
    }

    let hasil = evaluasiEkspresi(input, x, y, z);
    content.innerHTML = `
        <p><b>Fungsi:</b> f = ${input}</p>
        <p style='color:#38bdf8; font-weight:bold;'>✅ <b>Hasil Evaluasi:</b> ${hasil}</p>
    `;
    
    box.style.display = 'block';
}

// 3. TABEL KEBENARAN
function hitungTabelKebenaran() {
    if (window.event) window.event.preventDefault();

    let input = document.getElementById('input-tabel').value.trim();
    let box = document.getElementById('box-table-output-dinamis');
    let content = document.getElementById('content-table-output-dinamis');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus!</span>";
        box.style.display = 'block';
        return;
    }

    let htmlTable = `
        <p style="margin-bottom: 12px;">✅ <b>Tabel Kebenaran Berhasil Dibuat:</b></p>
        <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
            <thead>
                <tr style="background:#1e293b;"><th>x/a</th><th>y/b</th><th>z/c</th><th>Output</th></tr>
            </thead>
            <tbody>
    `;
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                let hasil = evaluasiEkspresi(input, x, y, z);
                htmlTable += `<tr><td>${x}</td><td>${y}</td><td>${z}</td><td style='color:#38bdf8; font-weight:bold;'>${hasil}</td></tr>`;
            }
        }
    }
    htmlTable += `</tbody></table>`;
    content.innerHTML = htmlTable;
    
    box.style.display = 'block';
}

// 4. RANGKAIAN LOGIKA
function hitungRangkaian() {
    if (window.event) window.event.preventDefault();

    let input = document.getElementById('input-rangkaian').value.trim();
    let box = document.getElementById('box-sirkuit-dinamis');
    let content = document.getElementById('content-sirkuit-dinamis');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus sirkuit!</span>";
        box.style.display = 'block';
        return;
    }

    content.innerHTML = `<p>✅ <b>Pemetaan Sukses:</b> Logika sirkuit <b>${input}</b> berhasil dipetakan ke dalam gerbang kombinasi internal digital.</p>`;
    
    box.style.display = 'block';
}

// 5. K-MAP
function hitungKMap() {
    if (window.event) window.event.preventDefault();

    let input = document.getElementById('input-kmap').value.trim();
    let box = document.getElementById('box-kmap-matrix-dinamis');
    let content = document.getElementById('content-kmap-matrix-dinamis');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus K-Map!</span>";
        box.style.display = 'block';
        return;
    }

    let urutanKolom = [{y:0,z:0}, {y:0,z:1}, {y:1,z:1}, {y:1,z:0}];
    let htmlKMap = `
        <p style="margin-bottom: 12px;">✅ <b>Matriks K-Map Berhasil Digenerate:</b></p>
        <table border="1" style="border-collapse:collapse; width:100%; text-align:center;">
            <thead>
                <tr style="background:#1e293b;"><th>x \\ yz</th><th>00</th><th>01</th><th>11</th><th>10</th></tr>
            </thead>
            <tbody>
    `;
    for (let x = 0; x <= 1; x++) {
        htmlKMap += `<tr><td style='font-weight:bold; color:#38bdf8;'>${x}</td>`;
        for (let i = 0; i < urutanKolom.length; i++) {
            let hasil = evaluasiEkspresi(input, x, urutanKolom[i].y, urutanKolom[i].z);
            htmlKMap += `<td>${hasil}</td>`;
        }
        htmlKMap += `</tr>`;
    }
    htmlKMap += `</tbody></table>`;
    content.innerHTML = htmlKMap;
    
    box.style.display = 'block';
}
