/**
 * Shared code between client and server
 * Blockchain voting system types and interfaces
 */

// Candidate related types
export interface Candidate {
  id: string;
  name: string;
  description: string;
  party: string;
  imageUrl?: string;
  voteCount: number;
  blockchainAddress: string;
}

// Vote related types
export interface Vote {
  id: string;
  candidateId: string;
  voterAddress: string;
  blockchainTxHash: string;
  timestamp: Date;
  verified: boolean;
}

// Election/Voting Session types
export interface VotingSession {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  candidates: Candidate[];
  totalVotes: number;
  blockchainContractAddress: string;
}

// Blockchain integration types
export interface BlockchainTransactionResponse {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export interface WalletConnection {
  address: string;
  connected: boolean;
  balance?: string;
  network?: string;
}

// API Response types
export interface VoteResponse extends BlockchainTransactionResponse {
  vote?: Vote;
}

export interface CandidatesResponse {
  success: boolean;
  candidates: Candidate[];
  votingSession: VotingSession;
}

export interface VotingResultsResponse {
  success: boolean;
  results: Candidate[];
  totalVotes: number;
  votingSession: VotingSession;
}

export interface WalletStatusResponse {
  success: boolean;
  wallet?: WalletConnection;
  error?: string;
}

// Voting contract interaction types
export interface VoteContractCall {
  candidateId: string;
  voterAddress: string;
}

export interface ContractDeploymentResponse extends BlockchainTransactionResponse {
  contractAddress?: string;
}
