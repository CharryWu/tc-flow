import { useState, useEffect } from 'react';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
}

export function NumericInput({ value, onValueChange, ...props }: NumericInputProps) {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    // Sync from store only when the input isn't focused / empty
    const parsed = parseFloat(raw);
    if (raw.trim() === '' || parsed !== value) {
      if (raw.trim() !== '' || value !== 0) {
        setRaw(String(value));
      }
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const str = e.target.value;
    setRaw(str);
    const trimmed = str.trim();
    if (trimmed === '') {
      onValueChange(0);
    } else {
      const n = Number(trimmed);
      if (!isNaN(n)) {
        onValueChange(n);
      }
    }
  }

  return (
    <input
      {...props}
      type="number"
      value={raw}
      onChange={handleChange}
      onBlur={() => setRaw(String(value))}
    />
  );
}
