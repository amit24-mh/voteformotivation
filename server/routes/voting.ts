import { RequestHandler } from "express";
import { blockchainService } from "../services/blockchain";

// If @shared/api types fail, define them locally
export interface VoteResponse {
  success: boolean;
  vote?: any;
  error?: string;
}

export interface CandidatesResponse {
  success: boolean;
  candidates: any[];
  votingSession: any;
  error?: string;
}

export interface VotingResultsResponse {
  success: boolean;
  results: any[];
  totalVotes: number;
  votingSession: any;
  error?: string;
}

export interface WalletStatusResponse {
  success: boolean;
  wallet?: {
    address: string;
    connected: boolean;
    balance: string;
    network: string;
  };
  error?: string;
}

export interface VoteContractCall {
  candidateId: string;
  voterAddress: string;
}

// ----------------------
// GET /api/voting/candidates
export const getCandidates: RequestHandler = async (_req, res) => {
  try {
    const candidates = await blockchainService.getCandidates();
    const votingSession = await blockchainService.getVotingSession();

    const response: CandidatesResponse = {
      success: true,
      candidates: candidates || [],
      votingSession: votingSession || {}
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({
      success: false,
      candidates: [],
      votingSession: {},
      error: "Failed to fetch candidates"
    });
  }
};

// ----------------------
// POST /api/voting/vote
export const castVote: RequestHandler = async (req, res) => {
  try {
    const { candidateId, voterAddress } = req.body as VoteContractCall;

    if (!candidateId || !voterAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing candidateId or voterAddress"
      });
    }

    if (!(await blockchainService.isVotingActive())) {
      return res.status(400).json({
        success: false,
        error: "Voting is not currently active"
      });
    }

    const result = await blockchainService.castVote({ candidateId, voterAddress });

    if (result.success) {
      const voterHistory = await blockchainService.getVoterHistory(voterAddress);
      const latestVote = voterHistory[voterHistory.length - 1];

      const response: VoteResponse = {
        ...result,
        vote: latestVote
      };

      res.json(response);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cast vote"
    });
  }
};

// ----------------------
// GET /api/voting/results
export const getResults: RequestHandler = async (_req, res) => {
  try {
    const candidates = await blockchainService.getCandidates();
    const votingSession = await blockchainService.getVotingSession();
    const totalVotes = await blockchainService.getTotalVotes();

    const sortedResults = (candidates || []).sort(
      (a, b) => (b.voteCount || 0) - (a.voteCount || 0)
    );

    const response: VotingResultsResponse = {
      success: true,
      results: sortedResults,
      totalVotes: totalVotes || 0,
      votingSession: votingSession || {}
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      results: [],
      totalVotes: 0,
      votingSession: {},
      error: "Failed to fetch results"
    });
  }
};

// ----------------------
// GET /api/voting/voter/:address
export const getVoterHistory: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Voter address is required"
      });
    }

    const history = await blockchainService.getVoterHistory(address);

    res.json({
      success: true,
      history: history || []
    });
  } catch (error) {
    console.error("Error fetching voter history:", error);
    res.status(500).json({
      success: false,
      history: [],
      error: "Failed to fetch voter history"
    });
  }
};

// ----------------------
// POST /api/voting/wallet/connect
export const connectWallet: RequestHandler = async (_req, res) => {
  try {
    const mockAddress = blockchainService.generateMockWalletAddress();

    const response: WalletStatusResponse = {
      success: true,
      wallet: {
        address: mockAddress,
        connected: true,
        balance: "1.234 ETH",
        network: "Ethereum Mainnet (Mock)"
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to connect wallet"
    });
  }
};

// ----------------------
// GET /api/voting/status
export const getVotingStatus: RequestHandler = async (_req, res) => {
  try {
    const votingSession = await blockchainService.getVotingSession();
    const isActive = await blockchainService.isVotingActive();
    const totalVotes = await blockchainService.getTotalVotes();

    res.json({
      success: true,
      session: votingSession || {},
      isActive: isActive || false,
      totalVotes: totalVotes || 0
    });
  } catch (error) {
    console.error("Error fetching voting status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch voting status"
    });
  }
};

// ----------------------
// POST /api/voting/verify/:voteId
export const verifyVote: RequestHandler = async (req, res) => {
  try {
    const { voteId } = req.params;

    if (!voteId) {
      return res.status(400).json({
        success: false,
        error: "Vote ID is required"
      });
    }

    const isVerified = await blockchainService.verifyVote(voteId);

    res.json({
      success: true,
      verified: !!isVerified,
      voteId
    });
  } catch (error) {
    console.error("Error verifying vote:", error);
    res.status(500).json({
      success: false,
      verified: false,
      error: "Failed to verify vote"
    });
  }
};
