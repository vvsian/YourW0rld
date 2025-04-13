// Enhanced Daily Goals System
document.addEventListener('DOMContentLoaded', () => {
    console.log('Enhanced Goals System loaded');
    
    // State management for goals
    const goalsState = {
        goals: JSON.parse(localStorage.getItem('enhancedGoals')) || [],
        categories: [
            { id: 'personal', name: 'Personal', icon: 'user' },
            { id: 'work', name: 'Work', icon: 'briefcase' },
            { id: 'health', name: 'Health', icon: 'heartbeat' },
            { id: 'learning', name: 'Learning', icon: 'book' }
        ],
        priorities: [
            { id: 'high', name: 'High', color: '#ff6b6b' },
            { id: 'medium', name: 'Medium', color: '#feca57' },
            { id: 'low', name: 'Low', color: '#1dd1a1' }
        ],
        filters: {
            category: 'all',
            completed: 'all'
        }
    };

    // Cache DOM elements
    const goalsList = document.getElementById('goals-list');
    const goalsAddForm = document.querySelector('.goals-add-form');
    const dailyGoalsCard = document.querySelector('.daily-goals-card');

    // Initialize the system
    function init() {
        // Replace the existing goals UI with our enhanced version
        replaceGoalsUI();
        
        // Render initial goals
        renderGoals();
        
        // Setup event listeners
        setupEventListeners();
    }

    // Replace the existing UI with our enhanced version
    function replaceGoalsUI() {
        // Clear the existing content
        if (dailyGoalsCard) {
            dailyGoalsCard.innerHTML = `
                <div class="goals-header">
                    <h3><i class="fas fa-tasks"></i> Daily Goals</h3>
                    <div class="goals-actions">
                        <div class="goals-filter">
                            <select id="goals-category-filter">
                                <option value="all">All Categories</option>
                                ${goalsState.categories.map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                            <select id="goals-completion-filter">
                                <option value="all">All Goals</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <button id="add-goal-btn" class="btn-icon" title="Add a new goal">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="goals-content">
                    <ul id="goals-list" class="goals-list enhanced">
                        <!-- Goals will be added by JS -->
                    </ul>
                    <div class="goals-progress">
                        <div class="progress-text">
                            <span id="goals-completed-count">0</span>/<span id="goals-total-count">0</span> completed
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="goals-progress-bar"></div>
                        </div>
                    </div>
                </div>
                <div class="enhanced-goals-form" style="display: none;">
                    <div class="form-row">
                        <input type="text" id="new-goal-input" placeholder="Enter a new goal...">
                    </div>
                    <div class="form-row form-options">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="new-goal-category">
                                ${goalsState.categories.map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select id="new-goal-priority">
                                ${goalsState.priorities.map(priority => 
                                    `<option value="${priority.id}">${priority.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button id="cancel-goal-btn" class="btn-subtle">
                            Cancel
                        </button>
                        <button id="save-goal-btn" class="btn-primary">
                            <i class="fas fa-save"></i> Save
                        </button>
                    </div>
                </div>
            `;
        }

        // Add enhanced styles
        addEnhancedStyles();
    }

    // Add styles for the enhanced goals system
    function addEnhancedStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .goals-list.enhanced {
                margin-bottom: 15px;
            }

            .goals-progress {
                margin-top: 15px;
                margin-bottom: 15px;
            }

            .progress-text {
                text-align: right;
                font-size: 0.85rem;
                color: var(--text-secondary);
                margin-bottom: 5px;
            }

            .progress-bar-container {
                height: 6px;
                background: rgba(var(--accent-rgb), 0.1);
                border-radius: 3px;
                overflow: hidden;
            }

            .progress-bar {
                height: 100%;
                background: linear-gradient(to right, var(--accent), rgba(var(--accent-rgb), 0.7));
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 3px;
            }

            .enhanced-goal-item {
                display: flex;
                align-items: center;
                padding: 12px 15px;
                border-radius: 10px;
                margin-bottom: 8px;
                background: rgba(var(--bg-secondary-rgb), 0.5);
                border: 1px solid rgba(var(--accent-rgb), 0.1);
                transition: all 0.2s ease;
            }

            .enhanced-goal-item:hover {
                background: rgba(var(--bg-secondary-rgb), 0.8);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
            }

            .enhanced-goal-item.completed {
                opacity: 0.7;
            }

            .enhanced-goal-item.completed .goal-text {
                text-decoration: line-through;
                color: var(--text-secondary);
            }

            .goal-checkbox {
                appearance: none;
                -webkit-appearance: none;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                border: 2px solid rgba(var(--accent-rgb), 0.4);
                cursor: pointer;
                margin-right: 12px;
                position: relative;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .goal-checkbox:hover {
                border-color: var(--accent);
                box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
            }

            .goal-checkbox:checked {
                background-color: var(--accent);
                border-color: var(--accent);
            }

            .goal-checkbox:checked:after {
                content: '\\f00c';
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                color: white;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
            }

            .goal-content {
                flex: 1;
                margin-right: 10px;
                overflow: hidden;
            }

            .goal-text {
                font-size: 1rem;
                color: var(--text-primary);
                transition: all 0.2s ease;
                font-weight: 500;
                margin-bottom: 3px;
            }

            .goal-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .goal-category, .goal-priority {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 12px;
                background: rgba(var(--bg-secondary-rgb), 0.8);
                font-size: 0.75rem;
            }

            .goal-priority {
                font-weight: 600;
            }

            .goal-actions {
                display: flex;
                gap: 5px;
            }

            .goal-delete, .goal-edit {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1rem;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.6;
                transition: all 0.2s ease;
            }

            .goal-delete:hover, .goal-edit:hover {
                opacity: 1;
                background: rgba(var(--bg-secondary-rgb), 0.8);
            }

            .goal-delete:hover {
                color: #ff6b6b;
            }

            .goal-edit:hover {
                color: var(--accent);
            }

            .goals-filter {
                display: flex;
                gap: 10px;
            }

            .goals-filter select {
                background: rgba(var(--bg-secondary-rgb), 0.8);
                border: 1px solid rgba(var(--accent-rgb), 0.1);
                color: var(--text-primary);
                border-radius: 8px;
                padding: 6px 25px 6px 10px;
                font-size: 0.85rem;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 8px center;
                background-size: 12px;
            }

            .goals-filter select:focus {
                outline: none;
                border-color: var(--accent);
            }

            .goals-actions {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .enhanced-goals-form {
                margin-top: 20px;
                background: rgba(var(--bg-secondary-rgb), 0.5);
                border-radius: 12px;
                padding: 15px;
                border: 1px solid rgba(var(--accent-rgb), 0.1);
                animation: fadeIn 0.3s ease;
            }

            .form-row {
                margin-bottom: 12px;
            }

            .form-options {
                display: flex;
                gap: 15px;
            }

            .form-group {
                flex: 1;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .enhanced-goals-form input,
            .enhanced-goals-form select {
                width: 100%;
                padding: 10px 12px;
                border-radius: 8px;
                border: 1px solid rgba(var(--accent-rgb), 0.2);
                background: rgba(var(--bg-primary-rgb), 0.6);
                color: var(--text-primary);
                font-size: 1rem;
            }

            .enhanced-goals-form input:focus,
            .enhanced-goals-form select:focus {
                outline: none;
                border-color: var(--accent);
                box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
            }

            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .empty-goals {
                text-align: center;
                padding: 20px 0;
                color: var(--text-secondary);
                font-size: 0.95rem;
            }

            .empty-goals i {
                font-size: 2rem;
                margin-bottom: 10px;
                opacity: 0.6;
            }

            .priority-high {
                border-left: 3px solid #ff6b6b;
            }

            .priority-medium {
                border-left: 3px solid #feca57;
            }

            .priority-low {
                border-left: 3px solid #1dd1a1;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes highPriorityPulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
            }

            .priority-high.enhanced-goal-item:not(.completed) {
                animation: highPriorityPulse 2s infinite;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Render all goals based on current filters
    function renderGoals() {
        if (!goalsList) return;
        
        // Clear the list
        goalsList.innerHTML = '';
        
        // Filter goals based on current filters
        const filteredGoals = goalsState.goals.filter(goal => {
            const categoryMatch = goalsState.filters.category === 'all' || goal.category === goalsState.filters.category;
            const completionMatch = 
                goalsState.filters.completed === 'all' || 
                (goalsState.filters.completed === 'active' && !goal.completed) ||
                (goalsState.filters.completed === 'completed' && goal.completed);
            
            return categoryMatch && completionMatch;
        });
        
        // Sort goals by priority and completion
        const sortedGoals = [...filteredGoals].sort((a, b) => {
            // Completed goals at the bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Sort by priority (high > medium > low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // If no goals, show empty state
        if (sortedGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-goals">
                    <i class="fas fa-tasks"></i>
                    <p>No goals found</p>
                </div>
            `;
            return;
        }
        
        // Render each goal
        sortedGoals.forEach(goal => {
            const goalItem = document.createElement('li');
            goalItem.className = `enhanced-goal-item priority-${goal.priority} ${goal.completed ? 'completed' : ''}`;
            goalItem.dataset.id = goal.id;
            
            // Get category and priority details
            const category = goalsState.categories.find(c => c.id === goal.category) || 
                { name: 'Other', icon: 'tag' };
            const priority = goalsState.priorities.find(p => p.id === goal.priority) || 
                { name: 'Normal', color: '#aaaaaa' };
            
            goalItem.innerHTML = `
                <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
                <div class="goal-content">
                    <div class="goal-text">${goal.text}</div>
                    <div class="goal-meta">
                        <span class="goal-category">
                            <i class="fas fa-${category.icon}"></i> ${category.name}
                        </span>
                        <span class="goal-priority" style="color: ${priority.color}">
                            ${priority.id === 'high' ? '<i class="fas fa-arrow-up"></i>' : 
                              priority.id === 'low' ? '<i class="fas fa-arrow-down"></i>' : 
                              '<i class="fas fa-minus"></i>'} 
                            ${priority.name}
                        </span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="goal-edit" title="Edit goal">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="goal-delete" title="Delete goal">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            goalsList.appendChild(goalItem);
        });
        
        // Update progress bar and counts
        updateProgress();
    }

    // Update progress bar and counts
    function updateProgress() {
        const totalGoals = goalsState.goals.length;
        const completedGoals = goalsState.goals.filter(goal => goal.completed).length;
        const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        
        // Update UI elements
        const totalCountEl = document.getElementById('goals-total-count');
        const completedCountEl = document.getElementById('goals-completed-count');
        const progressBar = document.getElementById('goals-progress-bar');
        
        if (totalCountEl) totalCountEl.textContent = totalGoals;
        if (completedCountEl) completedCountEl.textContent = completedGoals;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Add goal button click
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                document.querySelector('.enhanced-goals-form').style.display = 'block';
                document.getElementById('new-goal-input').focus();
            });
        }
        
        // Cancel goal button click
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');
        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () => {
                document.querySelector('.enhanced-goals-form').style.display = 'none';
                document.getElementById('new-goal-input').value = '';
            });
        }
        
        // Save goal button click
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', saveGoal);
        }
        
        // Save on Enter press
        const newGoalInput = document.getElementById('new-goal-input');
        if (newGoalInput) {
            newGoalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveGoal();
                }
            });
        }
        
        // Filter changes
        const categoryFilterEl = document.getElementById('goals-category-filter');
        const completionFilterEl = document.getElementById('goals-completion-filter');
        
        if (categoryFilterEl) {
            categoryFilterEl.addEventListener('change', (e) => {
                goalsState.filters.category = e.target.value;
                renderGoals();
            });
        }
        
        if (completionFilterEl) {
            completionFilterEl.addEventListener('change', (e) => {
                goalsState.filters.completed = e.target.value;
                renderGoals();
            });
        }
        
        // Goal list item events (using event delegation)
        if (goalsList) {
            goalsList.addEventListener('click', (e) => {
                const goalItem = e.target.closest('.enhanced-goal-item');
                if (!goalItem) return;
                
                const goalId = parseInt(goalItem.dataset.id);
                
                // Handle checkbox click
                if (e.target.classList.contains('goal-checkbox')) {
                    toggleGoalCompletion(goalId, e.target.checked);
                }
                
                // Handle delete button click
                if (e.target.closest('.goal-delete')) {
                    deleteGoal(goalId);
                }
                
                // Handle edit button click
                if (e.target.closest('.goal-edit')) {
                    editGoal(goalId);
                }
            });
        }
    }

    // Save a new goal
    function saveGoal() {
        const goalInput = document.getElementById('new-goal-input');
        const categorySelect = document.getElementById('new-goal-category');
        const prioritySelect = document.getElementById('new-goal-priority');
        
        if (!goalInput || !categorySelect || !prioritySelect) return;
        
        const goalText = goalInput.value.trim();
        const category = categorySelect.value;
        const priority = prioritySelect.value;
        
        if (goalText) {
            // Check if we're in edit mode
            const editModeId = goalInput.dataset.editId;
            
            if (editModeId) {
                // Update existing goal
                const goalIndex = goalsState.goals.findIndex(g => g.id === parseInt(editModeId));
                if (goalIndex !== -1) {
                    goalsState.goals[goalIndex].text = goalText;
                    goalsState.goals[goalIndex].category = category;
                    goalsState.goals[goalIndex].priority = priority;
                    
                    // Reset edit mode
                    goalInput.dataset.editId = '';
                    document.getElementById('save-goal-btn').innerHTML = '<i class="fas fa-save"></i> Save';
                }
            } else {
                // Add new goal
                const newGoal = {
                    id: Date.now(),
                    text: goalText,
                    category: category,
                    priority: priority,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                goalsState.goals.push(newGoal);
            }
            
            // Save to localStorage
            saveGoalsToStorage();
            
            // Clear form and hide it
            goalInput.value = '';
            document.querySelector('.enhanced-goals-form').style.display = 'none';
            
            // Re-render goals
            renderGoals();
            
            // Show feedback
            if (typeof window.showFeedback === 'function') {
                window.showFeedback(editModeId ? 'Goal updated!' : 'New goal added!', 'success');
            }
        } else {
            // Show error feedback
            if (typeof window.showFeedback === 'function') {
                window.showFeedback('Please enter a goal', 'error');
            }
        }
    }

    // Toggle goal completion
    function toggleGoalCompletion(goalId, isCompleted) {
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Update completion status
            goalsState.goals[goalIndex].completed = isCompleted;
            saveGoalsToStorage();
            
            // Re-render to maintain sort order
            renderGoals();
            
            // Show feedback on completion only
            if (isCompleted && typeof window.showFeedback === 'function') {
                window.showFeedback('Goal completed! 🎉', 'success');
            }
        }
    }

    // Delete a goal
    function deleteGoal(goalId) {
        goalsState.goals = goalsState.goals.filter(g => g.id !== goalId);
        saveGoalsToStorage();
        renderGoals();
        
        if (typeof window.showFeedback === 'function') {
            window.showFeedback('Goal removed', 'success');
        }
    }

    // Edit a goal
    function editGoal(goalId) {
        const goalToEdit = goalsState.goals.find(g => g.id === goalId);
        if (!goalToEdit) return;
        
        // Set form values
        const goalInput = document.getElementById('new-goal-input');
        const categorySelect = document.getElementById('new-goal-category');
        const prioritySelect = document.getElementById('new-goal-priority');
        
        if (goalInput && categorySelect && prioritySelect) {
            goalInput.value = goalToEdit.text;
            goalInput.dataset.editId = goalId;
            categorySelect.value = goalToEdit.category;
            prioritySelect.value = goalToEdit.priority;
            
            // Change save button text
            document.getElementById('save-goal-btn').innerHTML = '<i class="fas fa-check"></i> Update';
            
            // Show form
            document.querySelector('.enhanced-goals-form').style.display = 'block';
            goalInput.focus();
        }
    }

    // Save goals to localStorage
    function saveGoalsToStorage() {
        localStorage.setItem('enhancedGoals', JSON.stringify(goalsState.goals));
    }

    // Start the initialization
    init();
}); 