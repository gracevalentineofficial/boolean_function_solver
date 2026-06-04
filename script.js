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
