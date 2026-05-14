// Data Management
let appData = {
    username: 'Learner',
    skills: [],
    badges: {
        bronze: false,
        silver: false,
        gold: false,
        diamond: false,
        onFire: false,
        rocket: false,
        master: false
    },
    stats: {
        totalStars: 0,
        totalSkips: 0
    }
};

const BADGES_CONFIG = [
    { id: 'bronze', name: 'Bronze Star', icon: '🥉', condition: 'Reach Level 2', requirementType: 'level', requirementValue: 2 },
    { id: 'silver', name: 'Silver Star', icon: '🥈', condition: 'Reach Level 5', requirementType: 'level', requirementValue: 5 },
    { id: 'gold', name: 'Gold Star', icon: '🥇', condition: 'Reach Level 8', requirementType: 'level', requirementValue: 8 },
    { id: 'diamond', name: 'Diamond', icon: '💎', condition: 'Reach Level 10', requirementType: 'level', requirementValue: 10 },
    { id: 'onFire', name: 'On Fire', icon: '🔥', condition: 'Get 5+ stars in one skill', requirementType: 'singleSkillStars', requirementValue: 5 },
    { id: 'rocket', name: 'Rocket', icon: '🚀', condition: 'Skip 3+ levels', requirementType: 'totalSkips', requirementValue: 3 },
    { id: 'master', name: 'Master', icon: '👑', condition: 'Complete 5 skills at Level 10', requirementType: 'completedSkills', requirementValue: 5 }
];

let currentSkillId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAll();
});

// Load Data from LocalStorage
function loadData() {
    const saved = localStorage.getItem('progressLearningHackData');
    if (saved) {
        appData = JSON.parse(saved);
    }
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('progressLearningHackData', JSON.stringify(appData));
}

// Render Everything
function renderAll() {
    renderStats();
    renderSkills();
    renderBadges();
}

// Render Dashboard Stats
function renderStats() {
    document.getElementById('totalStars').textContent = appData.stats.totalStars;
    document.getElementById('skillsCount').textContent = appData.skills.length;
    
    let badgesEarned = Object.values(appData.badges).filter(b => b).length;
    document.getElementById('badgesCount').textContent = badgesEarned;
    
    // Calculate streak (simplified - could be enhanced)
    let maxLevel = 0;
    appData.skills.forEach(skill => {
        if (skill.level > maxLevel) maxLevel = skill.level;
    });
    document.getElementById('streak').textContent = maxLevel;
}

// Render Skills
function renderSkills() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';

    if (appData.skills.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; grid-column: 1 / -1;">No skills yet. Add one to get started! 🚀</p>';
        return;
    }

    appData.skills.forEach(skill => {
        const skillCard = createSkillCard(skill);
        container.appendChild(skillCard);
    });
}

// Create Skill Card
function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const starsArray = Array(5).fill('⭐').map((star, i) => 
        i < skill.currentStars ? '<span class="star-filled">⭐</span>' : '<span class="star-empty">☆</span>'
    ).join('');

    const progressPercentage = (skill.currentStars / 5) * 100;

    card.innerHTML = `
        <div class="skill-header">
            <div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-category">${skill.category}</div>
            </div>
            <button class="delete-btn" onclick="deleteSkill('${skill.id}')">✕</button>
        </div>
        <div class="skill-level">
            <div class="level-label">Level</div>
            <div class="level-display">${skill.level}</div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="stars-display">${starsArray}</div>
        <div style="text-align: center; color: #94a3b8; font-size: 0.9em; margin-bottom: 15px;">
            ${skill.currentStars}/5 stars to next level
        </div>
        <div class="skill-buttons">
            <button class="btn-award" onclick="openAwardStarsModal('${skill.id}', '${skill.name}')">⭐ Award Stars</button>
            <button class="btn-skip" onclick="skipLevel('${skill.id}')">⏭️ Skip Level</button>
        </div>
    `;

    return card;
}

// Render Badges
function renderBadges() {
    const container = document.getElementById('badgesContainer');
    container.innerHTML = '';

    BADGES_CONFIG.forEach(badge => {
        const isUnlocked = appData.badges[badge.id];
        const badgeEl = document.createElement('div');
        badgeEl.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
        badgeEl.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            ${!isUnlocked ? `<div style="font-size: 0.75em; color: #64748b; margin-top: 8px;">${badge.condition}</div>` : ''}
        `;
        container.appendChild(badgeEl);
    });
}

// Add Skill
function addSkill() {
    const name = document.getElementById('skillName').value.trim();
    const category = document.getElementById('skillCategory').value;

    if (!name) {
        showNotification('Please enter a skill name!', 'error');
        return;
    }

    const skill = {
        id: Date.now().toString(),
        name: name,
        category: category,
        level: 1,
        currentStars: 0,
        createdAt: new Date().toISOString()
    };

    appData.skills.push(skill);
    saveData();
    renderAll();
    closeAddSkillModal();
    showNotification(`✨ Added new skill: ${name}!`);
}

// Delete Skill
function deleteSkill(skillId) {
    if (confirm('Are you sure you want to delete this skill?')) {
        appData.skills = appData.skills.filter(s => s.id !== skillId);
        saveData();
        renderAll();
        showNotification('Skill deleted');
    }
}

// Award Stars
function awardStars(stars) {
    const skill = appData.skills.find(s => s.id === currentSkillId);
    if (!skill) return;

    skill.currentStars += stars;
    appData.stats.totalStars += stars;

    // Check for level up
    while (skill.currentStars >= 5) {
        skill.currentStars -= 5;
        skill.level += 1;
        showNotification(`🎉 Level up! ${skill.name} is now Level ${skill.level}!`);
    }

    checkBadges();
    saveData();
    renderAll();
    closeAwardStarsModal();
    showNotification(`⭐ Awarded ${stars} stars to ${skill.name}!`);
}

// Skip Level
function skipLevel(skillId) {
    const skill = appData.skills.find(s => s.id === skillId);
    if (!skill) return;

    if (skill.level >= 10) {
        showNotification('Already at max level! 🏆', 'error');
        return;
    }

    skill.level += 1;
    appData.stats.totalSkips += 1;

    checkBadges();
    saveData();
    renderAll();
    showNotification(`⏭️ Skipped to Level ${skill.level}!`);
}

// Check Badges
function checkBadges() {
    BADGES_CONFIG.forEach(badge => {
        if (appData.badges[badge.id]) return; // Already unlocked

        let unlocked = false;

        if (badge.requirementType === 'level') {
            unlocked = appData.skills.some(s => s.level >= badge.requirementValue);
        } else if (badge.requirementType === 'singleSkillStars') {
            unlocked = appData.skills.some(s => s.currentStars >= badge.requirementValue);
        } else if (badge.requirementType === 'totalSkips') {
            unlocked = appData.stats.totalSkips >= badge.requirementValue;
        } else if (badge.requirementType === 'completedSkills') {
            let completed = appData.skills.filter(s => s.level >= 10).length;
            unlocked = completed >= badge.requirementValue;
        }

        if (unlocked) {
            appData.badges[badge.id] = true;
            showNotification(`🏅 Unlocked Badge: ${badge.name}!`);
        }
    });
}

// Modal Functions
function openAddSkillModal() {
    document.getElementById('addSkillModal').classList.add('show');
    document.getElementById('skillName').focus();
}

function closeAddSkillModal() {
    document.getElementById('addSkillModal').classList.remove('show');
    document.getElementById('skillName').value = '';
    document.getElementById('skillCategory').value = 'Programming';
}

function openAwardStarsModal(skillId, skillName) {
    currentSkillId = skillId;
    document.getElementById('currentSkillName').textContent = skillName;
    document.getElementById('awardStarsModal').classList.add('show');
}

function closeAwardStarsModal() {
    document.getElementById('awardStarsModal').classList.remove('show');
    currentSkillId = null;
}

function openSettingsModal() {
    document.getElementById('username').value = appData.username;
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

function saveUsername() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        appData.username = username;
        saveData();
        closeSettingsModal();
        showNotification(`Welcome, ${username}! 👋`);
    }
}

function resetData() {
    if (confirm('⚠️ Are you sure you want to reset ALL data? This cannot be undone!')) {
        appData = {
            username: 'Learner',
            skills: [],
            badges: {
                bronze: false,
                silver: false,
                gold: false,
                diamond: false,
                onFire: false,
                rocket: false,
                master: false
            },
            stats: {
                totalStars: 0,
                totalSkips: 0
            }
        };
        localStorage.removeItem('progressLearningHackData');
        renderAll();
        closeSettingsModal();
        showNotification('All data reset! 🔄');
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#ef4444' : '#10b981';
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const addSkillModal = document.getElementById('addSkillModal');
    const awardStarsModal = document.getElementById('awardStarsModal');
    const settingsModal = document.getElementById('settingsModal');

    if (event.target === addSkillModal) {
        closeAddSkillModal();
    }
    if (event.target === awardStarsModal) {
        closeAwardStarsModal();
    }
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeAddSkillModal();
        closeAwardStarsModal();
        closeSettingsModal();
    }
});
