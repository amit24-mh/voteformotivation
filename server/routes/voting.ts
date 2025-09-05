import { RequestHandler } from "express";
import { blockchainService } from "../services/blockchain";
import { 
  VoteResponse, 
  CandidatesResponse, 
  VotingResultsResponse,
  WalletStatusResponse,
  VoteContractCall 
} from "@shared/api";

// GET /api/voting/candidates - Get all candidates
export const getCandidates: RequestHandler = async (req, res) => {
  try {
    const candidates = await blockchainService.getCandidates();
    const votingSession = await blockchainService.getVotingSession();
    
    const response: CandidatesResponse = {
      success: true,
      candidates,
      votingSession
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      candidates: [],
      votingSession: {} as any,
      error: 'Failed to fetch candidates'
    });
  }
};

// POST /api/voting/vote - Cast a vote
export const castVote: RequestHandler = async (req, res) => {
  try {
    const { candidateId, voterAddress } = req.body as VoteContractCall;
    
    if (!candidateId || !voterAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing candidateId or voterAddress'
      });
    }

    // Check if voting is active
    if (!blockchainService.isVotingActive()) {
      return res.status(400).json({
        success: false,
        error: 'Voting is not currently active'
      });
    }

    const result = await blockchainService.castVote({ candidateId, voterAddress });
    
    if (result.success) {
      // Get the vote details for response
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
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cast vote'
    });
  }
};

// GET /api/voting/results - Get voting results
export const getResults: RequestHandler = async (req, res) => {
  try {
    const candidates = await blockchainService.getCandidates();
    const votingSession = await blockchainService.getVotingSession();
    const totalVotes = await blockchainService.getTotalVotes();
    
    // Sort candidates by vote count (descending)
    const sortedResults = candidates.sort((a, b) => b.voteCount - a.voteCount);
    
    const response: VotingResultsResponse = {
      success: true,
      results: sortedResults,
      totalVotes,
      votingSession
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      results: [],
      totalVotes: 0,
      votingSession: {} as any,
      error: 'Failed to fetch results'
    });
  }
};

// GET /api/voting/voter/:address - Get voter history
export const getVoterHistory: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Voter address is required'
      });
    }

    const history = await blockchainService.getVoterHistory(address);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching voter history:', error);
    res.status(500).json({
      success: false,
      history: [],
      error: 'Failed to fetch voter history'
    });
  }
};

// POST /api/voting/wallet/connect - Mock wallet connection
export const connectWallet: RequestHandler = async (req, res) => {
  try {
    // In a real app, this would handle actual wallet connection
    const mockAddress = blockchainService.generateMockWalletAddress();
    
    const response: WalletStatusResponse = {
      success: true,
      wallet: {
        address: mockAddress,
        connected: true,
        balance: '1.234 ETH',
        network: 'Ethereum Mainnet (Mock)'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect wallet'
    });
  }
};

// GET /api/voting/status - Get voting session status
export const getVotingStatus: RequestHandler = async (req, res) => {
  try {
    const votingSession = await blockchainService.getVotingSession();
    const isActive = blockchainService.isVotingActive();
    
    res.json({
      success: true,
      session: votingSession,
      isActive,
      totalVotes: await blockchainService.getTotalVotes()
    });
  } catch (error) {
    console.error('Error fetching voting status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voting status'
    });
  }
};

// POST /api/voting/verify/:voteId - Verify a vote on blockchain
export const verifyVote: RequestHandler = async (req, res) => {
  try {
    const { voteId } = req.params;
    
    if (!voteId) {
      return res.status(400).json({
        success: false,
        error: 'Vote ID is required'
      });
    }

    const isVerified = await blockchainService.verifyVote(voteId);
    
    res.json({
      success: true,
      verified: isVerified,
      voteId
    });
  } catch (error) {
    console.error('Error verifying vote:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: 'Failed to verify vote'
    });
  }
};
