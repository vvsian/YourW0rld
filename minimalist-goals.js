// Minimalist Daily Goals System
document.addEventListener('DOMContentLoaded', () => {
    console.log('Minimalist Goals System loaded');
    
    // Simple state management for goals
    const goalsState = {
        goals: JSON.parse(localStorage.getItem('minimalistGoals')) || [],
        // Only essential category icons
        categories: {
            'task': { icon: 'circle', color: '#4fd1c5' },
            'important': { icon: 'star', color: '#f6ad55' }
        }
    };

    // Cache DOM elements
    const dailyGoalsCard = document.querySelector('.daily-goals-card');

    // Initialize the system
    function init() {
        // Replace the existing goals UI with our simplified version
        replaceGoalsUI();
        
        // Render initial goals
        renderGoals();
        
        // Setup event listeners
        setupEventListeners();
        
        // Debug log to confirm initialization
        console.log('Minimalist Goals System initialized');
    }

    // Replace the existing UI with our minimalist version
    function replaceGoalsUI() {
        // Clear the existing content
        if (dailyGoalsCard) {
            console.log('Replacing goals UI');
            dailyGoalsCard.innerHTML = `
                <div class="goals-header">
                    <h3><i class="fas fa-check-circle"></i> Focus Today</h3>
                    <button id="add-goal-btn" class="btn-icon" title="Add a new goal">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div id="goals-content" class="goals-content">
                    <ul id="goals-list" class="goals-list">
                        <!-- Goals will be added dynamically -->
                    </ul>
                </div>
                <div id="goals-form" class="goals-add-form" style="display: none;">
                    <input type="text" id="new-goal-input" class="new-goal-input" placeholder="What do you want to accomplish today?">
                    <div class="goals-form-actions">
                        <button id="cancel-goal-btn" class="cancel-goal-btn">
                            Cancel
                        </button>
                        <button id="save-goal-btn" class="save-goal-btn">
                            <i class="fas fa-save"></i> Save
                        </button>
                    </div>
                </div>
                <div class="goals-footer">
                    <div class="progress-container">
                        <div class="progress-bar" id="goals-progress-bar"></div>
                    </div>
                    <div class="goals-summary">
                        <span id="goals-completed-count">0</span>/<span id="goals-total-count">0</span> completed
                    </div>
                </div>
            `;
            
            // Add the styles to make sure form displays correctly
            addStyles();
        }
    }

    // Add styles directly to ensure they're applied
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .goals-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .goals-header h3 {
                font-size: 1.2rem;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                color: var(--text-primary);
            }
            
            .goals-header h3 i {
                margin-right: 10px;
                color: var(--accent);
            }
            
            #add-goal-btn {
                background: var(--accent);
                color: white;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                position: relative;
                z-index: 2;
            }
            
            #add-goal-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                background: var(--accent-hover);
            }
            
            #add-goal-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
            }
            
            #add-goal-btn i {
                font-size: 1.1rem;
            }
            
            .goals-content {
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 15px;
            }
            
            .goals-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .goal-item {
                display: flex;
                align-items: center;
                padding: 8px 4px;
                border-radius: 6px;
                margin-bottom: 4px;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .goal-item:hover {
                background: rgba(var(--bg-secondary-rgb), 0.5);
            }
            
            .goal-item.completed .goal-text {
                text-decoration: line-through;
                color: var(--text-secondary);
                opacity: 0.7;
            }
            
            /* Important goals styling */
            .goal-item.important::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 3px;
                background: #f6ad55;
                border-radius: 3px 0 0 3px;
            }
            
            .goal-checkbox {
                appearance: none;
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid rgba(var(--accent-rgb), 0.4);
                cursor: pointer;
                margin-right: 12px;
                position: relative;
                transition: all 0.2s ease;
            }
            
            .goal-checkbox:hover {
                border-color: var(--accent);
                transform: scale(1.1);
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
            
            .goal-text {
                flex: 1;
                font-size: 0.95rem;
                color: var(--text-primary);
                transition: all 0.2s ease;
            }
            
            .goal-actions {
                display: flex;
                gap: 5px;
                opacity: 1;
            }
            
            .goal-delete, .goal-star {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
                font-size: 0.8rem;
            }
            
            .goal-delete:hover {
                color: #e53e3e;
                background: rgba(229, 62, 62, 0.1);
            }
            
            .goal-star {
                font-size: 0.9rem;
            }
            
            .goal-star:hover, .goal-star.active {
                color: #f6ad55;
                background: rgba(246, 173, 85, 0.1);
            }
            
            /* Styling the add goal form */
            .goals-add-form {
                margin: 10px 0 15px;
                padding: 12px;
                background: var(--bg-card);
                border-radius: 8px;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(var(--accent-rgb), 0.1);
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .new-goal-input {
                width: 100%;
                padding: 12px;
                margin-bottom: 12px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background: var(--bg-input);
                color: var(--text-primary);
                font-size: 0.95rem;
                transition: all 0.2s ease;
            }
            
            .new-goal-input:focus {
                border-color: var(--accent);
                outline: none;
                box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
            }
            
            .goals-form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .cancel-goal-btn {
                padding: 8px 16px;
                background: transparent;
                border: none;
                color: var(--text-secondary);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }
            
            .cancel-goal-btn:hover {
                color: var(--text-primary);
                background: rgba(var(--bg-secondary-rgb), 0.5);
            }
            
            .save-goal-btn {
                padding: 8px 18px;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 500;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .save-goal-btn:hover {
                background: var(--accent-hover);
                transform: translateY(-1px);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
            }
            
            .save-goal-btn:active {
                transform: translateY(0);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .progress-container {
                height: 5px;
                background: rgba(var(--bg-secondary-rgb), 0.3);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            
            .progress-bar {
                height: 100%;
                background: var(--accent);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .goals-summary {
                font-size: 0.8rem;
                color: var(--text-secondary);
                text-align: right;
            }
            
            .goals-empty {
                text-align: center;
                padding: 20px 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Render goals in the UI
    function renderGoals() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;
        
        // Clear existing goals
        goalsList.innerHTML = '';
        
        // Sort goals: completed last, then by importance, then by creation date
        const sortedGoals = [...goalsState.goals].sort((a, b) => {
            // Completed goals at the end
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Important goals first among uncompleted
            if (!a.completed && a.important !== b.important) {
                return b.important ? 1 : -1;
            }
            
            // Otherwise sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // If no goals, show empty state
        if (sortedGoals.length === 0) {
            goalsList.innerHTML = `
                <li class="goals-empty">Add tasks to focus on today</li>
            `;
        } else {
            // Render each goal
            sortedGoals.forEach(goal => {
                const goalItem = document.createElement('li');
                goalItem.className = `goal-item ${goal.completed ? 'completed' : ''} ${goal.important ? 'important' : ''}`;
                goalItem.dataset.id = goal.id;
                
                goalItem.innerHTML = `
                    <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
                    <span class="goal-text">${goal.text}</span>
                    <div class="goal-actions">
                        <button class="goal-star ${goal.important ? 'active' : ''}" title="${goal.important ? 'Remove importance' : 'Mark as important'}">
                            <i class="${goal.important ? 'fas' : 'far'} fa-star"></i>
                        </button>
                        <button class="goal-delete" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // Add event listeners directly to each goal item elements
                const checkbox = goalItem.querySelector('.goal-checkbox');
                const starBtn = goalItem.querySelector('.goal-star');
                const deleteBtn = goalItem.querySelector('.goal-delete');
                
                if (checkbox) {
                    checkbox.addEventListener('change', (e) => {
                        toggleGoalCompletion(goal.id, e.target.checked);
                    });
                }
                
                if (starBtn) {
                    starBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleImportant(goal.id);
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteGoal(goal.id);
                    });
                }
                
                goalsList.appendChild(goalItem);
            });
        }
        
        // Update progress
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

    // Setup event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Add goal button - Show form
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            console.log('Add goal button found');
            addGoalBtn.addEventListener('click', () => {
                console.log('Add goal button clicked');
                const goalForm = document.getElementById('goals-form');
                if (goalForm) {
                    console.log('Showing goal form');
                    goalForm.style.display = 'block';
                    document.getElementById('new-goal-input').focus();
                } else {
                    console.error('Goal form not found!');
                }
            });
        } else {
            console.error('Add goal button not found!');
        }
        
        // Cancel button - Hide form
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');
        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () => {
                document.getElementById('goals-form').style.display = 'none';
                document.getElementById('new-goal-input').value = '';
            });
        }
        
        // Save button - Save new goal
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', saveGoal);
        }
        
        // Enter key in input - Save new goal
        const newGoalInput = document.getElementById('new-goal-input');
        if (newGoalInput) {
            newGoalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveGoal();
                }
            });
        }
    }

    // Save a new goal
    function saveGoal() {
        console.log('Save goal function called');
        const goalInput = document.getElementById('new-goal-input');
        if (!goalInput) {
            console.error('Goal input not found!');
            return;
        }
        
        const goalText = goalInput.value.trim();
        
        if (goalText) {
            console.log('Adding new goal:', goalText);
            // Add new goal
            const newGoal = {
                id: Date.now(),
                text: goalText,
                important: false,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            goalsState.goals.push(newGoal);
            
            // Save to localStorage
            saveGoalsToStorage();
            
            // Hide form and reset
            document.getElementById('goals-form').style.display = 'none';
            goalInput.value = '';
            
            // Re-render goals
            renderGoals();
            
            // Show feedback
            showFeedback('Goal added successfully!');
        } else {
            showFeedback('Please enter a goal', true);
        }
    }

    // Toggle goal completion
    function toggleGoalCompletion(goalId, isCompleted) {
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Update completion status
            goalsState.goals[goalIndex].completed = isCompleted;
            saveGoalsToStorage();
            renderGoals();
        }
    }

    // Toggle goal importance
    function toggleImportant(goalId) {
        console.log('Toggling important for goal:', goalId);
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Update importance status
            goalsState.goals[goalIndex].important = !goalsState.goals[goalIndex].important;
            saveGoalsToStorage();
            renderGoals();
            
            // Show feedback
            const isImportant = goalsState.goals[goalIndex].important;
            showFeedback(isImportant ? 'Goal marked as important' : 'Importance removed');
        }
    }

    // Delete a goal
    function deleteGoal(goalId) {
        console.log('Deleting goal:', goalId);
        
        // Find the goal to get its text for the feedback message
        const goalToDelete = goalsState.goals.find(g => g.id === goalId);
        const goalText = goalToDelete ? goalToDelete.text : '';
        
        // Remove the goal
        goalsState.goals = goalsState.goals.filter(g => g.id !== goalId);
        saveGoalsToStorage();
        renderGoals();
        
        // Show feedback
        showFeedback(`Goal deleted`);
    }

    // Save goals to localStorage
    function saveGoalsToStorage() {
        localStorage.setItem('minimalistGoals', JSON.stringify(goalsState.goals));
    }

    // Simple feedback function
    function showFeedback(message, isError = false) {
        console.log(isError ? 'Error: ' : 'Success: ', message);
        // If window.showFeedback exists, use it
        if (typeof window.showFeedback === 'function') {
            window.showFeedback(message, isError ? 'error' : 'success');
        }
    }

    // Make some functions available globally for other scripts
    window.toggleGoalCompletion = toggleGoalCompletion;
    window.deleteGoal = deleteGoal;
    window.toggleImportant = toggleImportant;

    // Initialize the system
    init();
}); 