import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Vote, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import ElectionForm from './ElectionForm';
import CandidateManager from './CandidateManager';
import '../../styles/components/admin.css';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [managingCandidates, setManagingCandidates] = useState(null);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get('/elections');
      if (response.data.success) {
        setElections(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (electionsData) => {
    const totalElections = electionsData.length;
    const activeElections = electionsData.filter(e => e.status === 'active').length;
    const totalVotes = electionsData.reduce((sum, e) => sum + e.totalVotes, 0);
    
    setStats({ totalElections, activeElections, totalVotes });
  };

  const handleCreateElection = () => {
    setEditingElection(null);
    setShowElectionForm(true);
  };

  const handleEditElection = (election) => {
    setEditingElection(election);
    setShowElectionForm(true);
  };

  const handleDeleteElection = async (electionId) => {
    if (window.confirm('Are you sure you want to delete this election? This will also delete all candidates and votes.')) {
      try {
        await api.delete(`/elections/${electionId}`);
        fetchElections();
      } catch (error) {
        console.error('Error deleting election:', error);
      }
    }
  };

  const handleElectionFormClose = () => {
    setShowElectionForm(false);
    setEditingElection(null);
    fetchElections();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-upcoming';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleCreateElection} className="btn-primary">
          <Plus size={20} />
          Create Election
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Vote />
          </div>
          <div className="stat-content">
            <h3>{stats.totalElections}</h3>
            <p>Total Elections</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 />
          </div>
          <div className="stat-content">
            <h3>{stats.activeElections}</h3>
            <p>Active Elections</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{stats.totalVotes}</h3>
            <p>Total Votes Cast</p>
          </div>
        </div>
      </div>

      <div className="elections-section">
        <h2>All Elections</h2>
        <div className="elections-grid">
          {elections.map(election => (
            <div key={election._id} className="election-card">
              <div className="election-header">
                <h3>{election.title}</h3>
                <span className={`status ${getStatusClass(election.status)}`}>
                  {election.status}
                </span>
              </div>
              
              <p className="election-description">{election.description}</p>
              
              <div className="election-stats">
                <div className="stat">
                  <span className="stat-value">{election.totalVotes}</span>
                  <span className="stat-label">Votes</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {new Date(election.startDate).toLocaleDateString()}
                  </span>
                  <span className="stat-label">Start Date</span>
                </div>
              </div>

              <div className="election-actions">
                <button 
                  onClick={() => setManagingCandidates(election)}
                  className="btn-secondary"
                >
                  <Users size={16} />
                  Manage Candidates
                </button>
                <button 
                  onClick={() => handleEditElection(election)}
                  className="btn-secondary"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteElection(election._id)}
                  className="btn-danger"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showElectionForm && (
        <ElectionForm
          election={editingElection}
          onClose={handleElectionFormClose}
        />
      )}

      {managingCandidates && (
        <CandidateManager
          election={managingCandidates}
          onClose={() => setManagingCandidates(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;