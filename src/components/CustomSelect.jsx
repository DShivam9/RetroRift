import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import './CustomSelect.css'

export default function CustomSelect({ value, onChange, options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={`custom-select ${className}`} ref={selectRef}>
      <button 
        className={`custom-select__trigger ${isOpen ? 'custom-select__trigger--open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="custom-select__label">{selectedOption?.label}</span>
        <ChevronDown size={16} className={`custom-select__icon ${isOpen ? 'custom-select__icon--open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="custom-select__dropdown">
          {options.map((option) => (
            <div 
              key={option.value}
              className={`custom-select__option ${value === option.value ? 'custom-select__option--selected' : ''}`}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
