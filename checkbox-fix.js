// Checkbox Fix for Goals System
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkbox fix loaded');
    
    // Apply direct event listeners to all goal checkboxes and buttons
    function fixInteractions() {
        // Fix checkboxes
        const checkboxes = document.querySelectorAll('.goal-checkbox');
        checkboxes.forEach(checkbox => {
            // Remove existing listeners to prevent duplication
            checkbox.removeEventListener('change', handleCheckboxChange);
            // Add direct change listener
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // Fix delete buttons
        const deleteButtons = document.querySelectorAll('.goal-delete');
        deleteButtons.forEach(button => {
            // Remove existing listeners to prevent duplication
            button.removeEventListener('click', handleDeleteClick);
            // Add direct click listener
            button.addEventListener('click', handleDeleteClick);
        });
        
        // Fix star buttons
        const starButtons = document.querySelectorAll('.goal-star');
        starButtons.forEach(button => {
            // Remove existing listeners to prevent duplication
            button.removeEventListener('click', handleStarClick);
            // Add direct click listener
            button.addEventListener('click', handleStarClick);
        });
    }
    
    // Handle checkbox changes
    function handleCheckboxChange(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        const checkbox = e.target;
        const goalItem = checkbox.closest('.minimalist-goal-item');
        
        if (!goalItem) return;
        
        const goalId = parseInt(goalItem.dataset.id);
        const isChecked = checkbox.checked;
        
        // Apply completed class right away for immediate feedback
        if (isChecked) {
            goalItem.classList.add('completed');
            goalItem.classList.add('goal-complete-animation');
            
            // Find goal text and apply strikethrough
            const goalText = goalItem.querySelector('.goal-text');
            if (goalText) {
                goalText.style.textDecoration = 'line-through';
                goalText.style.color = 'var(--text-secondary)';
            }
            
            setTimeout(() => {
                goalItem.classList.remove('goal-complete-animation');
                
                // Call the global function to update state
                if (window.updateGoalCompletion) {
                    window.updateGoalCompletion(goalId, isChecked);
                } else {
                    updateGoalState(goalId, isChecked);
                }
            }, 400);
        } else {
            goalItem.classList.remove('completed');
            
            // Find goal text and remove strikethrough
            const goalText = goalItem.querySelector('.goal-text');
            if (goalText) {
                goalText.style.textDecoration = 'none';
                goalText.style.color = 'var(--text-primary)';
            }
            
            // Call the global function to update state immediately for unchecking
            if (window.updateGoalCompletion) {
                window.updateGoalCompletion(goalId, isChecked);
            } else {
                updateGoalState(goalId, isChecked);
            }
        }
    }
    
    // Handle delete button clicks
    function handleDeleteClick(e) {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent any default behavior
        
        const button = e.currentTarget; // Use currentTarget instead of target to ensure we get the button
        const goalItem = button.closest('.minimalist-goal-item');
        
        if (!goalItem) return;
        
        const goalId = parseInt(goalItem.dataset.id);
        
        // Add a visual indication that the button was clicked
        button.style.transform = 'scale(0.9)';
        
        // Call the global delete function if available
        if (window.deleteGoal) {
            setTimeout(() => {
                window.deleteGoal(goalId);
            }, 100);
        } else {
            // Fallback: directly manipulate localStorage and remove the element
            setTimeout(() => {
                try {
                    // Get goals from localStorage
                    const goals = JSON.parse(localStorage.getItem('minimalistGoals')) || [];
                    // Filter out the deleted goal
                    const updatedGoals = goals.filter(g => g.id !== goalId);
                    // Save back to localStorage
                    localStorage.setItem('minimalistGoals', JSON.stringify(updatedGoals));
                    // Remove the item from DOM
                    goalItem.style.opacity = '0';
                    goalItem.style.height = '0';
                    goalItem.style.marginBottom = '0';
                    goalItem.style.overflow = 'hidden';
                    setTimeout(() => {
                        goalItem.remove();
                        updateProgress();
                    }, 300);
                } catch(e) {
                    console.error('Error deleting goal:', e);
                }
            }, 100);
        }
    }
    
    // Handle star button clicks
    function handleStarClick(e) {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent any default behavior
        
        const button = e.currentTarget; // Use currentTarget instead of target
        const goalItem = button.closest('.minimalist-goal-item');
        
        if (!goalItem) return;
        
        const goalId = parseInt(goalItem.dataset.id);
        
        // Add a visual indication that the button was clicked
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
        
        // Toggle the important status
        if (window.toggleImportant) {
            window.toggleImportant(goalId);
        } else {
            // Fallback: directly manipulate localStorage and update the UI
            try {
                // Get goals from localStorage
                const goals = JSON.parse(localStorage.getItem('minimalistGoals')) || [];
                // Find the goal to toggle
                const goalIndex = goals.findIndex(g => g.id === goalId);
                if (goalIndex !== -1) {
                    // Toggle the important flag
                    goals[goalIndex].important = !goals[goalIndex].important;
                    // Save back to localStorage
                    localStorage.setItem('minimalistGoals', JSON.stringify(goals));
                    
                    // Update the UI
                    goalItem.classList.toggle('important');
                    button.classList.toggle('active');
                    const icon = button.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('far');
                        icon.classList.toggle('fas');
                    }
                    
                    // Update button title
                    const isImportant = goals[goalIndex].important;
                    button.title = isImportant ? 'Remove importance' : 'Mark as important';
                }
            } catch(e) {
                console.error('Error toggling important status:', e);
            }
        }
    }
    
    // Helper function to update the goal state in localStorage
    function updateGoalState(goalId, isCompleted) {
        console.log('Updating goal state: ', goalId, isCompleted);
        try {
            // Find the goals state in localStorage
            const goalsState = JSON.parse(localStorage.getItem('minimalistGoals')) || [];
            const goalIndex = goalsState.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                goalsState[goalIndex].completed = isCompleted;
                localStorage.setItem('minimalistGoals', JSON.stringify(goalsState));
                console.log('Goal completion updated', goalId, isCompleted);
            }
        } catch(e) {
            console.error('Error updating goal state:', e);
        }
    }
    
    // Helper function to update the progress display
    function updateProgress() {
        try {
            const goals = JSON.parse(localStorage.getItem('minimalistGoals')) || [];
            const totalGoals = goals.length;
            const completedGoals = goals.filter(goal => goal.completed).length;
            const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
            
            // Update UI elements
            const totalCountEl = document.getElementById('goals-total-count');
            const completedCountEl = document.getElementById('goals-completed-count');
            const progressBar = document.getElementById('goals-progress-bar');
            
            if (totalCountEl) totalCountEl.textContent = totalGoals;
            if (completedCountEl) completedCountEl.textContent = completedGoals;
            if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        } catch(e) {
            console.error('Error updating progress:', e);
        }
    }
    
    // Apply fix when goals are rendered or updated
    function observeGoalsList() {
        // Create a mutation observer to watch for changes to the goals list
        const observer = new MutationObserver((mutations) => {
            let needsFixing = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsFixing = true;
                    break;
                }
            }
            
            if (needsFixing) {
                // Small delay to ensure DOM is completely updated
                setTimeout(fixInteractions, 50);
            }
        });
        
        // Start observing the goals list
        const goalsList = document.getElementById('goals-list');
        if (goalsList) {
            observer.observe(goalsList, { childList: true, subtree: true });
            // Apply fix immediately in case goals are already rendered
            fixInteractions();
        }
    }
    
    // Try to fix interactions right away
    setTimeout(fixInteractions, 100);
    
    // Set up observer with slight delay to ensure DOM is fully loaded
    setTimeout(observeGoalsList, 300);
    
    // Re-apply fix periodically to catch any missed elements
    setInterval(fixInteractions, 2000);
}); 