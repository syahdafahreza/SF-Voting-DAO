import React, { useState } from "react";

// Deklarasikan Swal sebagai variabel global.
// Ini digunakan untuk menampilkan notifikasi (pop-up) yang manis dari library SweetAlert2.
declare const Swal: any;

// Mendefinisikan tipe properti (props) yang diharapkan oleh komponen CreateProposal.
// Komponen ini mengharapkan satu prop, yaitu `onCreate`, yang merupakan sebuah fungsi.
interface Props {
  onCreate: (
    title: string,
    description: string,
    mode: number, // 0 untuk Yes/No, 1 untuk Pilihan Ganda
    options: string[],
    duration: number // dalam detik
  ) => void;
}

// Ini adalah komponen React utama untuk membuat proposal baru.
// Menerima props `onCreate` untuk mengirimkan data proposal yang baru dibuat ke komponen induk.
export default function CreateProposal({ onCreate }: Props) {
  // State untuk menyimpan judul proposal.
  const [title, setTitle] = useState("");
  // State untuk menyimpan deskripsi proposal.
  const [description, setDescription] = useState("");
  // State untuk menyimpan tipe proposal (0: Yes/No, 1: Pilihan Ganda).
  const [mode, setMode] = useState(0);
  // State untuk menyimpan opsi-opsi jika proposal adalah tipe Pilihan Ganda.
  const [options, setOptions] = useState(["", ""]);
  // State untuk menyimpan durasi proposal dalam detik. Defaultnya 120 detik (2 menit).
  const [duration, setDuration] = useState(120);

  // Fungsi yang dipanggil ketika tombol "Create Proposal" diklik.
  const handleCreate = () => {
    // Validasi: Memastikan judul dan deskripsi tidak kosong.
    if (!title.trim() || !description.trim()) {
        // Jika kosong, tampilkan peringatan menggunakan SweetAlert.
        Swal.fire({
            icon: 'warning',
            title: 'Informasi Kurang',
            text: 'Harap isi judul dan deskripsi proposal.'
        });
        return; // Hentikan eksekusi fungsi.
    }
      
    // Cek jika tipe proposal adalah "Pilihan Ganda".
    if (mode === 1) {
      // Saring opsi untuk menghapus opsi yang kosong (hanya spasi atau tidak diisi).
      const filteredOptions = options.filter((opt) => opt.trim() !== "");
      // Validasi: Memastikan ada setidaknya 2 opsi yang valid.
      if (filteredOptions.length < 2) {
        // Jika kurang dari 2, tampilkan pesan error.
        Swal.fire({
            icon: 'error',
            title: 'Opsi Tidak Valid',
            text: 'Proposal dengan pilihan ganda harus memiliki setidaknya 2 opsi yang tidak kosong.'
        });
        return; // Hentikan eksekusi fungsi.
      }
      // Panggil fungsi `onCreate` dari props dengan data proposal pilihan ganda.
      onCreate(title, description, mode, filteredOptions, duration);
    } else {
      // Jika tipe proposal adalah "Yes/No", panggil `onCreate` dengan opsi default ["Yes", "No"].
      onCreate(title, description, mode, ["Yes", "No"], duration);
    }
  };

  // Render tampilan (UI) dari komponen.
  return (
    <div className="card">
      <h2>Buat Proposal Baru</h2>
      
      {/* Grup form untuk input judul proposal */}
      <div className="form-group">
        <label htmlFor="title">Judul</label>
        <input
          id="title"
          type="text"
          placeholder="Judul Proposal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Grup form untuk input deskripsi proposal */}
      <div className="form-group">
        <label htmlFor="description">Deskripsi</label>
        <textarea
          id="description"
          placeholder="Jelaskan proposal Anda"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Grup form untuk memilih tipe proposal */}
      <div className="form-group">
        <label htmlFor="type">Tipe Proposal</label>
        <select
          id="type"
          value={mode}
          onChange={(e) => setMode(Number(e.target.value))}
        >
          <option value={0}>Ya/Tidak</option>
          <option value={1}>Pilihan Ganda</option>
        </select>
      </div>

      {/* Bagian ini hanya akan ditampilkan jika tipe proposal adalah "Pilihan Ganda" (mode === 1) */}
      {mode === 1 && (
        <div className="form-group">
          <label>Opsi</label>
          {/* Ulangi (map) array `options` untuk membuat input field bagi setiap opsi */}
          {options.map((opt, idx) => (
            <input
              key={idx} // Kunci unik untuk setiap elemen dalam list, penting untuk performa React
              type="text"
              placeholder={`Opsi #${idx + 1}`}
              value={opt}
              onChange={(e) => {
                // Perbarui state `options` ketika nilai input berubah
                const newOpts = [...options]; // Salin array options yang lama
                newOpts[idx] = e.target.value; // Ubah nilai pada indeks yang sesuai
                setOptions(newOpts); // Atur state dengan array yang baru
              }}
              style={{ marginBottom: "0.5rem" }}
            />
          ))}
          {/* Tombol untuk menambahkan field input opsi baru */}
          <button
            onClick={() => setOptions([...options, ""])} // Tambahkan string kosong ke array `options`
            type="button"
            className="btn btn-secondary"
          >
            + Tambah Opsi
          </button>
        </div>
      )}

      {/* Grup form untuk input durasi proposal */}
      <div className="form-group">
        <label htmlFor="duration">Durasi (detik)</label>
        <input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      
      {/* Tombol untuk mengirimkan form dan membuat proposal */}
      <button onClick={handleCreate} className="btn btn-primary">Buat Proposal</button>
    </div>
  );
}