/**
 * DATA VIEW PRO - INTERNSHIP PORTAL ENGINE
 * v75.0 (Full Integration)
 */

// --- 1. GLOBAL VARIABLES ---
let views = [];
let currentView = null;
let currentRowIndex = 0;

const iconLeft = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="white" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
const iconRight = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="white" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

// --- 2. CSS INJECTION (Automatic Styling) ---
const stylePatch = document.createElement('style');
stylePatch.innerHTML = `
  /* Dark Overlay for Modals */
  .portal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.95);
    z-index: 1000;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: fadeIn 0.2s ease-out;
  }
  
  /* The Table Container */
  .table-modal {
    width: 90%; max-width: 1200px; margin: 40px auto;
    background: white; border-radius: 16px;
    display: flex; flex-direction: column;
    height: 85%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  /* Modal Header */
  .modal-header {
    padding: 20px 30px; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc; border-radius: 16px 16px 0 0;
  }

  /* Scrollable Table Area */
  .scroll-area { overflow-y: auto; flex: 1; padding: 0; }
  
  /* The Data Table */
  .job-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
  .job-table th { position: sticky; top: 0; background: #f1f5f9; padding: 15px; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
  .job-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; color: #334155; cursor: pointer; }
  .job-table tr:hover td { background: #e0f2fe; color: #0284c7; }
  
  /* Home Screen Cards */
  .portal-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; padding: 40px;
  }
  .portal-card {
    background: white; border-radius: 16px; padding: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    cursor: pointer; transition: all 0.2s;
    border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; text-align: center;
  }
  .portal-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border-color: #3b82f6; }
  .portal-icon { font-size: 3rem; margin-bottom: 16px; background: #f1f5f9; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(stylePatch);


// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    refreshGlobalData();
});

function refreshGlobalData() {
    // 1. Try to load local cache first for speed
    const saved = localStorage.getItem('dataView_cache');
    if (saved) {
        views = JSON.parse(saved);
        renderHome();
    }

    // 2. Fetch fresh data from your GitHub Action output
    // Note: This path matches the folder structure we discussed (data/internships.json)
    fetch('./data/internships.json')
        .then(response => {
            if (!response.ok) throw new Error("No data file found");
            return response.json();
        })
        .then(serverData => {
            console.log("Updated data received:", serverData);
            views = serverData; // Overwrite with fresh data
            localStorage.setItem('dataView_cache', JSON.stringify(views));
            renderHome(); // Re-render with new data
        })
        .catch(err => {
            console.log("Using cached data or offline mode.", err);
            if(views.length === 0) renderEmptyState();
        });
}


// --- 4. RENDER HOME (The Desktop) ---
function renderHome() {
    currentView = null;
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="home-container">
            <h1 class="main-heading">Internship Portals</h1>
            <p style="text-align:center; color:#64748b; margin-bottom:40px;">Live Data Feeds</p>
            
            <div class="portal-grid" id="view-list"></div>
        </div>`;

    const list = document.getElementById('view-list');
    
    if (views.length === 0) return renderEmptyState();

    views.forEach(v => {
        const card = document.createElement('div');
        card.className = 'portal-card';
        card.innerHTML = `
            <div class="portal-icon">⚡</div>
            <h3 style="margin:0; font-size:1.2rem; font-weight:700; color:#0f172a;">${v.name}</h3>
            <span style="color:#64748b; font-size:0.9rem; margin-top:8px;">${v.data.length} Active Listings</span>
            <div style="margin-top:15px; color:#3b82f6; font-size:0.85rem; font-weight:600;">CLICK TO BROWSE →</div>
        `;
        card.onclick = () => openTablePopup(v.createdAt);
        list.appendChild(card);
    });
}

function renderEmptyState() {
    document.getElementById('view-list').innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#94a3b8;">
            <h2>No Data Found</h2>
            <p>Waiting for scraper to run...</p>
        </div>`;
}


// --- 5. LEVEL 2: THE TABLE POPUP ---
function openTablePopup(id) {
    currentView = views.find(v => v.createdAt == id);
    if(!currentView) return;

    // Use headers from JSON or fallback to keys
    const headers = currentView.headers || Object.keys(currentView.data[0] || {});
    
    // Build Headers HTML
    const thHTML = headers.map(h => `<th>${h}</th>`).join('');

    // Build Rows HTML
    const rowsHTML = currentView.data.map((row, idx) => {
        return `<tr onclick="openSlideView(${idx})">
            ${headers.map(h => {
                let val = row[h] || '-';
                // Visual cleanup for links in table view
                if(String(val).startsWith('http')) {
                    val = '<span style="color:#3b82f6; text-decoration:underline;">View Link ↗</span>';
                }
                // Truncate long text
                if(val.length > 50 && !val.includes('<span')) val = val.substring(0,47) + '...';
                return `<td>${val}</td>`;
            }).join('')}
        </tr>`;
    }).join('');

    // Create Modal
    const modal = document.createElement('div');
    modal.className = 'portal-overlay';
    modal.id = 'table-overlay';
    modal.innerHTML = `
        <div class="table-modal">
            <div class="modal-header">
                <div>
                    <h2 style="margin:0; font-size:1.5rem; color:#0f172a;">${currentView.name}</h2>
                    <span style="color:#64748b; font-size:0.9rem;">Select a row to view details</span>
                </div>
                <button class="blue-btn" style="background:#ef4444; width:auto; padding:8px 20px;" onclick="closeTablePopup()">Close</button>
            </div>
            <div class="scroll-area">
                <table class="job-table">
                    <thead><tr>${thHTML}</tr></thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeTablePopup() {
    const el = document.getElementById('table-overlay');
    if(el) el.remove();
}


// --- 6. LEVEL 3: THE SLIDE DETAIL VIEW ---
function openSlideView(rowIndex) {
    currentRowIndex = rowIndex;
    
    const slideOverlay = document.createElement('div');
    slideOverlay.className = 'portal-overlay';
    slideOverlay.id = 'slide-overlay';
    
    // Note: We reuse your layout engine here
    slideOverlay.innerHTML = `
        <div class="presentation-fullscreen" style="background:${currentView.canvasBg || '#ffffff'};">
            <button onclick="closeSlideView()" style="position:absolute; top:20px; left:20px; z-index:2000; padding:10px 20px; background:#0f172a; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">← Back to List</button>
            
            <div class="slide-fit" id="modal-slide-canvas">
                </div>

            <div class="presentation-nav">
                <button onclick="navigateSlide(-1)">${iconLeft}</button>
                <span id="modal-counter" style="color:black; font-weight:bold; min-width:80px; text-align:center;">
                    ${currentRowIndex+1} / ${currentView.data.length}
                </span>
                <button onclick="navigateSlide(1)">${iconRight}</button>
            </div>
        </div>
    `;
    document.body.appendChild(slideOverlay);
    renderSlideContentInModal();
    
    // Keyboard navigation support
    window.onkeydown = (e) => {
        if(document.getElementById('slide-overlay')) {
            if(e.key === 'ArrowRight') navigateSlide(1);
            if(e.key === 'ArrowLeft') navigateSlide(-1);
            if(e.key === 'Escape') closeSlideView();
        }
    };
}

function closeSlideView() {
    const el = document.getElementById('slide-overlay');
    if(el) el.remove();
    // Remove keyboard listener to prevent conflicts
    window.onkeydown = null;
}

function navigateSlide(dir) {
    const newIdx = currentRowIndex + dir;
    if (newIdx >= 0 && newIdx < currentView.data.length) {
        currentRowIndex = newIdx;
        renderSlideContentInModal();
        document.getElementById('modal-counter').innerText = `${currentRowIndex+1} / ${currentView.data.length}`;
    }
}

function renderSlideContentInModal() {
    const canvas = document.getElementById('modal-slide-canvas'); 
    if (!canvas) return; 
    canvas.innerHTML = '';
    
    const row = currentView.data[currentRowIndex] || {};
    
    currentView.boxes.forEach((box) => {
        const div = document.createElement('div'); 
        div.className = 'box-instance';
        div.style.cssText = `left:${(box.x/6)*100}%; top:${(box.y/4)*100}%; --w-pct:${(box.w/6)*100}%; --h-pct:${(box.h/4)*100}%; background:${box.bgColor}; color:${box.textColor};`;
        
        let val = box.isVar ? (row[box.textVal] || '---') : box.textVal;
        
        // --- SMART LINK RENDERING ---
        let contentHtml = val;
        // If it looks like a URL, make it a button
        if (typeof val === 'string' && val.startsWith('http')) {
             contentHtml = `<a href="${val}" target="_blank" style="
                display:inline-block; 
                margin-top:10px;
                background:rgba(255,255,255,0.2); 
                border:1px solid currentColor;
                padding:8px 16px; 
                border-radius:6px;
                color:inherit; 
                text-decoration:none; 
                font-weight:bold;
                pointer-events:auto;">OPEN APPLICATION ↗</a>`;
        }
        
        div.innerHTML = `<div class="box-title" style="color:${box.textColor}; opacity:0.8; margin-bottom:5px;">${box.title}</div>
                         <div class="box-content" style="font-size:${box.fontSize}px;">${contentHtml}</div>`;
        
        // Prevent clicking the box from doing anything (unless it's a link)
        if(String(val).startsWith('http')) {
             div.onclick = (e) => e.stopPropagation();
        }

        canvas.appendChild(div);
    });
}
