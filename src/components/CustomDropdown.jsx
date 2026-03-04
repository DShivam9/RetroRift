import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useRetroAudio } from '../hooks/useRetroAudio'
import './CustomDropdown.css'

export default function CustomDropdown({ options, value, onChange, placeholder = "Select option" }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const { playBlip, playClick } = useRetroAudio()

    const selectedOption = options.find(o => o.id === value)

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <button
                className={`custom-dropdown__trigger ${isOpen ? 'open' : ''}`}
                onClick={() => { playClick(); setIsOpen(!isOpen) }}
                onMouseEnter={playBlip}
                type="button"
            >
                <span className="custom-dropdown__trigger-label">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className="custom-dropdown__icon" />
            </button>

            {isOpen && (
                <div className="custom-dropdown__menu animate-dropdown">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={`custom-dropdown__item ${value === opt.id ? 'selected' : ''}`}
                            onMouseEnter={playBlip}
                            onClick={() => {
                                playClick()
                                onChange(opt.id)
                                setIsOpen(false)
                            }}
                        >
                            <span className="custom-dropdown__item-label">{opt.label}</span>
                            {value === opt.id && <Check size={14} className="custom-dropdown__check" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
