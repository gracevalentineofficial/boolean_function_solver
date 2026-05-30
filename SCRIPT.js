// Standarisasi Fungsi Teks agar Siap Diolah Mesin Logika
function bersihkanEkspresi(expr) {
    let res = expr.replace(/\s+/g, '');
    res = res.replace(/([xyz])([xyz])/g, '$1*$2');
    res = res.replace(/(\))([xyz])/g, '$1*$2');
    res = res.replace(/([xyz])(\()/g, '$1*$2');
    return res;
}

// Logika De Morgan Otomatis
function olahDeMorgan(expr) {
    let suku = expr.split('+');
    let hasilSuku = suku.map(s => {
        let faktor = s.split('*');
        let invFaktor = faktor.map(f => f.includes("'") ? f.replace("'", "") : f + "'");
        return "(" + invFaktor.join('+') + ")";
    });
    return hasilSuku.join('*');
}

// Evaluator Inti JavaScript boolean
function jalankanEval(expr, x, y, z) {
    let js = expr.replace(/x'/g, (!x?1:0)).replace(/y'/g, (!y?1:0)).replace(/z'/g, (!z?1:0))
                 .replace(/x/g, x).replace(/y/g, y).replace(/z/g, z)
                 .replace(/\+/g, '||').replace(/\*/g, '&&');
    try { return eval(js) ? 1 : 0; } catch(e) { return "Err"; }
}

// Sinkronisasi sinkron untuk membuka semua kotak luaran sekaligus
function bukaPanelOutput(judul, awal, komplemen, tabelHtml, sirkuitTxt, kmapHtml) {
    document.getElementById('output-zone').style.display = 'block';
    document.getElementById('content-jawaban').innerHTML = `<b>Status:</b> ${judul}<br><b>Formula Terbaca:</b> <code style='color:#f43f5e'>${awal}</code>`;
    document.getElementById('content-hukum').innerHTML = `<code>f' = ${komplemen}</code>`;
    document.getElementById('content-table-output').innerHTML = tabelHtml;
    document.getElementById('content-sirkuit').innerHTML = sirkuitTxt;
    document.getElementById('content-kmap-matrix').innerHTML = kmapHtml;
    
    // Auto scroll halus ke area panel luaran
    document.getElementById('output-zone').scrollIntoView({ behavior: 'smooth' });
}

// 1. TOOL PADA BAGIAN HUKUM
function hitungHukum() {
    let input = document.getElementById('input-hukum').value;
    if(!input) return alert("Masukkan formula logika!");
    let bersih = bersihkanEkspresi(input);
    let komp = olahDeMorgan(bersih);
    
    bukaPanelOutput("Analisis Komplemen Berhasil", input, komp, "Tekan tombol di Bagian 3 untuk melihat tabel penuh.", "Tekan tombol di Bagian 4 untuk struktur sirkuit.", "Tekan tombol di Bagian 5 untuk matriks.");
}

// 2. TOOL PADA BAGIAN FUNGSI (IDENTIFIKASI & EVALUASI)
function hitungFungsi() {
    let input = document.getElementById('input-fungsi').value;
    if(!input) return alert("Masukkan fungsi!");
    
    // Identifikasi apakah ini fungsi biner valid
    let isValid = /^[xyz01\+\*'\s\(\)]+$/.test(input);
    if(!isValid) {
        alert("Karakter tidak dikenal! Gunakan hanya x, y, z, +, *, dan '");
        return;
    }
    
    let bersih = bersihkanEkspresi(input);
    let x = parseInt(document.getElementById('eval-x').value);
    let y = parseInt(document.getElementById('eval-y').value);
    let z = parseInt(document.getElementById('eval-z').value);
    let hasil = jalankanEval(bersih, x, y, z);
    
    bukaPanelOutput(`FUNGSI VALID. Hasil substitusi f(${x},${y},${z}) = <b>${hasil}</b>`, input, olahDeMorgan(bersih), "Sistem mendeteksi 3 literal aktif.", "Sirkuit siap di-generate.", "Matriks siap di-generate.");
}

// 3. TOOL BAGIAN TABEL KEBENARAN
function hitungTabelKebenaran() {
    let input = document.getElementById('input-tabel').value;
    if(!input) return alert("Masukkan rumus ekspresi!");
    let bersih = bersihkanEkspresi(input);
    
    let html = "<table><thead><tr><th>x</th><th>y</th><th>z</th><th>Output (f)</th></tr></thead><tbody>";
    for(let x=0; x<=1; x++) {
        for(let y=0; y<=1; y++) {
            for(let z=0; z<=1; z++) {
                let out = jalankanEval(bersih, x, y, z);
                html += `<tr><td>${x}</td><td>${y}</td><td>${z}</td><td style='font-weight:bold;color:#38bdf8'>${out}</td></tr>`;
            }
        }
    }
    html += "</tbody></table>";
    
    bukaPanelOutput("Tabel Kebenaran Selesai Dibuat", input, olahDeMorgan(bersih), html, "Gunakan fitur sirkuit untuk melihat visual gerbang.", "Gunakan fitur K-Map untuk pemetaan kotak.");
}

// 4. TOOL BAGIAN RANGKAIAN LOGIKA
function hitungRangkaian() {
    let input = document.getElementById('input-rangkaian').value;
    if(!input) return alert("Masukkan ekspresi!");
    let bersih = bersihkanEkspresi(input);
    
    let suku = bersih.split('+');
    let txt = "<div style='font-family:monospace; background:#111827; padding:10px; border-radius:6px;'>";
    txt += "<b>=== ALUR INPUT & GERBANG GERBANG ===</b><br>";
    
    suku.forEach((s, idx) => {
        txt += `Suku-${idx+1} [${s}] -> Masuk Gerbang AND<br>`;
    });
    if(suku.length > 1) {
        txt += "Gabungan Semua Suku -> Masuk Gerbang Utama OR -> OUTPUT PIN (f)<br>";
    } else {
        txt += "Suku Tunggal langsung dilempar ke -> OUTPUT PIN (f)<br>";
    }
    txt += "</div>";
    
    bukaPanelOutput("Skema Struktur Rangkaian Siap", input, olahDeMorgan(bersih), "Tekan tombol di bagian 3 untuk data tabel.", txt, "Tekan tombol di bagian 5 untuk data peta.");
}

// 5. TOOL BAGIAN PETA KARNAUGH (K-MAP)
function hitungKMap() {
    let input = document.getElementById('input-kmap').value;
    if(!input) return alert("Masukkan rumus!");
    let bersih = bersihkanEkspresi(input);
    
    // Susun peta K-Map untuk 3 variabel (Baris x, Kolom yz [00, 01, 11, 10])
    let m00_0 = jalankanEval(bersih, 0, 0, 0);
    let m01_0 = jalankanEval(bersih, 0, 0, 1);
    let m11_0 = jalankanEval(bersih, 0, 1, 1);
    let m10_0 = jalankanEval(bersih, 0, 1, 0);
    
    let m00_1 = jalankanEval(bersih, 1, 0, 0);
    let m01_1 = jalankanEval(bersih, 1, 0, 1);
    let m11_1 = jalankanEval(bersih, 1, 1, 1);
    let m10_1 = jalankanEval(bersih, 1, 1, 0);
    
    let html = "<table><thead><tr><th>x \\ yz</th><th>00</th><th>01</th><th>11</th><th>10</th></tr></thead><tbody>";
    html += `<tr><td><b>x = 0</b></td><td class='kmap-cell'>${m00_0}</td><td class='kmap-cell'>${m01_0}</td><td class='kmap-cell'>${m11_0}</td><td class='kmap-cell'>${m10_0}</td></tr>`;
    html += `<tr><td><b>x = 1</b></td><td class='kmap-cell'>${m00_1}</td><td class='kmap-cell'>${m01_1}</td><td class='kmap-cell'>${m11_1}</td><td class='kmap-cell'>${m10_1}</td></tr>`;
    html += "</tbody></table><p class='note' style='margin-top:10px;'>Penyederhanaan dilakukan dengan melingkari grup angka 1 yang bertetangga.</p>";
    
    bukaPanelOutput("Matriks K-Map Berhasil Dipetakan", input, olahDeMorgan(bersih), "Tekan tombol bagian 3 untuk tabel.", "Tekan tombol bagian 4 untuk gerbang.", html);
}
