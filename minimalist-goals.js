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
        // Replace the existing goals UI with our minimalist version
        replaceGoalsUI();
        
        // Render initial goals
        renderGoals();
        
        // Setup event listeners
        setupEventListeners();
    }

    // Replace the existing UI with our minimalist version
    function replaceGoalsUI() {
        // Clear the existing content
        if (dailyGoalsCard) {
            dailyGoalsCard.innerHTML = `
                <div class="goals-header">
                    <h3><i class="fas fa-check-circle"></i> Focus Today</h3>
                    <button id="add-goal-btn" class="btn-icon" title="Add a new goal">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="minimalist-goals-content">
                    <ul id="goals-list" class="minimalist-goals-list"></ul>
                </div>
                <div class="minimalist-goal-form" style="display: none;">
                    <input type="text" id="new-goal-input" placeholder="What do you want to accomplish today?">
                    <div class="goal-form-actions">
                        <button id="mark-important-btn" class="goal-tag-btn" title="Mark as important">
                            <i class="far fa-star"></i>
                        </button>
                        <div class="form-btn-group">
                            <button id="cancel-goal-btn" class="btn-subtle">
                                Cancel
                            </button>
                            <button id="save-goal-btn" class="btn-primary">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
                <div class="minimalist-goals-footer">
                    <div class="progress-container">
                        <div class="progress-bar" id="goals-progress-bar"></div>
                    </div>
                    <div class="goals-summary">
                        <span id="goals-completed-count">0</span>/<span id="goals-total-count">0</span> completed
                    </div>
                </div>
            `;
        }

        // Add minimalist styles
        addMinimalistStyles();
    }

    // Add styles for the minimalist goals system
    function addMinimalistStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .daily-goals-card {
                overflow: visible;
            }
            
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
                opacity: 0.9;
            }
            
            .minimalist-goals-content {
                margin-bottom: 15px;
            }
            
            .minimalist-goals-list {
                list-style: none;
                padding: 0;
                margin: 0;
                max-height: 300px; /* Keep the list from growing too tall */
                overflow-y: auto;
            }
            
            .minimalist-goals-list::-webkit-scrollbar {
                width: 4px;
            }
            
            .minimalist-goals-list::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .minimalist-goals-list::-webkit-scrollbar-thumb {
                background: rgba(var(--accent-rgb), 0.2);
                border-radius: 4px;
            }
            
            .minimalist-goals-list::-webkit-scrollbar-thumb:hover {
                background: rgba(var(--accent-rgb), 0.3);
            }
            
            .minimalist-goal-item {
                display: flex;
                align-items: center;
                padding: 8px 4px;
                border-radius: 6px;
                margin-bottom: 4px;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .minimalist-goal-item:hover {
                background: rgba(var(--bg-secondary-rgb), 0.5);
            }
            
            .minimalist-goal-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0;
                background: var(--accent);
                opacity: 0.1;
                transition: width 0.3s ease;
            }
            
            .minimalist-goal-item:hover::before {
                width: 100%;
            }
            
            .minimalist-goal-item.completed {
                opacity: 0.7;
            }
            
            .minimalist-goal-item.completed .goal-text {
                text-decoration: line-through;
                color: var(--text-secondary);
            }
            
            .minimalist-goal-item.important::after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 3px;
                background: #f6ad55;
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
                z-index: 2; /* Ensure it's above other elements */
            }
            
            .goal-checkbox:hover {
                border-color: var(--accent);
                transform: scale(1.1);
                box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
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
            
            /* Add a larger hitbox for checkbox */
            .goal-checkbox::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                z-index: -1;
            }
            
            .goal-text {
                flex: 1;
                font-size: 0.95rem;
                color: var(--text-primary);
                transition: all 0.2s ease;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding: 2px 0;
            }
            
            .goal-actions {
                display: flex;
                gap: 5px;
                opacity: 1; /* Always visible now */
                transition: all 0.2s ease;
                margin-left: 5px;
            }
            
            .minimalist-goal-item:hover .goal-actions {
                opacity: 1;
            }
            
            .goal-delete, .goal-star {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 0.85rem;
                width: 32px; /* Larger clickable area */
                height: 32px; /* Larger clickable area */
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                position: relative; /* For the hitbox */
            }
            
            /* Add a larger hit area for the buttons */
            .goal-delete::before, .goal-star::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                z-index: -1;
            }
            
            .goal-delete {
                color: #ec5858; /* Always visible in red */
                opacity: 0.6; /* Slightly dimmed when not hovered */
            }
            
            .goal-delete:hover {
                background: rgba(236, 88, 88, 0.1);
                color: #ec5858;
                opacity: 1;
                transform: scale(1.1);
            }
            
            .goal-star {
                opacity: 0.6; /* Slightly dimmed when not hovered */
            }
            
            .goal-star:hover, .goal-star.active {
                background: rgba(246, 173, 85, 0.1);
                color: #f6ad55;
                opacity: 1;
                transform: scale(1.1);
            }
            
            .goal-star.active {
                opacity: 1;
                color: #f6ad55;
            }
            
            .minimalist-goal-form {
                margin-top: 10px;
                margin-bottom: 15px;
                background: rgba(var(--bg-secondary-rgb), 0.3);
                border-radius: 8px;
                padding: 12px;
                border: 1px solid rgba(var(--accent-rgb), 0.1);
                animation: fadeIn 0.2s ease;
            }
            
            #new-goal-input {
                width: 100%;
                border: none;
                background: transparent;
                color: var(--text-primary);
                font-size: 0.95rem;
                padding: 6px 2px;
                border-bottom: 1px solid rgba(var(--accent-rgb), 0.2);
                margin-bottom: 12px;
            }
            
            #new-goal-input:focus {
                outline: none;
                border-color: var(--accent);
            }
            
            .goal-form-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .form-btn-group {
                display: flex;
                gap: 10px;
            }
            
            .goal-tag-btn {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1rem;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .goal-tag-btn:hover, .goal-tag-btn.active {
                background: rgba(246, 173, 85, 0.1);
                color: #f6ad55;
            }
            
            #cancel-goal-btn {
                font-size: 0.85rem;
                padding: 6px 12px;
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            
            #cancel-goal-btn:hover {
                background: rgba(var(--bg-secondary-rgb), 0.5);
                color: var(--text-primary);
            }
            
            #save-goal-btn {
                font-size: 0.85rem;
                padding: 6px 16px;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            #save-goal-btn:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
            
            .minimalist-goals-footer {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .progress-container {
                height: 4px;
                background: rgba(var(--accent-rgb), 0.1);
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background: var(--accent);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .goals-summary {
                font-size: 0.75rem;
                color: var(--text-secondary);
                text-align: right;
            }
            
            .empty-goals {
                text-align: center;
                padding: 20px 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
                opacity: 0.7;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Animation for completing a goal */
            @keyframes goalComplete {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .goal-complete-animation {
                animation: goalComplete 0.4s ease-in-out;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Render all goals
    function renderGoals() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;
        
        // Clear the list
        goalsList.innerHTML = '';
        
        // Sort goals: important first, then uncompleted, then completed
        const sortedGoals = [...goalsState.goals].sort((a, b) => {
            // Completed goals last
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
                <div class="empty-goals">
                    <p>Add tasks to focus on today</p>
                </div>
            `;
        } else {
            // Render each goal
            sortedGoals.forEach(goal => {
                const goalItem = document.createElement('li');
                goalItem.className = `minimalist-goal-item ${goal.completed ? 'completed' : ''} ${goal.important ? 'important' : ''}`;
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

    // Setup all event listeners
    function setupEventListeners() {
        // Add goal button click
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                document.querySelector('.minimalist-goal-form').style.display = 'block';
                document.getElementById('new-goal-input').focus();
            });
        }
        
        // Cancel goal button click
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');
        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () => {
                document.querySelector('.minimalist-goal-form').style.display = 'none';
                resetForm();
            });
        }
        
        // Save goal button click
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', saveGoal);
        }
        
        // Mark important button
        const markImportantBtn = document.getElementById('mark-important-btn');
        if (markImportantBtn) {
            markImportantBtn.addEventListener('click', () => {
                markImportantBtn.classList.toggle('active');
                markImportantBtn.querySelector('i').classList.toggle('far');
                markImportantBtn.querySelector('i').classList.toggle('fas');
            });
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
        
        // Goal list item events (using event delegation)
        const goalsList = document.getElementById('goals-list');
        if (goalsList) {
            goalsList.addEventListener('click', (e) => {
                const goalItem = e.target.closest('.minimalist-goal-item');
                if (!goalItem) return;
                
                const goalId = parseInt(goalItem.dataset.id);
                
                // Handle checkbox clicks directly
                if (e.target.classList.contains('goal-checkbox')) {
                    e.stopPropagation(); // Prevent event bubbling
                    toggleGoalCompletion(goalId, e.target.checked, goalItem);
                    return;
                }
                
                // Handle star button click
                if (e.target.closest('.goal-star')) {
                    toggleImportant(goalId);
                    return;
                }
                
                // Handle delete button click
                if (e.target.closest('.goal-delete')) {
                    deleteGoal(goalId);
                    return;
                }
            });
        }
    }

    // Reset form to default state
    function resetForm() {
        const newGoalInput = document.getElementById('new-goal-input');
        const markImportantBtn = document.getElementById('mark-important-btn');
        
        if (newGoalInput) newGoalInput.value = '';
        if (markImportantBtn) {
            markImportantBtn.classList.remove('active');
            markImportantBtn.querySelector('i').className = 'far fa-star';
        }
    }

    // Save a new goal
    function saveGoal() {
        const goalInput = document.getElementById('new-goal-input');
        const markImportantBtn = document.getElementById('mark-important-btn');
        
        if (!goalInput) return;
        
        const goalText = goalInput.value.trim();
        const isImportant = markImportantBtn && markImportantBtn.classList.contains('active');
        
        if (goalText) {
            // Add new goal
            const newGoal = {
                id: Date.now(),
                text: goalText,
                important: isImportant,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            goalsState.goals.push(newGoal);
            
            // Save to localStorage
            saveGoalsToStorage();
            
            // Hide form and reset
            document.querySelector('.minimalist-goal-form').style.display = 'none';
            resetForm();
            
            // Re-render goals
            renderGoals();
            
            // Show feedback
            if (typeof window.showFeedback === 'function') {
                window.showFeedback('Task added', 'success');
            }
        } else {
            // Show error feedback
            if (typeof window.showFeedback === 'function') {
                window.showFeedback('Please enter a task', 'error');
            }
        }
    }

    // Toggle goal completion
    function toggleGoalCompletion(goalId, isCompleted, goalElement) {
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Update completion status
            goalsState.goals[goalIndex].completed = isCompleted;
            saveGoalsToStorage();
            
            // Apply animation if completed
            if (isCompleted && goalElement) {
                goalElement.classList.add('goal-complete-animation');
                setTimeout(() => {
                    goalElement.classList.remove('goal-complete-animation');
                    // Re-render after animation to maintain sort order
                    renderGoals();
                }, 400);
            } else {
                // Re-render immediately if unchecked
                renderGoals();
            }
            
            // Show feedback on completion only
            if (isCompleted && typeof window.showFeedback === 'function') {
                window.showFeedback('Task completed! 🎉', 'success');
            }
        }
    }

    // Toggle important status
    function toggleImportant(goalId) {
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Toggle important flag
            goalsState.goals[goalIndex].important = !goalsState.goals[goalIndex].important;
            saveGoalsToStorage();
            
            // Re-render goals to update UI and maintain sort order
            renderGoals();
        }
    }

    // Delete a goal
    function deleteGoal(goalId) {
        goalsState.goals = goalsState.goals.filter(g => g.id !== goalId);
        saveGoalsToStorage();
        renderGoals();
    }

    // Save goals to localStorage
    function saveGoalsToStorage() {
        localStorage.setItem('minimalistGoals', JSON.stringify(goalsState.goals));
    }

    // Expose function to global scope for checkbox fix
    window.updateGoalCompletion = (goalId, isCompleted) => {
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            goalsState.goals[goalIndex].completed = isCompleted;
            saveGoalsToStorage();
            renderGoals();
            
            // Show feedback on completion only
            if (isCompleted && typeof window.showFeedback === 'function') {
                window.showFeedback('Task completed! 🎉', 'success');
            }
        }
    };

    // Expose delete function
    window.deleteGoal = (goalId) => {
        console.log('Deleting goal:', goalId);
        goalsState.goals = goalsState.goals.filter(g => g.id !== goalId);
        saveGoalsToStorage();
        renderGoals();
        
        if (typeof window.showFeedback === 'function') {
            window.showFeedback('Task removed', 'success');
        }
    };
    
    // Expose toggle important function
    window.toggleImportant = (goalId) => {
        console.log('Toggling importance for goal:', goalId);
        const goalIndex = goalsState.goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            // Toggle important flag
            goalsState.goals[goalIndex].important = !goalsState.goals[goalIndex].important;
            saveGoalsToStorage();
            
            // Re-render goals to update UI and maintain sort order
            renderGoals();
        }
    };

    // Start the initialization
    init();
}); 