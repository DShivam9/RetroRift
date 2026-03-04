import React from 'react'
import './ToggleSwitch.css'

/**
 * ToggleSwitch — Animated iOS-style toggle with glow
 * @param {boolean} checked
 * @param {function} onChange
 * @param {string} [color] — accent color (CSS color)
 * @param {string} [size] — 'sm' | 'md'
 */
export default function ToggleSwitch({ checked, onChange, color = '#8b5cf6', size = 'md', disabled = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`toggle-switch ${checked ? 'toggle-switch--on' : ''} toggle-switch--${size} ${disabled ? 'toggle-switch--disabled' : ''}`}
            style={{ '--toggle-color': color }}
            onClick={() => !disabled && onChange?.(!checked)}
        >
            <span className="toggle-switch__track" />
            <span className="toggle-switch__thumb">
                {checked && <span className="toggle-switch__glow" />}
            </span>
        </button>
    )
}
