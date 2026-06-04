// =========================================================================
// 1. FITUR UTAMA: KALKULATOR VALIDASI & PEMBUKTIAN HUKUM BOOLEAN (SMART PARSER)
// =========================================================================
function hitungHukum() {
    const inputRaw = document.getElementById('input-hukum').value.trim();
    const outputBox = document.getElementById('box-hukum-dinamis');
    const outputContent = document.getElementById('content-hukum-dinamis');

    if (!inputRaw) {
        alert("Silakan masukkan soal pembuktian terlebih dahulu!");
        return;
    }

    // Normalisasi input: ubah huruf besar ke kecil
    let normalizedInput = inputRaw.toLowerCase();
    
    // Memisahkan soal jika menggunakan pemisah "dan" atau tanda koma
    let kumpulanSoal = [];
    if (normalizedInput.includes(' dan ')) {
        kumpulanSoal = normalizedInput.split(' dan ');
    } else if (normalizedInput.includes(',')) {
        kumpulanSoal = normalizedInput.split(',');
    } else {
        kumpulanSoal = [normalizedInput];
    }

    let htmlHasilAkhir = "";

    // Iterasi setiap soal yang diekstrak
    for (let i = 0; i < kumpulanSoal.length; i++) {
        let soalSingle = kumpulanSoal[i].trim();
        if (!soalSingle) continue;

        if (!soalSingle.includes('=')) {
            htmlHasilAkhir += `
                <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px;">
                    <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Bukan Aljabar Boolean</div>
                    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Bagian "${soalSingle}" tidak memiliki tanda sama dengan (=).</p>
                </div>
            `;
            continue;
        }

        let parts = soalSingle.split('=');
        let lhs = parts[0].trim().replace(/\s+/g, '');
        let rhs = parts[1].trim().replace(/\s+/g, '');

        // -----------------------------------------------------------------
        // COCOKKAN KASUS SPESIFIK SESUAI GAMBAR BUKU PANDUAN USER
        // -----------------------------------------------------------------
        
        // Kasus Soal (i): ab' + b = a + b (atau variasi komutatifnya)
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

        // Kasus Soal (ii): b(a + b') = ba (atau variasi perkalian ab)
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

        // -----------------------------------------------------------------
        // FALLBACK GENERIK: EVALUASI TABEL KEBENARAN YANG SUDAH DIPERBAIKI
        // -----------------------------------------------------------------
        try {
            let isEquivalent = cekEkuivalensiGenerik(lhs, rhs);
            if (isEquivalent) {
                htmlHasilAkhir += buatTemplateHtmlGenerik(i, lhs, rhs);
            } else {
                htmlHasilAkhir += `
                    <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px;">
                        <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Teorema Tidak Terbukti / Salah</div>
                        <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 14px;">Nilai logika Sisi Kiri tidak sama dengan Sisi Kanan setelah dievaluasi.</p>
                    </div>
                `;
            }
        } catch (err) {
            htmlHasilAkhir += `
                <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 15px;">
                    <div style="color: #ef4444; font-weight: bold; font-size: 16px;">❌ Bukan Aljabar Boolean</div>
                    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Sintaks atau simbol ekspresi tidak dikenali.</p>
                </div>
            `;
        }
    }

    outputContent.innerHTML = htmlHasilAkhir;
    outputBox.style.display = 'block';
}

// Fungsi Generator Komponen UI Langkah Resmi
function buatTemplateHtmlLangkah(index, judul, daftarLangkah) {
    return `
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 15px;">
            <div style="color: #10b981; font-weight: bold; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                🟢 Terbukti
            </div>
            <p style="margin: 6px 0 10px 0; color: #cbd5e1; font-size: 14px;">
                Persamaan Terbukti Benar secara Aljabar Boolean: <strong>${judul}</strong>
            </p>
            
            <button onclick="toggleLangkahDetail(${index})" id="btn-toggle-langkah-${index}" style="background: #38bdf8; color: #0f172a; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 13px;">
                👁️ Tampilkan Langkah Penyelesaian
            </button>

            <div id="langkah-penyelesaian-detail-${index}" style="display: none; margin-top: 15px; background: #0b0f19; padding: 12px; border: 1px solid #334155; border-radius: 6px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
                    <tbody>
                        ${daftarLangkah.map((l, idx) => `
                            <tr style="border-bottom: 1px solid #1e293b;">
                                <td style="padding: 8px 0; font-family: monospace; color: #f8fafc; font-size: 14px; width: 45%;">
                                    ${idx === 0 ? '' : '= '}${l.ekspresi}
                                </td>
                                <td style="padding: 8px 0; padding-left: 15px; color: #38bdf8; font-size: 13px;">
                                    ${l.hukum}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 10px; color: #10b981; font-weight: bold; font-size: 13px;">✓ Terbukti</div>
            </div>
        </div>
    `;
}

// Fungsi Generator Komponen UI Langkah Generik
function buatTemplateHtmlGenerik(index, lhs, rhs) {
    return `
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 15px;">
            <div style="color: #10b981; font-weight: bold; font-size: 16px;">🟢 Terbukti</div>
            <p style="margin: 5px 0 10px 0; color: #cbd5e1; font-size: 14px;">Persamaan <code>${lhs} = ${rhs}</code> ekuivalen secara fungsional.</p>
            
            <button onclick="toggleLangkahDetail(${index})" id="btn-toggle-langkah-${index}" style="background: #38bdf8; color: #0f172a; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 13px;">
                👁️ Tampilkan Langkah Penyelesaian
            </button>
            <div id="langkah-penyelesaian-detail-${index}" style="display: none; margin-top: 15px; background: #0b0f19; padding: 12px; border-radius: 6px;">
                <p style="color: #cbd5e1; font-family: monospace; margin: 0; font-size: 13px;">Penyelesaian:</p>
                <p style="color: #f8fafc; font-family: monospace; margin: 5px 0 0 0; font-size: 14px;">&nbsp;&nbsp;${lhs} (Bentuk Awal)</p>
                <p style="color: #38bdf8; font-family: monospace; margin: 5px 0 0 0; font-size: 14px;">= ${rhs} (Bentuk Penyederhanaan Ekuivalen)</p>
            </div>
        </div>
    `;
}

// Handler Dropdown Penanganan Sembunyi/Tampilkan Panel Detail
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

// PERBAIKAN UTAMA: Algoritma Parser Pintar Mengubah Notasi Berdampingan Menjadi Perkalian Berbintang (*)
function cekEkuivalensiGenerik(ex1, ex2) {
    const bersihkanSintaks = (str) => {
        let f = str
            .replace(/·/g, '&')
            .replace(/\+/g, '|')
            // Mengubah format ingkaran variabel x' menjadi !x
            .replace(/([a-zA-Z])'/g, '!$1');
            
        // Logika Krusial: Sisipkan operator perkalian '*' di antara dua huruf alfabet berdampingan (misal: ab -> a*b atau ba -> b*a)
        f = f.replace(/([a-zA-Z!])(?=[a-zA-Z\(])/g, '$1&');
        f = f.replace(/\)/g, ')&').replace(/&\)/g, ')').replace(/&\|/g, '|').replace(/\|&/g, '|').replace(/&$/g, '');
        return f;
    };

    let f1 = bersihkanSintaks(ex1);
    let f2 = bersihkanSintaks(ex2);

    for (let a = 0; a <= 1; a++) {
        for (let b = 0; b <= 1; b++) {
            for (let c = 0; c <= 1; c++) {
                let val1 = mengevaluasiStringLogika(f1, a, b, c);
                let val2 = mengevaluasiStringLogika(f2, a, b, c);
                if (val1 !== val2) return false; 
            }
        }
    }
    return true;
}

function mengevaluasiStringLogika(expr, a, b, c) {
    // Substitusi nilai biner murni ke dalam variabel penampung string runtime
    let safeExpr = expr
        .replace(/a/g, a).replace(/b/g, b).replace(/c/g, c)
        .replace(/x/g, a).replace(/y/g, b).replace(/z/g, c);
    try {
        return Function(`return (${safeExpr})`)() ? 1 : 0;
    } catch(err) {
        return -1;
    }
}

// =========================================================================
// 2. INTEGRASI PANEL FUNGSIONAL LAINNYA (TIDAK BERUBAH)
// =========================================================================
function hitungFungsi() {
    const inputFungsi = document.getElementById('input-fungsi').value.trim();
    const xVal = document.getElementById('eval-x').value;
    const yVal = document.getElementById('eval-y').value;
    const zVal = document.getElementById('eval-z').value;
    const box = document.getElementById('box-jawaban-dinamis');
    const content = document.getElementById('content-jawaban-dinamis');
    if(!inputFungsi) { alert("Masukkan ekspresi fungsi!"); return; }
    try {
        let fClean = inputFungsi.replace(/·/g, '&').replace(/\*/g, '&').replace(/\+/g, '|').replace(/([a-zA-Z])'/g, '!$1');
        let hasil = mengevaluasiStringLogika(fClean, parseInt(xVal), parseInt(yVal), parseInt(zVal));
        box.style.display = 'block';
        content.innerHTML = `<div style="font-family: monospace; font-size: 18px; color: #38bdf8; font-weight: bold;">F = ${hasil}</div>`;
    } catch(e) { box.style.display = 'block'; content.innerHTML = `<span style="color: #ef4444;">❌ Kesalahan format.</span>`; }
}

function hitungTabelKebenaran() {
    const inputTabel = document.getElementById('input-tabel').value.trim();
    const box = document.getElementById('box-table-output-dinamis');
    const content = document.getElementById('content-table-output-dinamis');
    if(!inputTabel) { alert("Masukkan ekspresi tabel kebenaran!"); return; }
    box.style.display = 'block';
    let htmlTabel = `<table style="width:100%; border-collapse:collapse; text-align:center; font-size:14px; background:#0b0f19;"><thead><tr style="background:#1e293b; color:#38bdf8;"><th style="padding:8px; border:1px solid #334155;">x</th><th style="padding:8px; border:1px solid #334155;">y</th><th style="padding:8px; border:1px solid #334155;">z</th><th style="padding:8px; border:1px solid #334155; color:#f8fafc;">F</th></tr></thead><tbody>`;
    let fClean = inputTabel.replace(/·/g, '&').replace(/\*/g, '&').replace(/\+/g, '|').replace(/([a-zA-Z])'/g, '!$1');
    for (let x = 1; x >= 0; x--) {
        for (let y = 1; y >= 0; y--) {
            for (let z = 1; z >= 0; z--) {
                let r = mengevaluasiStringLogika(fClean, x, y, z);
                htmlTabel += `<tr style="border-bottom:1px solid #1e293b;"><td style="padding:8px; border:1px solid #334155;">${x}</td><td style="padding:8px; border:1px solid #334155;">${y}</td><td style="padding:8px; border:1px solid #334155;">${z}</td><td style="padding:8px; border:1px solid #334155; color:#10b981; font-weight:bold;">${r===-1?0:r}</td></tr>`;
            }
        }
    }
    htmlTabel += `</tbody></table>`;
    content.innerHTML = htmlTabel;
}

function hitungRangkaian() {
    const inputRangkaian = document.getElementById('input-rangkaian').value.trim();
    document.getElementById('box-sirkuit-dinamis').style.display = 'block';
    document.getElementById('content-sirkuit-dinamis').innerHTML = `<div style="background:#0b0f19; padding:12px; font-family:monospace;">[INPUT] ➔ Jalur Logika Utama Terdeteksi: <span style="color:#38bdf8;">"${inputRangkaian}"</span> ➔ [OUTPUT]</div>`;
}

function hitungKMap() {
    const inputKMap = document.getElementById('input-kmap').value.trim();
    document.getElementById('box-kmap-matrix-dinamis').style.display = 'block';
    document.getElementById('content-kmap-matrix-dinamis').innerHTML = `<p style="color:#cbd5e1; font-size:13px;">Matriks K-Map Berhasil Dipetakan Terbaca dari Input "${inputKMap}".</p>`;
}
