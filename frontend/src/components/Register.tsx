// Mengimpor hook yang diperlukan dari React dan library Identity dari Semaphore.
import React, { useState, useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";

// Mendeklarasikan Swal (SweetAlert) sebagai variabel global agar bisa digunakan tanpa error TypeScript.
declare const Swal: any;

// Mendefinisikan tipe properti (props) yang akan diterima oleh komponen Register.
interface RegisterProps {
    identity: Identity | null; // Objek identity yang aktif, bisa null jika belum ada.
    onRegister: (secret: string) => Identity; // Fungsi untuk mendaftarkan identity baru, dipanggil dari parent.
    onClear: () => void; // Fungsi untuk menghapus identity yang aktif, dipanggil dari parent.
}

// Komponen utama Register, bertanggung jawab untuk menampilkan UI dan mengelola pendaftaran identitas.
export default function Register({ identity, onRegister, onClear }: RegisterProps) {
  // State untuk menyimpan nilai 'secret' yang diinput oleh pengguna.
  const [secret, setSecret] = useState<string>("");

  // Hook useEffect ini akan berjalan setiap kali nilai 'identity' berubah.
  // Tujuannya adalah untuk logging dan debugging, agar kita tahu status identity saat ini.
  useEffect(() => {
    // Log ini membantu memverifikasi state saat komponen dimuat atau diperbarui
    console.log("--- Komponen Register Dimuat atau Diperbarui ---");
    if (identity) {
      console.log(`[EFFECT] Menerima identity dari App.tsx. Komitmen saat ini: ${identity.commitment.toString()}`);
    } else {
      console.log("[EFFECT] Tidak ada identity yang aktif saat ini (prop identity adalah null).");
    }
  }, [identity]);

  // Fungsi ini dipanggil ketika tombol 'Register' atau 'Replace' diklik.
  const handleRegisterClick = () => {
    // Validasi: Pastikan input 'secret' tidak kosong.
    if (!secret.trim()) {
        Swal.fire({ icon: 'error', title: 'Secret Key Dibutuhkan', text: 'Silakan masukkan secret key.' });
        return; // Hentikan eksekusi jika tidak ada secret.
    }
    
    // Panggil fungsi onRegister dari parent (App.tsx) dengan secret yang diinput.
    // Fungsi ini akan membuat identity baru dan mengembalikannya.
    const newIdentity = onRegister(secret);
    // Kosongkan kembali input field setelah pendaftaran berhasil.
    setSecret("");

    // Tampilkan notifikasi sukses menggunakan SweetAlert.
    Swal.fire({
        icon: 'success',
        title: 'Identitas Berhasil Didaftarkan!',
        html: `
            <p>Identitas baru Anda telah terdaftar dan aktif di seluruh aplikasi.</p>
            <p style="margin-top: 1rem;"><strong>Komitmen publik baru Anda:</strong></p>
            <code class="identity-code">${newIdentity.commitment.toString()}</code>
        `,
    });
  };

  // Render JSX (tampilan komponen).
  return (
    <div className="card">
      <h3>Manajemen Identitas Anonim</h3>

      {/* Bagian ini secara kondisional menampilkan status identity saat ini. */}
      {identity ? (
        // Tampilan jika sudah ada identity yang terdaftar.
        <div className="alert alert-info">
            <p><strong>Identitas Terdaftar Saat Ini:</strong></p>
            <code className="identity-code">{identity.commitment.toString()}</code>
            {/* Tombol untuk menghapus identity yang ada. */}
            <button onClick={onClear} className="btn btn-sm btn-danger" style={{marginTop: '1rem'}}>
                Hapus Identitas Ini
            </button>
        </div>
      ) : (
        // Tampilan jika belum ada identity yang terdaftar.
        <div className="alert alert-warning">
            <p>Tidak ada identitas yang terdaftar di browser ini.</p>
        </div>
      )}

      <hr />

      {/* Bagian ini berisi form untuk mendaftarkan atau mengganti identity. */}
      <div>
        <h4>Daftar atau Ganti Identitas</h4>
        <p>Gunakan salah satu secret yang telah ditentukan untuk mendaftar.</p>
        
        {/* Form untuk input secret. Menggunakan onSubmit untuk menangani penekanan tombol Enter. */}
        <form onSubmit={(e) => { e.preventDefault(); handleRegisterClick(); }}>
            <div className="form-group">
                <label htmlFor="secret-input">Secret Key</label>
                <input 
                    id="secret-input"
                    type="password"
                    className="form-control"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="contoh: secret-user-1-!@#$"
                />
            </div>
            {/* Tombol submit. Teksnya berubah tergantung apakah sudah ada identity atau belum. */}
            <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>
                {identity ? "Ganti dengan Identitas Baru" : "Daftarkan Identitas"}
            </button>
        </form>
      </div>
    </div>
  );
}