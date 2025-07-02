import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import '../../styles/components/dashboard.css';

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [electionsRes, historyRes] = await Promise.all([
        api.get('/elections'),
        api.get('/votes/history')
      ]);

      if (electionsRes.data.success) {
        setElections(electionsRes.data.data);
      }

      if (historyRes.data.success) {
        setVotingHistory(historyRes.data.data);
        const votedElections = new Set(historyRes.data.data.map(vote => vote.electionId._id));
        setUserVotes(votedElections);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-upcoming';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const canVote = (election) => {
    return election.status === 'active' && !userVotes.has(election._id);
  };

  const hasVoted = (electionId) => {
    return userVotes.has(electionId);
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  const activeElections = elections.filter(e => e.status === 'active');
  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const closedElections = elections.filter(e => e.status === 'closed');

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Your Voting Dashboard</h1>
        <p>Participate in active elections and view your voting history</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Vote />
          </div>
          <div className="stat-content">
            <h3>{votingHistory.length}</h3>
            <p>Total Votes Cast</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{activeElections.length}</h3>
            <p>Active Elections</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{upcomingElections.length}</h3>
            <p>Upcoming Elections</p>
          </div>
        </div>
      </div>

      {activeElections.length > 0 && (
        <section className="elections-section">
          <h2>Active Elections</h2>
          <div className="elections-grid">
            {activeElections.map(election => (
              <div key={election._id} className="election-card">
                <div className="election-header">
                  <h3>{election.title}</h3>
                  <span className={`status ${getStatusClass(election.status)}`}>
                    {election.status}
                  </span>
                </div>
                
                <p className="election-description">{election.description}</p>
                
                <div className="election-meta">
                  <div className="meta-item">
                    <span className="meta-label">Ends:</span>
                    <span className="meta-value">
                      {new Date(election.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Total Votes:</span>
                    <span className="meta-value">{election.totalVotes}</span>
                  </div>
                </div>

                <div className="election-actions">
                  {canVote(election) ? (
                    <Link to={`/vote/${election._id}`} className="btn-primary">
                      <Vote size={16} />
                      Vote Now
                    </Link>
                  ) : hasVoted(election._id) ? (
                    <span className="voted-indicator">
                      <CheckCircle size={16} />
                      Already Voted
                    </span>
                  ) : (
                    <span className="cannot-vote">Voting Closed</span>
                  )}
                  
                  {(election.allowResultsViewing || election.status === 'closed') && (
                    <Link to={`/results/${election._id}`} className="btn-secondary">
                      <BarChart3 size={16} />
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingElections.length > 0 && (
        <section className="elections-section">
          <h2>Upcoming Elections</h2>
          <div className="elections-grid">
            {upcomingElections.map(election => (
              <div key={election._id} className="election-card">
                <div className="election-header">
                  <h3>{election.title}</h3>
                  <span className={`status ${getStatusClass(election.status)}`}>
                    {election.status}
                  </span>
                </div>
                
                <p className="election-description">{election.description}</p>
                
                <div className="election-meta">
                  <div className="meta-item">
                    <span className="meta-label">Starts:</span>
                    <span className="meta-value">
                      {new Date(election.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="election-actions">
                  <span className="upcoming-indicator">
                    <Clock size={16} />
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {closedElections.length > 0 && (
        <section className="elections-section">
          <h2>Past Elections</h2>
          <div className="elections-grid">
            {closedElections.map(election => (
              <div key={election._id} className="election-card">
                <div className="election-header">
                  <h3>{election.title}</h3>
                  <span className={`status ${getStatusClass(election.status)}`}>
                    {election.status}
                  </span>
                </div>
                
                <p className="election-description">{election.description}</p>
                
                <div className="election-meta">
                  <div className="meta-item">
                    <span className="meta-label">Ended:</span>
                    <span className="meta-value">
                      {new Date(election.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Total Votes:</span>
                    <span className="meta-value">{election.totalVotes}</span>
                  </div>
                </div>

                <div className="election-actions">
                  {hasVoted(election._id) && (
                    <span className="voted-indicator">
                      <CheckCircle size={16} />
                      You Voted
                    </span>
                  )}
                  
                  <Link to={`/results/${election._id}`} className="btn-secondary">
                    <BarChart3 size={16} />
                    View Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {votingHistory.length > 0 && (
        <section className="voting-history">
          <h2>Your Voting History</h2>
          <div className="history-list">
            {votingHistory.map(vote => (
              <div key={vote._id} className="history-item">
                <div className="history-content">
                  <h4>{vote.electionId.title}</h4>
                  <p>You voted for: <strong>{vote.candidateId.name}</strong></p>
                  <span className="vote-date">
                    {new Date(vote.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-action">
                  <Link to={`/results/${vote.electionId._id}`} className="btn-secondary">
                    View Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default UserDashboard;