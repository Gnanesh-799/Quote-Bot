// Check authentication
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const randomQuoteBtn = document.getElementById('random-quote');
    const todayQuoteBtn = document.getElementById('today-quote');
    const favoriteQuoteBtn = document.getElementById('favorite-quote');
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const voiceButton = document.getElementById('voice-input');
    const clearChatBtn = document.getElementById('clear-chat');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const typingIndicator = document.getElementById('typing-indicator');
    const favoritesPanel = document.getElementById('favorites-panel');
    const favoritesList = document.getElementById('favorites-list');
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    const notificationsList = document.getElementById('notifications-list');
    const shareModal = document.getElementById('share-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const shareButtons = document.querySelectorAll('.share-btn');
    const copyQuoteBtn = document.getElementById('copy-quote');
    const shareQuoteBtn = document.getElementById('share-quote');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const chatTabs = document.querySelectorAll('.chat-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const dailyChallengeBtn = document.getElementById('daily-challenge');
    const challengeText = document.getElementById('challenge-text');
    const completeChallenge = document.getElementById('complete-challenge');
    const achievementsList = document.getElementById('achievements-list');
    const chatSettings = document.getElementById('chat-settings');

    let currentQuote = null;
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    let currentCategory = 'all';
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
    let points = parseInt(localStorage.getItem('points')) || 0;

    // Categories for quotes
    const categories = {
        motivation: ['success', 'inspiration', 'motivation', 'goals', 'achievement'],
        success: ['business', 'leadership', 'success', 'work', 'ambition'],
        wisdom: ['life', 'wisdom', 'philosophy', 'knowledge', 'truth'],
        happiness: ['happiness', 'joy', 'love', 'peace', 'positivity']
    };

    // Daily challenges
    const challenges = [
        { text: "Share an inspirational quote with a friend", points: 10 },
        { text: "Save 3 favorite quotes", points: 15 },
        { text: "Use voice input to request a quote", points: 20 },
        { text: "Share a quote on social media", points: 25 },
        { text: "Complete a conversation with QuoteSage", points: 30 }
    ];

    // Fallback quotes in case API fails
    const fallbackQuotes = [
        { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
        { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
        { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
        { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" },
        { q: "Success is not final, failure is not fatal: It is the courage to continue that counts.", a: "Winston Churchill" },
        { q: "The best way to predict the future is to create it.", a: "Peter Drucker" },
        { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
        { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
        { q: "Everything you've ever wanted is on the other side of fear.", a: "George Addair" },
        { q: "The only limit to our realization of tomorrow will be our doubts of today.", a: "Franklin D. Roosevelt" }
    ];

    // API configuration
    const API_KEY = 'KhusPWwmXaSXMVVj3zzOqA==JsA7vKVLTZMf26ms';
    const API_URL = 'https://api.api-ninjas.com/v1/quotes';

    // Load favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('favoriteQuotes')) || [];

    // Initialize theme
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Function to handle notifications
    function addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        notifications.unshift(notification);
        if (notifications.length > 10) notifications.pop();
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotifications();
        
        // Show notification badge
        notificationsBtn.classList.add('has-notifications');
    }

    // Function to update notifications panel
    function updateNotifications() {
        notificationsList.innerHTML = notifications.length ? '' : '<p>No notifications</p>';
        notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.classList.add('notification', notification.type);
            notificationEl.innerHTML = `
                <p>${notification.message}</p>
                <small>${new Date(notification.timestamp).toLocaleString()}</small>
                <button class="clear-notification" data-id="${notification.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            notificationsList.appendChild(notificationEl);
        });
    }

    // Function to handle achievements
    function addAchievement(title, description, points) {
        const achievement = {
            id: Date.now(),
            title,
            description,
            points,
            timestamp: new Date().toISOString()
        };
        achievements.push(achievement);
        localStorage.setItem('achievements', JSON.stringify(achievements));
        updateAchievements();
        addNotification(`🏆 New Achievement: ${title} (+${points} points)`, 'success');
        updatePoints(points);
    }

    // Function to update points
    function updatePoints(pointsToAdd) {
        points += pointsToAdd;
        localStorage.setItem('points', points);
        addNotification(`🌟 You earned ${pointsToAdd} points!`, 'info');
    }

    // Function to update achievements list
    function updateAchievements() {
        achievementsList.innerHTML = achievements.length ? '' : '<p>No achievements yet</p>';
        achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.classList.add('achievement');
            achievementEl.innerHTML = `
                <div class="achievement-icon">🏆</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <small>+${achievement.points} points</small>
                </div>
            `;
            achievementsList.appendChild(achievementEl);
        });
    }

    // Function to set daily challenge
    function setDailyChallenge() {
        const today = new Date().toDateString();
        const currentChallenge = localStorage.getItem(`challenge_${today}`);
        
        if (currentChallenge) {
            const challenge = JSON.parse(currentChallenge);
            challengeText.textContent = challenge.text;
            if (challenge.completed) {
                completeChallenge.disabled = true;
                completeChallenge.textContent = 'Completed';
            }
        } else {
            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
            challengeText.textContent = challenge.text;
            localStorage.setItem(`challenge_${today}`, JSON.stringify({
                ...challenge,
                completed: false
            }));
        }
    }

    // Function to handle category selection
    function handleCategorySelection(category) {
        currentCategory = category;
        categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        fetchRandomQuote(); // Fetch new quote for selected category
    }

    // Enhanced random quote function with categories
    async function fetchRandomQuote() {
        showTypingIndicator();
        try {
            let quote;
            if (currentCategory !== 'all') {
                const categoryKeywords = categories[currentCategory];
                let attempts = 0;
                do {
                    quote = await fetchQuoteFromAPI();
                    attempts++;
                } while (!categoryKeywords.some(keyword => 
                    quote.q.toLowerCase().includes(keyword) || 
                    quote.a.toLowerCase().includes(keyword)) && 
                    attempts < 3);
                
                if (attempts >= 3) {
                    quote = await fetchQuoteFromAPI();
                }
            } else {
                quote = await fetchQuoteFromAPI();
            }
            hideTypingIndicator();
            return quote;
        } catch (error) {
            console.error('Error fetching quote:', error);
            hideTypingIndicator();
            return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        }
    }

    // Function to fetch quote from API
    async function fetchQuoteFromAPI() {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return {
            q: data[0].quote,
            a: data[0].author
        };
    }

    // Function to handle quote sharing
    function shareQuote() {
        if (!currentQuote) return;
        shareModal.style.display = 'block';
        // Add history state when opening modal
        history.pushState({ modal: 'share' }, '', '');
    }

    // Function to close share modal
    function closeShareModal() {
        shareModal.style.display = 'none';
    }

    // Function to copy quote to clipboard
    function copyQuoteToClipboard() {
        if (!currentQuote) return;
        const text = `"${currentQuote.q}" — ${currentQuote.a}`;
        navigator.clipboard.writeText(text).then(() => {
            addNotification('Quote copied to clipboard!', 'success');
        }).catch(err => {
            addNotification('Failed to copy quote', 'error');
        });
    }

    // Function to handle tab switching
    function switchTab(tabId) {
        chatTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-content`);
        });
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Function to hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    // Function to toggle theme
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-theme');
        toggleThemeBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Function to save quote to favorites
    function saveToFavorites(quote) {
        if (!quote) return;
        
        const exists = favorites.some(fav => fav.q === quote.q && fav.a === quote.a);
        if (!exists) {
            favorites.push(quote);
            localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
            updateFavoritesList();
            addMessage('Quote saved to favorites!');
        } else {
            addMessage('This quote is already in your favorites.');
        }
    }

    // Function to update favorites list
    function updateFavoritesList() {
        favoritesList.innerHTML = '';
        favorites.forEach((quote, index) => {
            const quoteElement = document.createElement('div');
            quoteElement.classList.add('favorite-quote');
            quoteElement.innerHTML = `
                <p>"${quote.q}"</p>
                <p>— ${quote.a}</p>
                <button class="remove-favorite" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            favoritesList.appendChild(quoteElement);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('.remove-favorite').dataset.index;
                favorites.splice(index, 1);
                localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
                updateFavoritesList();
            });
        });
    }

    // Function to fetch the quote of the day
    async function fetchTodayQuote() {
        const today = new Date().toDateString();
        const cachedQuote = localStorage.getItem(`todayQuote_${today}`);
        
        if (cachedQuote) {
            return JSON.parse(cachedQuote);
        }

        showTypingIndicator();
        try {
            const quote = await fetchRandomQuote();
            localStorage.setItem(`todayQuote_${today}`, JSON.stringify(quote));
            hideTypingIndicator();
            return quote;
        } catch (error) {
            console.error('Error fetching today\'s quote:', error);
            hideTypingIndicator();
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            return fallbackQuotes[dayOfYear % fallbackQuotes.length];
        }
    }

    // Function to display a quote
    function displayQuote(quote) {
        currentQuote = quote;
        quoteText.textContent = `"${quote.q}"`;
        quoteAuthor.textContent = `— ${quote.a}`;
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        
        setTimeout(() => {
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
        }, 100);
    }

    // Function to add a message to the chat history
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Function to handle voice input
    function handleVoiceInput() {
        if (!('webkitSpeechRecognition' in window)) {
            addMessage("Sorry, voice input is not supported in your browser.");
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
            voiceButton.classList.add('recording');
            addMessage("Listening...");
        };

        recognition.onend = () => {
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButton.classList.remove('recording');
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            userInput.value = text;
            handleUserInput();
        };

        recognition.start();
    }

    // Function to handle user input
    async function handleUserInput() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        showTypingIndicator();
        
        // Process user input
        const lowerText = text.toLowerCase();
        
        setTimeout(async () => {
            if (lowerText.includes('random quote') || lowerText.includes('another quote')) {
                const quote = await fetchRandomQuote();
                addMessage(`"${quote.q}" — ${quote.a}`);
                displayQuote(quote);
            } else if (lowerText.includes('today') || lowerText.includes('quote of the day')) {
                const quote = await fetchTodayQuote();
                addMessage(`Today's quote: "${quote.q}" — ${quote.a}`);
                displayQuote(quote);
            } else if (lowerText.includes('favorite') || lowerText.includes('favourites')) {
                favoritesPanel.style.display = favoritesPanel.style.display === 'none' ? 'block' : 'none';
                addMessage(favorites.length > 0 ? "Here are your favorite quotes!" : "You haven't saved any favorites yet.");
            } else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
                addMessage("I can help you with:\n- Random inspirational quotes\n- Quote of the day\n- Saving favorite quotes\n- Voice input\n- Dark/Light theme toggle\n- Just chat with me about inspiration!");
            } else {
                const quote = await fetchRandomQuote();
                addMessage("Here's an inspirational quote that might help:");
                addMessage(`"${quote.q}" — ${quote.a}`);
                displayQuote(quote);
            }
            hideTypingIndicator();
        }, 1000);
    }

    // Event listeners
    randomQuoteBtn.addEventListener('click', async () => {
        const quote = await fetchRandomQuote();
        displayQuote(quote);
        addMessage("Here's a random inspirational quote:");
        addMessage(`"${quote.q}" — ${quote.a}`);
    });

    todayQuoteBtn.addEventListener('click', async () => {
        const quote = await fetchTodayQuote();
        displayQuote(quote);
        addMessage("Here's the quote of the day:");
        addMessage(`"${quote.q}" — ${quote.a}`);
    });

    favoriteQuoteBtn.addEventListener('click', () => {
        if (currentQuote) {
            saveToFavorites(currentQuote);
        } else {
            addMessage("Please get a quote first before trying to save it to favorites.");
        }
    });

    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    voiceButton.addEventListener('click', handleVoiceInput);
    clearChatBtn.addEventListener('click', () => {
        chatHistory.innerHTML = '';
        addMessage("Chat history cleared!");
    });

    toggleThemeBtn.addEventListener('click', toggleTheme);

    notificationsBtn.addEventListener('click', () => {
        notificationsPanel.style.display = 
            notificationsPanel.style.display === 'none' ? 'block' : 'none';
        notificationsBtn.classList.remove('has-notifications');
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => handleCategorySelection(btn.dataset.category));
    });

    chatTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    copyQuoteBtn.addEventListener('click', copyQuoteToClipboard);
    shareQuoteBtn.addEventListener('click', shareQuote);

    closeModalBtn.addEventListener('click', () => {
        closeShareModal();
    });

    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });

    // Handle back button for modal
    window.addEventListener('popstate', () => {
        if (shareModal.style.display === 'block') {
            closeShareModal();
        }
    });

    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = encodeURIComponent(`"${currentQuote.q}" — ${currentQuote.a}`);
            const urls = {
                twitter: `https://twitter.com/intent/tweet?text=${text}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?quote=${text}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}&summary=${text}`,
                whatsapp: `https://wa.me/?text=${text}`
            };
            window.open(urls[btn.classList[1]], '_blank');
            addAchievement('Social Butterfly', 'Shared a quote on social media', 25);
        });
    });

    completeChallenge.addEventListener('click', () => {
        const today = new Date().toDateString();
        const challenge = JSON.parse(localStorage.getItem(`challenge_${today}`));
        challenge.completed = true;
        localStorage.setItem(`challenge_${today}`, JSON.stringify(challenge));
        completeChallenge.disabled = true;
        completeChallenge.textContent = 'Completed';
        updatePoints(challenge.points);
        addAchievement('Challenge Champion', 'Completed a daily challenge', 50);
    });

    chatSettings.addEventListener('click', () => {
        addNotification('Chat settings coming soon!', 'info');
    });

    // Initialize features
    updateNotifications();
    updateAchievements();
    setDailyChallenge();

    // Initial setup
    updateFavoritesList();
    addMessage("Hello! I'm your Quote Bot. I can provide inspirational quotes, save your favorites, and even listen to your voice! How can I inspire you today?");
});