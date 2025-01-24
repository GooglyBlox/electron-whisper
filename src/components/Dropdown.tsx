import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full px-4 py-2.5 flex items-center justify-between
                   bg-gray-800 border border-gray-700 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-all duration-200
                   ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
                   ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
        disabled={disabled}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-100'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200
                     ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 
                      rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2.5 flex items-center justify-between
                          cursor-pointer transition-colors
                          ${option.value === value
                            ? 'bg-gray-700 text-gray-100'
                            : 'text-gray-300 hover:bg-gray-700'
                          }`}
              >
                <span className="block truncate">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;