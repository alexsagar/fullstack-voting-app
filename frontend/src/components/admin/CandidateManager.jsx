import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import '../../styles/components/modal.css';

const CandidateManager = ({ election, onClose }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get(`/candidates/election/${election._id}`);
      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const candidateData = {
        ...formData,
        electionId: election._id
      };

      if (editingCandidate) {
        await api.put(`/candidates/${editingCandidate._id}`, candidateData);
      } else {
        await api.post('/candidates', candidateData);
      }

      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingCandidate(null);
      fetchCandidates();
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      description: candidate.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/candidates/${candidateId}`);
        fetchCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingCandidate(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">Loading candidates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h2>Manage Candidates - {election.title}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="candidates-manager">
          <div className="candidates-header">
            <h3>Candidates ({candidates.length})</h3>
            <button onClick={handleAddNew} className="btn-primary">
              <Plus size={16} />
              Add Candidate
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="candidate-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Candidate name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCandidate ? 'Update' : 'Add'} Candidate
                </button>
              </div>
            </form>
          )}

          <div className="candidates-list">
            {candidates.length === 0 ? (
              <div className="empty-state">
                <p>No candidates added yet.</p>
                <button onClick={handleAddNew} className="btn-primary">
                  Add First Candidate
                </button>
              </div>
            ) : (
              <div className="candidates-grid">
                {candidates.map(candidate => (
                  <div key={candidate._id} className="candidate-card">
                    <div className="candidate-info">
                      <h4>{candidate.name}</h4>
                      {candidate.description && (
                        <p className="candidate-description">{candidate.description}</p>
                      )}
                      <div className="candidate-stats">
                        <span className="vote-count">{candidate.votes} votes</span>
                      </div>
                    </div>
                    <div className="candidate-actions">
                      <button 
                        onClick={() => handleEdit(candidate)}
                        className="btn-secondary"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(candidate._id)}
                        className="btn-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateManager;