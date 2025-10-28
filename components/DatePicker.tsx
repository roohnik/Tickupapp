import React from 'react';

interface DatePickerProps {
    value: string; // ISO string
    onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            // The input value is 'YYYY-MM-DD'. This represents a specific date.
            // To store it consistently and avoid timezone issues, we convert it to
            // a UTC midnight ISO string.
            const [year, month, day] = dateValue.split('-').map(Number);
            const newDate = new Date(Date.UTC(year, month - 1, day));
            onChange(newDate.toISOString());
        } else {
            onChange(''); // Clear the date if the input is cleared
        }
    };
    
    // The value from the state is a UTC ISO string (e.g., '2024-07-25T00:00:00.000Z').
    // The date input needs 'YYYY-MM-DD'. We can safely slice the ISO string.
    const inputValue = value ? value.substring(0, 10) : '';

    return (
        <input
            type="date"
            value={inputValue}
            onChange={handleDateInputChange}
            className="w-full text-sm font-medium p-0 border-none bg-transparent focus:ring-0"
        />
    );
};

export default DatePicker;
