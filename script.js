// Basic interactivity for Creator OS dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Content Planner functionality
    const plannerForm = document.querySelector('.planner-form');
    const inputField = document.querySelector('.input-field');
    const plannedContent = document.querySelector('.planned-content');

    if (plannerForm && inputField && plannedContent) {
        plannerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contentIdea = inputField.value.trim();
            if (contentIdea) {
                // Create new planned item
                const plannedItem = document.createElement('div');
                plannedItem.className = 'planned-item';
                
                const date = new Date();
                const tomorrow = new Date(date);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                plannedItem.innerHTML = `
                    <span class="planned-date">${dateStr}</span>
                    <p>${contentIdea}</p>
                `;
                
                plannedContent.appendChild(plannedItem);
                inputField.value = '';
            }
        });
    }

    // Simulate real-time updates (for demo purposes)
    function updateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            // Add subtle animation on page load
            stat.style.opacity = '0';
            setTimeout(() => {
                stat.style.transition = 'opacity 0.5s';
                stat.style.opacity = '1';
            }, 100);
        });
    }

    updateStats();
});
