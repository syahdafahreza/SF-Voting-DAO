import React from "react";

// Mendefinisikan struktur (tipe data) untuk sebuah objek proposal.
// Ini digunakan untuk memastikan setiap proposal memiliki properti yang konsisten.
interface Proposal {
  id: number;       // ID unik untuk setiap proposal
  title: string;    // Judul dari proposal
  mode: number;     // Mode proposal (misalnya: 0 untuk Ya/Tidak, 1 untuk Pilihan Ganda)
  open: boolean;    // Status proposal, true jika masih dibuka, false jika sudah ditutup
  closes: number;   // Waktu (timestamp) kapan proposal akan ditutup
  options: string[];// Daftar pilihan jawaban jika mode-nya adalah pilihan ganda
}

// Mendefinisikan properti (props) yang akan diterima oleh komponen ProposalList.
interface Props {
  // `proposals` adalah sebuah array yang berisi objek-objek dengan struktur `Proposal`.
  proposals: Proposal[];
}

/**
 * Komponen ProposalList adalah komponen fungsional React.
 * Fungsinya adalah untuk menampilkan daftar proposal ke antarmuka pengguna (UI).
 * @param {Props} props - Properti yang dilewatkan ke komponen, berisi daftar proposal.
 * @returns {JSX.Element} - Elemen JSX yang me-render daftar proposal.
 */
export default function ProposalList({ proposals }: Props) {
  // Komponen ini me-render sebuah div sebagai pembungkus utama.
  return (
    <div>
      {/* Judul untuk daftar proposal */}
      <h2>Proposals</h2>
      {/* Daftar tidak berurutan (unordered list) untuk menampung setiap item proposal */}
      <ul>
        {/* Melakukan iterasi (looping) pada array `proposals` menggunakan fungsi `map`.
          Untuk setiap objek proposal (`p`) dalam array, sebuah elemen daftar (`li`) akan dibuat.
        */}
        {proposals.map((p) => (
          // `key={p.id}` adalah properti khusus di React untuk identifikasi unik setiap elemen dalam daftar.
          <li key={p.id}>
            {/* Menampilkan judul proposal dengan teks tebal */}
            <b>{p.title}</b> — {/* Menampilkan mode proposal berdasarkan nilainya */}
            {p.mode === 0 ? "Yes/No" : "Multiple Choice"}
            <br />
            {/* Menampilkan status proposal (Open/Closed) berdasarkan nilai boolean `p.open` */}
            Status: {p.open ? "Open" : "Closed"}
            <br />
            {/* Menampilkan pilihan jawaban, menggabungkan array `p.options` menjadi satu string yang dipisahkan oleh koma */}
            Options: {p.options.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}