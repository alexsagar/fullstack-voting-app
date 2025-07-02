import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import '../../styles/components/voting.css';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchElectionData();
    checkVotingStatus();
  }, [id]);

  const fetchElectionData = async () => {
    try {
      const response = await api.get(`/elections/${id}`);
      if (response.data.success) {
        setElection(response.data.data);
        setCandidates(response.data.data.candidates || []);
      }
    } catch (error) {
      console.error('Error fetching election:', error);
      setError('Election not found');
    } finally {
      setLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    try {
      const response = await api.get(`/votes/check/${id}`);
      if (response.data.success && response.data.hasVoted) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await api.post('/votes', {
        electionId: id,
        candidateId: selectedCandidate._id
      });

      if (response.data.success) {
        setHasVoted(true);
        // Show success message and redirect after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error casting vote');
    } finally {
      setVoting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="loading">Loading election...</div>;
  }

  if (error && !election) {
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

  if (hasVoted) {
    return (
      <div className="voting-success">
        <div className="success-icon">
          <CheckCircle size={64} />
        </div>
        <h2>Vote Cast Successfully!</h2>
        <p>Thank you for participating in "{election.title}"</p>
        <p>Your vote has been recorded securely.</p>
        <div className="success-actions">
          <button onClick={handleBack} className="btn-primary">
            Back to Dashboard
          </button>
          {election.allowResultsViewing && (
            <button 
              onClick={() => navigate(`/results/${id}`)}
              className="btn-secondary"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    );
  }

  if (election.status !== 'active') {
    return (
      <div className="voting-closed">
        <h2>Voting Not Available</h2>
        <p>This election is currently {election.status}.</p>
        <button onClick={handleBack} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="voting-page">
      <div className="voting-header">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="voting-title">
          <h1>{election.title}</h1>
          <p>{election.description}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="voting-content">
        <div className="voting-instructions">
          <h3>Cast Your Vote</h3>
          <p>Select one candidate below and click "Cast Vote" to submit your choice.</p>
          <p><strong>Note:</strong> You can only vote once in this election.</p>
        </div>

        <div className="candidates-voting">
          {candidates.map(candidate => (
            <div 
              key={candidate._id} 
              className={`candidate-vote-card ${selectedCandidate?._id === candidate._id ? 'selected' : ''}`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="candidate-info">
                <h4>{candidate.name}</h4>
                {candidate.description && (
                  <p className="candidate-description">{candidate.description}</p>
                )}
              </div>
              <div className="selection-indicator">
                {selectedCandidate?._id === candidate._id && (
                  <CheckCircle className="selected-icon" />
                )}
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="no-candidates">
            <p>No candidates available for this election.</p>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="voting-actions">
            <div className="vote-summary">
              {selectedCandidate ? (
                <p>You selected: <strong>{selectedCandidate.name}</strong></p>
              ) : (
                <p>Please select a candidate to continue</p>
              )}
            </div>
            <button 
              onClick={handleVote}
              className="vote-btn"
              disabled={!selectedCandidate || voting}
            >
              <Vote size={20} />
              {voting ? 'Casting Vote...' : 'Cast Vote'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;