// Fix for the double clock issue
document.addEventListener('DOMContentLoaded', () => {
    console.log('Clock fix script loaded');
    
    // Wait a moment for all clocks to be created
    setTimeout(() => {
        // Get all time-date displays
        const timeDisplays = document.querySelectorAll('.time-date-display');
        
        // If there's more than one, remove the extras
        if (timeDisplays.length > 1) {
            console.log(`Found ${timeDisplays.length} clocks, removing extras`);
            
            // Keep only the first one
            for (let i = 1; i < timeDisplays.length; i++) {
                timeDisplays[i].remove();
            }
            
            console.log('Extra clocks removed');
        } else {
            console.log('No duplicate clocks found');
        }
    }, 500);
}); 