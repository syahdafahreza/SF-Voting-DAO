/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  MockVerifier,
  MockVerifierInterface,
} from "../../contracts/MockVerifier";

const _abi = [
  {
    inputs: [
      {
        internalType: "bool",
        name: "shouldVerify",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256[8]",
        name: "",
        type: "uint256[8]",
      },
      {
        internalType: "uint256[4]",
        name: "",
        type: "uint256[4]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161023f38038061023f8339818101604052810190610032919061008e565b806000806101000a81548160ff021916908315150217905550506100bb565b600080fd5b60008115159050919050565b61006b81610056565b811461007657600080fd5b50565b60008151905061008881610062565b92915050565b6000602082840312156100a4576100a3610051565b5b60006100b284828501610079565b91505092915050565b610175806100ca6000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80632357251114610030575b600080fd5b61004a600480360381019061004591906100c7565b610060565b6040516100579190610124565b60405180910390f35b60008060009054906101000a900460ff16905092915050565b600080fd5b600080fd5b60008190508260206008028201111561009f5761009e61007e565b5b92915050565b6000819050826020600402820111156100c1576100c061007e565b5b92915050565b60008061018083850312156100df576100de610079565b5b60006100ed85828601610083565b9250506101006100ff858286016100a5565b9150509250929050565b60008115159050919050565b61011e81610109565b82525050565b60006020820190506101396000830184610115565b9291505056fea26469706673582212202db9d4f26308d01d96144f072f2301c33b6e0c2ed0319ed2893cc2348570e68b64736f6c63430008180033";

type MockVerifierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockVerifierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockVerifier__factory extends ContractFactory {
  constructor(...args: MockVerifierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    shouldVerify: boolean,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(shouldVerify, overrides || {});
  }
  override deploy(
    shouldVerify: boolean,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(shouldVerify, overrides || {}) as Promise<
      MockVerifier & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MockVerifier__factory {
    return super.connect(runner) as MockVerifier__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockVerifierInterface {
    return new Interface(_abi) as MockVerifierInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): MockVerifier {
    return new Contract(address, _abi, runner) as unknown as MockVerifier;
  }
}
