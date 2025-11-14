import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle, FaExternalLinkAlt } from 'react-icons/fa';
import './ContestProblemManager.css';
import ContestService from '../../../services/ContestService';
import ProblemService from '../../../services/ProblemService';

const ContestProblemManager = ({ contestId, contestProblems = [], onUpdate }) => {
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('');
    const [rgb, setRgb] = useState('');
    const [points, setPoints] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

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
        let availableProblems = problems.filter(p => !contestProblemIds.includes(p.id));
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            availableProblems = availableProblems.filter(p => 
                p.slug.toLowerCase().includes(query) ||
                p.title.toLowerCase().includes(query)
            );
        }
        
        return availableProblems;
    };

    const handleSelectProblem = (problem) => {
        setSelectedProblem(problem);
        setSearchQuery(`${problem.title} (${problem.slug})`);
        setShowDropdown(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
        if (!e.target.value.trim()) {
            setSelectedProblem(null);
        }
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
                problem_id: selectedProblem.id,
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
            setSelectedProblem(null);
            setSearchQuery('');
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
                                <div className="autocomplete-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Search by slug or title..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        disabled={loading}
                                        className="autocomplete-input"
                                        autoComplete="off"
                                    />
                                    {showDropdown && availableProblems.length > 0 && (
                                        <div className="autocomplete-dropdown">
                                            {availableProblems.slice(0, 10).map(problem => (
                                                <div
                                                    key={problem.id}
                                                    className={`autocomplete-item ${selectedProblem?.id === problem.id ? 'selected' : ''}`}
                                                    onClick={() => handleSelectProblem(problem)}
                                                >
                                                    <div className="problem-info">
                                                        <span className="problem-title">{problem.title}</span>
                                                        <span className="problem-slug-badge">{problem.slug}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {availableProblems.length > 10 && (
                                                <div className="autocomplete-footer">
                                                    +{availableProblems.length - 10} more results...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {showDropdown && availableProblems.length === 0 && (
                                        <div className="autocomplete-dropdown">
                                            <div className="autocomplete-empty">
                                                No problems found
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                            {contestProblems.map((cp) => {
                                // Debug log
                                console.log('Contest Problem:', cp);
                                
                                // Safely extract values
                                const problemTitle = typeof cp.problem_title === 'object' 
                                    ? (cp.problem_title?.title || cp.problem_title?.name || 'Untitled')
                                    : cp.problem_title;
                                
                                const problemSlug = typeof cp.problem_slug === 'object'
                                    ? (cp.problem_slug?.slug || 'unknown')
                                    : cp.problem_slug;
                                
                                return (
                                <tr key={cp.id}>
                                    <td>
                                        <span 
                                            className="problem-label"
                                            style={{
                                                backgroundColor: cp.rgb || cp.color || '#6366f1',
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {cp.label || cp.alias}
                                        </span>
                                    </td>
                                    <td>
                                        <Link 
                                            to={`/admin/problems/${cp.problem_id}`}
                                            className="problem-title-link"
                                            title="View problem details"
                                        >
                                            {problemTitle} <FaExternalLinkAlt size={12} />
                                        </Link>
                                    </td>
                                    <td>
                                        <span className="problem-slug">
                                            {problemSlug}
                                        </span>
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
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ContestProblemManager;
