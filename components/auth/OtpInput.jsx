'use client';

import React, { useRef, useEffect } from 'react';

/**
 * 6-digit accessible verification code input with auto-advance, backspace, and paste support.
 * @param {Object} props
 * @param {string} props.value - 6-digit code string.
 * @param {(code: string) => void} props.onChange - Change handler.
 * @param {boolean} [props.disabled=false] - Disabled state.
 * @param {boolean} [props.isError=false] - Error styling flag.
 */
export default function OtpInput({ value = '', onChange, disabled = false, isError = false }) {
  const inputsRef = useRef([]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (index, e) => {
    const char = e.target.value.slice(-1); // take latest char
    if (!/^\d*$/.test(char)) return; // numbers only

    const newDigits = [...digits];
    newDigits[index] = char;
    const newCode = newDigits.join('');
    onChange(newCode);

    // Auto-advance to next box if filled
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, 5);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          disabled={disabled}
          aria-label={`Digit ${idx + 1}`}
          className={`h-12 w-11 sm:h-14 sm:w-12 text-center font-mono text-xl font-black rounded-xl border transition-all duration-200 focus-visible:outline-none ${
            isError
              ? 'border-red-500/70 bg-red-500/10 text-red-400 focus-visible:ring-2 focus-visible:ring-red-500'
              : digits[idx]
              ? 'border-talent-teal/70 bg-talent-teal/10 text-talent-text shadow-glow-teal'
              : 'border-talent-border bg-talent-surface/80 text-talent-text hover:border-talent-border-hover focus-visible:border-talent-teal focus-visible:ring-2 focus-visible:ring-talent-teal'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}
