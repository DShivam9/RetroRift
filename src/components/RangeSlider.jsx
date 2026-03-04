import React from 'react'
import './RangeSlider.css'

/**
 * RangeSlider — Themed slider with gradient track and value label
 * @param {number} value — current value
 * @param {function} onChange — callback with new value
 * @param {number} [min] @param {number} [max] @param {number} [step]
 * @param {string} [color] — accent color
 * @param {string} [label] — what this slider controls
 * @param {string} [unit] — display unit (%, x, etc.)
 */
export default function RangeSlider({
    value, onChange, min = 0, max = 100, step = 1,
    color = '#8b5cf6', label, unit = '', disabled = false
}) {
    const percent = ((value - min) / (max - min)) * 100

    return (
        <div className={`range-slider ${disabled ? 'range-slider--disabled' : ''}`} style={{ '--slider-color': color }}>
            {label && (
                <div className="range-slider__header">
                    <span className="range-slider__label">{label}</span>
                    <span className="range-slider__value" style={{ color }}>{value}{unit}</span>
                </div>
            )}
            <div className="range-slider__track-wrap">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => !disabled && onChange?.(Number(e.target.value))}
                    className="range-slider__input"
                    style={{ '--fill': `${percent}%` }}
                />
                <div className="range-slider__glow" style={{ left: `${percent}%` }} />
            </div>
        </div>
    )
}
