import React from 'react'
import { motion } from 'framer-motion'
import { 
  Gamepad2, Award, Zap, History, Clock, 
  Calendar, ChevronRight, Share2, Activity
} from 'lucide-react'
import { timeAgo } from '../../lib/xpEngine'
import './ActivityFeed.css'

const ActivityCard = ({ log, index }) => {
  const isAchievement = log.reason.toLowerCase().includes('achievement') || log.reason.toLowerCase().includes('trophy')
  const isLevelUp = log.reason.toLowerCase().includes('level') || log.reason.toLowerCase().includes('reached')
  const isGame = log.reason.toLowerCase().includes('played') || log.reason.toLowerCase().includes('game')

  const getIcon = () => {
    if (isAchievement) return <Award size={18} className="icon-ach" />
    if (isLevelUp) return <Zap size={18} className="icon-lvl" />
    if (isGame) return <Gamepad2 size={18} className="icon-game" />
    return <History size={18} className="icon-default" />
  }

  const getTypeLabel = () => {
    if (isAchievement) return 'ACHIEVEMENT UNLOCKED'
    if (isLevelUp) return 'LEVEL UP'
    if (isGame) return 'GAME SESSION'
    return 'ACTIVITY'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`activity-card ${isAchievement ? 'card-ach' : ''} ${isLevelUp ? 'card-lvl' : ''}`}
    >
      <div className="activity-card__side">
        <div className="activity-icon-wrap">
          {getIcon()}
          <div className="icon-glow" />
        </div>
        <div className="activity-line" />
      </div>

      <div className="activity-card__main">
        <div className="activity-header">
          <span className="activity-type">{getTypeLabel()}</span>
          <span className="activity-time">{timeAgo(log.timestamp)}</span>
        </div>
        
        <div className="activity-body">
          <h4 className="activity-title">{log.reason}</h4>
          {log.amount && (
            <div className="activity-reward">
              <Zap size={12} fill="currentColor" />
              <span>+{log.amount} XP gained</span>
            </div>
          )}
        </div>

        <div className="activity-footer">
           <div className="activity-meta">
              <Clock size={12} />
              <span>Verified Session</span>
           </div>
           <button className="activity-share">
              <Share2 size={12} />
           </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ActivityFeed({ logs = [] }) {
  // Group logs by date (simple grouping for now)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp)

  if (logs.length === 0) {
    return (
      <div className="activity-empty">
        <div className="empty-visual">
          <div className="pulse-ring" />
          <History size={48} strokeWidth={1} />
        </div>
        <h3>Neural Log Empty</h3>
        <p>Your journey hasn't been recorded yet. Start playing to build your legacy.</p>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <div className="feed-title">
          <Activity size={20} />
          <h3>Activity Timeline</h3>
        </div>
        <div className="feed-stats">
          <span>{logs.length} Entries</span>
        </div>
      </div>

      <div className="activity-list">
        {sortedLogs.map((log, i) => (
          <ActivityCard key={i} log={log} index={i} />
        ))}
      </div>
    </div>
  )
}
