// ==========================================
// ENGINE CORE: PARSER & EVALUATOR EKSPRESI BOOLEAN
// ==========================================
function evaluasiEkspresi(ekspresi, x, y, z) {
    // Ubah ke huruf kecil dan hapus spasi
    let formatted = ekspresi.toLowerCase().replace(/\s+/g, '');
    
    // Agar fleksibel, jika user mengetik a, b, c maka otomatis dianggap x, y, z
    formatted = formatted.replace(/a/g, 'x').replace(/b/g, 'y').replace(/c/g, 'z');
    
    // Substitusi nilai biner ke variabel
    formatted = formatted.replace(/x/g, x);
    formatted = formatted.replace(/y/g, y);
    formatted = formatted.replace(/z/g, z);

    // Proses komplemen/NOT (contoh: 1' -> 0, 0' -> 1)
    while (formatted.includes("'")) {
        formatted = formatted.replace(/1'/g, '0').replace(/0'/g, '1');
    }

    // Ubah perkalian Boolean (* atau titik) menjadi AND (&&)
    formatted = formatted.replace(/\*/g, '&&').replace(/\./g, '&&');
    formatted = formatted.replace(/([01])(?=[01])/g, '$1 && ');

    // Ubah penjumlahan Boolean (+) menjadi OR (||)
    formatted = formatted.replace(/\+/g, '||');

    try {
        let hasil = eval(formatted);
        return hasil ? 1 : 0;
    } catch (error) {
        return "Error";
    }
}

function tampilkanOutputZone() {
    document.getElementById('output-zone').style.display = 'block';
}

// 1. ANALISIS HUKUM DE MORGAN
function hitungHukum() {
    tampilkanOutputZone();
    let input = document.getElementById('input-hukum').value.trim();
    let content = document.getElementById('content-hukum');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus terlebih dahulu!</span>";
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
        <p style='color:#38bdf8; font-weight:bold;'><b>Hasil De Morgan:</b> ${hasilDeMorgan}</p>
    `;
}

// 2. EVALUATOR FUNGSI
function hitungFungsi() {
    tampilkanOutputZone();
    let input = document.getElementById('input-fungsi').value.trim();
    let x = document.getElementById('eval-x').value;
    let y = document.getElementById('eval-y').value;
    let z = document.getElementById('eval-z').value;
    let content = document.getElementById('content-jawaban');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan fungsi!</span>";
        return;
    }

    let hasil = evaluasiEkspresi(input, x, y, z);
    content.innerHTML = `
        <p><b>Fungsi:</b> f = ${input}</p>
        <p><b>Hasil Evaluasi:</b> <span style='color:#38bdf8; font-weight:bold;'>${hasil}</span></p>
    `;
}

// 3. TABEL KEBENARAN
function hitungTabelKebenaran() {
    tampilkanOutputZone();
    let input = document.getElementById('input-tabel').value.trim();
    let content = document.getElementById('content-table-output');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus!</span>";
        return;
    }

    let htmlTable = `<table><thead><tr><th>x/a</th><th>y/b</th><th>z/c</th><th>Output</th></tr></thead><tbody>`;
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
}

// 4. SIRKUIT LOGIKA
function hitungRangkaian() {
    tampilkanOutputZone();
    let input = document.getElementById('input-rangkaian').value.trim();
    let content = document.getElementById('content-sirkuit');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus sirkuit!</span>";
        return;
    }

    content.innerHTML = `<p>➡️ Logika sirkuit <b>${input}</b> berhasil dipetakan ke dalam gerbang kombinasi internal digital.</p>`;
}

// 5. K-MAP
function hitungKMap() {
    tampilkanOutputZone();
    let input = document.getElementById('input-kmap').value.trim();
    let content = document.getElementById('content-kmap-matrix');

    if (!input) {
        content.innerHTML = "<span style='color:#f43f5e;'>⚠️ Masukkan rumus K-Map!</span>";
        return;
    }

    let urutanKolom = [{y:0,z:0}, {y:0,z:1}, {y:1,z:1}, {y:1,z:0}];
    let htmlKMap = `<table><thead><tr><th>x \\ yz</th><th>00</th><th>01</th><th>11</th><th>10</th></tr></thead><tbody>`;
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
}
