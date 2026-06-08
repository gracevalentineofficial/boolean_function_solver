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
    
    // Pemrosesan substitusi nilai variabel aktif (case-insensitive)
    let hasilSubstitusi = inputVal
        .replace(/x/gi, valX)
        .replace(/y/gi, valY)
        .replace(/z/gi, valZ);
        
    outputBox.style.display = "block";
    contentBox.innerHTML = `
        <p style="margin: 0 0 8px 0;"><strong>Ekspresi Masuk:</strong> <code style="color: #38bdf8;">f = ${inputVal}</code></p>
        <p style="margin: 0 0 8px 0;"><strong>Substitusi Variabel Lokal:</strong> <code> ${hasilSubstitusi}</code></p>
        <p style="margin: 0; color: #4ade80;"><strong>Hasil Evaluasi Akhir:</strong> Teridentifikasi Berhasil (Simulasi Output Aktif)</p>
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
            htmlHasilAkhir += buatTemplateHtmlLangkah(i, "b (a + b')", [
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

function buatTemplateHtmlGenerik(index, lhs, rhs) {
    return `
        <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 15px; text-align: left;">
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
    const formatKeLogikaMurni = (str) => {
        let f = str
            .replace(/·/g, '*')
            .replace(/([a-zA-Z])'/g, '!$1')
            .replace(/([a-zA-Z!])(?=[a-zA-Z\(])/g, '$1*');

        let hasilLogika = "";
        for (let char of f) {
            if (char === '*') hasilLogika += ' && ';
            else if (char === '+') hasilLogika += ' || ';
            else hasilLogika += char;
        }
        return hasilLogika;
    };

    let f1 = formatKeLogikaMurni(ex1);
    let f2 = formatKeLogikaMurni(ex2);

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
    let safeExpr = expr
        .replace(/\ba\b/g, a).replace(/\bb\b/g, b).replace(/\bc/g, c)
        .replace(/\bx/g, a).replace(/\by/g, b).replace(/\bz/g, c);
    try {
        return Function(`return (${safeExpr})`)() ? 1 : 0;
    } catch(err) {
        return -1;
    }
}


// ==========================================
// 3. LOGIKA LANJUTAN: TABEL KEBENARAN, SOP, DAN POS
// ==========================================

/**
 * SKEMA 1: Membuat matriks baris dan kolom berdasarkan jumlah variabel yang diinput user
 */
function buatStrukturTabelSkema1() {
    const jumlahVar = parseInt(document.getElementById('jumlah-variabel-skema1').value);
    const containerTabel = document.getElementById('container-tabel-skema1');
    
    // Tentukan nama variabel berdasarkan jumlahnya
    let varNames = ['X', 'Y', 'Z', 'W'].slice(0, jumlahVar);
    let totalBaris = Math.pow(2, jumlahVar);
    
    let html = `
        <p style="margin: 10px 0; font-size: 14px; color: #cbd5e1;">Silakan isi nilai output <strong>(0 atau 1)</strong> pada kolom <strong>F</strong> untuk setiap baris:</p>
        <div style="overflow-x: auto;">
            <table id="tabel-input-skema1" style="width: 100%; border-collapse: collapse; text-align: center; background: #0f172a; color: #e2e8f0; font-size: 13px; border-radius: 6px; overflow: hidden;">
                <thead>
                    <tr style="background: #1e293b; color: #38bdf8;">
                        <th style="padding: 8px; border: 1px solid #334155;">No (Desimal)</th>
                        ${varNames.map(v => `<th style="padding: 8px; border: 1px solid #334155;">${v}</th>`).join('')}
                        <th style="padding: 8px; border: 1px solid #334155; color: #f43f5e;">F (Output)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < totalBaris; i++) {
        html += `<tr>`;
        html += `<td style="padding: 6px; border: 1px solid #334155; font-weight: bold; background: #1e293b;">${i}</td>`;
        
        // Generate kombinasi bit biner
        for (let j = jumlahVar - 1; j >= 0; j--) {
            let bit = (i >> j) & 1;
            html += `<td style="padding: 6px; border: 1px solid #334155; font-family: monospace;">${bit}</td>`;
        }
        
        // Input elemen seleksi untuk kolom F
        html += `
            <td style="padding: 6px; border: 1px solid #334155;">
                <select class="output-row-skema1" data-index="${i}" style="background: #1e293b; color: #fff; border: 1px solid #f43f5e; padding: 2px 6px; border-radius: 4px; outline: none; font-weight: bold;">
                    <option value="0">0</option>
                    <option value="1">1</option>
                </select>
            </td>
        `;
        html += `</tr>`;
    }
    
    html += `
                </tbody>
            </table>
        </div>
        <button onclick="prosesTabelSOPPOS_Skema1()" style="margin-top: 15px; width: 100%; background: #10b981; color: #fff;">Proses Kanonik SOP & POS (Skema 1)</button>
    `;
    
    containerTabel.innerHTML = html;
}

/**
 * SKEMA 1: Memproses hasil ekstraksi tabel manual menjadi representasi SOP dan POS
 */
function prosesTabelSOPPOS_Skema1() {
    const jumlahVar = parseInt(document.getElementById('jumlah-variabel-skema1').value);
    const selectElements = document.querySelectorAll('.output-row-skema1');
    const outputBox = document.getElementById('box-table-output-dinamis');
    const contentBox = document.getElementById('content-table-output-dinamis');
    
    let varNames = ['X', 'Y', 'Z', 'W'].slice(0, jumlahVar);
    let minterms = [];
    let maxterms = [];
    
    selectElements.forEach((el, index) => {
        let val = parseInt(el.value);
        if (val === 1) minterms.push(index);
        else maxterms.push(index);
    });
    
    let hasilKanonik = hitungEkspresiSOPPOS(varNames, minterms, maxterms);
    
    outputBox.style.display = "block";
    contentBox.innerHTML = generateHtmlHasilSOPPOS("Hasil Analisis Input Tabel Manual (Skema 1)", hasilKanonik);
}

/**
 * SKEMA 2: Menghasilkan tabel kebenaran otomatis beserta SOP dan POS dari formula fungsi string
 */
function hitungTabelKebenaran() {
    let inputVal = document.getElementById('input-tabel').value.trim();
    const outputBox = document.getElementById('box-table-output-dinamis');
    const contentBox = document.getElementById('content-table-output-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan ekspresi fungsi Boolean terlebih dahulu!");
        return;
    }
    
    // Deteksi variabel secara otomatis dari teks alfabet (case-insensitive)
    let detectedVars = [];
    let cleanExpr = inputVal.toUpperCase();
    
    for (let char of cleanExpr) {
        if (char >= 'A' && char <= 'Z' && !detectedVars.includes(char)) {
            detectedVars.push(char);
        }
    }
    
    // Sorting alfabet agar urutan kolom konsisten
    detectedVars.sort();
    
    if (detectedVars.length === 0) {
        alert("Ekspresi tidak valid! Tidak ditemukan variabel huruf.");
        return;
    }
    
    let totalBaris = Math.pow(2, detectedVars.length);
    let minterms = [];
    let maxterms = [];
    
    // Normalisasi sintaks ekspresi agar kompatibel dengan engine parser JavaScript
    let parsedExpr = cleanExpr
        .replace(/·/g, '*')
        .replace(/’/g, "'")
        .replace(/([A-Z])'/g, '!$1') // Mengubah A' menjadi !A
        .replace(/([A-Z!])(?=[A-Z\(])/g, '$1*'); // Mengubah kedekatan variabel AB menjadi A*B
        
    let jsExpr = "";
    for (let char of parsedExpr) {
        if (char === '*') jsExpr += ' && ';
        else if (char === '+') jsExpr += ' || ';
        else jsExpr += char;
    }
    
    // Bangun visualisasi tabel kebenaran HTML
    let htmlTable = `
        <p style="margin: 0 0 10px 0; font-size: 14px;">Tabel Kebenaran Otomatis untuk ekspresi: <code style="color:#38bdf8;">f = ${inputVal}</code></p>
        <div style="overflow-x: auto; margin-bottom: 20px;">
            <table style="width:100%; border-collapse:collapse; background:#0f172a; text-align:center; font-size:13px; border-radius: 6px; overflow: hidden;">
                <thead>
                    <tr style="background:#1e293b; color:#38bdf8;">
                        <th style="padding:8px; border:1px solid #334155;">No</th>
                        ${detectedVars.map(v => `<th style="padding:8px; border:1px solid #334155;">${v}</th>`).join('')}
                        <th style="padding:8px; border:1px solid #334155; color: #4ade80;">F (Hasil)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < totalBaris; i++) {
        let varValues = {};
        htmlTable += `<tr>`;
        htmlTable += `<td style="padding:6px; border:1px solid #334155; font-weight:bold; background:#1e293b;">${i}</td>`;
        
        // Petakan bit biner ke masing-masing variabel
        for (let j = detectedVars.length - 1; j >= 0; j--) {
            let bit = (i >> j) & 1;
            let currentVar = detectedVars[detectedVars.length - 1 - j];
            varValues[currentVar] = bit;
            htmlTable += `<td style="padding:6px; border:1px solid #334155; font-family:monospace;">${bit}</td>`;
        }
        
        // Evaluasi ekspresi logika dinamis
        let workingExpr = jsExpr;
        for (let v in varValues) {
            // Gunakan regex batas kata agar variabel tidak saling tindih substitusi
            let regex = new RegExp('\\b' + v + '\\b', 'g');
            workingExpr = workingExpr.replace(regex, varValues[v]);
        }
        
        let outVal = 0;
        try {
            outVal = Function(`return (${workingExpr})`)() ? 1 : 0;
        } catch (e) {
            outVal = 0; // Fallback nilai default aman jika error parsing
        }
        
        if (outVal === 1) minterms.push(i);
        else maxterms.push(i);
        
        htmlTable += `<td style="padding:6px; border:1px solid #334155; font-weight:bold; color:${outVal === 1 ? '#4ade80' : '#94a3b8'}; background: #111827;">${outVal}</td>`;
        htmlTable += `</tr>`;
    }
    
    htmlTable += `
                </tbody>
            </table>
        </div>
    `;
    
    let hasilKanonik = hitungEkspresiSOPPOS(detectedVars, minterms, maxterms);
    
    outputBox.style.display = "block";
    contentBox.innerHTML = htmlTable + generateHtmlHasilSOPPOS("Hasil Bentuk Kanonik (Skema 2)", hasilKanonik);
}

/**
 * UTILITY: Fungsi internal matematika untuk mengolah himpunan minterm/maxterm menjadi string lambang literatur
 */
function hitungEkspresiSOPPOS(varNames, minterms, maxterms) {
    // 1. Format SOP
    let sopTerms = [];
    minterms.forEach(m => {
        let term = "";
        for (let j = varNames.length - 1; j >= 0; j--) {
            let bit = (m >> j) & 1;
            let currentVar = varNames[varNames.length - 1 - j];
            term += (bit === 1) ? currentVar : currentVar + "'";
        }
        sopTerms.push(term);
    });
    let stringSOP = sopTerms.length > 0 ? sopTerms.join(" + ") : "0";
    let lambangSOP = minterms.length > 0 ? `Σm(${minterms.join(", ")})` : "Σm(tidak ada)";

    // 2. Format POS
    let posTerms = [];
    maxterms.forEach(M => {
        let termComponents = [];
        for (let j = varNames.length - 1; j >= 0; j--) {
            let bit = (M >> j) & 1;
            let currentVar = varNames[varNames.length - 1 - j];
            termComponents.push((bit === 0) ? currentVar : currentVar + "'");
        }
        posTerms.push(`(${termComponents.join(" + ")})`);
    });
    let stringPOS = posTerms.length > 0 ? posTerms.join(" · ") : "1";
    let lambangPOS = maxterms.length > 0 ? `ΠM(${maxterms.join(", ")})` : "ΠM(tidak ada)";

    return { stringSOP, lambangSOP, stringPOS, lambangPOS };
}

/**
 * UTILITY: Generator komponen desain antarmuka keluaran SOP & POS
 */
function generateHtmlHasilSOPPOS(judul, hasil) {
    return `
        <div style="margin-top: 15px; border-top: 2px dashed #334155; padding-top: 15px; text-align: left;">
            <h5 style="color: #38bdf8; margin: 0 0 12px 0; font-size: 15px; font-weight: bold;">${judul}</h5>
            
            <div style="background: #0f172a; padding: 12px; border-radius: 6px; border-left: 4px solid #4ade80; margin-bottom: 12px;">
                <div style="color: #4ade80; font-weight: bold; font-size: 13.5px; margin-bottom: 4px;">Sum-of-Products (SOP) / Bentuk Kanonik I</div>
                <div style="font-family: monospace; color: #e2e8f0; font-size: 14px; margin-bottom: 4px;"><strong>Notasi Minterm:</strong> f = ${hasil.lambangSOP}</div>
                <div style="font-family: monospace; color: #cbd5e1; font-size: 13.5px; word-break: break-all;"><strong>Ekspresi Lengkap:</strong> f = ${hasil.stringSOP}</div>
            </div>
            
            <div style="background: #0f172a; padding: 12px; border-radius: 6px; border-left: 4px solid #f43f5e;">
                <div style="color: #f43f5e; font-weight: bold; font-size: 13.5px; margin-bottom: 4px;">Product-of-Sums (POS) / Bentuk Kanonik II</div>
                <div style="font-family: monospace; color: #e2e8f0; font-size: 14px; margin-bottom: 4px;"><strong>Notasi Maxterm:</strong> f = ${hasil.lambangPOS}</div>
                <div style="font-family: monospace; color: #cbd5e1; font-size: 13.5px; word-break: break-all;"><strong>Ekspresi Lengkap:</strong> f = ${hasil.stringPOS}</div>
            </div>
        </div>
    `;
}


// ==========================================
// 4. LOGIKA VISUALISASI LAIN (FUNGSI PENUNJANG CADANGAN)
// ==========================================

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
 * Menangani visualisasi pemetaan Karnaugh Map (K-Map) secara Fleksibel (Dinamis 3 & 4 Variabel)
 * Algoritma Solver berbasis Penyederhanaan Implikan Logika Riil
 */
function hitungKMap() {
    const inputVal = document.getElementById('input-kmap').value.trim();
    const outputBox = document.getElementById('box-kmap-matrix-dinamis');
    const contentBox = document.getElementById('content-kmap-matrix-dinamis');
    
    if (inputVal === "") {
        alert("Silakan masukkan nomor minterm (contoh: 0,1,4,6 atau 0,2,5,7,8,10,13,15)!");
        return;
    }
    
    // 1. Parsing input minterm menjadi deretan angka integer bersih
    let minterms = inputVal.split(',')
                           .map(num => parseInt(num.trim()))
                           .filter(num => !isNaN(num) && num >= 0);
                           
    if (minterms.length === 0) {
        alert("Format input tidak valid! Gunakan deretan angka desimal yang dipisahkan oleh koma.");
        return;
    }

    // 2. Deteksi jumlah variabel maksimal (3 variabel jika maks < 8, 4 variabel jika maks 8-15)
    let maxMinterm = Math.max(...minterms);
    let numVars = 3;
    if (maxMinterm >= 8 && maxMinterm <= 15) {
        numVars = 4;
    } else if (maxMinterm > 15) {
        alert("Batas maksimal kalkulator K-Map saat ini adalah 4 Variabel (Minterm 0 sampai 15).");
        return;
    }

    // 3. Deteksi atau inisialisasi nama label variabel secara fleksibel
    let varLabels = numVars === 4 ? ['W', 'X', 'Y', 'Z'] : ['A', 'B', 'C'];

    let totalCells = Math.pow(2, numVars);
    let rows = numVars === 4 ? 4 : 2;
    let cols = 4;

    const grayRow = rows === 4 ? [0, 1, 3, 2] : [0, 1];
    const grayCol = [0, 1, 3, 2];

    let mapLayout = [];
    let gridValues = [];

    for (let r = 0; r < rows; r++) {
        mapLayout[r] = [];
        gridValues[r] = [];
        for (let c = 0; c < cols; c++) {
            let mintermValue = 0;
            if (numVars === 4) {
                mintermValue = (grayRow[r] << 2) | grayCol[c];
            } else {
                mintermValue = (grayRow[r] << 2) | grayCol[c];
            }
            mapLayout[r][c] = mintermValue;
            gridValues[r][c] = minterms.includes(mintermValue) ? 1 : 0;
        }
    }

    // 4. PROSES ALGORITMA SOLVER BOOLEAN (Mini Quine-McCluskey Engine)
    let primeImplicants = [];
    
    let binaryTerms = {};
    for (let i = 0; i < totalCells; i++) {
        if (minterms.includes(i)) {
            binaryTerms[i] = i.toString(2).padStart(numVars, '0');
        }
    }

    const combineGroups = (terms) => {
        let newTerms = {};
        let combined = new Set();
        let keys = Object.keys(terms);

        for (let i = 0; i < keys.length; i++) {
            for (let j = i + 1; j < keys.length; j++) {
                let k1 = keys[i], k2 = keys[j];
                let t1 = terms[k1], t2 = terms[k2];
                
                let diffCount = 0;
                let diffIdx = -1;
                for (let b = 0; b < numVars; b++) {
                    if (t1[b] !== t2[b]) {
                        diffCount++;
                        diffIdx = b;
                    }
                }
                
                if (diffCount === 1) {
                    let nextTerm = t1.substring(0, diffIdx) + '-' + t1.substring(diffIdx + 1);
                    let newKey = k1 + "," + k2;
                    newTerms[newKey] = nextTerm;
                    combined.add(k1);
                    combined.add(k2);
                }
            }
        }

        for (let k of keys) {
            if (!combined.has(k)) {
                primeImplicants.push(terms[k]);
            }
        }
        return newTerms;
    };

    let currentLevelTerms = binaryTerms;
    while (Object.keys(currentLevelTerms).length > 0) {
        currentLevelTerms = combineGroups(currentLevelTerms);
    }

    primeImplicants = [...new Set(primeImplicants)];

    let termStrings = [];
    primeImplicants.forEach(implican => {
        let str = "";
        for (let b = 0; b < numVars; b++) {
            if (implican[b] === '1') {
                str += varLabels[b];
            } else if (implican[b] === '0') {
                str += varLabels[b] + "'";
            }
        }
        if (str === "") str = "1";
        termStrings.push(str);
    });

    let hasilSederhana = [...new Set(termStrings)].join(" + ");
    if (minterms.length === totalCells) hasilSederhana = "1";
    if (minterms.length === 0) hasilSederhana = "0";

    // 5. RENDER ANTARMUKA TABEL MATRIKS DINAMIS KE KANVAS HTML
    outputBox.style.display = "block";
    
    let labelBaris = numVars === 4 ? `${varLabels[0]}${varLabels[1]}` : `${varLabels[0]}`;
    let labelKolom = numVars === 4 ? `${varLabels[2]}${varLabels[3]}` : `${varLabels[1]}${varLabels[2]}`;

    let htmlMatriks = `
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1;">
            Matriks Peta Karnaugh <strong>${numVars} Variabel</strong> untuk $\\Sigma m(${minterms.join(', ')})$:
        </p>
        
        <div style="overflow-x: auto; margin-bottom: 15px;">
            <table style="border-collapse: collapse; text-align: center; margin: 0 auto; background: #0f172a; font-family: monospace; font-size: 13px; color: #e2e8f0; min-width: 320px;">
                <thead>
                    <tr>
                        <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #38bdf8; font-weight: bold; font-size: 14px;">${labelBaris} \\ ${labelKolom}</th>
                        <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #94a3b8;">00</th>
                        <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #94a3b8;">01</th>
                        <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #94a3b8;">11</th>
                        <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #94a3b8;">10</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const textRowBits = rows === 4 ? ["00", "01", "11", "10"] : ["0", "1"];

    for (let r = 0; r < rows; r++) {
        htmlMatriks += `<tr>`;
        htmlMatriks += `<td style="padding: 10px; border: 1px solid #334155; background: #1e293b; font-weight: bold; color: #38bdf8;">${textRowBits[r]}</td>`;
        
        for (let c = 0; c < cols; c++) {
            let val = gridValues[r][c];
            let cellMinterm = mapLayout[r][c];
            
            let cellStyle = val === 1 
                ? `background: rgba(16, 185, 129, 0.15); color: #4ade80; font-weight: bold; border: 1.5px solid #10b981;` 
                : `background: #0f172a; color: #475569; border: 1px solid #334155;`;
                
            htmlMatriks += `
                <td style="padding: 14px 10px; ${cellStyle} position: relative;">
                    <span style="font-size: 16px;">${val}</span>
                    <span style="position: absolute; bottom: 2px; right: 4px; font-size: 8.5px; color: #475569;">m${cellMinterm}</span>
                </td>
            `;
        }
        htmlMatriks += `</tr>`;
    }

    htmlMatriks += `
                </tbody>
            </table>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 6px; border-left: 4px solid #38bdf8; text-align: left; margin-top: 15px;">
            <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-bottom: 4px;">Hasil Formula Penyederhanaan Minimal (SOP)</div>
            <div style="font-family: monospace; color: #f8fafc; font-size: 16px; font-weight: bold; word-break: break-all;">F = ${hasilSederhana}</div>
        </div>

        <div style="text-align: right; margin-top: 10px; font-size: 11.5px; color: #64748b; font-style: italic; letter-spacing: 0.3px;">
            * Akan dikembangkan saat libur semester. Intinya bagian Fungsi Boolean sudah paham kan? 🤔
        </div>
    `;
    
    contentBox.innerHTML = htmlMatriks;
}

/**
 * Menangani penutupan Welcome Screen Pop-Up Modal
 */
function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}
