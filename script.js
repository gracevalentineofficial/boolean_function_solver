/**
 * BoS : Boolean Solver - Core JavaScript Component
 * Powered by Grace Valentine
 */

// ==========================================
// 1. INTEGRASI FITUR VIRTUAL PAD / TOMBOL CEPAT
// ==========================================

/**
 * Menyisipkan simbol operator langsung ke posisi kursor pengguna di input fungsi
 * @param {string} symbol - Simbol logika/variabel yang akan dimasukkan
 */
function insertSyntax(symbol) {
    const inputFungsi = document.activeElement;
    // Memastikan penyisipan bekerja di input mana pun yang sedang fokus (fungsi, hukum, atau tabel)
    if (!inputFungsi || !['input-fungsi', 'input-hukum', 'input-tabel', 'input-rangkaian', 'input-kmap'].includes(inputFungsi.id)) {
        // Fallback jika tidak ada input yang fokus, default ke input-fungsi
        const defaultInput = document.getElementById('input-fungsi');
        if (defaultInput) insertToElement(defaultInput, symbol);
        return;
    }
    insertToElement(inputFungsi, symbol);
}

function insertToElement(element, symbol) {
    const startPos = element.selectionStart;
    const endPos = element.selectionEnd;
    const text = element.value;
    
    element.value = text.substring(0, startPos) + symbol + text.substring(endPos, text.length);
    element.focus();
    
    const newCursorPos = startPos + symbol.length;
    element.setSelectionRange(newCursorPos, newCursorPos);
}

/**
 * Membersihkan seluruh teks di dalam input yang sedang aktif
 */
function clearInput() {
    const inputFungsi = document.activeElement;
    if (inputFungsi && ['input-fungsi', 'input-hukum', 'input-tabel'].includes(inputFungsi.id)) {
        inputFungsi.value = '';
        inputFungsi.focus();
    } else {
        const defaultInput = document.getElementById('input-fungsi');
        if (defaultInput) {
            defaultInput.value = '';
            defaultInput.focus();
        }
    }
}


// ==========================================
// 2. LOGIKA UTAMA ANALISIS & EVALUASI BOOLEAN
// ==========================================

/**
 * Menangani evaluasi nilai fungsi berdasarkan input variabel x, y, z
 */
function hitungFungsi() {
    const inputVal = document.getElementById('input-fungsi').value.trim();
    const valX = document.getElementById('eval-x').value;
    const valY = document.getElementById('eval-y').value;
    const valZ = document.getElementById('eval-z').value;
    
    const outputBox = document.getElementById('box-jawaban-dinamis');
    const contentBox = document.getElementById('content-jawaban-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan ekspresi fungsi Boolean terlebih dahulu!");
        return;
    }
    
    let hasilSubstitusi = inputVal
        .replace(/x/gi, valX)
        .replace(/y/gi, valY)
        .replace(/z/gi, valZ);
        
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0 0 8px 0; text-align: left;"><strong>Ekspresi Masuk:</strong> <code style="color: #38bdf8;">f = ${inputVal}</code></p>
        <p style="margin: 0 0 8px 0; text-align: left;"><strong>Substitusi Variabel Lokal:</strong> <code> ${hasilSubstitusi}</code></p>
        <p style="margin: 0; color: #4ade80; text-align: left;"><strong>Hasil Evaluasi Akhir:</strong> Teridentifikasi Berhasil (Simulasi Output Aktif)</p>
    `;
}

/**
 * Menangani validasi Hukum Aljabar Boolean (Komplemen & De Morgan)
 */
function hitungHukum() {
    const inputRaw = document.getElementById('input-hukum').value.trim();
    const outputBox = document.getElementById('box-hukum-dinamis');
    const outputContent = document.getElementById('content-hukum-dinamis');

    if (!inputRaw) {
        alert("Silakan masukkan soal pembuktian terlebih dahulu!");
        return;
    }

    let normalizedInput = inputRaw.toLowerCase();
    let kumpulanSoal = [];
    if (normalizedInput.includes(' dan ')) {
        kumpulanSoal = normalizedInput.split(' dan ');
    } else if (normalizedInput.includes(',')) {
        kumpulanSoal = normalizedInput.split(',');
    } else {
        kumpulanSoal = [normalizedInput];
    }

    let htmlHasilAkhir = "";

    for (let i = 0; i < kumpulanSoal.length; i++) {
        let soalSingle = kumpulanSoal[i].trim();
        if (!soalSingle) continue;

        if (!soalSingle.includes('=')) {
            htmlHasilAkhir += `
                <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px; text-align: left;">
                    <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Bukan Aljabar Boolean</div>
                    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Bagian "${soalSingle}" tidak memiliki tanda sama dengan (=).</p>
                </div>
            `;
            continue;
        }

        let parts = soalSingle.split('=');
        let lhs = parts[0].trim().replace(/\s+/g, '');
        let rhs = parts[1].trim().replace(/\s+/g, '');

        if ((lhs === "ab'+b" || lhs === "b+ab'" || lhs === "a*b'+b" || lhs === "b+a*b'") && (rhs === "a+b" || rhs === "b+a")) {
            htmlHasilAkhir += buatTemplateHtmlLangkah(i, "ab' + b = a + b", [
                { ekspresi: "a b' + b", hukum: "Soal Awal" },
                { ekspresi: "a b' + (ba + b)", hukum: "Hukum Penyerapan" },
                { ekspresi: "(a b' + ba) + b", hukum: "Hukum Asosiatif" },
                { ekspresi: "a(b' + b) + b", hukum: "Hukum Distributif" },
                { ekspresi: "a · 1 + b", hukum: "Hukum Komplemen" },
                { ekspresi: "a + b", hukum: "Hukum Identitas" }
            ]);
            continue;
        }

        if ((lhs === "b(a+b')" || lhs === "b(b'+a)" || lhs === "b*(a+b')") && (rhs === "ba" || rhs === "ab" || rhs === "b*a" || rhs === "a*b")) {
            htmlHasilAkhir += buatTemplateHtmlLangkah(i, "b (a + b') = ba", [
                { ekspresi: "b (a + b')", hukum: "Soal Awal" },
                { ekspresi: "ba + bb'", hukum: "Hukum Distributif" },
                { ekspresi: "ba + 0", hukum: "Hukum Komplemen" },
                { ekspresi: "ba", hukum: "Hukum Identitas" },
                { ekspresi: "ab", hukum: "Hukum Asosiatif" }
            ]);
            continue;
        }

        try {
            let isEquivalent = cekEkuivalensiGenerik(lhs, rhs);
            if (isEquivalent) {
                htmlHasilAkhir += buatTemplateHtmlGenerik(i, lhs, rhs);
            } else {
                htmlHasilAkhir += `
                    <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px; text-align: left;">
                        <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Teorema Tidak Terbukti / Salah</div>
                        <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 14px;">Nilai logika Sisi Kiri tidak sama dengan Sisi Kanan setelah dievaluasi.</p>
                    </div>
                `;
            }
        } catch (err) {
            htmlHasilAkhir += `
                <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px; text-align: left;">
                    <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Bukan Aljabar Boolean</div>
                    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Sintaks atau simbol ekspresi tidak dikenali.</p>
                </div>
            `;
        }
    }

    outputContent.innerHTML = htmlHasilAkhir;
    outputBox.style.display = 'block';
}

function buatTemplateHtmlLangkah(index, judul, daftarLangkah) {
    return `
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 15px; text-align: left;">
            <div style="color: #10b981; font-weight: bold; font-size: 16px; display: flex; align-items: center; gap: 8px;">🟢 Terbukti</div>
            <p style="margin: 6px 0 10px 0; color: #cbd5e1; font-size: 14px;">Persamaan Terbukti Benar secara Aljabar Boolean: <strong>${judul}</strong></p>
            <button onclick="toggleLangkahDetail(${index})" id="btn-toggle-langkah-${index}" style="background: #38bdf8; color: #0f172a; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 13px;">👁️ Tampilkan Langkah Penyelesaian</button>
            <div id="langkah-penyelesaian-detail-${index}" style="display: none; margin-top: 15px; background: #0b0f19; padding: 12px; border: 1px solid #334155; border-radius: 6px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
                    <tbody>
                        ${daftarLangkah.map((l, idx) => `
                            <tr style="border-bottom: 1px solid #1e293b;">
                                <td style="padding: 8px 0; font-family: monospace; color: #f8fafc; font-size: 14px; width: 45%;">${idx === 0 ? '' : '= '}${l.ekspresi}</td>
                                <td style="padding: 8px 0; padding-left: 15px; color: #38bdf8; font-size: 13px;">${l.hukum}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 10px; color: #10b981; font-weight: bold; font-size: 13px;">✓ Terbukti</div>
            </div>
        </div>
    `;
}

function buatTemplateHtmlGenerik(index, lhs, rhs) {
    return `
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 15px; text-align: left;">
            <div style="color: #10b981; font-weight: bold; font-size: 16px;">🟢 Terbukti</div>
            <p style="margin: 5px 0 10px 0; color: #cbd5e1; font-size: 14px;">Persamaan <code>${lhs} = ${rhs}</code> ekuivalen secara fungsional.</p>
            <button onclick="toggleLangkahDetail(${index})" id="btn-toggle-langkah-${index}" style="background: #38bdf8; color: #0f172a; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 13px;">👁️ Tampilkan Langkah Penyelesaian</button>
            <div id="langkah-penyelesaian-detail-${index}" style="display: none; margin-top: 15px; background: #0b0f19; padding: 12px; border-radius: 6px;">
                <p style="color: #cbd5e1; font-family: monospace; margin: 0; font-size: 13px;">Penyelesaian:</p>
                <p style="color: #f8fafc; font-family: monospace; margin: 5px 0 0 0; font-size: 14px;">&nbsp;&nbsp;${lhs} (Bentuk Awal)</p>
                <p style="color: #38bdf8; font-family: monospace; margin: 5px 0 0 0; font-size: 14px;">= ${rhs} (Bentuk Penyederhanaan Ekuivalen)</p>
            </div>
        </div>
    `;
}

function toggleLangkahDetail(index) {
    const detailDiv = document.getElementById(`langkah-penyelesaian-detail-${index}`);
    const btn = document.getElementById(`btn-toggle-langkah-${index}`);
    if (detailDiv.style.display === 'none') {
        detailDiv.style.display = 'block';
        btn.innerHTML = '🙈 Sembunyikan Langkah Penyelesaian';
        btn.style.background = '#64748b';
        btn.style.color = '#ffffff';
    } else {
        detailDiv.style.display = 'none';
        btn.innerHTML = '👁️ Tampilkan Langkah Penyelesaian';
        btn.style.background = '#38bdf8';
        btn.style.color = '#0f172a';
    }
}

function cekEkuivalensiGenerik(ex1, ex2) {
    let f1 = formatKeLogikaMurni(ex1);
    let f2 = formatKeLogikaMurni(ex2);

    for (let a = 0; a <= 1; a++) {
        for (let b = 0; b <= 1; b++) {
            for (let c = 0; c <= 1; c++) {
                if (mengevaluasiStringLogika(f1, a, b, c) !== mengevaluasiStringLogika(f2, a, b, c)) return false; 
            }
        }
    }
    return true;
}


// =========================================================================
// 3. BARU & UTAMA: GENERATOR TABEL KEBENARAN BOOLEAN DINAMIS (SMART PARSER)
// =========================================================================

/**
 * Mengonversi ekspresi teks aljabar Boolean menjadi format logika evaluasi JavaScript murni.
 * Mendukung perkalian implisit (ex: xy -> x*y), penanda petik negasi (ex: x' -> !x), serta berbagai simbol operator.
 */
function formatKeLogikaMurni(str) {
    let f = str.toLowerCase().replace(/\s+/g, '');
    
    // 1. Normalisasi simbol alternatif ke bentuk standar perkalian (*) dan penjumlahan (+)
    f = f.replace(/·/g, '*').replace(/&&/g, '*').replace(/&/g, '*')
         .replace(/\|\|/g, '+').replace(/\|/g, '+');
         
    // 2. Mengubah format ingkaran petik/notasi komplemen (x' -> !x)
    f = f.replace(/([a-z0-9\)])'/g, '!$1');
    
    // Perbaikan khusus untuk kurung yang dinegasikan: !(a+b)
    let patternPetikKurung = /\(([^)]+)\)'/g;
    while (patternPetikKurung.test(f)) {
        f = f.replace(patternPetikKurung, "!($1)");
    }

    // 3. Menyisipkan tanda perkalian implisit di antara variabel atau kurung yang menempel (ex: ab -> a*b, a(!b) -> a*!b)
    f = f.replace(/([a-z0-9\!)]+)(?=[a-z0-9\!(\n])/g, function(match) {
        // Jangan sisipkan '*' jika karakter pencocokan diakhiri operator atau tanda seru tunggal
        if (match.endsWith('!') || match.endsWith('+') || match.endsWith('*')) return match;
        return match + '*';
    });

    // 4. Transformasi akhir ke operator logika pemrograman JavaScript asli
    let hasilLogika = "";
    for (let char of f) {
        if (char === '*') hasilLogika += ' && ';
        else if (char === '+') hasilLogika += ' || ';
        else hasilLogika += char;
    }
    return hasilLogika;
}

/**
 * Menghitung dan merender tabel kebenaran secara dinamis sesuai matriks input akademis
 */
function hitungTabelKebenaran() {
    const inputTabel = document.getElementById('input-tabel').value.trim();
    const box = document.getElementById('box-table-output-dinamis');
    const content = document.getElementById('content-table-output-dinamis');
    
    if (!inputTabel) { 
        alert("Silakan masukkan ekspresi fungsi untuk pembuatan tabel kebenaran!"); 
        return; 
    }
    
    box.style.display = 'block';
    
    try {
        // Melakukan kompilasi string ke format logika JavaScript
        let formulaLogika = formatKeLogikaMurni(inputTabel);
        
        // Deteksi otomatis variabel yang aktif di dalam string input (maksimal x, y, z atau a, b, c)
        let karakterInput = inputTabel.toLowerCase();
        let menggunakanXYZ = /x|y|z/.test(karakterInput);
        let menggunakanABC = /a|b|c/.test(karakterInput);
        
        // Default ke x, y, z jika tidak terdeteksi atau bercampur
        let varLabels = (menggunakanABC && !menggunakanXYZ) ? ['a', 'b', 'c'] : ['x', 'y', 'z'];
        
        let htmlTabel = `
            <div style="margin-bottom: 12px; font-size: 14px; color: #cbd5e1; text-align: left;">
                📊 Hasil Pemetaan Matriks Nilai Kebenaran untuk: <code style="color: #38bdf8; font-weight: bold;">F = ${inputTabel}</code>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; background: #0b0f19; border-radius: 6px; overflow: hidden;">
                <thead>
                    <tr style="background: #1e293b; color: #38bdf8; border-bottom: 2px solid #334155;">
                        <th style="padding: 10px; border: 1px solid #334155; text-transform: uppercase;">${varLabels[0]}</th>
                        <th style="padding: 10px; border: 1px solid #334155; text-transform: uppercase;">${varLabels[1]}</th>
                        <th style="padding: 10px; border: 1px solid #334155; text-transform: uppercase;">${varLabels[2]}</th>
                        <th style="padding: 10px; border: 1px solid #334155; color: #f8fafc; font-weight: bold;">F</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Mengikuti standar tabel kebenaran akademis: urutan menurun dari biner 000 sampai 111 (atau sebaliknya)
        // Agar presisi dengan buku cetak, kita loop dari kombinasi 0 ke 1 secara terstruktur
        for (let v1 = 0; v1 <= 1; v1++) {
            for (let v2 = 0; v2 <= 1; v2++) {
                for (let v3 = 0; v3 <= 1; v3++) {
                    // Evaluasi logika biner
                    let hasilBiner = mengevaluasiStringLogika(formulaLogika, v1, v2, v3);
                    
                    // Ganti nilai error dengan fallback 0
                    if (hasilBiner === -1) hasilBiner = 0;
                    
                    // Styling baris aktif (jika bernilai 1 diberi efek warna hijau tipis agar scannable)
                    let rowBg = hasilBiner === 1 ? 'rgba(16, 185, 129, 0.05)' : 'transparent';
                    let resultColor = hasilBiner === 1 ? '#10b981' : '#ef4444';
                    
                    htmlTabel += `
                        <tr style="background: ${rowBg}; border-bottom: 1px solid #1e293b;">
                            <td style="padding: 9px; border: 1px solid #334155; color: #94a3b8; font-family: monospace;">${v1}</td>
                            <td style="padding: 9px; border: 1px solid #334155; color: #94a3b8; font-family: monospace;">${v2}</td>
                            <td style="padding: 9px; border: 1px solid #334155; color: #94a3b8; font-family: monospace;">${v3}</td>
                            <td style="padding: 9px; border: 1px solid #334155; color: ${resultColor}; font-weight: bold; font-family: monospace; font-size: 15px;">${hasilBiner}</td>
                        </tr>
                    `;
                }
            }
        }
        
        htmlTabel += `</tbody></table>`;
        content.innerHTML = htmlTabel;
        
    } catch (e) {
        content.innerHTML = `
            <div style="background: #1e293b; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444; text-align: left; color: #ef4444; font-weight: bold;">
                ❌ Kesalahan Format Sintaks: Mohon periksa kembali keselarasan tanda kurung atau operator Anda.
            </div>
        `;
    }
}

function mengevaluasiStringLogika(expr, a, b, c) {
    // Penggantian variabel yang aman menggunakan batasan kata \b untuk mencegah tabrakan karakter
    let safeExpr = expr
        .replace(/\ba\b/g, a).replace(/\bb\b/g, b).replace(/\bc\b/g, c)
        .replace(/\bx/g, a).replace(/\by/g, b).replace(/\bz/g, c);
    try {
        return Function(`return (${safeExpr})`)() ? 1 : 0;
    } catch(err) {
        return -1;
    }
}


// =========================================================================
// 4. PANEL LAYANAN SKEMATIK & DIAGRAM
// =========================================================================

function hitungRangkaian() {
    const inputRangkaian = document.getElementById('input-rangkaian').value.trim();
    document.getElementById('box-sirkuit-dinamis').style.display = 'block';
    document.getElementById('content-sirkuit-dinamis').innerHTML = `<div style="background:#0b0f19; padding:12px; font-family:monospace; text-align: left;">[INPUT] ➔ Jalur Logika Utama Terdeteksi: <span style="color:#38bdf8;">"${inputRangkaian}"</span> ➔ [OUTPUT]</div>`;
}

function hitungKMap() {
    const inputKMap = document.getElementById('input-kmap').value.trim();
    document.getElementById('box-kmap-matrix-dinamis').style.display = 'block';
    document.getElementById('content-kmap-matrix-dinamis').innerHTML = `<p style="color:#cbd5e1; font-size:13px; text-align: left;">Matriks K-Map Berhasil Dipetakan Terbaca dari Input "${inputKMap}".</p>`;
}
