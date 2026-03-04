import re

with open('src/pages/ProfilePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the levelBarStyle application for XPBar
xp_old = """<XPBar progress={stats.progress} accent={accent} style={custom.xpBarStyle} />"""
xp_new = """<div className="profile__level-bar" data-level-bar={custom.levelBarStyle}>
              <XPBar progress={stats.progress} accent={accent} style={custom.xpBarStyle} />
            </div>"""
content = content.replace(xp_old, xp_new)

# 2. To get closest achievement, we need it in the render block
closest_ach_logic = """
  // Next Closest Achievement Logic
  const nextAch = ACHIEVEMENTS.filter(a => !stats.unlockedAchievements?.[a.id])
    .map(a => ({ ...a, currProg: a.progress(xpData) }))
    .sort((a, b) => b.currProg - a.currProg)[0]

  // ─── Render ─── //
"""
content = content.replace("// ─── Render ─── //", closest_ach_logic)

# 3. Replace entire Overview pane
overview_old = re.search(r"\{\/\* ── OVERVIEW ── \*\/.*?profile__card-grid\">\s*(.*?)\s*<\/div>\s*<\/section>\s*\)\}\s*<\/div>\s*\)\}", content, re.DOTALL)

overview_new = """{/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="profile__pane profile__pane--bento">
              {/* Top half: 4 Bento Stat Cards */}
              <div className="profile__bento-stats">
                {[
                  { label: 'Games Played', value: animGames, icon: Gamepad2, color: '#22d3ee' },
                  { label: 'Playtime (Min)', value: animPlaytime, icon: Clock, color: '#8b5cf6' },
                  { label: 'Best Streak', value: stats.bestStreak, icon: Flame, color: '#f97316' },
                  { label: 'Achievements', value: `${stats.unlockedCount}/${stats.totalAchievements}`, icon: Award, color: '#fbbf24' }
                ].map((s, i) => (
                  <div key={i} className="profile__stat-card" style={{ '--stat-color': s.color }}>
                    <div className="profile__stat-icon" style={{ color: s.color, marginBottom: '12px' }}><s.icon size={28} /></div>
                    <span className="profile__stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{s.value}</span>
                    <span className="profile__stat-lbl" style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '4px' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Bottom half left: Next Achievement */}
              {nextAch && (
                <div className="profile__bento-next-ach">
                  <div className="profile__bento-header">
                    <Award size={16} /> <span>Up Next</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '2.5rem', opacity: 0.9 }}>{nextAch.icon}</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{nextAch.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{nextAch.desc}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                      <span>Progress</span>
                      <span style={{ color: 'var(--accent)' }}>{Math.floor(nextAch.currProg * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${nextAch.currProg * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom half right: Last Played (Mini) */}
              {lastPlayed && (
                <div className="profile__bento-next-ach" style={{ justifyContent: 'center', padding: '16px' }}>
                   <div className="profile__bento-header" style={{ marginBottom: '12px' }}>
                    <Zap size={16} /> <span>Jump Back In</span>
                  </div>
                  <GameCard game={lastPlayed} navigate={navigate} isFavorite={favorites.includes(lastPlayed.id)} toggleFavorite={toggleFavorite} onPlay={onPlayGame} />
                </div>
              )}
            </div>
          )}"""

content = re.sub(
    r"\{\/\* ── OVERVIEW ── \*\/.*?profile__card-grid\">\s*(.*?)\s*<\/div>\s*<\/section>\s*\)\}\s*<\/div>\s*\)\}",
    overview_new,
    content,
    flags=re.DOTALL
)

# Apply level-bar data attribute to profile container
content = content.replace('className="profile"', 'className="profile" data-level-bar={custom.levelBarStyle}')

with open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Overview Bento Grid Refactored.")
