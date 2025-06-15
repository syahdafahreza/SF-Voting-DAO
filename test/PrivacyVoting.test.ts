import { expect } from "chai";
import { ethers } from "hardhat";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof, SemaphoreProof } from "@semaphore-protocol/proof";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Muat variabel lingkungan dari file .env
dotenv.config();

/**
 * Mengemas bukti (proof) dari format array bigint menjadi array 8-elemen datar yang kompatibel dengan Solidity.
 * Kontrak pintar verifier mengharapkan urutan elemen yang spesifik.
 * @param proof Bukti Semaphore dalam format array bigint.
 * @returns Bukti yang diformat sebagai array string datar [8] untuk dikirim ke kontrak pintar.
 */
function packToSolidityProof(proof: bigint[]): string[] {
  // Memastikan argumen 'proof' yang diterima valid dan memiliki 8 elemen.
  if (!proof || proof.length !== 8) {
    throw new Error(
      "Fungsi packToSolidityProof menerima argumen 'proof' yang tidak valid!"
    );
  } // Kontrak verifier mengharapkan elemen 'b' ditukar posisinya. // Urutan yang benar untuk verifier adalah: [a.x, a.y, b.x.y, b.x.x, b.y.y, b.y.x, c.x, c.y]
  return [
    proof[0].toString(),
    proof[1].toString(),
    proof[3].toString(), // b.x.y ditukar dengan b.x.x
    proof[2].toString(), // b.x.x ditukar dengan b.x.y
    proof[5].toString(), // b.y.y ditukar dengan b.y.x
    proof[4].toString(), // b.y.x ditukar dengan b.y.y
    proof[6].toString(),
    proof[7].toString(),
  ];
}

// Blok pengujian utama untuk kontrak 'PrivacyVotingDAOv2'.
describe("PrivacyVotingDAOv2", function () {
  // --- KONFIGURASI AWAL ---
  // Mendefinisikan path ke file sirkuit ZK-SNARK (wasm dan zkey) yang diperlukan untuk generate proof.
  const wasmFilePath = path.resolve(
    process.env.VERIFIER_WASM_PATH || "./circuits/semaphore.wasm"
  );
  const zkeyFilePath = path.resolve(
    process.env.VERIFIER_ZKEY_PATH || "./circuits/semaphore.zkey"
  );
  // Menentukan kedalaman Merkle Tree, yang membatasi jumlah maksimum anggota dalam grup.
  const merkleTreeDepth = parseInt(process.env.MERKLE_TREE_DEPTH || "20");

  // --- VARIABEL GLOBAL UNTUK TES ---
  // Variabel untuk menyimpan instance kontrak DAO dan Verifier.
  let dao: any;
  let verifier: any;

  // Variabel untuk menyimpan grup Semaphore dan identitas para anggota.
  let group: Group;
  let identities: Identity[]; // --- PENINGKATAN: Menggunakan 10 identitas tetap untuk konsistensi pengujian ---
  // Daftar rahasia (secrets) yang akan digunakan untuk membuat identitas unik.
  // Dalam aplikasi nyata, ini harus dijaga kerahasiaannya oleh masing-masing pengguna.
  const identitySecrets = [
    "secret-user-1-!@#$",
    "secret-user-2-!@#$",
    "secret-user-3-!@#$",
    "secret-user-4-!@#$",
    "secret-user-5-!@#$",
    "secret-user-6-!@#$",
    "secret-user-7-!@#$",
    "secret-user-8-!@#$",
    "secret-user-9-!@#$",
    "secret-user-10-!@#$",
  ]; // Blok `before` berjalan sekali sebelum semua skenario tes di dalam `describe` dieksekusi.

  // Tujuannya adalah untuk melakukan setup awal yang diperlukan oleh semua tes.
  before(async function () {
    // Inisialisasi ulang grup dan daftar identitas untuk memastikan setiap rangkaian tes dimulai dari keadaan bersih.
    group = new Group();
    identities = [];

    // Verifikasi keberadaan file sirkuit.
    if (!fs.existsSync(wasmFilePath))
      throw new Error(`File WASM tidak ditemukan di: ${wasmFilePath}`);
    if (!fs.existsSync(zkeyFilePath))
      throw new Error(`File ZKEY tidak ditemukan di: ${zkeyFilePath}`);

    // Membuat objek identitas dari setiap secret dan menambahkannya ke grup.
    for (const secret of identitySecrets) {
      const id = new Identity(secret);
      identities.push(id);
      // 'commitment' adalah representasi publik dari identitas yang aman untuk dibagikan.
      group.addMember(id.commitment);
    }

    console.log(
      `✅ ${identitySecrets.length} identitas tetap berhasil dibuat.`
    );
    // Mencetak root dari Merkle Tree. Root ini akan digunakan saat men-deploy kontrak DAO
    // untuk mendefinisikan himpunan anggota yang sah.
    console.log("✅ Merkle Root Grup (KONSISTEN):", group.root.toString());
    // Mencetak daftar komitmen anggota untuk kemudahan copy-paste ke frontend.
    const memberCommitments = identities.map((id) => id.commitment.toString());
    console.log(
      "\n📋 SALIN DAFTAR KOMITMEN INI (10 ANGGOTA) KE FRONTEND ANDA:\n"
    );
    console.log(JSON.stringify(memberCommitments, null, 2));
    console.log("\n");
    // Deploy kontrak Verifier yang bertugas memverifikasi ZK-SNARK proof.
    const VerifierFactory = await ethers.getContractFactory(
      "SemaphoreVerifier"
    );
    verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
    console.log(
      `✅ SemaphoreVerifier berhasil di-deploy di alamat: ${await verifier.getAddress()}`
    );

    // Deploy kontrak utama, PrivacyVotingDAOv2.
    // Alamat verifier dan root grup diteruskan sebagai argumen konstruktor.
    const DAOFactory = await ethers.getContractFactory("PrivacyVotingDAOv2");
    dao = await DAOFactory.deploy(
      await verifier.getAddress(),
      group.root, // Root dari Merkle Tree yang berisi semua anggota sah.
      ethers.ZeroAddress // Alamat token (jika ada, di sini tidak digunakan).
    );
    await dao.waitForDeployment();
    console.log(
      `✅ PrivacyVotingDAOv2 berhasil di-deploy di alamat: ${await dao.getAddress()}`
    );
  }); // --- Skenario 1: Pengujian Voting pada Proposal Tipe Yes/No ---

  it("Harus mengizinkan 5 anggota untuk memilih pada proposal Yes/No", async function () {
    // Menambah batas waktu eksekusi tes karena generate proof bisa memakan waktu lama.
    this.timeout(120000);
    const [owner] = await ethers.getSigners(); // Membuat proposal baru bertipe Yes/No.
    const proposalId = 1;
    const options = ["Yes", "No"];
    await dao
      .connect(owner)
      .createProposal(
        "Proposal Yes/No",
        "Deskripsi untuk proposal Yes/No",
        0,
        options,
        300
      );
    console.log(
      `\n--- Skenario 1: Proposal Yes/No (ID: ${proposalId}) Dibuat ---`
    ); // Simulasi 5 anggota pertama memberikan suara.

    for (let i = 0; i < 5; i++) {
      const voterIdentity = identities[i];
      // Memilih opsi secara acak (0 untuk "Yes", 1 untuk "No").
      const optionIndex = Math.round(Math.random());

      // 'signal' adalah pesan yang ingin disiarkan oleh pemilih. Di sini, sinyal menandakan pilihan.
      const signal = `VOTE_${optionIndex}`;
      // Hash dari sinyal untuk menjaga privasi.
      const signalHash = BigInt(
        ethers.solidityPackedKeccak256(["string"], [signal])
      );
      // 'externalNullifier' memastikan proof hanya valid untuk proposal spesifik ini, mencegah replay attack.
      const externalNullifier = BigInt(proposalId);

      // Menghasilkan ZK-SNARK proof yang membuktikan keanggotaan dalam grup tanpa mengungkapkan identitas.
      const fullProof = await generateProof(
        voterIdentity,
        group,
        externalNullifier,
        signalHash,
        merkleTreeDepth,
        { wasm: wasmFilePath, zkey: zkeyFilePath }
      );
      // Mengambil data proof dan mengemasnya ke dalam format yang diterima oleh kontrak pintar.
      const proofData = (fullProof as any).points.map((p: string) => BigInt(p));
      const solidityProof = packToSolidityProof(proofData);

      // MENAMBAHKAN LOG UNTUK MENAMPILKAN BUKTI
      console.log(
        `📦 Bukti Solidity untuk Anggota ${i + 1} (Proposal ID ${proposalId}):`,
        solidityProof
      );

      // Mengirimkan transaksi vote ke kontrak pintar dengan semua data yang diperlukan.
      await dao.vote(
        proposalId,
        optionIndex,
        fullProof.scope,
        fullProof.nullifier,
        fullProof.merkleTreeRoot,
        solidityProof
      );
      console.log(
        `🗳️  Anggota ${
          i + 1
        } memberikan suara untuk: "${options[optionIndex]}" pada Proposal ID ${proposalId}`
      );
    }

    // Setelah voting, mengambil hasil perhitungan suara dari kontrak.
    const tallies = await dao.tallies(proposalId, 0, options.length);
    // Menjumlahkan total suara yang masuk.
    const totalVotes = tallies.reduce(
      (sum: bigint, current: bigint) => sum + current,
      BigInt(0)
    );
    console.log(
      `\n📊 Hasil Proposal ID ${proposalId}: Yes: ${tallies[0]}, No: ${tallies[1]}`
    );
    // Memverifikasi bahwa jumlah suara yang tercatat di kontrak sama dengan jumlah pemilih yang berpartisipasi.
    expect(totalVotes).to.equal(BigInt(5));
    console.log(
      `✅ Verifikasi Skenario 1 Berhasil: Total suara (${totalVotes}) cocok dengan jumlah pemilih (5).`
    );
  }); // --- Skenario 2: Pengujian Voting pada Proposal Tipe Pilihan Ganda ---

  it("Harus mengizinkan 5 anggota lainnya untuk memilih pada proposal Pilihan Ganda", async function () {
    this.timeout(120000);
    const [owner] = await ethers.getSigners(); // Membuat proposal baru bertipe Pilihan Ganda.
    const proposalId = 2;
    const options = ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"];
    await dao
      .connect(owner)
      .createProposal(
        "Proposal Pilihan Ganda",
        "Deskripsi untuk pilihan ganda",
        0,
        options,
        300
      );
    console.log(
      `\n--- Skenario 2: Proposal Pilihan Ganda (ID: ${proposalId}) Dibuat ---`
    ); // Simulasi 5 anggota berikutnya (indeks 5 hingga 9) memberikan suara.

    for (let i = 5; i < 10; i++) {
      const voterIdentity = identities[i];
      // Memilih opsi secara acak dari 4 pilihan yang tersedia.
      const optionIndex = Math.floor(Math.random() * options.length);

      // Proses generate proof dan signal sama seperti skenario 1.
      const signal = `VOTE_${optionIndex}`;
      const signalHash = BigInt(
        ethers.solidityPackedKeccak256(["string"], [signal])
      );
      const externalNullifier = BigInt(proposalId);

      const fullProof = await generateProof(
        voterIdentity,
        group,
        externalNullifier,
        signalHash,
        merkleTreeDepth,
        { wasm: wasmFilePath, zkey: zkeyFilePath }
      );
      const proofData = (fullProof as any).points.map((p: string) => BigInt(p));
      const solidityProof = packToSolidityProof(proofData);

      // MENAMBAHKAN LOG UNTUK MENAMPILKAN BUKTI
      console.log(
        `📦 Bukti Solidity untuk Anggota ${i + 1} (Proposal ID ${proposalId}):`,
        solidityProof
      );

      // Mengirimkan transaksi vote.
      await dao.vote(
        proposalId,
        optionIndex,
        fullProof.scope,
        fullProof.nullifier,
        fullProof.merkleTreeRoot,
        solidityProof
      );
      console.log(
        `🗳️  Anggota ${
          i + 1
        } memberikan suara untuk: "${options[optionIndex]}" pada Proposal ID ${proposalId}`
      );
    }

    // Mengambil dan memverifikasi hasil perhitungan suara.
    const tallies = await dao.tallies(proposalId, 0, options.length);
    const totalVotes = tallies.reduce(
      (sum: bigint, current: bigint) => sum + current,
      BigInt(0)
    );

    console.log(
      `\n📊 Hasil Proposal ID ${proposalId}: A: ${tallies[0]}, B: ${tallies[1]}, C: ${tallies[2]}, D: ${tallies[3]}`
    );
    // Verifikasi total suara.
    expect(totalVotes).to.equal(BigInt(5));
    console.log(
      `✅ Verifikasi Skenario 2 Berhasil: Total suara (${totalVotes}) cocok dengan jumlah pemilih (5).`
    );
  });
});