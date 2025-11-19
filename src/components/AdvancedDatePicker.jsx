import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../assets/css/advanced-date-picker.css';

const AdvancedDatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  className = "",
  disabled = false,
  minDate = null,
  maxDate = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'month', 'year'
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const dropdownHeight = 400; // Approximate height
        const viewportHeight = window.innerHeight;

        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX;

        // Adjust if dropdown would go off screen bottom
        if (top + dropdownHeight > viewportHeight + window.scrollY) {
          top = rect.top + window.scrollY - dropdownHeight - 5;
        }

        // Adjust if dropdown would go off screen right
        if (left + 280 > window.innerWidth + window.scrollX) {
          left = window.innerWidth + window.scrollX - 290;
        }

        // Only update position if it's different to prevent unnecessary re-renders
        setPosition(prev => {
          if (prev.top !== top || prev.left !== left) {
            return { top, left };
          }
          return prev;
        });
      }
    };

    if (isOpen) {
      // Use requestAnimationFrame to ensure DOM is updated before calculating position
      requestAnimationFrame(() => {
        updatePosition();
      });
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const generateYearRange = () => {
    const currentYear = currentDate.getFullYear();
    const years = [];
    // Show 12 years (4 rows × 3 columns) around current year
    for (let i = currentYear - 6; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const handleYearSelect = (year) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setViewMode('calendar');
  };

  const handleMonthSelect = (month) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setViewMode('calendar');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`advanced-date-picker ${className}`} ref={dropdownRef}>
      {label && <label className="form-label small fw-medium text-muted mb-1">{label}</label>}
      <div className="position-relative">
        <button
          ref={inputRef}
          type="button"
          className={`form-control d-flex align-items-center justify-content-between ${disabled ? 'bg-light' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={selectedDate ? 'text-dark' : 'text-muted'}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          <Icon
            icon="mdi:calendar"
            className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className="position-absolute"
            style={{
              position: 'fixed',
              top: position.top === -9999 ? '-9999px' : `${position.top}px`,
              left: position.left === -9999 ? '-9999px' : `${position.left}px`,
              minWidth: '280px',
              zIndex: 99999,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '300px',
              opacity: position.top === -9999 ? 0 : 1,
              transition: position.top === -9999 ? 'none' : 'opacity 0.1s ease-out',
              borderRadius: '12px'
            }}
          >
            {/* Header with View Navigation */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-1 d-flex align-items-center justify-content-center"
                onClick={() => {
                  if (viewMode === 'calendar') {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    if (!minDate || newDate >= minDate) {
                      navigateMonth(-1);
                    }
                  }
                  if (viewMode === 'month') {
                    const newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
                    if (!minDate || newDate >= minDate) {
                      setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
                    }
                  }
                  if (viewMode === 'year') {
                    const newDate = new Date(currentDate.getFullYear() - 10, currentDate.getMonth(), 1);
                    if (!minDate || newDate >= minDate) {
                      setCurrentDate(prev => new Date(prev.getFullYear() - 10, prev.getMonth(), 1));
                    }
                  }
                }}
                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                disabled={viewMode === 'calendar' && minDate && (() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  return newDate < minDate;
                })()}
              >
                <Icon icon="mdi:chevron-left" className="text-muted" />
              </button>
              
              <div className="d-flex align-items-center gap-1">
                {viewMode === 'calendar' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none px-2 py-1 h-auto fw-bold"
                      onClick={() => setViewMode('month')}
                      style={{ fontSize: '0.9rem', minWidth: 'auto' }}
                    >
                      {monthNames[currentDate.getMonth()]}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none px-2 py-1 h-auto fw-bold"
                      onClick={() => setViewMode('year')}
                      style={{ fontSize: '0.9rem', minWidth: 'auto' }}
                    >
                      {currentDate.getFullYear()}
                    </button>
                  </>
                )}
                {viewMode === 'month' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none px-2 py-1 h-auto fw-bold"
                      onClick={() => setViewMode('year')}
                      style={{ fontSize: '0.9rem', minWidth: 'auto' }}
                    >
                      {currentDate.getFullYear()}
                    </button>
                    <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Select Month</span>
                  </>
                )}
                {viewMode === 'year' && (
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Select Year</span>
                )}
              </div>
              
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-1 d-flex align-items-center justify-content-center"
                onClick={() => {
                  if (viewMode === 'calendar') {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    if (!maxDate || newDate <= maxDate) {
                      navigateMonth(1);
                    }
                  }
                  if (viewMode === 'month') {
                    const newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
                    if (!maxDate || newDate <= maxDate) {
                      setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
                    }
                  }
                  if (viewMode === 'year') {
                    const newDate = new Date(currentDate.getFullYear() + 10, currentDate.getMonth(), 1);
                    if (!maxDate || newDate <= maxDate) {
                      setCurrentDate(prev => new Date(prev.getFullYear() + 10, prev.getMonth(), 1));
                    }
                  }
                }}
                style={{ width: '32px', height: '32px', flexShrink: 0 }}
                disabled={viewMode === 'calendar' && maxDate && (() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  return newDate > maxDate;
                })()}
              >
                <Icon icon="mdi:chevron-right" className="text-muted" />
              </button>
            </div>

            {/* Content based on view mode */}
            <div className="p-3">
              {viewMode === 'calendar' && (
                <>
                  {/* Day headers */}
                  <div className="d-grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-muted small fw-medium py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="d-grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((date, index) => {
                      const disabled = isDateDisabled(date);
                      return (
                        <button
                          key={index}
                          type="button"
                          className={`
                            btn btn-sm border-0 rounded d-flex align-items-center justify-content-center
                            ${isDateSelected(date) ? 'bg-primary text-white' : ''}
                            ${!isCurrentMonth(date) ? 'text-muted' : 'text-dark'}
                            ${isToday(date) && !isDateSelected(date) ? 'bg-primary-light text-primary' : ''}
                            ${!isCurrentMonth(date) && isToday(date) ? 'bg-primary-light text-primary' : ''}
                            ${disabled ? 'text-muted bg-light cursor-not-allowed' : 'hover:bg-primary hover:text-white transition-colors'}
                          `}
                          onClick={() => handleDateSelect(date)}
                          disabled={disabled}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {viewMode === 'month' && (
                <div className="d-grid grid-cols-3 gap-2">
                  {monthNames.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      className={`
                        btn btn-sm border rounded d-flex align-items-center justify-content-center
                        ${currentDate.getMonth() === index ? 'bg-primary text-white' : 'btn-outline-primary text-primary'}
                        hover:bg-primary hover:text-white transition-colors
                      `}
                      onClick={() => handleMonthSelect(index)}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {viewMode === 'year' && (
                <div className="d-grid grid-cols-3 gap-2">
                  {generateYearRange().map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`
                        btn btn-sm border rounded d-flex align-items-center justify-content-center
                        ${currentDate.getFullYear() === year ? 'bg-primary text-white' : 'btn-outline-primary text-primary'}
                        hover:bg-primary hover:text-white transition-colors
                      `}
                      style={{ minHeight: '36px', fontWeight: '500' }}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <button
                type="button"
                className={`btn btn-sm btn-link text-decoration-none ${minDate && new Date() < minDate ? 'text-muted' : 'text-muted'} px-2 py-1`}
                onClick={() => {
                  const today = new Date();
                  if (minDate && today < minDate) return;
                  setCurrentDate(today);
                  setSelectedDate(today);
                  onChange(today.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                disabled={minDate && new Date() < minDate}
              >
                Today
              </button>
              <div className="d-flex gap-1">
                {viewMode !== 'calendar' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary px-3 py-1 fw-medium"
                    onClick={() => setViewMode('calendar')}
                    style={{ minHeight: '32px' }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-primary px-3 py-1 fw-medium"
                  onClick={() => setIsOpen(false)}
                  style={{ minHeight: '32px' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDatePicker;