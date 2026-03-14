import { useState, useRef, useEffect } from 'react'
import { getSuggestions } from '../data/parts'

export default function AutocompleteInput({ partKey, value, onChange, placeholder, className }) {
  const [open, setOpen]             = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [dropUp, setDropUp]         = useState(false)
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)

  const suggestions = getSuggestions(partKey, value)
  const showDropdown = open && suggestions.length > 0

  // Determine whether to open up or down based on available space
  const checkFlip = () => {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setDropUp(spaceBelow < 220)
  }

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setHighlighted(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (name) => {
    onChange(name)
    setOpen(false)
    setHighlighted(-1)
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, -1))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      pick(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="autocomplete-wrap" ref={wrapRef}>
      <input
        ref={inputRef}
        className={className}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        spellCheck={false}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlighted(-1); checkFlip() }}
        onFocus={() => { if (value) { setOpen(true); checkFlip() } }}
        onKeyDown={onKeyDown}
      />
      {showDropdown && (
        <ul className={`autocomplete-dropdown ${dropUp ? 'drop-up' : ''}`}>
          {suggestions.map((name, i) => (
            <li
              key={name}
              className={`autocomplete-item ${i === highlighted ? 'highlighted' : ''}`}
              onMouseDown={() => pick(name)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {highlightMatch(name, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="autocomplete-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}
