import React, { useState } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { ethers } from "ethers";
import { generateProof } from "@semaphore-protocol/proof";
import { packToSolidityProof } from "../utils/packToSolidityProof";

declare const Swal: any;

interface VoteProps {
  proposalId: number;
  options: string[];
  memberMerkleRoot: bigint | null;
  members: string[];
  identity: Identity | null;
  hasVoted: boolean;
  onVote: (
    proposalId: number,
    optionIndex: number,
    signalHash: bigint,
    nullifierHash: bigint,
    merkleRoot: bigint,
    proof: any,
    fullProofString: string,
    solidityProofString: string
  ) => void;
}

const Vote: React.FC<VoteProps> = ({
  proposalId,
  options,
  memberMerkleRoot,
  members,
  identity,
  hasVoted,
  onVote,
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    if (!identity) {
      Swal.fire("Identitas Tidak Ditemukan", 'Anda harus mendaftarkan identitas sebelum dapat memberikan suara.', "warning");
      return;
    }
    if (hasVoted) {
      Swal.fire("Sudah Memilih", "Anda sudah pernah memberikan suara untuk proposal ini.", "info");
      return;
    }
    if (!memberMerkleRoot) {
      Swal.fire("Belum Bisa Memilih", "Akar Merkle grup belum dimuat dari kontrak.", "error");
      return;
    }

    try {
      setVoting(true);
      const group = new Group();
      group.addMembers(members.map(BigInt));

      if (group.indexOf(identity.commitment) === -1) {
        Swal.fire('Bukan Anggota Grup', `Identitas Anda bukan bagian dari grup voting ini.`, 'error');
        setVoting(false);
        return;
      }
      
      const signal = `VOTE_${selectedOption}`;
      const signalHash = BigInt(ethers.solidityPackedKeccak256(['string'], [signal]));
      const externalNullifier = BigInt(proposalId);
      const wasmFilePath = "/circuits/semaphore.wasm";
      const zkeyFilePath = "/circuits/semaphore.zkey";
      const merkleTreeDepth = 20;

      const fullProof = await generateProof(
        identity,
        group,
        externalNullifier,
        signalHash,
        merkleTreeDepth,
        { wasm: wasmFilePath, zkey: zkeyFilePath }
      ) as any;

      console.log("Full Proof Object:", fullProof);
      
      const proofData = fullProof.points.map((p: string) => BigInt(p));
      const solidityProof = packToSolidityProof(proofData);

      console.log("Solidity Proof (Packed for Contract):", solidityProof);
      
      const fullProofString = JSON.stringify(fullProof, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value, 2);
      const solidityProofString = JSON.stringify(solidityProof, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value, 2);


      const merkleTreeRootFromProof = BigInt(fullProof.merkleTreeRoot);
      const nullifierHash = BigInt(fullProof.nullifier);
      const signalHashFromProof = BigInt(fullProof.scope);
      
      await onVote(
        proposalId,
        selectedOption,
        signalHashFromProof,
        nullifierHash,
        merkleTreeRootFromProof,
        solidityProof,
        fullProofString,
        solidityProofString
      );

    } catch (err: any) {
      console.error("Kesalahan saat voting:", err);
      Swal.fire("Voting Gagal", err.reason || err.message || "Terjadi kesalahan saat membuat bukti. Periksa console.", "error");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="card p-3 shadow-sm">
      <h5 className="card-title">Kirim Suara Anonim Anda</h5>
      <div className="form-group">
        <label htmlFor={`vote-select-${proposalId}`}>Pilih opsi Anda</label>
        <select
          id={`vote-select-${proposalId}`}
          className="form-control"
          value={selectedOption}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedOption(Number(e.target.value))
          }
          disabled={hasVoted || voting}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={idx}>{opt}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleVote}
        className={`btn mt-3 ${hasVoted ? 'btn-secondary' : 'btn-primary'}`}
        disabled={voting || !memberMerkleRoot || !identity || hasVoted}
        title={
            hasVoted ? "Anda sudah memberikan suara untuk proposal ini" :
            !identity ? "Daftarkan identitas terlebih dahulu" : 
            !memberMerkleRoot ? "Menunggu Merkle root..." : 
            "Kirim suara Anda"
        }
      >
        {voting ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span> Mengirim...</span>
          </>
        ) : hasVoted ? "Anda Sudah Memilih" : "Kirim Suara Anonim"}
      </button>
    </div>
  );
};

export default Vote;