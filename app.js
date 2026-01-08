// 1. CONFIGURATION
const sources = [
    // --- GITHUB READERS (These open in your Popup) ---
    {
        id: 'speedyapply',
        type: 'reader', // Opens in popup
        name: 'SpeedyApply: 2026 AI Jobs',
        description: 'Collection of AI and tech internships for the 2026 season.',
        // Converted to RAW URL:
        url: 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md',
        originalLink: 'https://github.com/speedyapply/2026-AI-College-Jobs'
    },
    {
        id: 'pittcsc',
        type: 'reader',
        name: 'Pitt CSC - Summer 2026',
        description: 'The standard list. Official Pitt Computer Science Club repository.',
        url: 'https://raw.githubusercontent.com/pittcsc/Summer2024-Internships/dev/README.md',
        originalLink: 'https://github.com/pittcsc/Summer2024-Internships'
    },

    // --- EXTERNAL SITES (These open in New Tab) ---
    {
        id: 'nsf-reu',
        type: 'external', // Opens new tab
        name: 'NSF REU Search',
        description: 'Research Experiences for Undergraduates. Essential for research positions.',
        url: 'https://www.nsf.gov/funding/initiatives/reu/search'
    },
    {
        id: 'energy-gov',
        type: 'external',
        name: 'Dept. of Energy',
        description: 'DOE internships and fellowships (SULI, CCI, etc).',
        url: 'https://www.energy.gov/internships-fellowships'
    },
    {
        id: 'jhu-apl',
        type: 'external',
        name: 'JHU Applied Physics Lab',
        description: 'Internships at Johns Hopkins APL.',
        url: 'https://careers.jhuapl.edu/jobs?keywords=intern&sortBy=relevance&page=1'
    },
    {
        id: 'zintellect',
        type: 'external',
        name: 'Zintellect (ORISE)',
        description: 'Catalog of STEM internships and fellowships for government agencies.',
        url: 'https://www.zintellect.com/Catalog'
    },
    {
        id: '80000',
        type: 'external',
        name: '80,000 Hours',
        description: 'High-impact careers and internships focused on solving global problems.',
        url: 'https://jobs.80000hours.org/?jobPk=17376&refinementList%5Btags_role_type%5D%5B0%5D=Internship&refinementList%5Btags_location_80k%5D%5B0%5D=USA'
    },
    {
        id: 'levelsfyi',
        type: 'external',
        name: 'Levels.fyi Internships',
        description: 'Internship compensation data and job listings.',
        url: 'https://www.levels.fyi/internships/'
    }
];

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
});

// 3. RENDER THE PREVIEW GRID
function renderGrid() {
    const grid = document.getElementById('grid-container');
    grid.innerHTML = ''; 

    sources.forEach(source => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Visual cue for external links (adding an arrow icon if it's external)
        const icon = source.type === 'external' ? '↗' : '📄';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${source.name}</h3>
                <span style="color:var(--accent); font-size:1.2rem;">${icon}</span>
            </div>
            <p>${source.description}</p>
        `;

        // Click Logic based on Type
        if (source.type === 'external') {
            card.onclick = () => window.open(source.url, '_blank');
        } else {
            card.onclick = () => openPopup(source);
        }

        grid.appendChild(card);
    });
}

// 4. POPUP LOGIC (Only for 'reader' types)
const popup = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');
const popupTitle = document.getElementById('popup-title');
const popupLink = document.getElementById('popup-link');

async function openPopup(source) {
    // Show UI
    popup.style.display = 'flex';
    popupTitle.innerText = source.name;
    popupLink.href = source.originalLink;
    
    // Show Loading State
    popupContent.innerHTML = '<div style="text-align:center; padding:50px;">Loading Data...</div>';

    try {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error('Network response was not ok');
        const markdownText = await response.text();
        const rawHtml = marked.parse(markdownText);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        popupContent.innerHTML = cleanHtml;
    } catch (error) {
        popupContent.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Error loading data: ${error.message}</div>`;
    }
}

function closePopup() {
    popup.style.display = 'none';
    popupContent.innerHTML = ''; 
}
