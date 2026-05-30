// Fungsi untuk membersihkan dan standarisasi input string logika
function standarisasiEkspresi(expr) {
    let res = expr.replace(/\s+/g, ''); // Hapus spasi
    // Sisipkan operator * jika ada variabel menempel, misal xy menjadi x*y
    res = res.replace(/([xyz])([xyz])/g, '$1*$2');
    res = res.replace(/(\))([xyz])/g, '$1*$2');
    res = res.replace(/([xyz])(\()/g, '$1*$2');
    return res;
}

// Logika mencari fungsi Komplemen secara sederhana menggunakan Hukum De Morgan dasar
function cariKomplemen(expr) {
    let tokens = expr.split('+');
    let komplemenTerms = tokens.map(term => {
        let factors = term.split('*');
        let invertedFactors = factors.map(f => {
            if (f.includes("'")) {
                return f.replace("'", ""); // Komplemen dari ganda kembali ke asal
            } else {
                return f + "'"; // Tambah not
            }
        });
        return "(" + invertedFactors.join('+') + ")";
    });
    return komplemenTerms.join('*');
}

// Logika Evaluasi nilai boolean (0 atau 1)
function evaluasiFungsi(expr, x, y, z) {
    // Ubah format string agar bisa dievaluasi oleh mesin JavaScript murni
    let jsExpr = expr.replace(/x'/g, (!x ? 1 : 0))
                     .replace(/y'/g, (!y ? 1 : 0))
                     .replace(/z'/g, (!z ? 1 : 0))
                     .replace(/x/g, x)
                     .replace(/y/g, y)
                     .replace(/z/g, z)
                     .replace(/\+/g, '||') // OR di JS
                     .replace(/\*/g, '&&'); // AND di JS
    
    try {
        let hasil = eval(jsExpr);
        return hasil ? 1 : 0;
    } catch (e) {
        return "Error Input";
    }
}

function prosesFungsi() {
    let inputRaw = document.getElementById('boolean-input').value;
    if(!inputRaw) return alert("Masukkan fungsi terlebih dahulu!");

    let ekspresiStandar = standarisasiEkspresi(inputRaw);
    
    // Ambil nilai variabel dari dropdown
    let x = parseInt(document.getElementById('val-x').value);
    let y = parseInt(document.getElementById('val-y').value);
    let z = parseInt(document.getElementById('val-z').value);

    // Eksekusi Logika Matematika Diskrit
    let hasilKomplemen = cariKomplemen(ekspresiStandar);
    let hasilEvaluasi = evaluasiFungsi(ekspresiStandar, x, y, z);

    // Tampilkan Hasil ke Layar
    document.getElementById('res-awal').innerText = inputRaw;
    document.getElementById('res-komplemen').innerText = hasilKomplemen;
    document.getElementById('res-evaluasi').innerText = hasilEvaluasi;
    document.getElementById('result-box').style.display = 'block';
}