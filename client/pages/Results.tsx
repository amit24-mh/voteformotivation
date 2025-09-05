import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Candidate, 
  VotingSession, 
  VotingResultsResponse 
} from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Trophy, Medal, BarChart3, Users, Shield } from "lucide-react";

export default function Results() {
  const [results, setResults] = useState<Candidate[]>([]);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/voting/results");
      const data: VotingResultsResponse = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setVotingSession(data.votingSession);
        setTotalVotes(data.totalVotes);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1: return <Trophy className="h-6 w-6 text-gray-400" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "from-yellow-400 to-yellow-600";
      case 1: return "from-gray-400 to-gray-600";
      case 2: return "from-amber-400 to-amber-600";
      default: return "from-vote-primary to-vote-secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vote-primary/20 via-vote-secondary/20 to-vote-blockchain/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-vote-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Results...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vote-primary/10 via-vote-secondary/10 to-vote-blockchain/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Voting
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
              <p className="text-sm text-gray-600">Live blockchain results</p>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-vote-blockchain" />
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Election Overview */}
        {votingSession && (
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">{votingSession.title}</CardTitle>
                <CardDescription className="text-lg">
                  Final Results - {totalVotes} Total Votes Cast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-vote-success/10 rounded-lg">
                    <Users className="h-8 w-8 text-vote-success mx-auto mb-2" />
                    <div className="text-2xl font-bold text-vote-success">{totalVotes}</div>
                    <div className="text-sm text-gray-600">Votes Cast</div>
                  </div>
                  <div className="text-center p-4 bg-vote-primary/10 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-vote-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-vote-primary">{results.length}</div>
                    <div className="text-sm text-gray-600">Candidates</div>
                  </div>
                  <div className="text-center p-4 bg-vote-blockchain/10 rounded-lg">
                    <Shield className="h-8 w-8 text-vote-blockchain mx-auto mb-2" />
                    <div className="text-2xl font-bold text-vote-blockchain">100%</div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {results.map((candidate, index) => {
            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
            
            return (
              <Card key={candidate.id} className="overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center`}>
                      {getRankIcon(index)}
                    </div>
                    
                    {/* Candidate Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                        <Badge variant="outline">{candidate.party}</Badge>
                        {index === 0 && totalVotes > 0 && (
                          <Badge className="bg-yellow-500 text-white">Winner</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                          <div className="text-2xl font-bold text-vote-result">
                            {candidate.voteCount} votes
                          </div>
                          <div className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <Progress value={percentage} className="h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-vote-blockchain" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                All votes have been securely recorded on the blockchain. Each vote is cryptographically 
                verified and immutable, ensuring the integrity of the election results.
              </p>
              {votingSession && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono">
                  Contract: {votingSession.blockchainContractAddress}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-vote-primary" />
                Election Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Candidates:</span>
                  <span className="font-semibold">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Votes:</span>
                  <span className="font-semibold">{totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Highest Vote Count:</span>
                  <span className="font-semibold">{results[0]?.voteCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Winning Margin:</span>
                  <span className="font-semibold">
                    {results.length > 1 ? results[0]?.voteCount - results[1]?.voteCount : 0} votes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
