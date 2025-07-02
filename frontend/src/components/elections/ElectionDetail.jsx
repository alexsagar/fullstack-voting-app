import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Vote, Users, Calendar, Clock, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../styles/components/election-detail.css';

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-upcoming';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const canVote = () => {
    return election?.status === 'active' && !hasVoted;
  };

  const canViewResults = () => {
    return election?.allowResultsViewing || election?.status === 'closed' || user?.role === 'admin';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!election) return '';
    
    const now = new Date();
    const endDate = new Date(election.endDate);
    const startDate = new Date(election.startDate);
    
    if (election.status === 'upcoming') {
      const timeToStart = startDate - now;
      if (timeToStart > 0) {
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `Starts in ${days}d ${hours}h`;
      }
    } else if (election.status === 'active') {
      const timeToEnd = endDate - now;
      if (timeToEnd > 0) {
        const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `Ends in ${days}d ${hours}h`;
      }
    }
    
    return '';
  };

  if (loading) {
    return <div className="loading">Loading election details...</div>;
  }

  if (error || !election) {
    return (
      <div className="error-page">
        <h2>Election Not Found</h2>
        <p>{error || 'The requested election could not be found.'}</p>
        <button onClick={handleBack} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="election-detail">
      <div className="election-detail-header">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      <div className="election-hero">
        <div className="election-hero-content">
          <div className="election-status-badge">
            <span className={`status ${getStatusClass(election.status)}`}>
              {election.status}
            </span>
            {getTimeRemaining() && (
              <span className="time-remaining">
                <Clock size={16} />
                {getTimeRemaining()}
              </span>
            )}
          </div>
          
          <h1 className="election-title">{election.title}</h1>
          <p className="election-description">{election.description}</p>
          
          <div className="election-meta-grid">
            <div className="meta-card">
              <div className="meta-icon">
                <Calendar />
              </div>
              <div className="meta-content">
                <h4>Start Date</h4>
                <p>{formatDate(election.startDate)}</p>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <Calendar />
              </div>
              <div className="meta-content">
                <h4>End Date</h4>
                <p>{formatDate(election.endDate)}</p>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <Users />
              </div>
              <div className="meta-content">
                <h4>Total Votes</h4>
                <p>{election.totalVotes}</p>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <Vote />
              </div>
              <div className="meta-content">
                <h4>Candidates</h4>
                <p>{candidates.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="election-content">
        <div className="candidates-section">
          <div className="section-header">
            <h2>Candidates</h2>
            <p>Meet the candidates running in this election</p>
          </div>
          
          {candidates.length === 0 ? (
            <div className="no-candidates">
              <Users size={48} />
              <h3>No Candidates Yet</h3>
              <p>Candidates will be added by the election administrator.</p>
            </div>
          ) : (
            <div className="candidates-grid">
              {candidates.map(candidate => (
                <div key={candidate._id} className="candidate-card">
                  <div className="candidate-avatar">
                    <Users size={32} />
                  </div>
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    {candidate.description && (
                      <p className="candidate-description">{candidate.description}</p>
                    )}
                    {canViewResults() && (
                      <div className="candidate-votes">
                        <span className="vote-count">{candidate.votes} votes</span>
                        {election.totalVotes > 0 && (
                          <span className="vote-percentage">
                            ({((candidate.votes / election.totalVotes) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="election-actions">
          {hasVoted && (
            <div className="voted-status">
              <CheckCircle size={24} />
              <div>
                <h3>You've Already Voted</h3>
                <p>Thank you for participating in this election!</p>
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            {canVote() && candidates.length > 0 && (
              <Link to={`/vote/${election._id}`} className="btn-primary vote-button">
                <Vote size={20} />
                Cast Your Vote
              </Link>
            )}
            
            {canViewResults() && (
              <Link to={`/results/${election._id}`} className="btn-secondary">
                <BarChart3 size={20} />
                View Results
              </Link>
            )}
            
            {election.status === 'upcoming' && (
              <div className="upcoming-notice">
                <Clock size={20} />
                <span>Voting will begin on {formatDate(election.startDate)}</span>
              </div>
            )}
            
            {election.status === 'closed' && !canViewResults() && (
              <div className="closed-notice">
                <span>This election has ended. Results are not yet available.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;