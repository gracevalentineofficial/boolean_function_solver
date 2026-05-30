// ==========================================
// ENGINE CORE: PARSER & EVALUATOR EKSPRESI BOOLEAN
// ==========================================

// Fungsi untuk membersihkan dan menerjemahkan input ke sintaks JavaScript
function evaluasiEkspresi(ekspresi, x, y, z) {
    // Sederhanakan input pengguna agar seragam
    let formatted = ekspresi.toLowerCase().replace(/\s+/g, '');
    
    // Ganti literal variabel dengan nilai biner (1 atau 0)
    // Gunakan regex untuk memastikan tidak salah mengganti karakter sisa
    formatted = formatted.replace(/x/g, x);
    formatted = formatted.replace(/y/g, y);
    formatted = formatted.replace(/z/g, z);

    // Proses operasi komplemen/NOT (contoh: 1' menjadi 0, 0' menjadi 1)
    while (formatted.includes("'")) {
        formatted = formatted.replace(/1'/g, '0').replace(/0'/g, '1');
    }

    // Ubah operator perkalian Boolean menjadi operator logika AND JavaScript
    // Mendukung penulisan implisit (xy) maupun eksplisit (x*y atau x.y)
    formatted = formatted.replace(/\*/g, '&&').replace(/\./g, '&&');
    // Menangani perkalian biner menempel (misal: 11 atau 10 setelah substitusi)
    formatted = formatted.replace(/([01])(?=[01])/g, '$1 && ');

    // Ubah operator penjumlahan Boolean (+) menjadi OR (||)
    formatted = formatted.replace(/\+/g, '||');

    try {
        // Evaluasi string ekspresi menjadi nilai boolean JavaScript (true/false)
        let hasilTingkatLanjut = eval(formatted);
        return hasilTingkatLanjut ? 1 : 0;
    } catch (error) {
        return "Error Sintaks";
    }
}

// Fungsi pembantu menampilkan zona output utama
function tampilkanOutputZone() {
    document.getElementById('output-zone').style.display = 'block';
}

// ==========================================
// 1. FUNGSI SOLVER: ANALISIS HUKUM DE MORGAN
// ==========================================
function hitungHukum() {
    tampilkanOutputZone();
    let input = document.getElementById('input-hukum').value.trim();
    let content = document.getElementById('content-hukum');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan suku ekspresi terlebih dahulu!</span>";
        return;
    }

    // Algoritma dasar De Morgan: (A + B)' = A'B' dan (AB)' = A' + B'
    let hasilDeMorgan = "";
    if (input.includes('+')) {
        let bagian = input.split('+');
        hasilDeMorgan = bagian.map(b => `(${b.trim()})'`).join(' · ');
    } else if (input.includes('*') || input.includes('.') || input.length > 1) {
        let separator = input.includes('*') ? '*' : (input.includes('.') ? '.' : '');
        let bagian = separator ? input.split(separator) : input.split('');
        hasilDeMorgan = bagian.map(b => `${b.trim()}'`).join(' + ');
    } else {
        hasilDeMorgan = `${input}'`;
    }

    content.innerHTML = `
        <p><b>Ekspresi Awal:</b> $(${input})'$</p>
        <p style='color:#38bdf8; font-weight:bold;'><b>Bentuk Komplemen (De Morgan):</b> $${hasilDeMorgan}$</p>
        <p class='note' style='font-size:12px; color:#94a3b8;'>*Gunakan prinsip dualitas untuk menyederhanakan literal komplemen ganda.</p>
    `;
}

// ==========================================
// 2. FUNGSI SOLVER: EVALUATOR FUNGSI & LITERAL
// ==========================================
function hitungFungsi() {
    tampilkanOutputZone();
    let input = document.getElementById('input-fungsi').value.trim();
    let x = document.getElementById('eval-x').value;
    let y = document.getElementById('eval-y').value;
    let z = document.getElementById('eval-z').value;
    let content = document.getElementById('content-jawaban');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan fungsi Boolean!</span>";
        return;
    }

    let hasil = evaluasiEkspresi(input, x, y, z);
    
    // Identifikasi literal aktif
    let literalDitemukan = [];
    if (/x/i.test(input)) literalDitemukan.push('x');
    if (/y/i.test(input)) literalDitemukan.push('y');
    if (/z/i.test(input)) literalDitemukan.push('z');

    content.innerHTML = `
        <p><b>Fungsi:</b> $f(x,y,z) = {${input}}$</p>
        <p><b>Substitusi:</b> $x=${x}, y=${y}, z=${z}$</p>
        <hr style='border-color:#334155;'>
        <p style='font-size:16px;'><b>Hasil Evaluasi $f$:</b> <span style='color:#38bdf8; font-weight:bold;'>${hasil}</span></p>
        <p style='font-size:13px; color:#cbd5e1;'><b>Literal Terdeteksi:</b> ${literalDitemukan.join(', ')} (${literalDitemukan.length} Variabel)</p>
    `;
}

// ==========================================
// 3. FUNGSI SOLVER: GENERATOR TABEL KEBENARAN
// ==========================================
function hitungTabelKebenaran() {
    tampilkanOutputZone();
    let input = document.getElementById('input-tabel').value.trim();
    let content = document.getElementById('content-table-output');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus ekspresi!</span>";
        return;
    }

    // Membuat struktur tabel 3-variabel standar (8 Kombinasi)
    let htmlTable = `
        <table>
            <thead>
                <tr><th>x</th><th>y</th><th>z</th><th>f(x,y,z)</th></tr>
            </thead>
            <tbody>
    `;

    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                let hasil = evaluasiEkspresi(input, x, y, z);
                let highlightRow = hasil === 1 ? "style='background-color: rgba(56, 189, 248, 0.1);'" : "";
                htmlTable += `<tr ${highlightRow}><td>${x}</td><td>${y}</td><td>${z}</td><td style='font-weight:bold; color:${hasil===1?'#38bdf8':'#64748b'}'>${hasil}</td></tr>`;
            }
        }
    }

    htmlTable += `</tbody></table>`;
    content.innerHTML = `<p style='font-size:13px; margin-bottom:10px;'>Tabel Kebenaran untuk: <b>${input}</b></p>` + htmlTable;
}

// ==========================================
// 4. FUNGSI SOLVER: VISUALISASI ALUR SIRKUIT RANGKAIAN
// ==========================================
function hitungRangkaian() {
    tampilkanOutputZone();
    let input = document.getElementById('input-rangkaian').value.trim();
    let content = document.getElementById('content-sirkuit');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan fungsi sirkuit!</span>";
        return;
    }

    // Parsing sederhana untuk memetakan alur logika sirkuit gerbang ke teks instruksi
    let alurSirkuit = "";
    if (input.includes('+')) {
        let kelompokGerbang = input.split('+');
        alurSirkuit += "<ol>";
        kelompokGerbang.forEach((item, index) => {
            alurSirkuit += `<li>Suku-${index+1} (${item.trim()}): Melewati Gerbang <b>AND / NOT</b></li>`;
        });
        alurSirkuit += "</ol><p>➡️ Seluruh luaran suku digabungkan menuju Gerbang Utama: <b>OR GATE (Penjumlahan)</b></p>";
    } else {
        alurSirkuit = "<p>➡️ Ekspresi tunggal: Melewati interkoneksi seri kabel logika menuju <b>AND GATE / NOT GATE</b> secara langsung.</p>";
    }

    content.innerHTML = `
        <div style='background:#0f172a; padding:12px; border-radius:6px; font-family:monospace; border:1px solid #334155;'>
            <p style='color:#38bdf8; margin-top:0;'><b>[Peta Interkoneksi Sirkuit]</b></p>
            ${alurSirkuit}
        </div>
    `;
}

// ==========================================
// 5. FUNGSI SOLVER: MATRIKS PETA KARNAUGH (K-MAP)
// ==========================================
function hitungKMap() {
    tampilkanOutputZone();
    let input = document.getElementById('input-kmap').value.trim();
    let content = document.getElementById('content-kmap-matrix');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan fungsi penyederhanaan!</span>";
        return;
    }

    // Ambil nilai kebenaran untuk susunan urutan matriks K-Map 3-Variabel (Kode Gray)
    // Baris: x=0, x=1
    // Kolom: yz=00, yz=01, yz=11, yz=10 (Urutan Kode Gray khusus)
    let urutanKolom = [
        {y:0, z:0}, // 00
        {y:0, z:1}, // 01
        {y:1, z:1}, // 11
        {y:1, z:0}  // 10
    ];

    let htmlKMap = `
        <table>
            <thead>
                <tr>
                    <th style='background:#1e293b; color:#cbd5e1;'>x \\ yz</th>
                    <th>00</th>
                    <th>01</th>
                    <th>11</th>
                    <th>10</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let x = 0; x <= 1; x++) {
        htmlKMap += `<tr><td style='font-weight:bold; background:#0f172a; color:#38bdf8; text-align:center;'>${x}</td>`;
        for (let i = 0; i < urutanKolom.length; i++) {
            let y = urutanKolom[i].y;
            let z = urutanKolom[i].z;
            let hasil = evaluasiEkspresi(input, x, y, z);
            
            let cellStyle = hasil === 1 ? "style='background-color:#0284c7; color:white; font-weight:bold; text-align:center;'" : "style='text-align:center; color:#475569;'";
            htmlKMap += `<td ${cellStyle}>${hasil}</td>`;
        }
        htmlKMap += `</tr>`;
    }

    htmlKMap += `</tbody></table>`;
    content.innerHTML = `<p style='font-size:13px; margin-bottom:10px;'>Peta Kotak Matriks Berdasarkan Urutan Kode Gray:</p>` + htmlKMap;
}
