import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Candidate,
  VotingSession,
  WalletConnection,
  CandidatesResponse,
  VoteResponse,
  WalletStatusResponse
} from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Vote, Wallet, BarChart3, Shield, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VotingHomepage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/voting/candidates");
      const data: CandidatesResponse = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
        setVotingSession(data.votingSession);
      } else {
        toast({
          title: "Error",
          description: "Failed to load candidates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to connect to voting service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/voting/wallet/connect", { method: "POST" });
      const data: WalletStatusResponse = await response.json();

      if (data.success && data.wallet) {
        setWallet(data.wallet);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${data.wallet.address.slice(0, 6)}...${data.wallet.address.slice(-4)}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (candidateId: string) => {
    if (!wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setVoting(true);
      setSelectedCandidate(candidateId);

      const response = await fetch("/api/voting/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          voterAddress: wallet.address
        })
      });

      const data: VoteResponse = await response.json();

      if (data.success) {
        toast({
          title: "Vote Cast Successfully!",
          description: `Your vote has been recorded on the blockchain. TX: ${data.transactionHash?.slice(0, 10)}...`,
        });

        // Refresh candidates to show updated vote counts
        await fetchCandidates();
      } else {
        toast({
          title: "Vote Failed",
          description: data.error || "Failed to cast vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
      setSelectedCandidate(null);
    }
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

  if (loading && candidates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vote-primary/20 via-vote-secondary/20 to-vote-blockchain/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-vote-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Voting System...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vote-primary/10 via-vote-secondary/10 to-vote-blockchain/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vote-primary rounded-lg">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BlockVote</h1>
                <p className="text-sm text-gray-600">Decentralized Voting Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {votingSession && (
                <Badge variant={votingSession.isActive ? "default" : "secondary"} className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {votingSession.isActive ? "Voting Active" : "Voting Closed"}
                </Badge>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/results")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                View Results
              </Button>

              {wallet ? (
                <Card className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-vote-blockchain" />
                    <span className="text-sm font-medium">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                  </div>
                </Card>
              ) : (
                <Button onClick={connectWallet} disabled={loading} className="bg-vote-blockchain hover:bg-vote-blockchain/90">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Election Information */}
        {votingSession && (
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl text-center">{votingSession.title}</CardTitle>
                <CardDescription className="text-center text-lg">
                  {votingSession.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center p-4 bg-vote-success/10 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-vote-success mb-2" />
                    <div className="text-2xl font-bold text-vote-success">{totalVotes}</div>
                    <div className="text-sm text-gray-600">Total Votes Cast</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-vote-candidate/10 rounded-lg">
                    <Vote className="h-8 w-8 text-vote-candidate mb-2" />
                    <div className="text-2xl font-bold text-vote-candidate">{candidates.length}</div>
                    <div className="text-sm text-gray-600">Candidates</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-vote-blockchain/10 rounded-lg">
                    <Shield className="h-8 w-8 text-vote-blockchain mb-2" />
                    <div className="text-2xl font-bold text-vote-blockchain">100%</div>
                    <div className="text-sm text-gray-600">Blockchain Secured</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const votePercentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
            const isVoting = voting && selectedCandidate === candidate.id;

            return (
              <Card key={candidate.id} className="overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-vote-candidate to-vote-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{candidate.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto">{candidate.party}</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-center text-sm">
                    {candidate.description}
                  </p>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Votes Received</span>
                      <span className="text-lg font-bold text-vote-result">{candidate.voteCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-vote-result to-vote-success h-2 rounded-full transition-all duration-500"
                        style={{ width: `${votePercentage}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      {votePercentage.toFixed(1)}% of total votes
                    </div>
                  </div>

                  <Button
                    onClick={() => castVote(candidate.id)}
                    disabled={!wallet || voting || !votingSession?.isActive}
                    className="w-full mt-4 bg-vote-primary hover:bg-vote-primary/90"
                  >
                    {isVoting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Casting Vote...
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4 mr-2" />
                        Vote for {candidate.name.split(' ')[0]}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Voting Instructions */}
        {!wallet && (
          <div className="mt-12">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Connect Your Wallet to Vote</h3>
                    <p className="text-yellow-700 text-sm">
                      To participate in this election, you need to connect your blockchain wallet.
                      Your vote will be securely recorded on the blockchain, ensuring transparency and immutability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span>Powered by Blockchain Technology</span>
          </div>
          <p>Your vote is private, secure, and verifiable on the blockchain.</p>
        </footer>
      </main>
    </div>
  );
}
