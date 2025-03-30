// Fix for the daily goals functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Goals fix script loaded');
    
    // Wait a moment for the main script to initialize and render goals
    setTimeout(() => {
        // Select all goal checkboxes
        setupGoalCheckboxes();
        
        // Add a mutation observer to handle dynamically added goals
        const goalsList = document.getElementById('goals-list');
        if (goalsList) {
            const observer = new MutationObserver(() => {
                setupGoalCheckboxes();
            });
            
            observer.observe(goalsList, { childList: true, subtree: true });
        }
    }, 1000);
    
    function setupGoalCheckboxes() {
        console.log('Setting up goal checkboxes');
        const checkboxes = document.querySelectorAll('.goal-checkbox');
        
        checkboxes.forEach(checkbox => {
            // Remove existing event listeners (to avoid duplicates)
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
            
            // Add new click event listener
            newCheckbox.addEventListener('click', function(e) {
                // Get the goal ID
                const goalItem = this.closest('.goal-item');
                if (!goalItem) return;
                
                const goalId = goalItem.dataset.id;
                console.log('Goal clicked:', goalId);
                
                // Toggle completed class
                goalItem.classList.toggle('completed');
                
                // Update the state in localStorage
                updateGoalState(goalId, this.checked);
                
                // Show feedback
                if (this.checked) {
                    showFeedback('Goal completed! 🎉', 'success');
                }
            });
        });
    }
    
    function updateGoalState(goalId, completed) {
        // Get current streaks data
        const streaksData = JSON.parse(localStorage.getItem('streaks')) || {};
        const goals = streaksData.goals || [];
        
        // Find and update the goal
        const goalIndex = goals.findIndex(g => g.id == goalId);
        if (goalIndex !== -1) {
            goals[goalIndex].completed = completed;
            
            // Save back to localStorage
            streaksData.goals = goals;
            localStorage.setItem('streaks', JSON.stringify(streaksData));
            console.log('Goal state updated:', goalId, completed);
        }
    }
    
    function showFeedback(message, type = 'success') {
        // Check if the feedback function exists in the main script
        if (window.showFeedback) {
            window.showFeedback(message, type);
        } else {
            // Create a simple feedback message if the main function doesn't exist
            const feedback = document.createElement('div');
            feedback.className = `feedback-message ${type} show`;
            feedback.textContent = message;
            
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                feedback.classList.remove('show');
                setTimeout(() => {
                    feedback.remove();
                }, 300);
            }, 3000);
        }
    }
}); 