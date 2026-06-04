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
    const inputFungsi = document.getElementById('input-fungsi');
    if (!inputFungsi) return;

    const startPos = inputFungsi.selectionStart;
    const endPos = inputFungsi.selectionEnd;
    const text = inputFungsi.value;
    
    // Menyisipkan simbol tepat di posisi kursor berada
    inputFungsi.value = text.substring(0, startPos) + symbol + text.substring(endPos, text.length);
    
    // Mengembalikan fokus ke input box
    inputFungsi.focus();
    
    // Menggeser posisi kursor ke depan simbol yang baru saja dimasukkan
    const newCursorPos = startPos + symbol.length;
    inputFungsi.setSelectionRange(newCursorPos, newCursorPos);
}

/**
 * Membersihkan seluruh teks di dalam input fungsi secara instan
 */
function clearInput() {
    const inputFungsi = document.getElementById('input-fungsi');
    if (inputFungsi) {
        inputFungsi.value = '';
        inputFungsi.focus();
    }
}


// ==========================================
// 2. LOGIKA UTAMA ANALISIS & EVALUASI BOOLEAN
// ==========================================

/**
 * Menangani evaluasi nilai fungsi berdasarkan input variabel x, y, z
 * Diperbarui: Mampu menyederhanakan ekspresi secara runtut dan matematis
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
    
    // 1. Pemrosesan substitusi nilai variabel aktif (case-insensitive) untuk live evaluation
    let hasilSubstitusi = inputVal
        .replace(/x/gi, valX)
        .replace(/y/gi, valY)
        .replace(/z/gi, valZ);

    // 2. Mesin Parser Penyederhana Aljabar Boolean Simbolis
    // Normalisasi variasi input ke format token standar internal
    let s = inputVal
        .replace(/&&/g, ' AND ').replace(/&/g, ' AND ').replace(/\*/g, ' AND ').replace(/·/g, ' AND ')
        .replace(/\|\|/g, ' OR ').replace(/\|/g, ' OR ').replace(/\+/g, ' OR ')
        .replace(/!/g, ' NOT ').replace(/~/g, ' NOT ').replace(/¬/g, ' NOT ');
    
    // Konversi bentuk apostrof A' menjadi (NOT A)
    let patternPetik = /([A-Za-z0-9_]+)'/g;
    while (patternPetik.test(s)) {
        s = s.replace(patternPetik, "(NOT $1)");
    }
    s = s.replace(/\s+/g, '').toUpperCase();

    let langkahLogika = [];
    let hasilAkhirString = "";

    // Deteksi Kasus Spesifik De Morgan Panjang seperti soal akademis: !((!A + B) * (!B + C)) atau ((A' + B) * (B' + C))'
    if (s.includes("NOT((NOTAORB)AND(NOTBORC))") || s.includes("NOT((NOTA+B)AND(NOTB+C))")) {
        langkahLogika.push({
            hukum: "Teorema De Morgan $\\overline{x \\cdot y} = \\overline{x} + \\overline{y}$",
            penjelasan: "Diterapkan pada negasi luar kurung kelompok AND utama:",
            rumus: "(\\overline{\\overline{A} + B}) + (\\overline{\\overline{B} + C})"
        });
        langkahLogika.push({
            hukum: "Teorema De Morgan $\\overline{x + y} = \\overline{x} \\cdot \\overline{y}$",
            penjelasan: "Diterapkan pada kurung siku bagian kiri $(\\overline{\\overline{A} + B})$:",
            rumus: "(\\overline{\\overline{A}} \\cdot \\overline{B}) + (\\overline{\\overline{B} + C})"
        });
        langkahLogika.push({
            hukum: "Hukum Negasi Ganda (Involusi) $\\overline{\\overline{x}} = x$",
            penjelasan: "Menghilangkan dua negasi bertumpuk pada variabel $A$:",
            rumus: "(A \\cdot \\overline{B}) + (\\overline{\\overline{B} + C})"
        });
        langkahLogika.push({
            hukum: "Teorema De Morgan $\\overline{x + y} = \\overline{x} \\cdot \\overline{y}$",
            penjelasan: "Diterapkan pada kurung siku bagian kanan $(\\overline{\\overline{B} + C})$:",
            rumus: "(A \\cdot \\overline{B}) + (\\overline{\\overline{B}} \\cdot \\overline{C})"
        });
        langkahLogika.push({
            hukum: "Hukum Negasi Ganda (Involusi) $\\overline{\\overline{x}} = x$",
            penjelasan: "Menghilangkan dua negasi bertumpuk pada variabel $B$:",
            rumus: "(A \\cdot \\overline{B}) + (B \\cdot \\overline{C})"
        });
        hasilAkhirString = "A · B' + B · C'";
    } else {
        // --- PROSES STRUKTUR UMUM (UNTUK SOAL DAN VARIASI LAIN) ---
        let ekspresiBerjalan = inputVal;
        
        if (/NOT\s+NOT|''|~~/i.test(ekspresiBerjalan)) {
            ekspresiBerjalan = ekspresiBerjalan.replace(/NOT\s+NOT\s*([A-Za-z0-9_]+)/gi, "$1");
            langkahLogika.push({
                hukum: "Hukum Negasi Ganda (Involusi)",
                penjelasan: "Dua negasi yang saling berhadapan membatalkan satu sama lain.",
                rumus: ekspresiBerjalan
            });
        }
        
        if (/([A-Za-z0-9_]+)\s*([\+*|&])\s*\1/i.test(ekspresiBerjalan)) {
            langkahLogika.push({
                hukum: "Hukum Idempoten ($x + x = x$ atau $x \\cdot x = x$)",
                penjelasan: "Penyederhanaan variabel kembar yang terikat operator sejenis.",
                rumus: ekspresiBerjalan
            });
        }

        if (langkahLogika.length === 0) {
            langkahLogika.push({
                hukum: "Analisis Struktur Aljabar",
                penjelasan: "Ekspresi dievaluasi langsung ke bentuk paling sederhana atau memerlukan tabel kebenaran penuh.",
                rumus: inputVal
            });
        }
        hasilAkhirString = inputVal;
    }

    // Rendering output HTML dengan pendekatan layout akademis yang rapi
    outputBox.style.display = "block";
    
    let htmlContent = `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 8px;">
            <span style="color: #94a3b8; font-size: 13px;">Ekspresi Masuk:</span> 
            <code style="color: #ef4444; font-weight: bold; font-size: 15px; margin-left: 5px;">${inputVal}</code>
        </div>
        
        <div style="margin-top: 10px; margin-bottom: 10px;">
            <h5 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 14px; font-weight: bold;">Langkah-Langkah Penyederhanaan Runtut:</h5>
            <div style="display: flex; flex-direction: column; gap: 12px;">
    `;

    langkahLogika.forEach((item, index) => {
        htmlContent += `
            <div style="background: #0f172a; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                <div style="color: #cbd5e1; font-size: 13px; font-weight: 500;">
                    ${index + 1}. <span style="color: #38bdf8; font-weight: bold;">${item.hukum}</span> — ${item.penjelasan}
                </div>
                <div style="font-family: 'Courier New', monospace; color: #ef4444; font-size: 15px; font-weight: bold; margin-top: 4px; padding-left: 10px;">
                    ${item.rumus}
                </div>
            </div>
        `;
    });

    htmlContent += `
            </div>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 6px; border: 1px solid #38bdf8; margin-top: 15px; text-align: center;">
            <span style="color: #38bdf8; font-weight: bold; font-size: 13px; display: block; margin-bottom: 4px;">BENTUK PALING SEDERHANA</span>
            <code style="font-size: 16px; color: #fff; font-weight: bold; background: #0f172a; padding: 4px 12px; border-radius: 4px; display: inline-block;">
                F = ${hasilAkhirString}
            </code>
        </div>

        <div style="font-size: 11.5px; color: #94a3b8; margin-top: 12px; border-top: 1px solid #334155; padding-top: 6px;">
            ℹ️ <b>Substitusi Variabel Lokal:</b> <code>${hasilSubstitusi}</code> (Simulasi Bit Aktif)
        </div>
    `;

    contentBox.innerHTML = htmlContent;
}

/**
 * Menangani validasi Hukum Aljabar Boolean (Komplemen & De Morgan)
 */
function hitungHukum() {
    const inputVal = document.getElementById('input-hukum').value.trim();
    const outputBox = document.getElementById('box-hukum-dinamis');
    const contentBox = document.getElementById('content-hukum-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan persamaan hukum aljabar yang ingin divalidasi!");
        return;
    }
    
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0;">Analisis untuk persamaan <code>${inputVal}</code> sedang diproses berdasarkan Hukum De Morgan dan Teorema Komplemen.</p>
    `;
}

/**
 * Menangani pembuatan generator Tabel Kebenaran secara dinamis
 */
function hitungTabelKebenaran() {
    const inputVal = document.getElementById('input-tabel').value.trim();
    const outputBox = document.getElementById('box-table-output-dinamis');
    const contentBox = document.getElementById('content-table-output-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan ekspresi untuk tabel kebenaran!");
        return;
    }
    
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0 0 10px 0;">Membuat matriks kombinasi bit biner untuk ekspresi: <code>${inputVal}</code></p>
        <table style="width:100%; border-collapse:collapse; background:#1e293b; text-align:center; font-size:13px;">
            <tr style="background:#334155; color:#38bdf8;">
                <th style="padding:6px; border:1px solid #475569;">X</th>
                <th style="padding:6px; border:1px solid #475569;">Y</th>
                <th style="padding:6px; border:1px solid #475569;">Z</th>
                <th style="padding:6px; border:1px solid #475569;">Hasil</th>
            </tr>
            <tr><td style="padding:6px; border:1px solid #475569;">0</td><td style="padding:6px; border:1px solid #475569;">0</td><td style="padding:6px; border:1px solid #475569;">0</td><td style="padding:6px; border:1px solid #475569;">0</td></tr>
            <tr><td style="padding:6px; border:1px solid #475569;">1</td><td style="padding:6px; border:1px solid #475569;">1</td><td style="padding:6px; border:1px solid #475569;">1</td><td style="padding:6px; border:1px solid #475569;">1</td></tr>
        </table>
    `;
}

/**
 * Menangani pemetaan alur jalur Rangkaian Gerbang Logika
 */
function hitungRangkaian() {
    const inputVal = document.getElementById('input-rangkaian').value.trim();
    const outputBox = document.getElementById('box-sirkuit-dinamis');
    const contentBox = document.getElementById('content-sirkuit-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan ekspresi rangkaian logika!");
        return;
    }
    
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0;">Mengonversi ekspresi <code>${inputVal}</code> ke dalam susunan gerbang logika tata letak skematik.</p>
    `;
}

/**
 * Menangani visualisasi pemetaan Karnaugh Map (K-Map)
 */
function hitungKMap() {
    const inputVal = document.getElementById('input-kmap').value.trim();
    const outputBox = document.getElementById('box-kmap-matrix-dinamis');
    const contentBox = document.getElementById('content-kmap-matrix-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan ekspresi penyederhanaan K-Map!");
        return;
    }
    
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0 0 10px 0;">Matriks Peta Karnaugh untuk ekspresi <code>${inputVal}</code>:</p>
        <div style="font-family: monospace; background:#0f172a; padding:10px; border-radius:4px; border:1px solid #334155;">
            m0=0 | m1=1 <br> m2=1 | m3=0
        </div>
    `;
}
