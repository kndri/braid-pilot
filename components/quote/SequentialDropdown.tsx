import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SequentialDropdownProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  isVisible: boolean;
  isDisabled?: boolean;
}

export function SequentialDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  isVisible,
  isDisabled = false,
}: SequentialDropdownProps) {
  if (!isVisible) return null;
  
  return (
    <div className="animate-fadeIn">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          className={`
            w-full px-4 py-3 pr-10 text-gray-900 bg-white border rounded-lg 
            appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${!value ? 'text-gray-400' : 'text-gray-900'}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-gray-900">
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}