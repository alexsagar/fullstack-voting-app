import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import '../../styles/components/results.css';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/elections/${id}/results`);
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.message || 'Error loading results');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getPercentage = (votes, total) => {
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  const getWinner = (candidates) => {
    if (candidates.length === 0) return null;
    return candidates.reduce((winner, candidate) => 
      candidate.votes > winner.votes ? candidate : winner
    );
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { election, candidates, totalVotes } = results;
  const winner = getWinner(candidates);
  const sortedCandidates = candidates.sort((a, b) => b.votes - a.votes);

  return (
    <div className="results-page">
      <div className="results-header">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="results-title">
          <h1>{election.title}</h1>
          <p>{election.description}</p>
        </div>
      </div>

      <div className="results-summary">
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-content">
              <h3>{totalVotes}</h3>
              <p>Total Votes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 />
            </div>
            <div className="stat-content">
              <h3>{candidates.length}</h3>
              <p>Candidates</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <h3>{election.status}</h3>
              <p>Status</p>
            </div>
          </div>
        </div>

        {winner && totalVotes > 0 && (
          <div className="winner-announcement">
            <div className="winner-icon">🏆</div>
            <div className="winner-info">
              <h3>Leading Candidate</h3>
              <h2>{winner.name}</h2>
              <p>{winner.votes} votes ({getPercentage(winner.votes, totalVotes)}%)</p>
            </div>
          </div>
        )}
      </div>

      <div className="results-details">
        <h3>Detailed Results</h3>
        
        {totalVotes === 0 ? (
          <div className="no-votes">
            <p>No votes have been cast yet.</p>
          </div>
        ) : (
          <div className="candidates-results">
            {sortedCandidates.map((candidate, index) => (
              <div key={candidate._id} className="candidate-result">
                <div className="candidate-info">
                  <div className="candidate-rank">#{index + 1}</div>
                  <div className="candidate-details">
                    <h4>{candidate.name}</h4>
                    {candidate.description && (
                      <p className="candidate-description">{candidate.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="vote-stats">
                  <div className="vote-count">
                    <span className="votes">{candidate.votes}</span>
                    <span className="votes-label">votes</span>
                  </div>
                  <div className="vote-percentage">
                    {getPercentage(candidate.votes, totalVotes)}%
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getPercentage(candidate.votes, totalVotes)}%`,
                      backgroundColor: index === 0 ? '#10b981' : '#6b7280'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="results-footer">
        <div className="election-info">
          <p><strong>Election Period:</strong></p>
          <p>
            {new Date(election.startDate).toLocaleDateString()} - {' '}
            {new Date(election.endDate).toLocaleDateString()}
          </p>
        </div>
        
        {election.status === 'active' && (
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>Live Results</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;