import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './ContestProblemManager.css';
import ContestService from '../../../services/ContestService';
import ProblemService from '../../../services/ProblemService';

const ContestProblemManager = ({ contestId, contestProblems = [], onUpdate }) => {
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState('');
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('');
    const [rgb, setRgb] = useState('');
    const [points, setPoints] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadProblems();
    }, []);

    useEffect(() => {
        // Auto-generate label when form is shown
        if (showAddForm && !label) {
            setLabel(getNextLabel());
        }
    }, [showAddForm, contestProblems]);

    const loadProblems = async () => {
        try {
            const data = await ProblemService.getAll({ page_size: 1000 });
            // Handle both paginated and non-paginated responses
            if (data && data.results && Array.isArray(data.results)) {
                setProblems(data.results);
            } else if (Array.isArray(data)) {
                setProblems(data);
            } else {
                setProblems([]);
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            setProblems([]);
        }
    };

    const getAvailableProblems = () => {
        // Ensure both are arrays before filtering
        if (!Array.isArray(problems) || !Array.isArray(contestProblems)) {
            return [];
        }
        const contestProblemIds = contestProblems.map(cp => cp.problem_id);
        return problems.filter(p => !contestProblemIds.includes(p.id));
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        
        if (!selectedProblem || !label) {
            setMessage({ type: 'error', text: 'Please select a problem and enter a label' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const problemData = {
                problem_id: parseInt(selectedProblem),
                label: label.trim(),
                points: parseInt(points) || 1,
                lazy_eval_results: false
            };

            // Add optional fields
            if (color) problemData.color = color.trim();
            if (rgb) problemData.rgb = rgb.trim();

            await ContestService.addProblem(contestId, problemData);
            
            setMessage({ type: 'success', text: 'Problem added successfully!' });
            
            // Reset form
            setSelectedProblem('');
            setLabel('');
            setColor('');
            setRgb('');
            setPoints(1);
            setShowAddForm(false);
            
            // Notify parent to reload contest data
            if (onUpdate) onUpdate();
            
        } catch (error) {
            console.error('Error adding problem:', error);
            setMessage({ 
                type: 'error', 
                text: error.error || error.details || 'Failed to add problem' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProblem = async (problemId) => {
        if (!window.confirm('Are you sure you want to remove this problem from the contest?')) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await ContestService.removeProblem(contestId, problemId);
            
            setMessage({ type: 'success', text: 'Problem removed successfully!' });
            
            // Notify parent to reload contest data
            if (onUpdate) onUpdate();
            
        } catch (error) {
            console.error('Error removing problem:', error);
            setMessage({ 
                type: 'error', 
                text: error.error || 'Failed to remove problem' 
            });
        } finally {
            setLoading(false);
        }
    };

    const getNextLabel = () => {
        if (!Array.isArray(contestProblems) || contestProblems.length === 0) return 'A';
        
        const labels = contestProblems.map(cp => cp.label || cp.alias).filter(Boolean);
        if (labels.length === 0) return 'A';
        
        const lastLabel = labels.sort().pop();
        const nextCharCode = lastLabel.charCodeAt(0) + 1;
        return String.fromCharCode(nextCharCode);
    };

    const availableProblems = getAvailableProblems();

    return (
        <div className="contest-problem-manager">
            <div className="problem-manager-header">
                <h3>Contest Problems</h3>
                <button 
                    className="contest-btn-add-problem"
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={loading || availableProblems.length === 0}
                >
                    <FaPlus /> {showAddForm ? 'Cancel' : 'Add Problem'}
                </button>
            </div>

            {message.text && (
                <div className={`problem-manager-message ${message.type}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {message.text}
                </div>
            )}

            {showAddForm && (
                <div className="add-problem-form">
                    <h4>Add Problem to Contest</h4>
                    <form onSubmit={handleAddProblem}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    Problem <span className="required">*</span>
                                </label>
                                <select
                                    value={selectedProblem}
                                    onChange={(e) => setSelectedProblem(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select a problem</option>
                                    {availableProblems.map(problem => (
                                        <option key={problem.id} value={problem.id}>
                                            {problem.title} ({problem.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    Label <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="A, B, C..."
                                    maxLength="10"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Points</label>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    min="1"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="blue, red, etc."
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>RGB Code</label>
                                <input
                                    type="text"
                                    value={rgb}
                                    onChange={(e) => setRgb(e.target.value)}
                                    placeholder="#FF0000"
                                    maxLength="7"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="contest-btn-cancel"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="contest-btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Problem'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="problems-list">
                {contestProblems.length === 0 ? (
                    <div className="empty-problems">
                        No problems added to this contest yet.
                    </div>
                ) : (
                    <table className="problems-table">
                        <thead>
                            <tr>
                                <th>Label</th>
                                <th>Problem</th>
                                <th>Slug</th>
                                <th>Points</th>
                                <th>Sequence</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contestProblems.map((cp) => (
                                <tr key={cp.id}>
                                    <td>
                                        <span className="problem-label">{cp.label || cp.alias}</span>
                                    </td>
                                    <td>{cp.problem_title}</td>
                                    <td>
                                        <span className="problem-slug">{cp.problem_slug}</span>
                                    </td>
                                    <td>{cp.point}</td>
                                    <td>{cp.sequence}</td>
                                    <td>
                                        <button
                                            className="contest-btn-remove"
                                            onClick={() => handleRemoveProblem(cp.problem_id)}
                                            disabled={loading}
                                            title="Remove problem"
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ContestProblemManager;
