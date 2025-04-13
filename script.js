document.addEventListener('DOMContentLoaded', () => {
    // State Management
    const state = {
        moods: JSON.parse(localStorage.getItem('moods')) || [],
        journalEntries: JSON.parse(localStorage.getItem('journalEntries')) || [],
        events: JSON.parse(localStorage.getItem('events')) || [],
        theme: localStorage.getItem('theme') || 'dark',
        activeDays: new Set(JSON.parse(localStorage.getItem('activeDays')) || []),
        // Add streaks to the state
        streaks: JSON.parse(localStorage.getItem('streaks')) || {
            current: 0,
            longest: 0,
            lastCheckIn: null,
            milestones: [3, 7, 14, 21, 30, 60, 90, 180, 365],
            rewards: JSON.parse(localStorage.getItem('streakRewards')) || {},
            goals: JSON.parse(localStorage.getItem('streakGoals')) || []
        },
        profile: JSON.parse(localStorage.getItem('profile')) || {
            name: '',
            bio: '',
            profilePic: ''
        },
        settings: JSON.parse(localStorage.getItem('settings')) || {
            showNotifications: true,
            autoSave: false,
            reminderTime: ''
        },
        affirmations: [
            "I am capable of achieving great things",
            "Every day is a new opportunity",
            "I trust my journey",
            "I am growing stronger each day",
            "I create my own happiness",
            "I am worthy of love and respect",
            "My potential is limitless",
            "I choose to be confident",
            "I am in charge of my life",
            "Today will be a great day"
        ],
        studyTools: {
            decks: JSON.parse(localStorage.getItem('studyDecks')) || [],
            currentDeck: null,
            currentCardIndex: 0,
            pomodoro: {
                focusDuration: parseInt(localStorage.getItem('pomodoroFocusDuration')) || 25,
                breakDuration: parseInt(localStorage.getItem('pomodoroBreakDuration')) || 5,
                timeLeft: parseInt(localStorage.getItem('pomodoroFocusDuration')) || 25 * 60,
                isRunning: false,
                isBreak: false,
                sessionsCompleted: parseInt(localStorage.getItem('pomodoroSessionsCompleted')) || 0,
                timer: null
            }
        }
    };
  
    // Initialize
    function init() {
        loadProfile();
        setupNavigation();
        setupThemeSwitch();
        setupProfileUpload();
        setupStickyNote();
        setupMoodTracker();
        setupJournal();
        setupTimeline();
        setupAnalytics();
        setupSettings();
        updateStats();
        setRandomAffirmation();
        updateStreaks(); // Add streak update
        markActiveDay();
        setupStudyTools();
        setupFaithPage();
        setupSidebar();
        setupTimeDate(); // Add clock/date display
        setupStreakSystem(); // Add streak system setup
    }
  
    // Profile Management
    function loadProfile() {
        // Load profile picture
        if (state.profile.profilePic) {
            document.getElementById('profile-pic').src = state.profile.profilePic;
        }
        
        // Load profile name and bio
        const profileName = document.getElementById('profile-name');
        const profileBio = document.getElementById('profile-bio');
        
        if (state.profile.name) {
            profileName.textContent = state.profile.name;
        }
        
        if (state.profile.bio) {
            profileBio.textContent = state.profile.bio;
        }
        
        // Setup profile edit functionality
        setupProfileEdit();
    }
    
    function setupProfileEdit() {
        const editProfileBtn = document.getElementById('edit-profile');
        const cancelEditBtn = document.getElementById('cancel-profile-edit');
        const saveProfileBtn = document.getElementById('save-home-profile');
        const editPanel = document.querySelector('.profile-edit-panel');
        const nameInput = document.getElementById('home-display-name');
        const bioInput = document.getElementById('home-bio');
        
        // Pre-fill form with existing data
        nameInput.value = state.profile.name || '';
        bioInput.value = state.profile.bio || '';
        
        // Show edit panel
        editProfileBtn.addEventListener('click', () => {
            editPanel.style.display = 'block';
        });
        
        // Hide edit panel
        cancelEditBtn.addEventListener('click', () => {
            editPanel.style.display = 'none';
        });
        
        // Save profile changes
        saveProfileBtn.addEventListener('click', () => {
            state.profile.name = nameInput.value;
            state.profile.bio = bioInput.value;
            
            // Update display
            document.getElementById('profile-name').textContent = state.profile.name || 'Welcome';
            document.getElementById('profile-bio').textContent = state.profile.bio || 'Add a short bio about yourself';
            
            // Save to localStorage
            localStorage.setItem('profile', JSON.stringify(state.profile));
            
            // Hide edit panel
            editPanel.style.display = 'none';
            
            // Show feedback
            showFeedback('Profile updated successfully!');
        });
    }
  
    function setupProfileUpload() {
        const profilePic = document.getElementById('profile-pic');
        const profilePicInput = document.getElementById('profile-pic-input');
        const profilePicOverlay = document.querySelector('.profile-pic-overlay');
        
        profilePicOverlay.addEventListener('click', () => {
            profilePicInput.click();
        });
  
        profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePic.src = e.target.result;
                    state.profile.profilePic = e.target.result;
                    localStorage.setItem('profile', JSON.stringify(state.profile));
                    showFeedback('Profile picture updated!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
  
    function setupStickyNote() {
        const noteDisplay = document.getElementById('note-display');
        const noteEditor = document.getElementById('note-editor');
        const noteTextarea = document.getElementById('note-textarea');
        const charCount = document.getElementById('note-char-count');
        const editButton = document.getElementById('edit-note');
        const saveButton = document.getElementById('save-note');
        const cancelButton = document.getElementById('cancel-note');
        
        // Load saved note
        const savedNote = localStorage.getItem('note');
        if (savedNote) {
            noteDisplay.textContent = savedNote;
        }
        
        // Show editor when display is clicked
        noteDisplay.addEventListener('click', showEditor);
        
        // Show editor when edit button is clicked
        editButton.addEventListener('click', showEditor);
        
        // Update character count
        noteTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const max = this.maxLength;
            charCount.textContent = `${length}/${max}`;
        });
        
        // Save note
        saveButton.addEventListener('click', saveNote);
        
        // Cancel editing
        cancelButton.addEventListener('click', hideEditor);
        
        // Allow saving with Ctrl+Enter
        noteTextarea.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                saveNote();
            }
            
            // Escape key to cancel
            if (e.key === 'Escape') {
                hideEditor();
            }
        });
        
        function showEditor() {
            // Pre-fill textarea with current note
            noteTextarea.value = noteDisplay.textContent === 'Click to add a note' ? '' : noteDisplay.textContent;
            
            // Update character count
            const length = noteTextarea.value.length;
            const max = noteTextarea.maxLength;
            charCount.textContent = `${length}/${max}`;
            
            // Hide display, show editor
            noteDisplay.style.display = 'none';
            noteEditor.style.display = 'block';
            
            // Focus textarea
            noteTextarea.focus();
        }
        
        function hideEditor() {
            noteDisplay.style.display = 'block';
            noteEditor.style.display = 'none';
        }
        
        function saveNote() {
            const noteText = noteTextarea.value.trim();
            
            if (noteText) {
                // Update display
                noteDisplay.textContent = noteText;
                
                // Save to localStorage
                localStorage.setItem('note', noteText);
                
                // Show feedback
                showFeedback('Note saved successfully!');
                
                // Mark as active day
                markActiveDay();
            } else {
                // If empty, show default text
                noteDisplay.textContent = 'Click to add a note';
                
                // Remove from localStorage
                localStorage.removeItem('note');
            }
            
            // Hide editor
            hideEditor();
        }
    }
  
    // Mood Tracker
    function setupMoodTracker() {
        const moodItems = document.querySelectorAll('.mood-item');
        const moodNote = document.getElementById('mood-note');
        const moodNoteChar = document.getElementById('mood-note-char');
        const moodFilter = document.getElementById('mood-filter');
        const clearAllMoodsBtn = document.getElementById('clear-all-moods');
        
        // Setup character counter for mood note
        moodNote.addEventListener('input', () => {
            updateCharCount(moodNote, moodNoteChar);
        });
        
        // Setup mood selection
        moodItems.forEach(item => {
            item.addEventListener('click', () => {
                // Clear previous selections
                moodItems.forEach(mi => mi.classList.remove('selected'));
                
                // Add selected class to clicked item
                item.classList.add('selected');
                
                const moodType = item.dataset.mood;
                const mood = {
                    type: moodType,
                    mood: moodType, // Adding this property for compatibility
                    note: moodNote.value.trim(),
                    timestamp: new Date().toISOString()
                };
                
                state.moods.unshift(mood); // Add to beginning of array
                localStorage.setItem('moods', JSON.stringify(state.moods));
                
                // Clear the note field
                moodNote.value = '';
                updateCharCount(moodNote, moodNoteChar);
                
                // Show visual feedback
                showFeedback(`${mood.type.charAt(0).toUpperCase() + mood.type.slice(1)} mood logged!`);
                
                // Update UI
                updateMoodChart();
                renderMoodEntries();
                updateAnalyticsCharts();
                updateStats();
                markActiveDay();
                
                // Trigger onMoodChange callback if it exists
                if (typeof state.onMoodChange === 'function') {
                    state.onMoodChange(moodType);
                }
                
                // Clear selection after a short delay
                setTimeout(() => {
                    item.classList.remove('selected');
                }, 1000);
            });
        });
  
        // Setup mood filtering
        moodFilter.addEventListener('change', () => {
            renderMoodEntries(moodFilter.value);
        });
        
        // Setup clear all moods
        clearAllMoodsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all mood entries? This cannot be undone.')) {
                state.moods = [];
                localStorage.setItem('moods', JSON.stringify(state.moods));
                
                // Update UI
        updateMoodChart();
                renderMoodEntries();
                updateAnalyticsCharts();
                updateStats();
                
                showFeedback('All mood entries cleared');
            }
        });
        
        // Initial render
        updateMoodChart();
        renderMoodEntries();
    }
    
    function renderMoodEntries(filter = 'all') {
        const container = document.getElementById('mood-entries');
        const filteredMoods = filter === 'all' 
            ? state.moods 
            : state.moods.filter(mood => mood.type === filter);
        
        container.innerHTML = '';
        
        if (filteredMoods.length === 0) {
            container.innerHTML = `
                <div class="mood-empty">
                    <i class="fas fa-smile-beam"></i>
                    <p>${filter === 'all' ? 'No mood entries yet' : 'No ' + filter + ' moods logged yet'}</p>
                    <p class="mood-empty-subtitle">Select a mood above to start tracking</p>
                </div>
            `;
            return;
        }
        
        // Get emoji for each mood type
        const moodEmojis = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😡',
            'excited': '🤩',
            'tired': '😴',
            'neutral': '😐',
            'anxious': '😰',
            'relaxed': '😌'
        };
        
        filteredMoods.forEach((mood, index) => {
            const moodDate = new Date(mood.timestamp);
            const formattedDate = moodDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            const formattedTime = moodDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const div = document.createElement('div');
            div.className = 'mood-entry';
            div.innerHTML = `
                <div class="mood-entry-header">
                    <div class="mood-entry-emoji">${moodEmojis[mood.type] || '😊'}</div>
                    <div class="mood-entry-info">
                        <h4 class="mood-entry-type">${mood.type.charAt(0).toUpperCase() + mood.type.slice(1)}</h4>
                        <span class="mood-entry-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formattedDate} at ${formattedTime}
                        </span>
                    </div>
                    <button class="delete-btn" data-index="${index}" title="Delete mood">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${mood.note ? `<p class="mood-entry-note">${mood.note}</p>` : ''}
            `;
            
            div.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (confirm('Are you sure you want to delete this mood entry?')) {
                    // Find the actual index in the full moods array if we're filtering
                    const actualIndex = filter === 'all' ? index : state.moods.findIndex(m => m === mood);
                    
                    state.moods.splice(actualIndex, 1);
                    localStorage.setItem('moods', JSON.stringify(state.moods));
                    
                    // Update UI
                    updateMoodChart();
                    renderMoodEntries(filter);
                    updateAnalyticsCharts();
                    updateStats();
                    
                    showFeedback('Mood entry deleted');
                }
            });
            
            container.appendChild(div);
        });
    }
  
    function updateMoodChart() {
        const ctx = document.getElementById('mood-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.moodChart) {
            window.moodChart.destroy();
        }
        
        // Get moods from the last 7 days
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 6);
        
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });
        
        // Count moods by type for the last 7 days
        const moodCounts = {};
        const recentMoods = state.moods.filter(mood => {
            const moodDate = new Date(mood.timestamp);
            return moodDate >= oneWeekAgo;
        });
        
        recentMoods.forEach(mood => {
            moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
        });
  
        const moodColors = {
            'happy': '#FFD700',    // Gold
            'sad': '#4169E1',      // Royal Blue
            'angry': '#DC143C',    // Crimson
            'excited': '#32CD32',  // Lime Green
            'tired': '#8A2BE2',    // Blue Violet
            'neutral': '#808080',  // Gray
            'anxious': '#FF8C00',  // Dark Orange
            'relaxed': '#20B2AA'   // Light Sea Green
        };
        
        // If we have no moods, show a placeholder
        if (Object.keys(moodCounts).length === 0) {
            window.moodChart = new Chart(ctx, {
                type: 'doughnut',
            data: {
                    labels: ['No moods logged yet'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#808080'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    }
                }
            });
            return;
        }

        window.moodChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(moodCounts).map(mood => 
                    mood.charAt(0).toUpperCase() + mood.slice(1)
                ),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: Object.keys(moodCounts).map(mood => moodColors[mood] || '#808080'),
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
  
    // Show feedback message
    function showFeedback(message, type = 'success') {
        // Check if notifications are enabled in settings
        if (!state.settings.showNotifications) {
            return; // Don't show feedback if notifications are disabled
        }
        
        // Create feedback element if it doesn't exist
        let feedback = document.querySelector('.feedback-message');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'feedback-message';
            document.body.appendChild(feedback);
        }
        
        // Set message and type
        feedback.textContent = message;
        feedback.className = `feedback-message ${type}`;
        
        // Show and then hide after delay
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
  
    // Journal
    function setupJournal() {
        const journalEntry = document.getElementById('journal-entry');
        const journalChar = document.getElementById('journal-char');
        const saveButton = document.getElementById('save-journal');
        const journalContent = document.getElementById('journal-content');
        const lockOverlay = document.getElementById('journal-lock-overlay');
        const passwordInput = document.getElementById('journal-password-input');
        const unlockButton = document.getElementById('journal-unlock-btn');
        const lockButton = document.getElementById('journal-lock-btn');
        const passwordHint = document.getElementById('password-hint');
        const journalSearch = document.getElementById('journal-search');
        const journalFilter = document.getElementById('journal-filter');
        const viewAllBtn = document.getElementById('journal-view-all');
        const viewCalendarBtn = document.getElementById('journal-view-calendar');
        const calendarView = document.getElementById('journal-calendar-view');
        const journalEntriesContainer = document.getElementById('journal-entries');
        const journalMoods = document.querySelectorAll('.journal-mood');
        const journalTools = {
            addDate: document.getElementById('journal-add-date'),
            addTime: document.getElementById('journal-add-time'),
            addWeather: document.getElementById('add-weather-btn'),
            addLocation: document.getElementById('add-location-btn')
        };
        
        // Password protection setup
        const passwordSetupModal = document.getElementById('password-setup-modal');
        const setupPasswordBtn = document.getElementById('setup-password-btn');
        const newPasswordInput = document.getElementById('password-input');
        const confirmPasswordInput = document.getElementById('confirm-password-input');
        const passwordHintInput = document.getElementById('password-hint-input');
        const savePasswordBtn = document.getElementById('save-password-btn');
        const cancelPasswordBtn = document.getElementById('cancel-password-setup');
        const closePasswordModalBtn = document.getElementById('close-password-modal');
        const passwordStrengthBar = document.getElementById('password-strength-bar');
        const passwordStrengthText = document.getElementById('password-strength-text');
        
        let selectedMood = null;
        
        // Check if journal is password protected
        const isProtected = localStorage.getItem('journal-protected') === 'true';
        const journalPassword = localStorage.getItem('journal-password');
        const journalPasswordHint = localStorage.getItem('journal-password-hint');
        
        console.log('Journal protection status:', { isProtected, passwordExists: !!journalPassword });
        
        // If journal is protected, show lock overlay
        if (isProtected && journalPassword) {
            lockOverlay.style.display = 'flex';
            journalContent.style.display = 'none';
            
            // Show password hint if available
            if (journalPasswordHint) {
                passwordHint.textContent = `Hint: ${journalPasswordHint}`;
                passwordHint.style.display = 'block';
            } else {
                passwordHint.style.display = 'none';
            }
        }
        
        // Password strength indicator
        newPasswordInput.addEventListener('input', () => {
            const password = newPasswordInput.value;
            const strength = checkPasswordStrength(password);
            
            // Update strength bar width and color
            passwordStrengthBar.style.width = `${strength.percent}%`;
            
            // Remove all strength classes and add the appropriate one
            passwordStrengthBar.parentElement.classList.remove('strength-weak', 'strength-medium', 'strength-good', 'strength-strong');
            if (strength.level) {
                passwordStrengthBar.parentElement.classList.add(`strength-${strength.level}`);
            }
            
            // Update strength text
            passwordStrengthText.textContent = strength.message || 'Password strength';
        });
        
        // Unlock journal with password
        unlockButton.addEventListener('click', () => {
            const enteredPassword = passwordInput.value.trim();
            const storedPassword = localStorage.getItem('journal-password');
            
            console.log('Unlock attempt. Entered password length:', enteredPassword.length, 
                      'Stored password length:', storedPassword ? storedPassword.length : 0);
            
            if (enteredPassword === storedPassword) {
                lockOverlay.style.display = 'none';
                journalContent.style.display = 'block';
                passwordInput.value = '';
                showFeedback('Journal unlocked successfully!');
            } else {
                showFeedback('Incorrect password. Please try again.', 'error');
                passwordInput.value = '';
            }
        });
        
        // Allow Enter key to submit password
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                unlockButton.click();
            }
        });
        
        // Lock journal
        lockButton.addEventListener('click', () => {
            if (!isProtected || !journalPassword) {
                // If not protected yet, show password setup modal
                passwordSetupModal.style.display = 'flex';
            } else {
                // If already protected, just lock it
                lockOverlay.style.display = 'flex';
                journalContent.style.display = 'none';
                showFeedback('Journal locked');
            }
        });
        
        // Show password setup modal
        setupPasswordBtn.addEventListener('click', () => {
            passwordSetupModal.style.display = 'flex';
        });
        
        // Password setup
        savePasswordBtn.addEventListener('click', () => {
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const hint = passwordHintInput.value.trim();
            
            if (!newPassword) {
                showFeedback('Please enter a password', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showFeedback('Passwords do not match', 'error');
                return;
            }
            
            const strength = checkPasswordStrength(newPassword);
            if (strength.level === 'weak' && newPassword.length < 4) {
                showFeedback('Password is too weak. Please use a stronger password.', 'error');
                return;
            }
            
            // Save password and protection status
            localStorage.setItem('journal-protected', 'true');
            localStorage.setItem('journal-password', newPassword);
            
            if (hint) {
                localStorage.setItem('journal-password-hint', hint);
                passwordHint.textContent = `Hint: ${hint}`;
                passwordHint.style.display = 'block';
            } else {
                localStorage.removeItem('journal-password-hint');
                passwordHint.textContent = '';
                passwordHint.style.display = 'none';
            }
            
            // Close modal and lock journal
            passwordSetupModal.style.display = 'none';
            lockOverlay.style.display = 'flex';
            journalContent.style.display = 'none';
            
            // Clear inputs
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            passwordHintInput.value = '';
            
            console.log('Password set. Length:', newPassword.length);
            showFeedback('Password set and journal locked');
        });
        
        // Cancel password setup
        cancelPasswordBtn.addEventListener('click', () => {
            passwordSetupModal.style.display = 'none';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            passwordHintInput.value = '';
        });
        
        // Close password modal
        closePasswordModalBtn.addEventListener('click', () => {
            passwordSetupModal.style.display = 'none';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            passwordHintInput.value = '';
        });
        
        // Character counter
        journalEntry.addEventListener('input', () => {
            updateCharCount(journalEntry, journalChar);
        });
  
        // Mood selection
        journalMoods.forEach(mood => {
            mood.addEventListener('click', () => {
                // Remove selected class from all moods
                journalMoods.forEach(m => m.classList.remove('selected'));
                
                // Add selected class to clicked mood
                mood.classList.add('selected');
                selectedMood = mood.dataset.mood;
            });
        });
        
        // Journal tools
        const addWeatherBtn = document.getElementById('journal-add-weather');
        const addLocationBtn = document.getElementById('journal-add-location');
        const addImageBtn = document.getElementById('journal-add-image');
        const imageInput = document.getElementById('journal-image-input');
        const imageContainer = document.getElementById('journal-image-container');
        const imagePreview = document.getElementById('journal-image-preview');
        const removeImageBtn = document.getElementById('remove-journal-image');
        
        // Metadata displays
        const weatherDisplay = document.getElementById('journal-weather-display');
        const locationDisplay = document.getElementById('journal-location-display');
        
        // Journal metadata
        let journalMetadata = {
            weather: '',
            location: '',
            image: ''
        };
        
        // Add weather
        addWeatherBtn.addEventListener('click', () => {
            // Show loading state
            weatherDisplay.innerHTML = '<i class="fas fa-cloud-sun"></i> <span>Loading weather...</span>';
            weatherDisplay.classList.add('active', 'loading');
            
            // Check if we already have location data
            if (journalMetadata.location && journalMetadata.location.coords) {
                // Use existing coordinates to fetch weather
                const { latitude, longitude } = journalMetadata.location.coords;
                fetchWeatherData(latitude, longitude);
            } else {
                // Get location first, then fetch weather
                if (navigator.geolocation) {
                    showFeedback('Fetching your location for weather...');
                    
                    navigator.geolocation.getCurrentPosition(
                        // Success callback
                        (position) => {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            
                            // Store location data if not already set
                            if (!journalMetadata.location) {
                                // Use reverse geocoding to get location name
                                fetchLocationName(latitude, longitude)
                                    .then(locationName => {
                                        journalMetadata.location = {
                                            name: locationName,
                                            coords: {
                                                latitude,
                                                longitude
                                            }
                                        };
                                        
                                        locationDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> <span>${locationName}</span>`;
                                        locationDisplay.classList.add('active');
                                        locationDisplay.classList.remove('loading');
                                        
                                        // Now fetch weather with the coordinates
                                        fetchWeatherData(latitude, longitude);
                                    })
                                    .catch(error => {
                                        console.error('Error getting location name:', error);
                                        // Still fetch weather even if reverse geocoding fails
                                        fetchWeatherData(latitude, longitude);
                                    });
                            } else {
                                // Just fetch weather if we already have location
                                fetchWeatherData(latitude, longitude);
                            }
                        },
                        // Error callback
                        (error) => {
                            console.error('Geolocation error:', error);
                            showFeedback('Could not access your location for weather. Using default weather.', 'error');
                            
                            // Remove loading state
                            weatherDisplay.classList.remove('loading');
                            
                            // Fall back to random weather
                            useRandomWeather();
                        }
                    );
                } else {
                    // Browser doesn't support geolocation
                    showFeedback('Your browser does not support geolocation. Using default weather.', 'error');
                    
                    // Remove loading state
                    weatherDisplay.classList.remove('loading');
                    
                    // Fall back to random weather
                    useRandomWeather();
                }
            }
        });
        
        // Function to fetch weather data from OpenWeatherMap API
        async function fetchWeatherData(latitude, longitude) {
            try {
                showFeedback('Fetching current weather...');
                
                // Using OpenWeatherMap API (you would need to replace 'YOUR_API_KEY' with an actual API key)
                // For demo purposes, we'll use a free weather API that doesn't require a key
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`);
                const data = await response.json();
                
                if (data.current) {
                    // Process the weather data
                    const temp = Math.round(data.current.temperature_2m);
                    const weatherCode = data.current.weather_code;
                    const windSpeed = data.current.wind_speed_10m;
                    
                    // Map weather code to condition and icon
                    // Weather codes from Open-Meteo: https://open-meteo.com/en/docs
                    const weatherInfo = getWeatherInfo(weatherCode, temp, windSpeed);
                    
                    journalMetadata.weather = {
                        text: weatherInfo.condition,
                        temp: `${temp}°F`,
                        icon: weatherInfo.icon,
                        class: weatherInfo.class,
                        windSpeed: `${windSpeed} mph`
                    };
                    
                    const weatherText = `${weatherInfo.condition}, ${temp}°F`;
                    weatherDisplay.innerHTML = `<i class="${weatherInfo.icon} weather-icon ${weatherInfo.class}"></i> <span>${weatherText}</span>`;
                    weatherDisplay.classList.add('active');
                    weatherDisplay.classList.remove('loading');
                    
                    showFeedback('Current weather added to entry');
                } else {
                    throw new Error('Invalid weather data format');
                }
            } catch (error) {
                console.error('Error fetching weather:', error);
                showFeedback('Could not fetch weather data. Using default weather.', 'error');
                
                // Remove loading state
                weatherDisplay.classList.remove('loading');
                
                // Fall back to random weather
                useRandomWeather();
            }
        }
        
        // Function to map weather codes to conditions and icons
        function getWeatherInfo(code, temp, windSpeed) {
            // Weather code mapping based on Open-Meteo API
            // https://open-meteo.com/en/docs
            
            // Clear
            if (code === 0) {
                return {
                    condition: 'Clear Sky',
                    icon: 'fas fa-sun',
                    class: 'weather-sunny'
                };
            }
            
            // Partly cloudy
            if (code === 1 || code === 2) {
                return {
                    condition: 'Partly Cloudy',
                    icon: 'fas fa-cloud-sun',
                    class: 'weather-partly-cloudy'
                };
            }
            
            // Cloudy
            if (code === 3) {
                return {
                    condition: 'Cloudy',
                    icon: 'fas fa-cloud',
                    class: 'weather-cloudy'
                };
            }
            
            // Fog
            if (code >= 45 && code <= 48) {
                return {
                    condition: 'Foggy',
                    icon: 'fas fa-smog',
                    class: 'weather-foggy'
                };
            }
            
            // Drizzle
            if (code >= 51 && code <= 57) {
                return {
                    condition: 'Drizzle',
                    icon: 'fas fa-cloud-rain',
                    class: 'weather-rainy'
                };
            }
            
            // Rain
            if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
                return {
                    condition: 'Rainy',
                    icon: 'fas fa-cloud-showers-heavy',
                    class: 'weather-rainy'
                };
            }
            
            // Snow
            if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
                return {
                    condition: 'Snowy',
                    icon: 'fas fa-snowflake',
                    class: 'weather-snowy'
                };
            }
            
            // Thunderstorm
            if (code >= 95 && code <= 99) {
                return {
                    condition: 'Stormy',
                    icon: 'fas fa-bolt',
                    class: 'weather-stormy'
                };
            }
            
            // High wind (if wind speed is high regardless of weather)
            if (windSpeed > 20) {
                return {
                    condition: 'Windy',
                    icon: 'fas fa-wind',
                    class: 'weather-windy'
                };
            }
            
            // Default fallback
            return {
                condition: 'Clear',
                icon: 'fas fa-sun',
                class: 'weather-sunny'
            };
        }
        
        // Fallback function for random weather
        function useRandomWeather() {
            const weatherOptions = [
                { icon: 'fas fa-sun', text: 'Sunny', class: 'weather-sunny', temp: '72°F' },
                { icon: 'fas fa-cloud', text: 'Cloudy', class: 'weather-cloudy', temp: '65°F' },
                { icon: 'fas fa-cloud-rain', text: 'Rainy', class: 'weather-rainy', temp: '58°F' },
                { icon: 'fas fa-snowflake', text: 'Snowy', class: 'weather-snowy', temp: '28°F' },
                { icon: 'fas fa-bolt', text: 'Stormy', class: 'weather-stormy', temp: '62°F' },
                { icon: 'fas fa-smog', text: 'Foggy', class: 'weather-foggy', temp: '60°F' },
                { icon: 'fas fa-wind', text: 'Windy', class: 'weather-windy', temp: '55°F' }
            ];
            
            const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
            const weatherText = `${randomWeather.text}, ${randomWeather.temp}`;
            
            journalMetadata.weather = {
                text: randomWeather.text,
                temp: randomWeather.temp,
                icon: randomWeather.icon,
                class: randomWeather.class
            };
            
            weatherDisplay.innerHTML = `<i class="${randomWeather.icon} weather-icon ${randomWeather.class}"></i> <span>${weatherText}</span>`;
            weatherDisplay.classList.add('active');
            
            showFeedback('Weather added to entry');
        }
        
        // Add location
        addLocationBtn.addEventListener('click', () => {
            // Show loading state
            locationDisplay.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Detecting location...</span>';
            locationDisplay.classList.add('active', 'loading');
            
            // Use browser's geolocation API
            if (navigator.geolocation) {
                showFeedback('Fetching your location...');
                
                navigator.geolocation.getCurrentPosition(
                    // Success callback
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        
                        // Use reverse geocoding to get location name
                        fetchLocationName(latitude, longitude)
                            .then(locationName => {
                                journalMetadata.location = {
                                    name: locationName,
                                    coords: {
                                        latitude,
                                        longitude
                                    }
                                };
                                
                                locationDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> <span>${locationName}</span>`;
                                locationDisplay.classList.add('active');
                                locationDisplay.classList.remove('loading');
                                showFeedback('Location added to entry');
                            })
                            .catch(error => {
                                console.error('Error getting location name:', error);
                                // Fallback to coordinates if reverse geocoding fails
                                const locationText = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                                journalMetadata.location = {
                                    name: locationText,
                                    coords: {
                                        latitude,
                                        longitude
                                    }
                                };
                                
                                locationDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> <span>${locationText}</span>`;
                                locationDisplay.classList.add('active');
                                locationDisplay.classList.remove('loading');
                                showFeedback('Location added to entry (coordinates only)');
                            });
                    },
                    // Error callback
                    (error) => {
                        console.error('Geolocation error:', error);
                        showFeedback('Could not access your location. Please check permissions.', 'error');
                        
                        // Remove loading state
                        locationDisplay.classList.remove('loading');
                        
                        // Fallback to manual location input
                        const locationName = prompt('Enter your location:');
                        if (locationName && locationName.trim()) {
                            journalMetadata.location = {
                                name: locationName.trim()
                            };
                            
                            locationDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> <span>${locationName.trim()}</span>`;
                            locationDisplay.classList.add('active');
                            showFeedback('Location added to entry');
                        } else {
                            // If user cancels the prompt, reset the display
                            locationDisplay.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Add location</span>';
                            locationDisplay.classList.remove('active');
                        }
                    }
                );
            } else {
                // Browser doesn't support geolocation
                showFeedback('Your browser does not support geolocation', 'error');
                
                // Remove loading state
                locationDisplay.classList.remove('loading');
                
                // Fallback to manual location input
                const locationName = prompt('Enter your location:');
                if (locationName && locationName.trim()) {
                    journalMetadata.location = {
                        name: locationName.trim()
                    };
                    
                    locationDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> <span>${locationName.trim()}</span>`;
                    locationDisplay.classList.add('active');
                    showFeedback('Location added to entry');
                } else {
                    // If user cancels the prompt, reset the display
                    locationDisplay.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Add location</span>';
                    locationDisplay.classList.remove('active');
                }
            }
        });
        
        // Function to get location name from coordinates using reverse geocoding
        async function fetchLocationName(latitude, longitude) {
            try {
                // Using OpenStreetMap Nominatim API for reverse geocoding (free and no API key required)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await response.json();
                
                // Extract relevant location information
                if (data.address) {
                    // Try to get a meaningful location name
                    const address = data.address;
                    if (address.city) return address.city;
                    if (address.town) return address.town;
                    if (address.village) return address.village;
                    if (address.suburb) return address.suburb;
                    if (address.neighbourhood) return address.neighbourhood;
                    if (address.road) return address.road;
                    
                    // If no specific location found, use the display name
                    return data.display_name.split(',')[0];
                }
                
                return data.display_name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            } catch (error) {
                console.error('Error in reverse geocoding:', error);
                throw error;
            }
        }
        
        // Click on metadata to edit
        weatherDisplay.addEventListener('click', () => {
            if (journalMetadata.weather) {
                // Allow editing or removing the weather
                if (confirm('Remove weather from entry?')) {
                    journalMetadata.weather = '';
                    weatherDisplay.innerHTML = '<i class="fas fa-cloud-sun"></i> <span>Add weather</span>';
                    weatherDisplay.classList.remove('active');
                    showFeedback('Weather removed from entry');
                }
            } else {
                // Add weather if not present
                addWeatherBtn.click();
            }
        });
        
        locationDisplay.addEventListener('click', () => {
            if (journalMetadata.location) {
                // Allow editing or removing the location
                if (confirm('Remove location from entry?')) {
                    journalMetadata.location = '';
                    locationDisplay.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Add location</span>';
                    locationDisplay.classList.remove('active');
                    showFeedback('Location removed from entry');
                }
            } else {
                // Add location if not present
                addLocationBtn.click();
            }
        });
        
        // Image upload handling
        addImageBtn.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                    imageContainer.style.display = 'block';
                    journalMetadata.image = event.target.result;
                    showFeedback('Image added to entry');
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        removeImageBtn.addEventListener('click', () => {
            imageContainer.style.display = 'none';
            imagePreview.src = '';
            journalMetadata.image = '';
            imageInput.value = null; // Reset file input
            showFeedback('Image removed from entry');
        });
        
        // Save journal entry with metadata
        saveButton.addEventListener('click', () => {
            const entryText = journalEntry.value.trim();
            if (!entryText) {
                showFeedback('Please write something in your journal entry', 'error');
                return;
            }
            
            // Check if we're in edit mode
            const isEditMode = saveButton.getAttribute('data-mode') === 'edit';
            const editEntryId = isEditMode ? parseInt(saveButton.getAttribute('data-id')) : null;
            
            // Check storage space before saving
            try {
                // Prepare the image metadata
                let imageMetadata = '';
                
                if (journalMetadata.image) {
                    // If we already have structured image data (with position/size)
                    if (typeof journalMetadata.image === 'object') {
                        // Make sure we're not modifying the original object
                        imageMetadata = { ...journalMetadata.image };
                    } else {
                        // Convert string format to object format with defaults
                        const activePositionBtn = document.querySelector('.position-btn.active');
                        const position = activePositionBtn ? activePositionBtn.dataset.position : 'below';
                        
                        const sizeSlider = document.getElementById('image-size-slider');
                        const size = sizeSlider ? parseInt(sizeSlider.value) : 50;
                        
                        imageMetadata = {
                            src: journalMetadata.image,
                            position: position,
                            size: size
                        };
                    }
                }
                
                // Update the metadata with structured image data
                const finalMetadata = { ...journalMetadata };
                if (imageMetadata) {
                    finalMetadata.image = imageMetadata;
                }
                
                // Get existing entries
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                
                if (isEditMode) {
                    // Find the entry to edit
                    const entryIndex = entries.findIndex(entry => entry.id === editEntryId);
                    
                    if (entryIndex === -1) {
                        showFeedback('Could not find entry to update', 'error');
                        return;
                    }
                    
                    // Update the entry while preserving its original id and date
                    const originalEntry = entries[entryIndex];
                    entries[entryIndex] = {
                        ...originalEntry,
                        text: entryText,
                        mood: selectedMood,
                        metadata: finalMetadata,
                        lastEdited: new Date().toISOString()
                    };
                    
                    // Try to save
                    try {
                        localStorage.setItem('journalEntries', JSON.stringify(entries));
                        showFeedback('Journal entry updated successfully');
                    } catch (e) {
                        console.error('Error updating journal entry:', e);
                        showFeedback('Error updating journal entry. Please try again.', 'error');
                        return;
                    }
                } else {
                    // Create a new entry
                    const entry = {
                        id: Date.now(),
                        text: entryText,
                        date: new Date().toISOString(),
                        mood: selectedMood,
                        metadata: finalMetadata
                    };
                    
                    // Try to save to storage with error handling
                    try {
                        // Add new entry
                        entries.unshift(entry);
                        
                        // Save to localStorage
                        localStorage.setItem('journalEntries', JSON.stringify(entries));
                    } catch (e) {
                        if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                            console.error('Storage quota exceeded:', e);
                            
                            // Ask user if they want to clean up
                            if (confirm('You have reached the storage limit. Would you like to clean up older entries to make space?')) {
                                // Keep only the 15 most recent entries plus the new one
                                const cleanedEntries = entries.slice(0, 14);
                                cleanedEntries.unshift(entry);
                                
                                try {
                                    localStorage.setItem('journalEntries', JSON.stringify(cleanedEntries));
                                    showFeedback('Older entries cleaned up and new entry saved', 'success');
                                } catch (err) {
                                    // If still not enough space, try more drastic measures
                                    const emergencyEntries = entries.slice(0, 5);
                                    emergencyEntries.unshift(entry);
                                    
                                    try {
                                        localStorage.setItem('journalEntries', JSON.stringify(emergencyEntries));
                                        showFeedback('Most older entries removed to save space. Consider exporting your data.', 'warning');
                                    } catch (finalErr) {
                                        showFeedback('Could not save entry. Your storage is completely full.', 'error');
                                        return;
                                    }
                                }
                            } else {
                                showFeedback('Entry not saved. Try deleting some older entries manually.', 'error');
                                return;
                            }
                        } else {
                            console.error('Error saving journal entry:', e);
                            showFeedback('Error saving journal entry. Please try again.', 'error');
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Error preparing journal entry:', e);
                showFeedback('Error preparing journal entry. Please try again.', 'error');
                return;
            }
            
            // If we made it here, the entry was saved or updated successfully
            
            // Clear form
            journalEntry.value = '';
            selectedMood = null;
            journalMetadata = { weather: '', location: '', image: '' };
            
            // Reset mood selection
            document.querySelectorAll('.journal-mood').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Reset metadata displays
            weatherDisplay.innerHTML = '<i class="fas fa-cloud-sun"></i> <span>Add weather</span>';
            locationDisplay.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>Add location</span>';
            weatherDisplay.classList.remove('active');
            locationDisplay.classList.remove('active');
            
            // Reset image preview
            imageContainer.style.display = 'none';
            imagePreview.src = '';
            imageInput.value = null;
            
            // Reset image position and size controls if they exist
            document.querySelectorAll('.position-btn').forEach(btn => {
                if (btn.dataset.position === 'below') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            const sizeSlider = document.getElementById('image-size-slider');
            const sizeValueDisplay = document.getElementById('size-value');
            if (sizeSlider) {
                sizeSlider.value = 50;
                if (sizeValueDisplay) {
                    sizeValueDisplay.textContent = '50%';
                }
            }
            
            // Update character count
            updateCharCount(journalEntry, journalChar);
            
            // Reset save button to normal state
            saveButton.textContent = 'Save';
            saveButton.removeAttribute('data-mode');
            saveButton.removeAttribute('data-id');
            
            // Render entries
            renderJournalEntries();
            
            // Update stats
            updateStats();
        });
        
        // View toggle
        viewAllBtn.addEventListener('click', () => {
            viewAllBtn.classList.add('active');
            viewCalendarBtn.classList.remove('active');
            journalEntriesContainer.style.display = 'block';
            calendarView.style.display = 'none';
        });
        
        viewCalendarBtn.addEventListener('click', () => {
            viewCalendarBtn.classList.add('active');
            viewAllBtn.classList.remove('active');
            journalEntriesContainer.style.display = 'none';
            calendarView.style.display = 'block';
            renderCalendarView();
        });
        
        // Journal search
        journalSearch.addEventListener('input', () => {
            const searchTerm = journalSearch.value.toLowerCase();
            filterJournalEntries(searchTerm, journalFilter.value);
        });
        
        // Journal filter
        journalFilter.addEventListener('change', () => {
            const searchTerm = journalSearch.value.toLowerCase();
            filterJournalEntries(searchTerm, journalFilter.value);
        });
        
        // Initial render
        renderJournalEntries();
    }
  
    function renderJournalEntries() {
        const entriesContainer = document.getElementById('journal-entries');
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const filterValue = document.getElementById('journal-filter').value;
        
        // Filter entries based on selected filter
        let filteredEntries = entries;
        
        if (filterValue === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filteredEntries = entries.filter(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            });
        } else if (filterValue === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);
        } else if (filterValue === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredEntries = entries.filter(entry => new Date(entry.date) >= monthAgo);
        }
        
        // Check if there are any entries
        if (filteredEntries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="journal-empty">
                    <i class="fas fa-book-open"></i>
                    <p>No journal entries yet</p>
                    <p>Write your first entry above</p>
                </div>
            `;
            return;
        }
        
        // Render entries
        entriesContainer.innerHTML = '';
        
        filteredEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const entryTime = entryDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create metadata HTML if present
            let metadataHTML = '';
            if (entry.metadata) {
                const metadata = entry.metadata;
                const metadataItems = [];
                
                // Handle weather metadata
                if (metadata.weather) {
                    if (typeof metadata.weather === 'object') {
                        // New format with object
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="${metadata.weather.icon} weather-icon ${metadata.weather.class}"></i> 
                            <span>${metadata.weather.text}, ${metadata.weather.temp}</span>
                        </div>`);
                    } else if (typeof metadata.weather === 'string') {
                        // Handle older entries that might have string weather
                        let weatherIconClass = 'fas fa-cloud-sun';
                        let weatherColorClass = '';
                        
                        if (metadata.weather.includes('Sunny')) {
                            weatherIconClass = 'fas fa-sun';
                            weatherColorClass = 'weather-sunny';
                        } else if (metadata.weather.includes('Cloudy')) {
                            weatherIconClass = 'fas fa-cloud';
                            weatherColorClass = 'weather-cloudy';
                        } else if (metadata.weather.includes('Rainy')) {
                            weatherIconClass = 'fas fa-cloud-rain';
                            weatherColorClass = 'weather-rainy';
                        } else if (metadata.weather.includes('Snowy')) {
                            weatherIconClass = 'fas fa-snowflake';
                            weatherColorClass = 'weather-snowy';
                        } else if (metadata.weather.includes('Stormy')) {
                            weatherIconClass = 'fas fa-bolt';
                            weatherColorClass = 'weather-stormy';
                        }
                        
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="${weatherIconClass} weather-icon ${weatherColorClass}"></i> 
                            <span>${metadata.weather}</span>
                        </div>`);
                    }
                }
                
                // Handle location metadata
                if (metadata.location) {
                    if (typeof metadata.location === 'object') {
                        // New format with object
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${metadata.location.name}</span>
                        </div>`);
                    } else if (typeof metadata.location === 'string') {
                        // Handle older entries with string location
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${metadata.location}</span>
                        </div>`);
                    }
                }
                
                if (metadataItems.length > 0) {
                    metadataHTML = `<div class="journal-metadata">${metadataItems.join('')}</div>`;
                }
            }
            
            // Create mood emoji if present
            let moodHTML = '';
            if (entry.mood) {
                const moodEmoji = getMoodEmoji(entry.mood);
                moodHTML = `<div class="journal-entry-mood">${moodEmoji}</div>`;
            }
            
            // Generate journal content with properly positioned image
            let entryContent = '';
            if (typeof createJournalEntryContent === 'function') {
                // Use the advanced layout function if available
                entryContent = createJournalEntryContent(entry);
            } else {
                // Fallback to basic layout
                let imageHTML = '';
                if (typeof displayJournalEntryImage === 'function') {
                    imageHTML = displayJournalEntryImage(entry);
                } else if (entry.metadata && entry.metadata.image) {
                    // Handle both string and object image data formats
                    let imgSrc, positionClass = '', sizeStyle = '';
                    
                    if (typeof entry.metadata.image === 'object') {
                        imgSrc = entry.metadata.image.src;
                        
                        // Set position class
                        if (entry.metadata.image.position) {
                            positionClass = `journal-entry-image-${entry.metadata.image.position}`;
                        } else {
                            positionClass = 'journal-entry-image-below';
                        }
                        
                        // Set size style - ONLY if user specified a size
                        if (entry.metadata.image.size) {
                            sizeStyle = `width: ${entry.metadata.image.size}%;`;
                        }
                        // No default size - let the image use its natural size unless specified
                    } else {
                        // Legacy format
                        imgSrc = entry.metadata.image;
                        positionClass = 'journal-entry-image-below';
                        // Don't set a default size for legacy images
                    }
                    
                    imageHTML = `<img src="${imgSrc}" class="journal-entry-image ${positionClass}" style="${sizeStyle}" alt="Journal entry image">`;
                }
                
                // Create layout based on position if available
                if (entry.metadata && entry.metadata.image && typeof entry.metadata.image === 'object' && 
                    entry.metadata.image.position && (entry.metadata.image.position === 'left' || entry.metadata.image.position === 'right')) {
                    entryContent = `
                        <div class="journal-content-wrapper">
                            ${imageHTML}
                            <div class="journal-content">${entry.text}</div>
                        </div>
                    `;
                } else if (entry.metadata && entry.metadata.image && typeof entry.metadata.image === 'object' && 
                    entry.metadata.image.position === 'above') {
                    entryContent = `
                        ${imageHTML}
                        <div class="journal-content">${entry.text}</div>
                    `;
                } else {
                    // Default: below or any other position
                    entryContent = `
                        <div class="journal-content">${entry.text}</div>
                        ${imageHTML}
                    `;
                }
            }
            
            const entryHTML = `
                <div class="journal-entry" data-id="${entry.id}">
                    <div class="journal-entry-header">
                        <div class="journal-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate} at ${entryTime}</span>
                            ${moodHTML}
                        </div>
                        <div class="journal-entry-actions">
                            <button class="edit-btn" data-id="${entry.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${entry.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    ${metadataHTML}
                    ${entryContent}
                </div>
            `;
            
            entriesContainer.innerHTML += entryHTML;
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = parseInt(e.currentTarget.getAttribute('data-id'));
                
                if (confirm('Are you sure you want to delete this journal entry?')) {
                    // Get entries
                    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                    
                    // Filter out deleted entry
                    const updatedEntries = entries.filter(entry => entry.id !== entryId);
                    
                    // Save updated entries
                    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
                    
                    // Re-render entries
                    renderJournalEntries();
                    
                    // Update stats
                    updateStats();
                    
                    showFeedback('Journal entry deleted successfully');
                }
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = parseInt(e.currentTarget.getAttribute('data-id'));
                editJournalEntry(entryId);
            });
        });
    }

    // Function to edit a journal entry
    function editJournalEntry(entryId) {
        // Get the entry to edit
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const entryToEdit = entries.find(entry => entry.id === entryId);
        
        if (!entryToEdit) {
            showFeedback('Could not find entry to edit', 'error');
            return;
        }
        
        // Get all the necessary form elements
        const journalEntry = document.getElementById('journal-entry');
        const saveButton = document.getElementById('save-journal');
        const journalMoods = document.querySelectorAll('.journal-mood');
        const imageContainer = document.getElementById('journal-image-container');
        const imagePreview = document.getElementById('journal-image-preview');
        const weatherDisplay = document.getElementById('weather-display');
        const locationDisplay = document.getElementById('location-display');
        
        // Set the entry text
        journalEntry.value = entryToEdit.text;
        
        // Update character count
        const journalChar = document.getElementById('journal-char');
        updateCharCount(journalEntry, journalChar);
        
        // Set the mood if present
        if (entryToEdit.mood) {
            selectedMood = entryToEdit.mood;
            
            // Clear all selected moods
            journalMoods.forEach(moodEl => {
                moodEl.classList.remove('selected');
            });
            
            // Find and select the correct mood
            const moodEl = document.querySelector(`.journal-mood[data-mood="${entryToEdit.mood}"]`);
            if (moodEl) {
                moodEl.classList.add('selected');
            }
        }
        
        // Reset metadata and populate from entry
        journalMetadata = { weather: '', location: '', image: '' };
        
        // Set weather if present
        if (entryToEdit.metadata && entryToEdit.metadata.weather) {
            journalMetadata.weather = entryToEdit.metadata.weather;
            
            // Update weather display
            if (typeof entryToEdit.metadata.weather === 'object') {
                weatherDisplay.innerHTML = `
                    <i class="${entryToEdit.metadata.weather.icon} weather-icon ${entryToEdit.metadata.weather.class}"></i> 
                    <span>${entryToEdit.metadata.weather.text}, ${entryToEdit.metadata.weather.temp}</span>
                `;
            } else {
                // Legacy format
                let weatherIconClass = 'fas fa-cloud-sun';
                let weatherColorClass = '';
                
                if (entryToEdit.metadata.weather.includes('Sunny')) {
                    weatherIconClass = 'fas fa-sun';
                    weatherColorClass = 'weather-sunny';
                } else if (entryToEdit.metadata.weather.includes('Cloudy')) {
                    weatherIconClass = 'fas fa-cloud';
                    weatherColorClass = 'weather-cloudy';
                } else if (entryToEdit.metadata.weather.includes('Rainy')) {
                    weatherIconClass = 'fas fa-cloud-rain';
                    weatherColorClass = 'weather-rainy';
                } else if (entryToEdit.metadata.weather.includes('Snowy')) {
                    weatherIconClass = 'fas fa-snowflake';
                    weatherColorClass = 'weather-snowy';
                } else if (entryToEdit.metadata.weather.includes('Stormy')) {
                    weatherIconClass = 'fas fa-bolt';
                    weatherColorClass = 'weather-stormy';
                }
                
                weatherDisplay.innerHTML = `
                    <i class="${weatherIconClass} weather-icon ${weatherColorClass}"></i> 
                    <span>${entryToEdit.metadata.weather}</span>
                `;
            }
            
            weatherDisplay.classList.add('active');
        }
        
        // Set location if present
        if (entryToEdit.metadata && entryToEdit.metadata.location) {
            journalMetadata.location = entryToEdit.metadata.location;
            
            // Update location display
            if (typeof entryToEdit.metadata.location === 'object') {
                locationDisplay.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i> 
                    <span>${entryToEdit.metadata.location.name}</span>
                `;
            } else {
                // Legacy format
                locationDisplay.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i> 
                    <span>${entryToEdit.metadata.location}</span>
                `;
            }
            
            locationDisplay.classList.add('active');
        }
        
        // Set image if present
        if (entryToEdit.metadata && entryToEdit.metadata.image) {
            journalMetadata.image = entryToEdit.metadata.image;
            
            // Update image preview
            if (typeof entryToEdit.metadata.image === 'object') {
                imagePreview.src = entryToEdit.metadata.image.src;
                
                // Set the correct position button
                const positionBtns = document.querySelectorAll('.position-btn');
                if (positionBtns.length > 0) {
                    positionBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.position === entryToEdit.metadata.image.position) {
                            btn.classList.add('active');
                        }
                    });
                }
                
                // Set the size slider
                const sizeSlider = document.getElementById('image-size-slider');
                const sizeValueDisplay = document.getElementById('size-value');
                if (sizeSlider && entryToEdit.metadata.image.size) {
                    sizeSlider.value = entryToEdit.metadata.image.size;
                    if (sizeValueDisplay) {
                        sizeValueDisplay.textContent = `${entryToEdit.metadata.image.size}%`;
                    }
                    
                    // Apply size to preview
                    imagePreview.style.width = `${entryToEdit.metadata.image.size}%`;
                }
            } else {
                // Legacy format
                imagePreview.src = entryToEdit.metadata.image;
                
                // Set default position and size
                const positionBtns = document.querySelectorAll('.position-btn');
                if (positionBtns.length > 0) {
                    positionBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.position === 'below') {
                            btn.classList.add('active');
                        }
                    });
                }
                
                // Set default size
                const sizeSlider = document.getElementById('image-size-slider');
                const sizeValueDisplay = document.getElementById('size-value');
                if (sizeSlider) {
                    sizeSlider.value = 50;
                    if (sizeValueDisplay) {
                        sizeValueDisplay.textContent = '50%';
                    }
                    
                    // Apply size to preview
                    imagePreview.style.width = '50%';
                }
            }
            
            // Show the image container
            imageContainer.style.display = 'block';
        }
        
        // Change save button text and add edit mode attribute
        saveButton.textContent = 'Update Entry';
        saveButton.setAttribute('data-mode', 'edit');
        saveButton.setAttribute('data-id', entryId);
        
        // Scroll to the editor
        journalEntry.scrollIntoView({ behavior: 'smooth' });
        journalEntry.focus();
        
        showFeedback('Editing journal entry');
    }
  
    // Timeline
    function setupTimeline() {
        const form = document.getElementById('event-form');
        const formContainer = document.getElementById('event-form-container');
        const toggleButton = document.getElementById('toggle-event-form');
        const closeButton = document.getElementById('close-event-form');
        const addEventContainer = document.querySelector('.add-event-button-container');
        
        // Toggle form visibility when the + button is clicked
        addEventContainer.addEventListener('click', () => {
            formContainer.style.display = 'block';
            setTimeout(() => {
                formContainer.classList.add('show');
                form.querySelector('#event-title').focus();
            }, 10);
        });
        
        // Close form when the close button is clicked
        closeButton.addEventListener('click', () => {
            formContainer.classList.remove('show');
            setTimeout(() => {
                formContainer.style.display = 'none';
            }, 300);
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = form.querySelector('#event-title').value.trim();
            const description = form.querySelector('#event-description').value.trim();
            const datetime = form.querySelector('#event-datetime').value;
            const category = form.querySelector('#event-category').value;
            const priority = form.querySelector('#event-priority').value;
            
            if (!title || !datetime) {
                showFeedback('Please fill in all required fields', 'error');
                return;
            }
            
            const event = {
                title,
                description,
                datetime,
                category,
                priority,
                timestamp: new Date().toISOString()
            };
            
            state.events.push(event);
            localStorage.setItem('events', JSON.stringify(state.events));
            
            form.reset();
            
            // Hide the form after submission
            formContainer.classList.remove('show');
            setTimeout(() => {
                formContainer.style.display = 'none';
            }, 300);
            
            renderTimeline();
            markActiveDay();
            showFeedback('Event added successfully!');
        });
  
        renderTimeline();
        
        // Update time remaining every minute
        setInterval(updateTimeRemaining, 60000);
    }
  
    function renderTimeline() {
        const container = document.getElementById('events-timeline');
        container.innerHTML = '';
        
        const sortedEvents = [...state.events].sort((a, b) => 
            new Date(a.datetime) - new Date(b.datetime)
        );
        
        if (sortedEvents.length === 0) {
            container.innerHTML = `
                <div class="timeline-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>No events scheduled yet</p>
                    <button class="btn btn-primary" id="add-first-event">
                        <i class="fas fa-plus"></i> Add your first event
                    </button>
                </div>
            `;
            
            document.getElementById('add-first-event').addEventListener('click', () => {
                const formContainer = document.getElementById('event-form-container');
                formContainer.style.display = 'block';
                setTimeout(() => {
                    formContainer.classList.add('show');
                    document.getElementById('event-title').focus();
                }, 10);
            });
            
            return;
        }
        
        sortedEvents.forEach((event, index) => {
            const eventDate = new Date(event.datetime);
            const now = new Date();
            const isPast = eventDate < now;
            const isUpcoming = !isPast && eventDate - now < 24 * 60 * 60 * 1000; // 24 hours
            
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const formattedTime = eventDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Calculate time remaining
            const timeRemaining = getTimeRemaining(eventDate);
            const timeRemainingClass = getTimeRemainingClass(eventDate);
            
            // Get category icon
            const categoryIcon = getCategoryIcon(event.category);
            
            // Get priority icon
            const priorityIcon = getPriorityIcon(event.priority);
            
            const div = document.createElement('div');
            div.className = `timeline-event ${isPast ? 'past' : ''} ${isUpcoming ? 'upcoming' : ''}`;
            div.setAttribute('data-datetime', event.datetime);
            div.innerHTML = `
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <span class="event-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${formattedDate} at ${formattedTime}
                    </span>
                </div>
                <div class="event-time-remaining ${timeRemainingClass}">
                    <i class="fas fa-clock"></i>
                    ${timeRemaining}
                </div>
                <p class="event-description">${event.description || 'No description provided.'}</p>
                <div class="event-meta">
                    <span class="event-category">
                        <i class="${categoryIcon}"></i>
                        ${event.category}
                    </span>
                    <span class="event-priority ${event.priority}">
                        <i class="${priorityIcon}"></i>
                        ${event.priority} priority
                    </span>
                </div>
                <div class="event-actions">
                    <button class="edit-btn" data-index="${index}" title="Edit event">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-index="${index}" title="Delete event">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            div.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this event?')) {
                state.events.splice(index, 1);
                localStorage.setItem('events', JSON.stringify(state.events));
                renderTimeline();
                    showFeedback('Event deleted');
                }
            });
            
            div.querySelector('.edit-btn').addEventListener('click', () => {
                // Populate form with event data
                const form = document.getElementById('event-form');
                form.querySelector('#event-title').value = event.title;
                form.querySelector('#event-description').value = event.description || '';
                form.querySelector('#event-datetime').value = event.datetime;
                form.querySelector('#event-category').value = event.category;
                form.querySelector('#event-priority').value = event.priority;
                
                // Remove event and scroll to form
                state.events.splice(index, 1);
                localStorage.setItem('events', JSON.stringify(state.events));
                renderTimeline();
                form.scrollIntoView({ behavior: 'smooth' });
                form.querySelector('#event-title').focus();
            });
            
            container.appendChild(div);
        });
    }
  
    function updateTimeRemaining() {
        const timeElements = document.querySelectorAll('.event-time-remaining');
        timeElements.forEach(el => {
            const eventItem = el.closest('.timeline-event');
            const datetimeStr = eventItem.getAttribute('data-datetime');
            
            if (!datetimeStr) {
                console.error('No datetime attribute found on timeline event');
                return;
            }
            
            const eventDate = new Date(datetimeStr);
            
            // Check if the date is valid
            if (isNaN(eventDate.getTime())) {
                console.error('Invalid date from attribute:', datetimeStr);
                return;
            }
            
            // Update the time remaining text and class
            const timeRemaining = getTimeRemaining(eventDate);
            el.innerHTML = `<i class="fas fa-clock"></i> ${timeRemaining}`;
            el.className = `event-time-remaining ${getTimeRemainingClass(eventDate)}`;
        });
    }
    
    function getTimeRemaining(eventDate) {
        const now = new Date();
        const diff = eventDate - now;
        
        if (diff < 0) {
            const pastDiff = Math.abs(diff);
            const days = Math.floor(pastDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((pastDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
                return `Passed ${days} day${days !== 1 ? 's' : ''} ago`;
            } else {
                return `Passed ${hours} hour${hours !== 1 ? 's' : ''} ago`;
            }
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        } else {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        }
    }
    
    function getTimeRemainingClass(eventDate) {
        const now = new Date();
        const diff = eventDate - now;
        
        if (diff < 0) {
            return 'past';
        } else if (diff < 3600000) { // Less than 1 hour
            return 'urgent';
        } else if (diff < 86400000) { // Less than 24 hours
            return 'soon';
        } else {
            return 'plenty';
        }
    }
    
    function getCategoryIcon(category) {
        const icons = {
            'personal': 'fas fa-user',
            'work': 'fas fa-briefcase',
            'academic': 'fas fa-graduation-cap',
            'health': 'fas fa-heartbeat',
            'social': 'fas fa-users'
        };
        
        return icons[category] || 'fas fa-tag';
    }
    
    function getPriorityIcon(priority) {
        const icons = {
            'high': 'fas fa-exclamation-circle',
            'medium': 'fas fa-exclamation',
            'low': 'fas fa-arrow-down'
        };
        
        return icons[priority] || 'fas fa-circle';
    }
  
    // Analytics
    function setupAnalytics() {
        updateStats();
        updateAnalyticsCharts();
        generateInsights();
    }
  
    function updateAnalyticsCharts() {
        // Mood Distribution Chart
        const moodCtx = document.getElementById('mood-distribution-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.moodDistChart) {
            window.moodDistChart.destroy();
        }
        
        const moodCounts = {};
        const moodColors = {
            'happy': '#FFD700',
            'sad': '#4169E1',
            'angry': '#DC143C',
            'excited': '#32CD32',
            'tired': '#8A2BE2',
            'neutral': '#808080',
            'anxious': '#FF6347',
            'relaxed': '#20B2AA'
        };
        
        state.moods.forEach(mood => {
            moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
        });
  
        window.moodDistChart = new Chart(moodCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(moodCounts).map(mood => 
                    mood.charAt(0).toUpperCase() + mood.slice(1)
                ),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: Object.keys(moodCounts).map(mood => moodColors[mood] || '#808080'),
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
  
        // Activity Timeline Chart
        const activityCtx = document.getElementById('activity-timeline-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.activityChart) {
            window.activityChart.destroy();
        }
        
        // Get last 7 days
        const today = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });
        
        const activityCounts = last7Days.map(date => ({
            date,
            count: countActivitiesOnDate(date)
        }));
  
        window.activityChart = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: activityCounts.map(a => new Date(a.date).toLocaleDateString('en-US', {weekday: 'short'})),
                datasets: [{
                    label: 'Activities',
                    data: activityCounts.map(a => a.count),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent'),
                    backgroundColor: 'rgba(100, 108, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent'),
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
        
        // Most Active Days Chart
        const activeDaysCtx = document.getElementById('active-days-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.activeDaysChart) {
            window.activeDaysChart.destroy();
        }
        
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const daysCounts = Array(7).fill(0);
        
        // Count activities by day of week
        const allActivities = [
            ...state.moods.map(m => ({ ...m, timestamp: m.timestamp || m.date || new Date().toISOString() })),
            ...state.journalEntries.map(j => ({ ...j, timestamp: j.date || j.timestamp || new Date().toISOString() })),
            ...state.events.map(e => ({ ...e, timestamp: e.datetime || e.timestamp || new Date().toISOString() }))
        ];
        
        allActivities.forEach(activity => {
            try {
                const date = new Date(activity.timestamp);
                if (!isNaN(date.getTime())) {
                    const dayOfWeek = date.getDay();
                    daysCounts[dayOfWeek]++;
                }
            } catch (e) {
                console.error("Error processing activity date:", e, activity);
            }
        });
        
        window.activeDaysChart = new Chart(activeDaysCtx, {
            type: 'bar',
            data: {
                labels: daysOfWeek.map(day => day.substring(0, 3)),
                datasets: [{
                    label: 'Activities',
                    data: daysCounts,
                    backgroundColor: 'rgba(100, 108, 255, 0.7)',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent'),
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
        
        // Time of Day Analysis Chart
        const timeOfDayCtx = document.getElementById('time-of-day-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.timeOfDayChart) {
            window.timeOfDayChart.destroy();
        }
        
        const timeSlots = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'];
        const timeSlotCounts = Array(4).fill(0);
        
        allActivities.forEach(activity => {
            try {
                const date = new Date(activity.timestamp);
                if (!isNaN(date.getTime())) {
                    const hour = date.getHours();
                    
                    if (hour >= 6 && hour < 12) {
                        timeSlotCounts[0]++; // Morning
                    } else if (hour >= 12 && hour < 18) {
                        timeSlotCounts[1]++; // Afternoon
                    } else if (hour >= 18 && hour < 24) {
                        timeSlotCounts[2]++; // Evening
                    } else {
                        timeSlotCounts[3]++; // Night
                    }
                }
            } catch (e) {
                console.error("Error processing activity time:", e, activity);
            }
        });
        
        window.timeOfDayChart = new Chart(timeOfDayCtx, {
            type: 'polarArea',
            data: {
                labels: timeSlots,
                datasets: [{
                    data: timeSlotCounts,
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.7)',  // Morning - yellow
                        'rgba(54, 162, 235, 0.7)',  // Afternoon - blue
                        'rgba(153, 102, 255, 0.7)', // Evening - purple
                        'rgba(75, 192, 192, 0.7)'   // Night - teal
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    }
    
    function generateInsights() {
        const insightsContainer = document.getElementById('analytics-insights');
        const allActivities = [
            ...state.moods.map(m => ({ ...m, timestamp: m.timestamp || m.date || new Date().toISOString() })),
            ...state.journalEntries.map(j => ({ ...j, timestamp: j.date || j.timestamp || new Date().toISOString() })),
            ...state.events.map(e => ({ ...e, timestamp: e.datetime || e.timestamp || new Date().toISOString() }))
        ];
        
        // Only generate insights if we have enough data
        if (allActivities.length < 5) {
            return;
        }
        
        // Clear placeholder if it exists
        const placeholder = insightsContainer.querySelector('.insight-placeholder');
        if (placeholder) {
            insightsContainer.innerHTML = '';
        }
        
        // Generate mood-based insights
        if (state.moods.length >= 3) {
            const moodCounts = {};
            state.moods.forEach(mood => {
                moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
            });
            
            const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
            const topMood = sortedMoods[0];
            
            if (topMood) {
                const moodInsight = document.createElement('div');
                moodInsight.className = 'insight-item';
                moodInsight.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <div class="insight-content">
                        <h4>Mood Pattern Detected</h4>
                        <p>Your most frequent mood is "${topMood[0]}" (${topMood[1]} times). This represents ${Math.round((topMood[1] / state.moods.length) * 100)}% of your recorded moods.</p>
                    </div>
                `;
                insightsContainer.appendChild(moodInsight);
            }
        }
        
        // Generate activity time insights
        if (allActivities.length >= 5) {
            const timeSlots = ['morning', 'afternoon', 'evening', 'night'];
            const timeSlotCounts = Array(4).fill(0);
            
            allActivities.forEach(activity => {
                try {
                    const date = new Date(activity.timestamp);
                    if (!isNaN(date.getTime())) {
                        const hour = date.getHours();
                        
                        if (hour >= 6 && hour < 12) {
                            timeSlotCounts[0]++; // Morning
                        } else if (hour >= 12 && hour < 18) {
                            timeSlotCounts[1]++; // Afternoon
                        } else if (hour >= 18 && hour < 24) {
                            timeSlotCounts[2]++; // Evening
                        } else {
                            timeSlotCounts[3]++; // Night
                        }
                    }
                } catch (e) {
                    console.error("Error processing activity time for insights:", e, activity);
                }
            });
            
            const maxTimeSlot = timeSlotCounts.indexOf(Math.max(...timeSlotCounts));
            
            const timeInsight = document.createElement('div');
            timeInsight.className = 'insight-item';
            timeInsight.innerHTML = `
                <i class="fas fa-clock"></i>
                <div class="insight-content">
                    <h4>Activity Pattern</h4>
                    <p>You're most active during the ${timeSlots[maxTimeSlot]} (${Math.round((timeSlotCounts[maxTimeSlot] / allActivities.length) * 100)}% of your activities).</p>
                </div>
            `;
            insightsContainer.appendChild(timeInsight);
        }
        
        // Generate day of week insights
        if (allActivities.length >= 5) {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const daysCounts = Array(7).fill(0);
            
            allActivities.forEach(activity => {
                try {
                    const date = new Date(activity.timestamp);
                    if (!isNaN(date.getTime())) {
                        const dayOfWeek = date.getDay();
                        daysCounts[dayOfWeek]++;
                    }
                } catch (e) {
                    console.error("Error processing activity day for insights:", e, activity);
                }
            });
            
            const maxDayIndex = daysCounts.indexOf(Math.max(...daysCounts));
            
            const dayInsight = document.createElement('div');
            dayInsight.className = 'insight-item';
            dayInsight.innerHTML = `
                <i class="fas fa-calendar-day"></i>
                <div class="insight-content">
                    <h4>Weekly Pattern</h4>
                    <p>${daysOfWeek[maxDayIndex]} is your most active day of the week.</p>
                </div>
            `;
            insightsContainer.appendChild(dayInsight);
        }
        
        // Generate consistency insights
        if (state.activeDays.size >= 3) {
            const consistencyInsight = document.createElement('div');
            consistencyInsight.className = 'insight-item';
            consistencyInsight.innerHTML = `
                <i class="fas fa-chart-line"></i>
                <div class="insight-content">
                    <h4>Consistency</h4>
                    <p>You've been active on ${state.activeDays.size} different days. Keep it up!</p>
                </div>
            `;
            insightsContainer.appendChild(consistencyInsight);
        }
    }
  
    // Utility Functions
    function updateCharCount(input, display) {
        const max = input.maxLength;
        const current = input.value.length;
        display.textContent = `${current}/${max}`;
    }
  
    function markActiveDay() {
        const today = new Date().toISOString().split('T')[0];
        state.activeDays.add(today);
        localStorage.setItem('activeDays', JSON.stringify(Array.from(state.activeDays)));
        updateStats();
        
        // Also update streaks when marking active day
        updateStreaks();
    }
  
    function countActivitiesOnDate(date) {
        const activities = [
            ...state.moods.map(m => ({ ...m, timestamp: m.timestamp || m.date || new Date().toISOString() })),
            ...state.journalEntries.map(j => ({ ...j, timestamp: j.date || j.timestamp || new Date().toISOString() })),
            ...state.events.map(e => ({ ...e, timestamp: e.datetime || e.timestamp || new Date().toISOString() }))
        ];
        
        return activities.filter(activity => {
            try {
                const activityDate = new Date(activity.timestamp);
                return activityDate.toISOString().split('T')[0] === date;
            } catch (e) {
                console.error("Error filtering activity by date:", e, activity);
                return false;
            }
        }).length;
    }
  
    function updateStats() {
        document.getElementById('mood-count').textContent = state.moods.length;
        document.getElementById('journal-count').textContent = state.journalEntries.length;
        document.getElementById('active-days').textContent = state.activeDays.size;
        
        document.getElementById('total-moods').textContent = state.moods.length;
        document.getElementById('total-entries').textContent = state.journalEntries.length;
        document.getElementById('total-days').textContent = state.activeDays.size;
        document.getElementById('total-events').textContent = state.events.length;
    }
  
    function setRandomAffirmation() {
        const affirmation = state.affirmations[Math.floor(Math.random() * state.affirmations.length)];
        document.getElementById('daily-affirmation').textContent = affirmation;
    }
  
    // Data Reset
    document.getElementById('reset-data').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    });
  
    // Settings
    function setupSettings() {
        // Load settings
        const showNotificationsToggle = document.getElementById('show-notifications');
        const autoSaveToggle = document.getElementById('auto-save');
        const reminderTimeInput = document.getElementById('reminder-time');
        
        showNotificationsToggle.checked = state.settings.showNotifications;
        autoSaveToggle.checked = state.settings.autoSave;
        
        if (state.settings.reminderTime) {
            reminderTimeInput.value = state.settings.reminderTime;
        }
        
        // Setup settings toggles
        showNotificationsToggle.addEventListener('change', () => {
            state.settings.showNotifications = showNotificationsToggle.checked;
            localStorage.setItem('settings', JSON.stringify(state.settings));
            
            // If notifications are enabled and we have a reminder time, set up the reminder
            if (state.settings.showNotifications && state.settings.reminderTime) {
                setupReminderNotification();
            }
            
            showFeedback('Notification settings updated!');
        });
        
        autoSaveToggle.addEventListener('change', () => {
            state.settings.autoSave = autoSaveToggle.checked;
            localStorage.setItem('settings', JSON.stringify(state.settings));
            showFeedback('Auto-save settings updated!');
            
            // Setup auto-save for journal if enabled
            if (state.settings.autoSave) {
                const journalEntry = document.getElementById('journal-entry');
                journalEntry.addEventListener('input', debounce(() => {
                    const text = journalEntry.value.trim();
                    if (text) {
                        const entry = {
                            text,
                            timestamp: new Date().toISOString()
                        };
                        
                        // Replace the first entry if it was auto-saved
                        if (state.journalEntries.length > 0 && state.journalEntries[0].autoSaved) {
                            state.journalEntries[0] = { ...entry, autoSaved: true };
                        } else {
                            state.journalEntries.unshift({ ...entry, autoSaved: true });
                        }
                        
                        localStorage.setItem('journalEntries', JSON.stringify(state.journalEntries));
                        showFeedback('Journal entry auto-saved', 'success');
                    }
                }, 2000));
            }
        });
        
        reminderTimeInput.addEventListener('change', () => {
            state.settings.reminderTime = reminderTimeInput.value;
            localStorage.setItem('settings', JSON.stringify(state.settings));
            showFeedback('Reminder time set to ' + reminderTimeInput.value);
            
            // Setup reminder notification
            if (state.settings.reminderTime && state.settings.showNotifications) {
                setupReminderNotification();
            }
        });
        
        // Setup data export/import
        const exportDataBtn = document.getElementById('export-data');
        const importDataBtn = document.getElementById('import-data');
        const importFileInput = document.getElementById('import-file');
        
        exportDataBtn.addEventListener('click', () => {
            const exportData = {
                moods: state.moods,
                journalEntries: state.journalEntries,
                events: state.events,
                profile: state.profile,
                settings: state.settings,
                activeDays: Array.from(state.activeDays),
                streaks: state.streaks // Include streaks data
            };
            
            const dataStr = JSON.stringify(exportData);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'personal_space_data.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showFeedback('Data exported successfully!');
        });
        
        importDataBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate imported data
                        if (importedData.moods && importedData.journalEntries && importedData.events) {
                            state.moods = importedData.moods;
                            state.journalEntries = importedData.journalEntries;
                            state.events = importedData.events;
                            
                            if (importedData.profile) {
                                state.profile = importedData.profile;
                            }
                            
                            if (importedData.settings) {
                                state.settings = importedData.settings;
                            }
                            
                            if (importedData.activeDays) {
                                state.activeDays = new Set(importedData.activeDays);
                            }
                            
                            // Import streaks data if available
                            if (importedData.streaks) {
                                state.streaks = importedData.streaks;
                            }
                            
                            // Save all imported data
                            localStorage.setItem('moods', JSON.stringify(state.moods));
                            localStorage.setItem('journalEntries', JSON.stringify(state.journalEntries));
                            localStorage.setItem('events', JSON.stringify(state.events));
                            localStorage.setItem('profile', JSON.stringify(state.profile));
                            localStorage.setItem('settings', JSON.stringify(state.settings));
                            localStorage.setItem('activeDays', JSON.stringify(Array.from(state.activeDays)));
                            localStorage.setItem('streaks', JSON.stringify(state.streaks));
                            
                            // Also save streak-related data separately
                            if (state.streaks) {
                                localStorage.setItem('streakRewards', JSON.stringify(state.streaks.rewards || {}));
                                localStorage.setItem('streakGoals', JSON.stringify(state.streaks.goals || []));
                            }
                            
                            showFeedback('Data imported successfully! Refreshing page...');
                            
                            // Refresh page after a short delay
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else {
                            showFeedback('Invalid data format', 'error');
                        }
                    } catch (error) {
                        showFeedback('Error importing data: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    function setupReminderNotification() {
        // Check if notifications are enabled in settings
        if (!state.settings.showNotifications) {
            console.log("Notifications are disabled in settings");
            return;
        }
        
        // Check if browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }
        
        // Check if we already have permission
        if (Notification.permission === "granted") {
            scheduleReminderNotification();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    scheduleReminderNotification();
                }
            });
        }
    }
    
    function scheduleReminderNotification() {
        // Double-check if notifications are still enabled
        if (!state.settings.showNotifications) {
            return;
        }
        
        const reminderTime = state.settings.reminderTime;
        if (!reminderTime) return;
        
        const [hours, minutes] = reminderTime.split(':');
        
        // Calculate time until reminder
        const now = new Date();
        const reminderDate = new Date();
        reminderDate.setHours(parseInt(hours, 10));
        reminderDate.setMinutes(parseInt(minutes, 10));
        reminderDate.setSeconds(0);
        
        // If the reminder time has already passed today, schedule for tomorrow
        if (reminderDate <= now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }
        
        const timeUntilReminder = reminderDate.getTime() - now.getTime();
        
        // Schedule the notification
        setTimeout(() => {
            // Check again if notifications are still enabled before showing
            if (!state.settings.showNotifications) {
                scheduleReminderNotification(); // Reschedule without showing notification
                return;
            }
            
            const notification = new Notification("Personal Space Reminder", {
                body: "Don't forget to log your mood today!",
                icon: "https://via.placeholder.com/64"
            });
            
            notification.onclick = function() {
                window.focus();
                document.querySelector('[data-page="moods"]').click();
                this.close();
            };
            
            // Schedule the next reminder for tomorrow
            setTimeout(scheduleReminderNotification, 1000);
        }, timeUntilReminder);
    }
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
  
    // Navigation
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-button');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetPage = btn.dataset.page;
                
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById(targetPage).classList.add('active');
                
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
  
    // Theme Management
    function setupThemeSwitch() {
        const themeCards = document.querySelectorAll('.theme-card');
        let currentTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = currentTheme;
        
        // Set the active theme card
        themeCards.forEach(card => {
            if (card.dataset.theme === currentTheme) {
                card.classList.add('active');
            }
            
            card.addEventListener('click', () => {
                // Remove active class from all cards
                themeCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                card.classList.add('active');
                
                // Set the theme
                const theme = card.dataset.theme;
                document.body.className = theme;
                localStorage.setItem('theme', theme);
                
                // Add RGB color values for the active theme
                updateThemeRgbValues(theme);
            });
        });
        
        // Set initial RGB values
        updateThemeRgbValues(currentTheme);
    }
    
    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
        // Remove the # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
    
    // Update RGB values for CSS variables
    function updateThemeRgbValues(theme) {
        // Get the computed styles
        const computedStyle = getComputedStyle(document.body);
        const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
        const accent = computedStyle.getPropertyValue('--accent').trim();
        
        // Set the RGB values
        if (textPrimary.startsWith('#')) {
            document.documentElement.style.setProperty('--text-rgb', hexToRgb(textPrimary));
        }
        
        if (accent.startsWith('#')) {
            document.documentElement.style.setProperty('--accent-rgb', hexToRgb(accent));
        }
    }
  
    // Function to check password strength
    function checkPasswordStrength(password) {
        // Default values
        let strength = {
            level: 'weak',
            message: 'Weak',
            percent: 25
        };
        
        if (!password) {
            strength.percent = 0;
            strength.message = '';
            return strength;
        }
        
        // Calculate strength
        let score = 0;
        
        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score += 1; // Has uppercase
        if (/[a-z]/.test(password)) score += 1; // Has lowercase
        if (/[0-9]/.test(password)) score += 1; // Has number
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
        
        // Determine strength level based on score
        if (score >= 5) {
            strength.level = 'strong';
            strength.message = 'Strong';
            strength.percent = 100;
        } else if (score >= 4) {
            strength.level = 'good';
            strength.message = 'Good';
            strength.percent = 75;
        } else if (score >= 2) {
            strength.level = 'medium';
            strength.message = 'Medium';
            strength.percent = 50;
        }
        
        return strength;
    }
  
    // Helper function to get mood emoji
    function getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            sad: '😢',
            angry: '😡',
            excited: '🤩',
            tired: '😴',
            neutral: '😐',
            anxious: '😰',
            relaxed: '😌'
        };
        return emojis[mood] || '😐';
    }
  
    // Initialize the app
    init();

    // Add the renderCalendarView function after renderJournalEntries
    function renderCalendarView() {
        const calendarDays = document.getElementById('journal-calendar-days');
        const monthYearDisplay = document.getElementById('calendar-month-year');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        
        // Get current date for initial display
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Function to render the calendar for a specific month and year
        function renderCalendar(month, year) {
            // Clear previous calendar
            calendarDays.innerHTML = '';
            
            // Update month/year display
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
            
            // Get first day of month and total days in month
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Get days from previous month to fill first row
            const prevMonthDays = new Date(year, month, 0).getDate();
            
            // Create calendar grid
            // Add days from previous month
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = prevMonthDays - i;
                calendarDays.appendChild(dayElement);
            }
            
            // Add days of current month
            const today = new Date();
            const todayDate = today.getDate();
            const todayMonth = today.getMonth();
            const todayYear = today.getFullYear();
            
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = i;
                
                // Check if this day has journal entries
                const dayDate = new Date(year, month, i).toISOString().split('T')[0];
                const hasEntries = entries.some(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.toISOString().split('T')[0] === dayDate;
                });
                
                // Mark days with entries
                if (hasEntries) {
                    dayElement.classList.add('has-entry');
                }
                
                // Mark today
                if (i === todayDate && month === todayMonth && year === todayYear) {
                    dayElement.classList.add('today');
                }
                
                // Add click event to show entries for that day
                dayElement.addEventListener('click', () => {
                    // Only handle clicks for current month days
                    if (!dayElement.classList.contains('other-month')) {
                        const selectedDate = new Date(year, month, i);
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        
                        // Filter entries for this day
                        const dayEntries = entries.filter(entry => {
                            const entryDate = new Date(entry.date);
                            return entryDate.toISOString().split('T')[0] === formattedDate;
                        });
                        
                        // Switch to list view and show only entries for this day
                        document.getElementById('journal-view-all').classList.add('active');
                        document.getElementById('journal-view-calendar').classList.remove('active');
                        document.getElementById('journal-calendar-view').style.display = 'none';
                        document.getElementById('journal-entries').style.display = 'flex';
                        
                        // Render only entries for this day
                        const entriesContainer = document.getElementById('journal-entries');
                        entriesContainer.innerHTML = '';
                        
                        if (dayEntries.length === 0) {
                            entriesContainer.innerHTML = `
                                <div class="journal-empty">
                                    <i class="fas fa-book-open"></i>
                                    <p>No journal entries for ${selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            `;
                            return;
                        }
                        
                        // Render entries for the selected day
                        dayEntries.forEach(entry => {
                            const entryDate = new Date(entry.date);
                            const formattedDate = entryDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                            
                            const entryTime = entryDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            // Create metadata HTML if present
                            let metadataHTML = '';
                            if (entry.metadata) {
                                const metadata = entry.metadata;
                                const metadataItems = [];
                                
                                // Handle weather metadata
                                if (metadata.weather) {
                                    if (typeof metadata.weather === 'object') {
                                        metadataItems.push(`<div class="metadata-item active">
                                            <i class="${metadata.weather.icon} weather-icon ${metadata.weather.class}"></i> 
                                            <span>${metadata.weather.text}, ${metadata.weather.temp}</span>
                                        </div>`);
                                    } else if (typeof metadata.weather === 'string') {
                                        let weatherIconClass = 'fas fa-cloud-sun';
                                        let weatherColorClass = '';
                                        
                                        if (metadata.weather.includes('Sunny')) {
                                            weatherIconClass = 'fas fa-sun';
                                            weatherColorClass = 'weather-sunny';
                                        } else if (metadata.weather.includes('Cloudy')) {
                                            weatherIconClass = 'fas fa-cloud';
                                            weatherColorClass = 'weather-cloudy';
                                        } else if (metadata.weather.includes('Rainy')) {
                                            weatherIconClass = 'fas fa-cloud-rain';
                                            weatherColorClass = 'weather-rainy';
                                        } else if (metadata.weather.includes('Snowy')) {
                                            weatherIconClass = 'fas fa-snowflake';
                                            weatherColorClass = 'weather-snowy';
                                        } else if (metadata.weather.includes('Stormy')) {
                                            weatherIconClass = 'fas fa-bolt';
                                            weatherColorClass = 'weather-stormy';
                                        }
                                        
                                        metadataItems.push(`<div class="metadata-item active">
                                            <i class="${weatherIconClass} weather-icon ${weatherColorClass}"></i> 
                                            <span>${metadata.weather}</span>
                                        </div>`);
                                    }
                                }
                                
                                // Handle location metadata
                                if (metadata.location) {
                                    if (typeof metadata.location === 'object') {
                                        metadataItems.push(`<div class="metadata-item active">
                                            <i class="fas fa-map-marker-alt"></i> 
                                            <span>${metadata.location.name}</span>
                                        </div>`);
                                    } else if (typeof metadata.location === 'string') {
                                        metadataItems.push(`<div class="metadata-item active">
                                            <i class="fas fa-map-marker-alt"></i> 
                                            <span>${metadata.location}</span>
                                        </div>`);
                                    }
                                }
                                
                                if (metadataItems.length > 0) {
                                    metadataHTML = `<div class="journal-metadata">${metadataItems.join('')}</div>`;
                                }
                            }
                            
                            // Create mood emoji if present
                            let moodHTML = '';
                            if (entry.mood) {
                                const moodEmoji = getMoodEmoji(entry.mood);
                                moodHTML = `<div class="journal-entry-mood">${moodEmoji}</div>`;
                            }
                            
                            // Create image HTML if present - use displayJournalEntryImage function from image.js
                            let imageHTML = '';
                            if (typeof displayJournalEntryImage === 'function') {
                                imageHTML = displayJournalEntryImage(entry);
                            } else if (entry.metadata && entry.metadata.image) {
                                imageHTML = `<img src="${entry.metadata.image}" class="journal-entry-image" alt="Journal entry image">`;
                            }
                            
                            const entryHTML = `
                                <div class="journal-entry" data-id="${entry.id}">
                                    <div class="journal-entry-header">
                                        <div class="journal-date">
                                            <i class="fas fa-calendar"></i>
                                            <span>${formattedDate} at ${entryTime}</span>
                                            ${moodHTML}
                                        </div>
                                        <div class="journal-entry-actions">
                                            <button class="edit-btn" data-id="${entry.id}">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="delete-btn" data-id="${entry.id}">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                    ${metadataHTML}
                                    ${entryContent}
                                </div>
                            `;
                            
                            entriesContainer.innerHTML += entryHTML;
                        });
                        
                        // Add event listeners to delete buttons
                        document.querySelectorAll('.delete-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const entryId = parseInt(e.currentTarget.getAttribute('data-id'));
                                
                                if (confirm('Are you sure you want to delete this journal entry?')) {
                                    // Get entries
                                    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                                    
                                    // Filter out deleted entry
                                    const updatedEntries = entries.filter(entry => entry.id !== entryId);
                                    
                                    // Save updated entries
                                    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
                                    
                                    // Re-render entries
                                    renderJournalEntries();
                                    
                                    // Update stats
                                    updateStats();
                                    
                                    showFeedback('Journal entry deleted successfully');
                                }
                            });
                        });
                    }
                });
                
                calendarDays.appendChild(dayElement);
            }
            
            // Add days from next month to fill remaining grid
            const totalDaysDisplayed = firstDay + daysInMonth;
            const remainingCells = 42 - totalDaysDisplayed; // 6 rows of 7 days
            
            for (let i = 1; i <= remainingCells; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = i;
                calendarDays.appendChild(dayElement);
            }
        }
        
        // Initial render
        renderCalendar(currentMonth, currentYear);
        
        // Previous month button
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });
        
        // Next month button
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Add a function to filter journal entries
    function filterJournalEntries(searchTerm, filterValue) {
        const entriesContainer = document.getElementById('journal-entries');
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        
        // Filter entries based on selected filter
        let filteredEntries = entries;
        
        if (filterValue === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filteredEntries = entries.filter(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            });
        } else if (filterValue === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);
        } else if (filterValue === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredEntries = entries.filter(entry => new Date(entry.date) >= monthAgo);
        }
        
        // Apply search term filter if provided
        if (searchTerm) {
            filteredEntries = filteredEntries.filter(entry => 
                entry.text.toLowerCase().includes(searchTerm)
            );
        }
        
        // Check if there are any entries
        if (filteredEntries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="journal-empty">
                    <i class="fas fa-book-open"></i>
                    <p>No journal entries match your search</p>
                </div>
            `;
            return;
        }
        
        // Render filtered entries
        entriesContainer.innerHTML = '';
        
        filteredEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const entryTime = entryDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create metadata HTML if present
            let metadataHTML = '';
            if (entry.metadata) {
                const metadata = entry.metadata;
                const metadataItems = [];
                
                // Handle weather metadata
                if (metadata.weather) {
                    if (typeof metadata.weather === 'object') {
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="${metadata.weather.icon} weather-icon ${metadata.weather.class}"></i> 
                            <span>${metadata.weather.text}, ${metadata.weather.temp}</span>
                        </div>`);
                    } else if (typeof metadata.weather === 'string') {
                        let weatherIconClass = 'fas fa-cloud-sun';
                        let weatherColorClass = '';
                        
                        if (metadata.weather.includes('Sunny')) {
                            weatherIconClass = 'fas fa-sun';
                            weatherColorClass = 'weather-sunny';
                        } else if (metadata.weather.includes('Cloudy')) {
                            weatherIconClass = 'fas fa-cloud';
                            weatherColorClass = 'weather-cloudy';
                        } else if (metadata.weather.includes('Rainy')) {
                            weatherIconClass = 'fas fa-cloud-rain';
                            weatherColorClass = 'weather-rainy';
                        } else if (metadata.weather.includes('Snowy')) {
                            weatherIconClass = 'fas fa-snowflake';
                            weatherColorClass = 'weather-snowy';
                        } else if (metadata.weather.includes('Stormy')) {
                            weatherIconClass = 'fas fa-bolt';
                            weatherColorClass = 'weather-stormy';
                        }
                        
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="${weatherIconClass} weather-icon ${weatherColorClass}"></i> 
                            <span>${metadata.weather}</span>
                        </div>`);
                    }
                }
                
                // Handle location metadata
                if (metadata.location) {
                    if (typeof metadata.location === 'object') {
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${metadata.location.name}</span>
                        </div>`);
                    } else if (typeof metadata.location === 'string') {
                        metadataItems.push(`<div class="metadata-item active">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${metadata.location}</span>
                        </div>`);
                    }
                }
                
                if (metadataItems.length > 0) {
                    metadataHTML = `<div class="journal-metadata">${metadataItems.join('')}</div>`;
                }
            }
            
            // Create mood emoji if present
            let moodHTML = '';
            if (entry.mood) {
                const moodEmoji = getMoodEmoji(entry.mood);
                moodHTML = `<div class="journal-entry-mood">${moodEmoji}</div>`;
            }
            
            // Create image HTML if present - use displayJournalEntryImage function from image.js
            let imageHTML = '';
            if (typeof displayJournalEntryImage === 'function') {
                imageHTML = displayJournalEntryImage(entry);
            } else if (entry.metadata && entry.metadata.image) {
                imageHTML = `<img src="${entry.metadata.image}" class="journal-entry-image" alt="Journal entry image">`;
            }
            
            const entryHTML = `
                <div class="journal-entry" data-id="${entry.id}">
                    <div class="journal-entry-header">
                        <div class="journal-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate} at ${entryTime}</span>
                            ${moodHTML}
                        </div>
                        <div class="journal-entry-actions">
                            <button class="edit-btn" data-id="${entry.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${entry.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    ${metadataHTML}
                    ${entryContent}
                </div>
            `;
            
            entriesContainer.innerHTML += entryHTML;
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = parseInt(e.currentTarget.getAttribute('data-id'));
                
                if (confirm('Are you sure you want to delete this journal entry?')) {
                    // Get entries
                    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                    
                    // Filter out deleted entry
                    const updatedEntries = entries.filter(entry => entry.id !== entryId);
                    
                    // Save updated entries
                    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
                    
                    // Re-render entries
                    renderJournalEntries();
                    
                    // Update stats
                    updateStats();
                    
                    showFeedback('Journal entry deleted successfully');
                }
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = parseInt(e.currentTarget.getAttribute('data-id'));
                editJournalEntry(entryId);
            });
        });
    }

    // Initialize journal section
    function initJournal() {
        // Initialize journal entries from localStorage
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        state.journalEntries = entries;
        
        // Set up journal form
        const journalForm = document.getElementById('journal-form');
        const journalEntry = document.getElementById('journal-entry');
        const saveJournalBtn = document.getElementById('save-journal');
        const charCount = document.getElementById('journal-char');
        
        // Add character counter
        journalEntry.addEventListener('input', () => {
            updateCharCount(journalEntry, charCount);
        });
        
        // Handle journal submission
        journalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = journalEntry.value.trim();
            
            if (content) {
                const entry = {
                    id: Date.now(),
                    content,
                    date: new Date().toISOString(),
                    weather: state.currentWeather
                };
                
                state.journalEntries.push(entry);
                localStorage.setItem('journalEntries', JSON.stringify(state.journalEntries));
                
                journalEntry.value = '';
                updateCharCount(journalEntry, charCount);
                renderJournalEntries();
                updateStats();
                
                showFeedback('Journal entry saved');
            }
        });
        
        // Add view switching functionality
        const viewAllBtn = document.getElementById('journal-view-all');
        const viewCalendarBtn = document.getElementById('journal-view-calendar');
        const entriesContainer = document.getElementById('journal-entries');
        const calendarView = document.getElementById('journal-calendar-view');
        
        // Switch to list view
        viewAllBtn.addEventListener('click', () => {
            viewAllBtn.classList.add('active');
            viewCalendarBtn.classList.remove('active');
            entriesContainer.style.display = 'block';
            calendarView.style.display = 'none';
        });
        
        // Switch to calendar view
        viewCalendarBtn.addEventListener('click', () => {
            viewCalendarBtn.classList.add('active');
            viewAllBtn.classList.remove('active');
            entriesContainer.style.display = 'none';
            calendarView.style.display = 'block';
            renderCalendarView();
        });
        
        // Initialize search and filter functionality
        const searchInput = document.getElementById('journal-search');
        const filterSelect = document.getElementById('journal-filter');
        
        searchInput.addEventListener('input', () => {
            filterJournalEntries(searchInput.value, filterSelect.value);
        });
        
        filterSelect.addEventListener('change', () => {
            filterJournalEntries(searchInput.value, filterSelect.value);
        });
        
        // Initial render
        renderJournalEntries();
    }

    function setupStudyTools() {
        console.log("Setting up study tools...");
        
        // Initialize state
        state.studyTools = {
            decks: JSON.parse(localStorage.getItem('studyDecks')) || [],
            currentDeck: null,
            currentCardIndex: 0,
            pomodoro: {
                focusDuration: parseInt(localStorage.getItem('pomodoroFocusDuration')) || 25,
                breakDuration: parseInt(localStorage.getItem('pomodoroBreakDuration')) || 5,
                timeLeft: parseInt(localStorage.getItem('pomodoroFocusDuration')) || 25 * 60,
                isRunning: false,
                isBreak: false,
                sessionsCompleted: parseInt(localStorage.getItem('pomodoroSessionsCompleted')) || 0,
                timer: null
            }
        };

        console.log("Initial state:", state.studyTools);

        // Flashcard Elements
        let deckList = document.querySelector('.deck-list');
        let flashcardsContainer = document.querySelector('.flashcards-container');
        let prevCardBtn = document.getElementById('prev-card');
        let nextCardBtn = document.getElementById('next-card');
        let cardCounter = document.querySelector('.card-counter');
        let addCardBtn = document.getElementById('add-flashcard');
        let addDeckBtn = document.getElementById('add-deck');

        // Pomodoro Timer Elements
        const startTimerBtn = document.getElementById('start-timer');
        const resetTimerBtn = document.getElementById('reset-timer');
        const timerDisplay = document.querySelector('.timer-display .time');
        const timerLabel = document.querySelector('.timer-label');
        const sessionCount = document.querySelector('.session-count .count');
        const increaseFocusBtn = document.getElementById('increase-focus');
        const decreaseFocusBtn = document.getElementById('decrease-focus');
        const increaseBreakBtn = document.getElementById('increase-break');
        const decreaseBreakBtn = document.getElementById('decrease-break');
        const focusDurationDisplay = document.getElementById('focus-duration');
        const breakDurationDisplay = document.getElementById('break-duration');

        // Verify timer elements were found
        if (!startTimerBtn) console.error("Start timer button not found");
        if (!resetTimerBtn) console.error("Reset timer button not found");
        if (!timerDisplay) console.error("Timer display not found");
        if (!timerLabel) console.error("Timer label not found");
        if (!sessionCount) console.error("Session count not found");
        if (!increaseFocusBtn) console.error("Increase focus button not found");
        if (!decreaseFocusBtn) console.error("Decrease focus button not found");
        if (!increaseBreakBtn) console.error("Increase break button not found");
        if (!decreaseBreakBtn) console.error("Decrease break button not found");
        if (!focusDurationDisplay) console.error("Focus duration display not found");
        if (!breakDurationDisplay) console.error("Break duration display not found");

        // Verify flashcard elements were found
        if (!deckList) console.error("Deck list element not found");
        if (!flashcardsContainer) console.error("Flashcards container not found");
        if (!prevCardBtn) console.error("Previous card button not found");
        if (!nextCardBtn) console.error("Next card button not found");
        if (!cardCounter) console.error("Card counter not found");
        if (!addCardBtn) console.error("Add card button not found");
        if (!addDeckBtn) console.error("Add deck button not found");

        // Pomodoro Timer Functions
        function initializePomodoro() {
            // Update displays
            focusDurationDisplay.textContent = state.studyTools.pomodoro.focusDuration;
            breakDurationDisplay.textContent = state.studyTools.pomodoro.breakDuration;
            sessionCount.textContent = state.studyTools.pomodoro.sessionsCompleted;
            updateTimerDisplay();
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(state.studyTools.pomodoro.timeLeft / 60);
            const seconds = state.studyTools.pomodoro.timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerLabel.textContent = state.studyTools.pomodoro.isBreak ? 'Break Time' : 'Focus Time';
            
            if (state.studyTools.pomodoro.isBreak) {
                timerDisplay.classList.add('break-time');
            } else {
                timerDisplay.classList.remove('break-time');
            }
        }

        function startTimer() {
            // Already running - stop the timer
            if (state.studyTools.pomodoro.isRunning) {
                clearInterval(state.studyTools.pomodoro.timer);
                state.studyTools.pomodoro.isRunning = false;
                startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                timerDisplay.classList.remove('active');
                return;
            }

            // Start the timer
            state.studyTools.pomodoro.isRunning = true;
            startTimerBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            timerDisplay.classList.add('active');

            state.studyTools.pomodoro.timer = setInterval(() => {
                if (state.studyTools.pomodoro.timeLeft > 0) {
                    state.studyTools.pomodoro.timeLeft--;
                    updateTimerDisplay();
                } else {
                    // Timer completed
                    clearInterval(state.studyTools.pomodoro.timer);
                    
                    // Play sound
                    const audio = new Audio('https://soundbible.com/mp3/service-bell_daniel_simion.mp3');
                    audio.play().catch(e => console.log('Audio play failed:', e));
                    
                    // Show notification
                    if (!state.studyTools.pomodoro.isBreak) {
                        showFeedback('Focus session completed! Take a break.', 'success');
                        state.studyTools.pomodoro.sessionsCompleted++;
                        sessionCount.textContent = state.studyTools.pomodoro.sessionsCompleted;
                        localStorage.setItem('pomodoroSessionsCompleted', state.studyTools.pomodoro.sessionsCompleted);
                        
                        // Switch to break
                        state.studyTools.pomodoro.isBreak = true;
                        state.studyTools.pomodoro.timeLeft = state.studyTools.pomodoro.breakDuration * 60;
                    } else {
                        showFeedback('Break time over! Get back to work.', 'success');
                        
                        // Switch to focus
                        state.studyTools.pomodoro.isBreak = false;
                        state.studyTools.pomodoro.timeLeft = state.studyTools.pomodoro.focusDuration * 60;
                    }
                    
                    updateTimerDisplay();
                    
                    // Automatically start the next session
                    startTimer();
                }
            }, 1000);
        }

        function resetTimer() {
            // Clear any running timer
            if (state.studyTools.pomodoro.isRunning) {
                clearInterval(state.studyTools.pomodoro.timer);
                state.studyTools.pomodoro.isRunning = false;
                startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                timerDisplay.classList.remove('active');
            }
            
            // Reset to focus state
            state.studyTools.pomodoro.isBreak = false;
            state.studyTools.pomodoro.timeLeft = state.studyTools.pomodoro.focusDuration * 60;
            updateTimerDisplay();
            
            showFeedback('Timer has been reset', 'info');
        }

        function adjustFocusDuration(amount) {
            // Don't allow changes while timer is running
            if (state.studyTools.pomodoro.isRunning) {
                showFeedback('Please stop the timer before changing duration', 'error');
                return;
            }
            
            // Update focus duration (min 1, max 60)
            const newDuration = Math.max(1, Math.min(60, state.studyTools.pomodoro.focusDuration + amount));
            state.studyTools.pomodoro.focusDuration = newDuration;
            focusDurationDisplay.textContent = newDuration;
            
            // If in focus mode, update the time left
            if (!state.studyTools.pomodoro.isBreak) {
                state.studyTools.pomodoro.timeLeft = newDuration * 60;
                updateTimerDisplay();
            }
            
            // Save to localStorage
            localStorage.setItem('pomodoroFocusDuration', newDuration);
        }

        function adjustBreakDuration(amount) {
            // Don't allow changes while timer is running
            if (state.studyTools.pomodoro.isRunning) {
                showFeedback('Please stop the timer before changing duration', 'error');
                return;
            }
            
            // Update break duration (min 1, max 30)
            const newDuration = Math.max(1, Math.min(30, state.studyTools.pomodoro.breakDuration + amount));
            state.studyTools.pomodoro.breakDuration = newDuration;
            breakDurationDisplay.textContent = newDuration;
            
            // If in break mode, update the time left
            if (state.studyTools.pomodoro.isBreak) {
                state.studyTools.pomodoro.timeLeft = newDuration * 60;
                updateTimerDisplay();
            }
            
            // Save to localStorage
            localStorage.setItem('pomodoroBreakDuration', newDuration);
        }

        // Pomodoro Event Listeners
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', startTimer);
        }
        
        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', resetTimer);
        }
        
        if (increaseFocusBtn) {
            increaseFocusBtn.addEventListener('click', () => adjustFocusDuration(1));
        }
        
        if (decreaseFocusBtn) {
            decreaseFocusBtn.addEventListener('click', () => adjustFocusDuration(-1));
        }
        
        if (increaseBreakBtn) {
            increaseBreakBtn.addEventListener('click', () => adjustBreakDuration(1));
        }
        
        if (decreaseBreakBtn) {
            decreaseBreakBtn.addEventListener('click', () => adjustBreakDuration(-1));
        }

        // Initialize the pomodoro timer
        initializePomodoro();

        // Flashcard Functions
        // ... [rest of the existing flashcard code] ...

        // Create new deck
        function createDeck(name) {
            const deck = {
                id: Date.now(),
                name,
                cards: []
            };
            console.log("Creating new deck:", deck);
            state.studyTools.decks.push(deck);
            state.studyTools.currentDeck = deck;
            saveState();
            updateDecksList();
            showFeedback('Deck created successfully');
        }

        // Create new flashcard
        function createFlashcard(front, back) {
            if (!state.studyTools.currentDeck) {
                showFeedback('Please select a deck first', 'error');
                console.log("Error: No deck selected");
                return;
            }

            const card = { front, back };
            console.log("Adding card to deck:", card);
            console.log("Current deck before:", state.studyTools.currentDeck);
            
            state.studyTools.currentDeck.cards.push(card);
            state.studyTools.currentCardIndex = state.studyTools.currentDeck.cards.length - 1;
            saveState();
            updateFlashcardDisplay();
            
            console.log("Current deck after:", state.studyTools.currentDeck);
            console.log("All decks:", state.studyTools.decks);
            
            showFeedback('Card added successfully');
        }

        // Show flashcard form
        function showFlashcardForm() {
            if (!state.studyTools.currentDeck) {
                showFeedback('Please select a deck first', 'error');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Flashcard</h3>
                        <button class="btn-icon close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="card-front">Front</label>
                            <textarea id="card-front" placeholder="Enter the front of the card" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="card-back">Back</label>
                            <textarea id="card-back" placeholder="Enter the back of the card" required></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-subtle close-modal">Cancel</button>
                        <button class="btn btn-primary" id="save-card">Save Card</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => modal.remove());
            });

            modal.querySelector('#save-card').addEventListener('click', () => {
                const front = document.getElementById('card-front').value.trim();
                const back = document.getElementById('card-back').value.trim();

                if (!front || !back) {
                    showFeedback('Please fill in both sides of the card', 'error');
                    return;
                }

                createFlashcard(front, back);
                modal.remove();
            });
        }

        // Show deck form
        function showDeckForm() {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create New Deck</h3>
                        <button class="btn-icon close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="deck-name">Deck Name</label>
                            <input type="text" id="deck-name" placeholder="Enter deck name" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-subtle close-modal">Cancel</button>
                        <button class="btn btn-primary" id="save-deck">Create Deck</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => modal.remove());
            });

            modal.querySelector('#save-deck').addEventListener('click', () => {
                const name = document.getElementById('deck-name').value.trim();
                if (!name) {
                    showFeedback('Please enter a deck name', 'error');
                    return;
                }
                createDeck(name);
                modal.remove();
            });
        }

        // Update decks list
        function updateDecksList() {
            console.log("Updating decks list:", state.studyTools.decks);
            
            if (!deckList) {
                console.error("Deck list element not found!");
                return;
            }
            
            if (state.studyTools.decks.length === 0) {
                deckList.innerHTML = `
                    <div class="deck-empty">
                        <p>No decks available</p>
                        <p class="empty-subtitle">Create a new deck to get started!</p>
                    </div>
                `;
                return;
            }
            
            deckList.innerHTML = state.studyTools.decks.map(deck => `
                <div class="deck-card ${deck.id === state.studyTools.currentDeck?.id ? 'active' : ''}" data-deck-id="${deck.id}">
                    <h5>${deck.name}</h5>
                    <p>${deck.cards.length} cards</p>
                    <button class="btn-icon delete-btn" title="Delete Deck">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');

            // Add event listeners
            deckList.querySelectorAll('.deck-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.delete-btn')) {
                        const deckId = parseInt(card.dataset.deckId);
                        console.log("Selecting deck with ID:", deckId);
                        state.studyTools.currentDeck = state.studyTools.decks.find(d => d.id === deckId);
                        state.studyTools.currentCardIndex = 0;
                        console.log("Current deck set to:", state.studyTools.currentDeck);
                        updateDecksList();
                        updateFlashcardDisplay();
                    }
                });
            });

            deckList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const deckId = parseInt(e.target.closest('.deck-card').dataset.deckId);
                    if (confirm('Are you sure you want to delete this deck?')) {
                        const deckIndex = state.studyTools.decks.findIndex(d => d.id === deckId);
                        state.studyTools.decks.splice(deckIndex, 1);
                        if (state.studyTools.currentDeck?.id === deckId) {
                            state.studyTools.currentDeck = null;
                            state.studyTools.currentCardIndex = 0;
                            updateFlashcardDisplay();
                        }
                        updateDecksList();
                        saveState();
                        showFeedback('Deck deleted successfully');
                    }
                });
            });
        }

        // Update flashcard display
        function updateFlashcardDisplay() {
            console.log("Updating flashcard display");
            
            if (!flashcardsContainer) {
                console.error("Flashcards container not found!");
                // Try to find it again in case it was added to the DOM after setup
                flashcardsContainer = document.querySelector('.flashcards-container');
                if (!flashcardsContainer) {
                    console.error("Still can't find flashcards container!");
                    return;
                }
            }
            
            const currentDeck = state.studyTools.currentDeck;
            console.log("Current deck:", currentDeck);
            
            if (!currentDeck || !currentDeck.cards.length) {
                console.log("No deck or empty deck");
                flashcardsContainer.innerHTML = `
                    <div class="flashcard-empty">
                        <i class="fas fa-clone"></i>
                        <p>No flashcards available</p>
                        <p class="empty-subtitle">${currentDeck ? 'Add some flashcards to get started!' : 'Please select a deck first'}</p>
                    </div>
                `;
                cardCounter.textContent = "0 / 0";
                prevCardBtn.disabled = true;
                nextCardBtn.disabled = true;
                return;
            }

            const currentCard = currentDeck.cards[state.studyTools.currentCardIndex];
            console.log("Current card:", currentCard);
            
            flashcardsContainer.innerHTML = `
                <div class="flashcard" id="current-flashcard">
                    <div class="flashcard-front">
                        <div class="flashcard-content">${currentCard.front}</div>
                        <div class="flip-hint"><i class="fas fa-sync-alt"></i> Click to flip</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-content">${currentCard.back}</div>
                        <div class="flip-hint"><i class="fas fa-sync-alt"></i> Click to flip back</div>
                    </div>
                </div>
            `;

            // Add event listeners for the new flashcard
            const flashcard = document.getElementById('current-flashcard');
            
            if (!flashcard) {
                console.error("Flashcard element not found after creating!");
                return;
            }
            
            // Click to flip
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
            });
            
            // Add keyboard navigation
            const handleKeyDown = (e) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    flashcard.classList.toggle('flipped');
                } else if (e.code === 'ArrowLeft') {
                    previousFlashcard();
                } else if (e.code === 'ArrowRight') {
                    nextFlashcard();
                }
            };
            
            // Remove old event listener and add new one
            document.removeEventListener('keydown', handleKeyDown);
            document.addEventListener('keydown', handleKeyDown);

            // Update navigation
            updateFlashcardNavigation();
        }

        // Update flashcard navigation
        function updateFlashcardNavigation() {
            const currentDeck = state.studyTools.currentDeck;
            if (!currentDeck) return;

            prevCardBtn.disabled = state.studyTools.currentCardIndex === 0;
            nextCardBtn.disabled = state.studyTools.currentCardIndex === currentDeck.cards.length - 1;
            cardCounter.textContent = `${state.studyTools.currentCardIndex + 1} / ${currentDeck.cards.length}`;
        }

        // Navigation functions
        function nextFlashcard() {
            const currentDeck = state.studyTools.currentDeck;
            if (!currentDeck) return;
            
            if (state.studyTools.currentCardIndex < currentDeck.cards.length - 1) {
                state.studyTools.currentCardIndex++;
                updateFlashcardDisplay();
            }
        }

        function previousFlashcard() {
            if (state.studyTools.currentCardIndex > 0) {
                state.studyTools.currentCardIndex--;
                updateFlashcardDisplay();
            }
        }

        // Save state to localStorage
        function saveState() {
            console.log("Saving state to localStorage:", state.studyTools.decks);
            localStorage.setItem('studyDecks', JSON.stringify(state.studyTools.decks));
            console.log("State saved!");
        }

        // Make functions accessible in the outer scope for debugging
        window.flashcardDebug = {
            createDeck,
            createFlashcard,
            updateDecksList,
            updateFlashcardDisplay,
            state: state.studyTools
        };

        // Add event listeners with error handling
        if (addCardBtn) {
            addCardBtn.addEventListener('click', showFlashcardForm);
        }
        
        if (addDeckBtn) {
            addDeckBtn.addEventListener('click', showDeckForm);
        }
        
        if (prevCardBtn) {
            prevCardBtn.addEventListener('click', previousFlashcard);
        }
        
        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', nextFlashcard);
        }

        // Initialize display
        updateDecksList();
        updateFlashcardDisplay();
        
        console.log("Study tools setup complete");
    }

    // Faith Page Functionality
    function setupFaithPage() {
        setupDailyVerse();
        setupMoodBasedVerse();
        setupCustomVerses();
        setupVerseSearch();
    }

    // Daily Verse
    function setupDailyVerse() {
        const refreshBtn = document.getElementById('refresh-verse');
        const saveBtn = document.getElementById('save-verse');
        const shareBtn = document.getElementById('share-verse');
        const verseTextElement = document.getElementById('daily-verse-text');
        const verseReferenceElement = document.getElementById('daily-verse-reference');
        
        if (!refreshBtn || !saveBtn || !shareBtn || !verseTextElement || !verseReferenceElement) {
            console.error('Daily verse elements not found');
            return;
        }
        
        // Load initial verse
        getNewVerse();
        
        // Refresh button click handler
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('rotating');
            setTimeout(() => {
                refreshBtn.classList.remove('rotating');
            }, 1000);
            
            getNewVerse();
        });
        
        // Save button click handler
        saveBtn.addEventListener('click', () => {
            const text = verseTextElement.textContent;
            const reference = verseReferenceElement.textContent;
            
            if (!text || !reference) {
                showFeedback('No verse to save', 'error');
                return;
            }
            
            // Get existing verses
            const customVerses = JSON.parse(localStorage.getItem('customVerses')) || [];
            
            // Check if verse already exists
            const verseExists = customVerses.some(verse => 
                verse.text === text && verse.reference === reference
            );
            
            if (verseExists) {
                showFeedback('This verse is already saved to your collection', 'info');
                return;
            }
            
            // Create new verse object
            const newVerse = {
                id: Date.now().toString(),
                text: text,
                reference: reference,
                dateAdded: new Date().toISOString()
            };
            
            // Add to array
            customVerses.push(newVerse);
            
            // Save to localStorage
            localStorage.setItem('customVerses', JSON.stringify(customVerses));
            
            // Update the display if the custom verses list is visible
            const customVersesList = document.getElementById('custom-verses-list');
            if (customVersesList) {
                displayCustomVerses(customVerses);
            }
            
            // Show feedback
            showFeedback('Verse saved to your collection!', 'success');
            
            // Highlight the save button
            saveBtn.classList.add('highlight-action');
            setTimeout(() => {
                saveBtn.classList.remove('highlight-action');
            }, 1500);
        });
        
        // Share button click handler
        shareBtn.addEventListener('click', () => {
            const text = verseTextElement.textContent;
            const reference = verseReferenceElement.textContent;
            
            if (!text || !reference) {
                showFeedback('No verse to share', 'error');
                return;
            }
            
            // Use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: 'Bible Verse',
                    text: `"${text}" - ${reference}`
                })
                .then(() => {
                    showFeedback('Verse shared successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error sharing verse:', error);
                    fallbackShare();
                });
            } else {
                fallbackShare();
            }
            
            function fallbackShare() {
                // Fallback to clipboard copy
                const verseText = `"${text}" - ${reference}`;
                
                // Create temporary input element
                const tempInput = document.createElement('textarea');
                tempInput.value = verseText;
                document.body.appendChild(tempInput);
                
                // Select and copy text
                tempInput.select();
                document.execCommand('copy');
                
                // Remove temporary element
                document.body.removeChild(tempInput);
                
                showFeedback('Verse copied to clipboard!', 'success');
            }
        });
    }

    // Mood-Based Verse
    function setupMoodBasedVerse() {
        const moodDisplay = document.getElementById('current-mood-display');
        const verseText = document.getElementById('mood-verse-text');
        const verseRef = document.getElementById('mood-verse-reference');
        const moodVerseCard = document.querySelector('.faith-card.mood-encouragement');

        if (!moodDisplay || !verseText || !verseRef) {
            console.error('Mood verse elements not found');
            return;
        }
        
        // Get current mood from state (checking both mood and type properties for compatibility)
        let currentMood = 'neutral';
        if (state.moods.length > 0) {
            currentMood = state.moods[0].mood || state.moods[0].type || 'neutral';
        }
        
        console.log('Current mood set to:', currentMood);
        moodDisplay.textContent = getMoodEmoji(currentMood);
        
        // Get appropriate verse based on mood
        const verse = getMoodBasedVerse(currentMood);
        displayVerse(verse, verseText, verseRef);

        // Update verse when mood changes
        state.onMoodChange = (newMood) => {
            console.log('Mood changed to:', newMood);
            moodDisplay.textContent = getMoodEmoji(newMood);
            const newVerse = getMoodBasedVerse(newMood);
            displayVerse(newVerse, verseText, verseRef);
            
            // Highlight the mood verse card
            if (moodVerseCard) {
                moodVerseCard.classList.add('highlight-update');
                setTimeout(() => {
                    moodVerseCard.classList.remove('highlight-update');
                }, 1500);
            }
        };
    }

    // Custom Verses Management
    function setupCustomVerses() {
        const verseTextInput = document.getElementById('verse-text-input');
        const verseRefInput = document.getElementById('verse-reference-input');
        const addVerseBtn = document.getElementById('add-custom-verse');
        
        if (!verseTextInput || !verseRefInput || !addVerseBtn) {
            console.error('Custom verse elements not found');
            return;
        }
        
        // Get custom verses from localStorage
        const customVerses = JSON.parse(localStorage.getItem('customVerses')) || [];
        
        // Display existing verses
        displayCustomVerses(customVerses);
        
        // Setup form submission
        addVerseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addCustomVerse();
        });
        
        // Setup input event listeners for Enter key
        verseTextInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verseRefInput.focus();
            }
        });
        
        verseRefInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomVerse();
            }
        });
        
        // Setup placeholder animations
        setupInputPlaceholders();
    }

    function displayCustomVerses(verses) {
        const versesList = document.getElementById('custom-verses-list');
        const verseCount = document.getElementById('custom-verse-count');
        
        if (!versesList || !verseCount) {
            console.error('Custom verses elements not found');
            return;
        }
        
        // Update verse count
        verseCount.textContent = `${verses.length} ${verses.length === 1 ? 'verse' : 'verses'}`;
        
        // Sort verses by date added (newest first)
        const sortedVerses = [...verses].sort((a, b) => {
            return new Date(b.dateAdded) - new Date(a.dateAdded);
        });
        
        // If no verses, show placeholder
        if (sortedVerses.length === 0) {
            versesList.innerHTML = `
                <div class="no-verses">
                    <i class="fas fa-book"></i>
                    <p>No custom verses yet</p>
                    <span class="subtitle">Add your favorite verses to get started</span>
                </div>
            `;
            return;
        }
        
        // Build HTML for verses
        let html = '';
        sortedVerses.forEach(verse => {
            // Format date
            const date = new Date(verse.dateAdded);
            const formattedDate = date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            html += `
                <div class="verse-item" data-id="${verse.id}">
                    <div class="verse-item-header">
                        <span class="verse-item-reference">${verse.reference}</span>
                        <span class="verse-item-date">${formattedDate}</span>
                    </div>
                    <p class="verse-item-text">"${verse.text}"</p>
                    <div class="verse-item-actions">
                        <button class="verse-item-btn use-verse" data-id="${verse.id}" title="Use this verse as your daily verse">
                            <i class="fas fa-check"></i> Use
                        </button>
                        <button class="verse-item-btn delete delete-verse" data-id="${verse.id}" title="Delete this verse">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        versesList.innerHTML = html;
        
        // Add event listeners to the delete and use buttons
        const deleteButtons = versesList.querySelectorAll('.delete-verse');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up
                const verseId = button.getAttribute('data-id');
                deleteCustomVerse(verseId);
            });
        });
        
        const useButtons = versesList.querySelectorAll('.use-verse');
        useButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up
                const verseId = button.getAttribute('data-id');
                const verse = sortedVerses.find(v => v.id === verseId);
                if (verse) {
                    selectVerse(verse);
                }
            });
        });
    }

    function deleteCustomVerse(verseId) {
        if (!confirm('Are you sure you want to delete this verse?')) {
            return;
        }
        
        // Get verses from localStorage
        const customVerses = JSON.parse(localStorage.getItem('customVerses')) || [];
        
        // Find the verse index
        const verseIndex = customVerses.findIndex(verse => verse.id === verseId);
        
        if (verseIndex === -1) {
            console.error('Verse not found with ID:', verseId);
            showFeedback('Verse not found', 'error');
            return;
        }
        
        // Remove the verse
        customVerses.splice(verseIndex, 1);
        
        // Save back to localStorage
        localStorage.setItem('customVerses', JSON.stringify(customVerses));
        
        // Update the display
        displayCustomVerses(customVerses);
        
        // Show feedback
        showFeedback('Verse deleted successfully', 'success');
    }

    // Verse Search
    function setupVerseSearch() {
        const searchInput = document.getElementById('verse-search');
        const searchResults = document.getElementById('verse-search-results');
        let searchTimeout;

        if (!searchInput || !searchResults) {
            console.error('Verse search elements not found');
            return;
        }

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(() => {
                const customVerses = JSON.parse(localStorage.getItem('customVerses')) || [];
                const results = customVerses.filter(verse => 
                    verse.text.toLowerCase().includes(query) || 
                    verse.reference.toLowerCase().includes(query)
                );

                if (results.length === 0) {
                    searchResults.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <p>No verses found</p>
                        </div>
                    `;
                } else {
                    searchResults.innerHTML = '';
                    
                    // Create result elements individually to safely handle event listeners
                    results.forEach(verse => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        
                        // Safely create HTML content
                        resultItem.innerHTML = `
                            <div class="verse-text">${highlightText(verse.text, query)}</div>
                            <div class="verse-reference">${highlightText(verse.reference, query)}</div>
                        `;
                        
                        // Add click event listener directly to the element
                        resultItem.addEventListener('click', () => {
                            selectVerse(verse.text, verse.reference);
                        });
                        
                        searchResults.appendChild(resultItem);
                    });
                }

                // Add active class for animation
                searchResults.style.display = 'block';
                searchResults.classList.add('active');
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
                searchResults.classList.remove('active');
            }
        });
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function selectVerse(verse) {
        // Set the verse as daily verse
        const verseTextEl = document.getElementById('daily-verse-text');
        const verseRefEl = document.getElementById('daily-verse-reference');
        
        if (!verseTextEl || !verseRefEl) {
            console.error('Daily verse elements not found');
            return;
        }
        
        // Set the text and reference
        verseTextEl.textContent = verse.text;
        verseRefEl.textContent = verse.reference;
        
        // Give feedback to the user
        showFeedback('Verse set as your daily verse', 'success');
        
        // Switch to the home tab if we're not already there
        const faithPage = document.getElementById('faith');
        const navButtons = document.querySelectorAll('.nav-button');
        
        if (faithPage && !faithPage.classList.contains('active')) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            faithPage.classList.add('active');
            
            // Update nav buttons
            navButtons.forEach(button => {
                button.classList.remove('active');
                if (button.getAttribute('data-page') === 'faith') {
                    button.classList.add('active');
                }
            });
        }
        
        // Scroll to daily verse card
        const dailyVerseCard = document.querySelector('.daily-verse');
        if (dailyVerseCard) {
            dailyVerseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add highlight effect
            dailyVerseCard.classList.add('highlight-update');
            setTimeout(() => {
                dailyVerseCard.classList.remove('highlight-update');
            }, 1500);
        }
    }

    function displayVerse(verse, textElement, referenceElement) {
        if (!verse || !textElement || !referenceElement) {
            console.error('Missing required parameters for displayVerse');
            return;
        }
        
        // Add a fade-out effect
        textElement.classList.add('fade-out');
        referenceElement.classList.add('fade-out');
        
        // Set content after a short delay to allow fade out
        setTimeout(() => {
            textElement.textContent = verse.text;
            referenceElement.textContent = verse.reference;
            
            // Add the fade-in effect
            textElement.classList.remove('fade-out');
            textElement.classList.add('fade-in');
            
            referenceElement.classList.remove('fade-out');
            referenceElement.classList.add('fade-in');
            
            // Remove the animation classes after animation completes
            setTimeout(() => {
                textElement.classList.remove('fade-in');
                referenceElement.classList.remove('fade-in');
            }, 500);
        }, 300);
    }

    function getNewVerse() {
        const verses = [
            {
                text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
                reference: "John 3:16"
            },
            {
                text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
                reference: "Proverbs 3:5-6"
            },
            {
                text: "I can do all things through him who strengthens me.",
                reference: "Philippians 4:13"
            },
            {
                text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.",
                reference: "Deuteronomy 31:6"
            },
            {
                text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",
                reference: "Psalm 23:1-3"
            },
            {
                text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
                reference: "Romans 8:28"
            },
            {
                text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.",
                reference: "2 Corinthians 5:17"
            },
            {
                text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
                reference: "Isaiah 41:10"
            },
            {
                text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
                reference: "Matthew 11:28"
            },
            {
                text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
                reference: "Isaiah 40:31"
            }
        ];
        
        // Get a random verse
        const randomIndex = Math.floor(Math.random() * verses.length);
        const verse = verses[randomIndex];
        
        // Display the verse
        const verseTextElement = document.getElementById('daily-verse-text');
        const verseReferenceElement = document.getElementById('daily-verse-reference');
        
        if (verseTextElement && verseReferenceElement) {
            displayVerse(verse, verseTextElement, verseReferenceElement);
        }
        
        return verse;
    }

    function getMoodBasedVerse(mood) {
        const verses = {
            happy: {
                text: "Rejoice in the Lord always. I will say it again: Rejoice!",
                reference: "Philippians 4:4"
            },
            sad: {
                text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
                reference: "Psalm 34:18"
            },
            angry: {
                text: "In your anger do not sin. Do not let the sun go down while you are still angry.",
                reference: "Ephesians 4:26"
            },
            excited: {
                text: "This is the day that the Lord has made; let us rejoice and be glad in it.",
                reference: "Psalm 118:24"
            },
            tired: {
                text: "Come to me, all you who are weary and burdened, and I will give you rest.",
                reference: "Matthew 11:28"
            },
            anxious: {
                text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
                reference: "Philippians 4:6"
            },
            relaxed: {
                text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
                reference: "John 14:27"
            },
            neutral: {
                text: "Be still, and know that I am God.",
                reference: "Psalm 46:10"
            }
        };
        return verses[mood] || verses.neutral;
    }

    function getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            sad: '😢',
            angry: '😡',
            excited: '🤩',
            tired: '😴',
            neutral: '😐',
            anxious: '😰',
            relaxed: '😌'
        };
        return emojis[mood] || '😐';
    }

    // ... rest of the code remains unchanged ...

    function setupInputPlaceholders() {
        const verseTextInput = document.getElementById('verse-text-input');
        const verseRefInput = document.getElementById('verse-reference-input');
        
        if (!verseTextInput || !verseRefInput) {
            console.error('Input elements not found for placeholder animation');
            return;
        }
        
        const textPlaceholders = [
            "Enter verse text...",
            "In the beginning was the Word...",
            "For God so loved the world...",
            "I can do all things through Christ...",
            "The Lord is my shepherd..."
        ];
        
        const refPlaceholders = [
            "Enter verse reference (e.g., John 3:16)",
            "John 1:1",
            "John 3:16",
            "Philippians 4:13",
            "Psalm 23:1"
        ];
        
        let placeholderIndex = 0;
        
        // Change placeholders every 3 seconds when inputs are empty
        setInterval(() => {
            if (document.activeElement !== verseTextInput && verseTextInput.value === '') {
                placeholderIndex = (placeholderIndex + 1) % textPlaceholders.length;
                verseTextInput.setAttribute('placeholder', textPlaceholders[placeholderIndex]);
            }
            
            if (document.activeElement !== verseRefInput && verseRefInput.value === '') {
                placeholderIndex = (placeholderIndex + 1) % refPlaceholders.length;
                verseRefInput.setAttribute('placeholder', refPlaceholders[placeholderIndex]);
            }
        }, 3000);
    }

    function addCustomVerse() {
        const verseTextInput = document.getElementById('verse-text-input');
        const verseRefInput = document.getElementById('verse-reference-input');
        
        if (!verseTextInput || !verseRefInput) {
            console.error('Verse input elements not found');
            return;
        }
        
        const text = verseTextInput.value.trim();
        const reference = verseRefInput.value.trim();
        
        if (!text || !reference) {
            showFeedback('Please enter both verse text and reference', 'error');
            return;
        }
        
        // Get existing verses
        const customVerses = JSON.parse(localStorage.getItem('customVerses')) || [];
        
        // Generate a unique ID
        const id = Date.now().toString();
        
        // Create new verse object
        const newVerse = {
            id: id,
            text: text,
            reference: reference,
            dateAdded: new Date().toISOString()
        };
        
        console.log("Adding new verse with ID:", id);
        
        // Add to array
        customVerses.push(newVerse);
        
        // Save to localStorage
        localStorage.setItem('customVerses', JSON.stringify(customVerses));
        
        // Clear inputs
        verseTextInput.value = '';
        verseRefInput.value = '';
        
        // Update the display
        displayCustomVerses(customVerses);
        
        // Show feedback
        showFeedback('Verse added successfully!', 'success');
        
        // Return focus to text input
        verseTextInput.focus();
        
        // Reset placeholder animation
        setupInputPlaceholders();
    }

    function setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');
        
        // Create and append the sidebar toggle button
        const sidebarToggle = document.createElement('button');
        sidebarToggle.className = 'sidebar-toggle';
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
        sidebarToggle.setAttribute('title', 'Toggle sidebar');
        document.body.appendChild(sidebarToggle); // Append to body instead of sidebar for better positioning
        
        // Check localStorage for saved sidebar state
        const isCompact = localStorage.getItem('sidebarCompact') === 'true';
        if (isCompact) {
            sidebar.classList.add('sidebar-compact');
            content.classList.add('content-extended');
            content.style.maxWidth = 'calc(100% - 80px)';
            content.style.marginLeft = '80px';
            sidebarToggle.style.left = '60px';
        } else {
            content.style.maxWidth = 'calc(100% - 250px)';
            content.style.marginLeft = '250px';
            sidebarToggle.style.left = '205px';
        }
        
        // Setup the time and date display
        setupTimeDate();
        
        // Get all navigation buttons
        const navButtons = sidebar.querySelectorAll('.nav-button');
        
        // Define categories
        const categories = {
            'Home': 'Main',
            'Moods': 'Personal',
            'Journal': 'Personal',
            'Timeline': 'Planning',
            'Study': 'Learning',
            'Faith': 'Learning',
            'Analytics': 'System',
            'Settings': 'System'
        };
        
        // Clear existing category labels if any
        const existingLabels = sidebar.querySelectorAll('.nav-category');
        existingLabels.forEach(label => label.remove());
        
        // Insert category headers
        let currentCategory = '';
        navButtons.forEach(button => {
            const buttonText = button.querySelector('span').textContent.trim();
            const category = categories[buttonText];
            
            if (category && category !== currentCategory) {
                currentCategory = category;
                
                const categoryLabel = document.createElement('div');
                categoryLabel.className = 'nav-category';
                categoryLabel.textContent = category;
                
                button.parentNode.insertBefore(categoryLabel, button);
            }
        });
        
        // Toggle sidebar state
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('sidebar-compact');
            content.classList.toggle('content-extended');
            
            // Update the main content container
            if (content.classList.contains('content-extended')) {
                content.style.maxWidth = 'calc(100% - 80px)';
                content.style.marginLeft = '80px';
            } else {
                content.style.maxWidth = 'calc(100% - 250px)';
                content.style.marginLeft = '250px';
            }
            
            const isNowCompact = sidebar.classList.contains('sidebar-compact');
            localStorage.setItem('sidebarCompact', isNowCompact);
            
            // Update toggle button position
            sidebarToggle.style.left = isNowCompact ? '60px' : '205px';
            
            // Remove any existing tooltips
            const existingTooltips = document.querySelectorAll('.nav-tooltip');
            existingTooltips.forEach(tip => tip.remove());
        });
        
        // Add tooltips for buttons in compact mode
        navButtons.forEach(button => {
            const buttonText = button.querySelector('span').textContent.trim();
            button.setAttribute('title', buttonText);
            
            // Handle the page navigation to ensure it works with the toggle
            button.addEventListener('click', (e) => {
                // The existing page navigation should still work
                // Just ensuring the tooltip is removed if it exists
                const tooltip = document.querySelector('.nav-tooltip');
                if (tooltip) tooltip.remove();
            });
        });
        
        // Add smooth hover effect for sidebar buttons
        navButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (sidebar.classList.contains('sidebar-compact')) {
                    // Remove any existing tooltips first
                    const existingTooltips = document.querySelectorAll('.nav-tooltip');
                    existingTooltips.forEach(tip => tip.remove());
                    
                    const tooltip = document.createElement('div');
                    tooltip.className = 'nav-tooltip';
                    tooltip.textContent = button.getAttribute('title');
                    
                    // Position correctly relative to the button
                    const buttonRect = button.getBoundingClientRect();
                    
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = (buttonRect.right + 10) + 'px';
                    tooltip.style.top = (buttonRect.top + buttonRect.height/2 - 15) + 'px';
                    tooltip.style.zIndex = '200';
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-10px)';
                    
                    document.body.appendChild(tooltip);
                    
                    // Animate tooltip appearance
                    requestAnimationFrame(() => {
                        tooltip.style.opacity = '1';
                        tooltip.style.transform = 'translateX(0)';
                    });
                }
            });
            
            button.addEventListener('mouseleave', () => {
                const tooltips = document.querySelectorAll('.nav-tooltip');
                tooltips.forEach(tooltip => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-10px)';
                    
                    setTimeout(() => {
                        tooltip.remove();
                    }, 200);
                });
            });
        });
        
        // Handle window resize to adjust the sidebar as needed
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('sidebar-compact');
                content.classList.add('content-extended');
                content.style.maxWidth = 'calc(100% - 80px)';
                content.style.marginLeft = '80px';
                sidebarToggle.style.display = 'none';
            } else {
                sidebarToggle.style.display = 'flex';
                if (localStorage.getItem('sidebarCompact') !== 'true') {
                    sidebar.classList.remove('sidebar-compact');
                    content.classList.remove('content-extended');
                    content.style.maxWidth = 'calc(100% - 250px)';
                    content.style.marginLeft = '250px';
                    sidebarToggle.style.left = '205px';
                } else {
                    sidebar.classList.add('sidebar-compact');
                    content.classList.add('content-extended');
                    content.style.maxWidth = 'calc(100% - 80px)';
                    content.style.marginLeft = '80px';
                    sidebarToggle.style.left = '60px';
                }
            }
        });
        
        // Initial check for mobile view
        if (window.innerWidth <= 768) {
            sidebar.classList.add('sidebar-compact');
            content.classList.add('content-extended');
            content.style.maxWidth = 'calc(100% - 80px)';
            content.style.marginLeft = '80px';
            sidebarToggle.style.display = 'none';
        }
    }

    function setupTimeDate() {
        // Check if a time-date display already exists
        if (document.querySelector('.time-date-display')) {
            console.log('Time-date display already exists, skipping initialization');
            return;
        }
        
        // Create the time-date container
        const timeDateDisplay = document.createElement('div');
        timeDateDisplay.className = 'time-date-display';
        
        // Create time element
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        
        // Create date element
        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'date-display';
        
        // Append elements
        timeDateDisplay.appendChild(timeDisplay);
        timeDateDisplay.appendChild(dateDisplay);
        
        // Append to sidebar - at the top, before the nav
        const sidebar = document.querySelector('.sidebar');
        const sidebarNav = sidebar.querySelector('nav');
        sidebar.insertBefore(timeDateDisplay, sidebarNav);
        
        // Tooltip for the time-date display
        timeDateDisplay.setAttribute('title', 'Click time to show seconds, click date to open calendar');
        
        // Update time and date
        function updateTimeDate() {
            const now = new Date();
            
            // Format time (HH:MM:SS AM/PM)
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            
            // Check if minute changed to add animation
            const prevMinutes = timeDisplay.dataset.minutes;
            if (prevMinutes && prevMinutes !== minutes) {
                timeDisplay.classList.add('minute-changed');
                setTimeout(() => {
                    timeDisplay.classList.remove('minute-changed');
                }, 1000);
            }
            
            // Store current minutes for next comparison
            timeDisplay.dataset.minutes = minutes;
            
            // Create HTML with pulsing separator
            const separatorClass = now.getSeconds() % 2 === 0 ? 'time-separator pulse' : 'time-separator';
            timeDisplay.innerHTML = `
                <span>${hours}</span>
                <span class="${separatorClass}">:</span>
                <span>${minutes}</span>
                <span class="seconds">${seconds}</span>
                <span class="ampm">${ampm}</span>
            `;
            
            // Format date (Day, Month DD, YYYY)
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            // Get current locale for date formatting
            const locale = navigator.language || 'en-US';
            dateDisplay.textContent = now.toLocaleDateString(locale, options);
        }
        
        // Initial update
        updateTimeDate();
        
        // Update every second for a smoother experience
        setInterval(updateTimeDate, 1000);
        
        // Add event listener to toggle seconds visibility on click
        timeDisplay.addEventListener('click', function() {
            timeDisplay.classList.toggle('show-seconds');
        });
        
        // Add event to open calendar on date click
        dateDisplay.addEventListener('click', function() {
            // Switch to journal page if not already there
            const journalButton = document.querySelector('[data-page="journal"]');
            if (journalButton) {
                journalButton.click();
                
                // Optional: After a short delay, switch to calendar view if available
                setTimeout(() => {
                    const calendarViewButton = document.querySelector('.journal-view-btn[data-view="calendar"]');
                    if (calendarViewButton) {
                        calendarViewButton.click();
                    }
                }, 300);
            }
        });
    }

    // Add this to the main setup function
    document.addEventListener('DOMContentLoaded', () => {
        setupSidebar();
        // ... other setup functions
    });

    // Add streak tracking functions
    function updateStreaks() {
        const today = new Date().toISOString().split('T')[0];
        const lastCheckIn = state.streaks.lastCheckIn;
        
        // Check if this is the first time using the app
        if (!lastCheckIn) {
            state.streaks.current = 1;
            state.streaks.longest = 1;
            state.streaks.lastCheckIn = today;
            saveStreaks();
            return;
        }
        
        // Convert to Date objects for proper comparison
        const todayDate = new Date(today);
        const lastCheckInDate = new Date(lastCheckIn);
        
        // Calculate days difference
        const diffTime = Math.abs(todayDate - lastCheckInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If checked in today already, do nothing
        if (diffDays === 0) {
            return;
        }
        
        // If checked in yesterday, increment streak
        if (diffDays === 1) {
            state.streaks.current += 1;
            
            // Update longest streak if current is longer
            if (state.streaks.current > state.streaks.longest) {
                state.streaks.longest = state.streaks.current;
            }
            
            // Check if we've hit a milestone
            checkStreakMilestones();
        } 
        // If missed a day or more, reset streak
        else {
            state.streaks.current = 1;
        }
        
        // Update last check-in date
        state.streaks.lastCheckIn = today;
        
        // Save to localStorage
        saveStreaks();
    }
    
    function saveStreaks() {
        localStorage.setItem('streaks', JSON.stringify(state.streaks));
        localStorage.setItem('streakRewards', JSON.stringify(state.streaks.rewards));
        localStorage.setItem('streakGoals', JSON.stringify(state.streaks.goals));
    }
    
    function checkStreakMilestones() {
        const currentStreak = state.streaks.current;
        
        // Check if current streak matches any milestone
        for (const milestone of state.streaks.milestones) {
            if (currentStreak === milestone && !state.streaks.rewards[milestone]) {
                // Mark this milestone as reached
                state.streaks.rewards[milestone] = {
                    date: new Date().toISOString(),
                    claimed: false
                };
                
                // Show achievement notification
                showFeedback(`🔥 Streak Milestone: ${milestone} days! Claim your reward in the Streak Center.`, 'success');
                
                // Add confetti effect for milestones
                if (typeof renderConfetti === 'function') {
                    renderConfetti();
                }
            }
        }
    }
    
    function renderConfetti() {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        canvas.id = 'confetti-canvas';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const confetti = [];
        const colors = ['#646cff', '#4c51bf', '#00c853', '#ff6b6b', '#ffaa00'];
        const confettiCount = 150;
        
        // Create confetti particles
        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 6.28,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: Math.random() * 0.01
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let allFallen = true;
            
            confetti.forEach(particle => {
                particle.y += particle.speed;
                particle.x += Math.sin(particle.angle) * 2;
                particle.rotation += particle.rotationSpeed;
                
                // Draw confetti
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                if (particle.y < canvas.height) {
                    allFallen = false;
                }
            });
            
            if (!allFallen) {
                requestAnimationFrame(animate);
            } else {
                // Remove canvas when animation is finished
                setTimeout(() => {
                    canvas.remove();
                }, 1000);
            }
        }
        
        animate();
    }
    
    function markActiveDay() {
        const today = new Date().toISOString().split('T')[0];
        state.activeDays.add(today);
        localStorage.setItem('activeDays', JSON.stringify(Array.from(state.activeDays)));
        updateStats();
        
        // Also update streaks when marking active day
        updateStreaks();
    }

    // Add the streak system setup function
    function setupStreakSystem() {
        // DOM elements
        const currentStreakEl = document.getElementById('current-streak');
        const longestStreakEl = document.getElementById('longest-streak');
        const nextMilestoneEl = document.getElementById('next-milestone');
        const checkInBtn = document.getElementById('check-in-btn');
        
        // Set up mini-streak element
        const miniStreak = document.getElementById('mini-streak');
        if (miniStreak) {
            miniStreak.addEventListener('click', (e) => {
                // Only trigger check-in if the tooltip isn't showing (direct click on the counter)
                if (!e.target.closest('.mini-streak-tooltip') && !checkInBtn.disabled) {
                    checkInBtn.click();
                }
            });
        }
        
        // Goals elements
        const goalsList = document.getElementById('goals-list');
        const addGoalBtn = document.getElementById('add-goal-btn');
        const saveGoalBtn = document.getElementById('save-goal-btn');
        const newGoalInput = document.getElementById('new-goal-input');
        const goalsAddForm = document.querySelector('.goals-add-form');
        
        // Update streak UI
        function updateStreakUI() {
            const { current, longest, milestones, lastCheckIn } = state.streaks;
            
            // Update current streak
            currentStreakEl.textContent = current;
            
            // Update longest streak
            longestStreakEl.textContent = `${longest} days`;
            
            // Find next milestone
            const nextMilestone = milestones.find(m => m > current) || milestones[milestones.length - 1];
            nextMilestoneEl.textContent = `${nextMilestone} days`;
            
            // Update check-in button state
            updateCheckInButton(lastCheckIn);
        }
        
        // Create milestone markers
        function renderMilestoneMarkers() {
            streakMilestones.innerHTML = '';
            
            // Get maximal milestone to calculate positions
            const maxMilestone = state.streaks.milestones[state.streaks.milestones.length - 1];
            
            state.streaks.milestones.forEach(milestone => {
                const position = (milestone / maxMilestone) * 100;
                const isReached = state.streaks.current >= milestone;
                
                const marker = document.createElement('div');
                marker.className = `milestone-marker ${isReached ? 'reached' : ''}`;
                marker.style.left = `${position}%`;
                marker.title = `${milestone} day milestone`;
                
                streakMilestones.appendChild(marker);
            });
        }
        
        // Update check-in button state
        function updateCheckInButton(lastCheckIn) {
            const today = new Date().toISOString().split('T')[0];
            
            if (lastCheckIn === today) {
                // Already checked in today
                checkInBtn.disabled = true;
                checkInBtn.innerHTML = '<i class="fas fa-check"></i> Checked in';
                checkInBtn.classList.add('btn-success');
            } else {
                // Can check in today
                checkInBtn.disabled = false;
                checkInBtn.innerHTML = '<i class="fas fa-check-circle"></i> Check-in';
                checkInBtn.classList.remove('btn-success');
            }
        }
        
        // Check-in button event
        checkInBtn.addEventListener('click', () => {
            updateStreaks();
            updateStreakUI();
            showFeedback('You\'ve checked in for today!', 'success');
            
            // Add pulsate animation to the streak counter
            const miniStreak = document.getElementById('mini-streak');
            if (miniStreak) {
                miniStreak.classList.add('streak-pulsate');
                setTimeout(() => {
                    miniStreak.classList.remove('streak-pulsate');
                }, 1000);
            }
            
            // Trigger confetti
            renderConfetti();
        });
        
        // Setup daily goals functionality
        function setupGoals() {
            // Initialize goals if not already set
            if (!state.streaks.goals) {
                state.streaks.goals = [];
                saveStreaks();
            }
            
            // Render goals
            renderGoals();
            
            // Show add goal form
            addGoalBtn.addEventListener('click', () => {
                goalsAddForm.style.display = 'flex';
                newGoalInput.focus();
            });
            
            // Save new goal
            saveGoalBtn.addEventListener('click', () => {
                saveNewGoal();
            });
            
            // Save on Enter press
            newGoalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveNewGoal();
                }
            });
        }
        
        function saveNewGoal() {
            const goalText = newGoalInput.value.trim();
            
            if (goalText) {
                // Add new goal
                const newGoal = {
                    id: Date.now(),
                    text: goalText,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                state.streaks.goals.push(newGoal);
                saveStreaks();
                
                // Clear input and hide form
                newGoalInput.value = '';
                goalsAddForm.style.display = 'none';
                
                // Render updated goals
                renderGoals();
                
                showFeedback('New goal added!', 'success');
            } else {
                showFeedback('Please enter a goal', 'error');
            }
        }
        
        function renderGoals() {
            goalsList.innerHTML = '';
            
            if (state.streaks.goals.length === 0) {
                goalsList.innerHTML = '<li class="goal-empty">Set goals to build better habits</li>';
                return;
            }
            
            state.streaks.goals.forEach(goal => {
                const goalItem = document.createElement('li');
                goalItem.className = `goal-item ${goal.completed ? 'completed' : ''}`;
                goalItem.dataset.id = goal.id;
                
                goalItem.innerHTML = `
                    <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
                    <span class="goal-text">${goal.text}</span>
                    <button class="goal-delete" title="Delete goal">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                // Checkbox toggle
                const checkbox = goalItem.querySelector('.goal-checkbox');
                checkbox.addEventListener('change', () => {
                    toggleGoalCompletion(goal.id);
                });
                
                // Delete button
                const deleteBtn = goalItem.querySelector('.goal-delete');
                deleteBtn.addEventListener('click', () => {
                    deleteGoal(goal.id);
                });
                
                goalsList.appendChild(goalItem);
            });
        }
        
        function toggleGoalCompletion(goalId) {
            const goalIndex = state.streaks.goals.findIndex(g => g.id === goalId);
            
            if (goalIndex !== -1) {
                // Toggle completion
                state.streaks.goals[goalIndex].completed = !state.streaks.goals[goalIndex].completed;
                saveStreaks();
                
                // Re-render goals
                renderGoals();
                
                // Show feedback
                if (state.streaks.goals[goalIndex].completed) {
                    showFeedback('Goal completed! 🎉', 'success');
                }
            }
        }
        
        function deleteGoal(goalId) {
            state.streaks.goals = state.streaks.goals.filter(g => g.id !== goalId);
            saveStreaks();
            renderGoals();
            showFeedback('Goal removed', 'success');
        }
        
        // Initialize streak UI
        updateStreakUI();
        
        // Setup goals
        setupGoals();
    }

    // Expose showFeedback function to the window object
    window.showFeedback = showFeedback;
});
