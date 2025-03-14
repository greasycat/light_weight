import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Unit } from "../../lib/models/exercise";

interface NumberInputOneLineProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  divClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  placeholder?: string;
  text?: string;
}

const NumberInputOneLine: React.FC<NumberInputOneLineProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  divClassName,
  inputClassName,
  iconClassName,
  textClassName,
  placeholder,
  text,
}) => {
  return (
    <div className={`${divClassName}`}>
      <div className={`${iconClassName}`}>
        <MinusIcon className="w-6 h-6" onClick={onDecrement} />
      </div>

      <span className={`${textClassName}`}>{text}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode="decimal"
        className={`${inputClassName}`}
      />
      <div className={`${iconClassName}`}>
        <PlusIcon className="w-6 h-6" onClick={onIncrement} />
      </div>
    </div>
  );
};

interface WeightNumberInputProps {
  weight: string;
  textColor?: string;
  text?: string;
  placeholder?: string;
  className?: string;
  unit: Unit;
  incrementValues?: number[];
  onWeightChange: (value: string) => void;
  onUnitChange: (unit: Unit) => void;
}

const WeightNumberInput: React.FC<WeightNumberInputProps> = ({
  weight,
  className = "w-full",
  textColor = "text-neutral-700",
  text = "Weight",
  placeholder,
  unit = Unit.Metric,
  incrementValues = [-5, -2.5, 2.5, 5],
  onWeightChange,
  onUnitChange,
}) => {
  const adjustWeight = (amount: number) => {
    const newValue = parseFloat((parseFloat(weight) + amount).toFixed(1));
    onWeightChange(newValue >= 0 ? newValue.toString() : "0");
  };

  return (
    <div className={`rounded-md p-2 flex flex-col items-center ${className}`}>
      <div className="flex justify-between items-center mb-2 w-full">
        <span className={`${textColor} font-bold text-lg select-none`}>
          {text}
        </span>
        <div className="flex">
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder={"405"}
            inputMode="decimal"
            step="0.1"
            className="w-16 mr-4 text-2xl remove-arrow text-center focus:ring-1 focus:outline-none border-gray-300 rounded-md"
          />
          <div className="flex">
            <button
              onClick={() => onUnitChange(Unit.Imperial)}
              type="button"
              className={` px-2 py-2 rounded-l-md
            ${
              unit === Unit.Imperial
                ? "bg-blue-500 text-white"
                : "text-gray-300 bg-gray-100"
            }`}
            >
              {Unit.Imperial}
            </button>
            <button
              onClick={() => onUnitChange(Unit.Metric)}
              type="button"
              className={` border-l-0 px-2 py-2 rounded-r-md
            ${
              unit === Unit.Metric
                ? "bg-blue-500 text-white"
                : "text-gray-300 bg-gray-100"
            }`}
            >
              {Unit.Metric}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full space-x-4">
        {incrementValues.map((value) => (
          <button
            key={value}
            onClick={() => adjustWeight(value)}
            type="button"
            className="bg-neutral-100 rounded-md hover:bg-gray-200 text-gray-500 py-1 px-2 flex-1"
          >
            {value > 0 ? `+${value}` : value}
          </button>
        ))}
      </div>
    </div>
  );
};

interface SimpleNumberInputProps {
  value: string;
  textColor?: string;
  text?: string;
  placeholder?: string;
  className?: string;
  incrementValue?: number;
  onChange: (value: string) => void;
}

const SimpleNumberInput: React.FC<SimpleNumberInputProps> = ({
  value,
  onChange,
  textColor = "text-neutral-700",
  text = "Number",
  placeholder = "number",
  className = "w-full",
  incrementValue = 1,
}) => {
  const adjustValue = (amount: number) => {
    const newValue = parseFloat(value) + amount;
    onChange(newValue >= 0 ? newValue.toString() : "0");
  };

  return (
    <div className={`rounded-md p-2 flex flex-col items-center ${className}`}>
      <div className="flex items-center w-full justify-between mb-2">
        <span className={`${textColor} font-bold text-lg select-none`}>
          {text}
        </span>
        <div className="flex items-center">
          <button
            onClick={() => adjustValue(-incrementValue)}
            type="button"
            className="bg-gray-100 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-l"
          >
            -
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode="numeric"
            className="w-16 px-2 py-1 text-xl remove-arrow text-center focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => adjustValue(incrementValue)}
            type="button"
            className="bg-gray-100 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-r"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

interface ComplexNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  textColor?: string;
  text?: string;
  placeholder?: string;
  className?: string;
  incrementValues?: number[];
}

const ComplexNumberInput: React.FC<ComplexNumberInputProps> = ({
  value,
  onChange,
  textColor = "text-neutral-700",
  text = "Number",
  placeholder = "number",
  className = "w-full",
  incrementValues = [-30, -5, 5, 30],
}) => {
  const adjustTime = (amount: number) => {
    const newValue = parseInt(value) + amount;
    onChange(newValue >= 0 ? newValue.toString() : "0");
  };

  return (
    <div className={`rounded-md p-2 flex flex-col items-center ${className}`}>
      <div className="flex items-center w-full justify-between mb-2">
        <span className={`${textColor} font-bold text-lg select-none`}>
          {text}
        </span>
        <div className="flex items-center">
          <button
            onClick={() => adjustTime(-1)}
            type="button"
            className="bg-gray-100 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-l"
          >
            -
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode="numeric"
            className="w-16 px-2 py-1 text-lg remove-arrow text-center focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => adjustTime(1)}
            type="button"
            className="bg-gray-100 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-r"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex justify-between w-full space-x-2">
        {incrementValues.map((value) => (
          <button
            key={value}
            onClick={() => adjustTime(value)}
            type="button"
            className="bg-gray-100 hover:bg-gray-300 text-black py-1 px-2 flex-1"
          >
            {value > 0 ? `+${value}` : value}
          </button>
        ))}
      </div>
    </div>
  );
};

export {
  NumberInputOneLine,
  WeightNumberInput,
  SimpleNumberInput,
  ComplexNumberInput,
};
