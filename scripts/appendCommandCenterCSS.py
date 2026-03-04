import os

css_chunk = """
/* ═══════════════════════════════════════════
   COMMAND CENTER LAYOUT (Customize Tab)
   ═══════════════════════════════════════════ */
.profile__pane--command {
  display: flex;
  gap: 20px;
  height: 600px; /* Fixed height for scrollable content */
  align-items: flex-start;
}

@media (max-width: 768px) {
  .profile__pane--command {
    flex-direction: column;
    height: auto;
  }
}

/* ── SIDEBAR ── */
.command-sidebar {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(10, 10, 16, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(20px);
}

@media (max-width: 768px) {
  .command-sidebar {
    flex: none;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 12px;
  }
  .command-sidebar::-webkit-scrollbar { height: 4px; }
  .command-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
}

.command-cat-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

@media (max-width: 768px) {
  .command-cat-btn {
    width: auto;
    white-space: nowrap;
    padding: 8px 12px;
  }
}

.command-cat-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.command-cat-btn.active {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  box-shadow: inset 3px 0 0 var(--accent);
}

@media (max-width: 768px) {
  .command-cat-btn.active {
    box-shadow: inset 0 -3px 0 var(--accent);
  }
}


/* ── CONTENT PANEL ── */
.command-content {
  flex: 1;
  background: rgba(10, 10, 16, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  position: relative;
}

/* Custom minimal scrollbar for command content */
.scrollbar-custom::-webkit-scrollbar { width: 6px; }
.scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
.scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

.command-panel h2 {
  font-size: 1.4rem;
  margin: 0 0 24px 0;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.animate-fade-in {
  animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Global Filter Overrides class based on custom settings */
.app-wrapper.filter-crt {
  animation: crtFlicker 0.15s infinite;
  box-shadow: inset 0 0 100px rgba(0,0,0,0.9);
}
@keyframes crtFlicker {
  0% { opacity: 0.98; }
  50% { opacity: 1; }
  100% { opacity: 0.99; }
}

.app-wrapper.cursor-crosshair { cursor: crosshair; }
.app-wrapper.cursor-sword { cursor: url('/sword-cursor.png'), auto; } /* Placeholder */

"""

with open('src/pages/ProfilePage.css', 'a', encoding='utf-8') as f:
    f.write(css_chunk)
print("Command Center CSS appended.")
