interface NumberInputProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  arrowColor: string;
  textColor: string;
  text: string;
  placeholder: string;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  arrowColor,
  textColor,
  text,
  placeholder,
  className,
}) => {
  return (
    <div
      className={`rounded-md p-1 cursor-pointer flex items-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`w-5 h-10 ${arrowColor} hover:bg-neutral-100`}
        stroke="currentColor"
        onClick={onDecrement}
      >
        <line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          strokeWidth="2"
          strokeLinecap="round"
        ></line>
      </svg>
      <span className={`ml-2 ${textColor} font-bold select-none`}>{text}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode="numeric"
        className="w-8 px-1 rounded-md text-base remove-arrow text-center"
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`w-5 h-10 ${arrowColor} hover:bg-neutral-100`}
        stroke="currentColor"
        onClick={onIncrement}
      >
        <line
          x1="12"
          y1="5"
          x2="12"
          y2="19"
          strokeWidth="2"
          strokeLinecap="round"
        ></line>
        <line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          strokeWidth="2"
          strokeLinecap="round"
        ></line>
      </svg>
    </div>
  );
};

interface NumberInputWeightProps {
  value: number;
  onChange: (value: number) => void;
  textColor?: string;
  text?: string;
  placeholder?: string;
  className?: string;
  unit: "kg" | "lbs";
  onUnitChange: (unit: "kg" | "lbs") => void;
}

const NumberInputWeight: React.FC<NumberInputWeightProps> = ({
  value,
  onChange,
  textColor = "text-neutral-700",
  text = "Weight",
  placeholder = "kg",
  className = "w-full",
  unit = "kg",
  onUnitChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };
  const adjustWeight = (amount: number) => {
    const newValue = parseFloat((value + amount).toFixed(1));
    onChange(newValue >= 0 ? newValue : 0);
  };


  return (
    <div className={`rounded-md p-2 flex flex-col items-center ${className}`}>
      <div className="flex items-center w-full justify-between mb-2">
        <span className={`${textColor} font-bold text-lg select-none`}>
          {text}
        </span>
        <div className="flex items-center">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            inputMode="decimal"
            step="0.1"
            className="w-20 px-2 py-1 text-lg remove-arrow text-center"
          />

          <button
            onClick={() => onUnitChange("lbs")}
            className={`border-r-0 border-gray-300 px-2 py-2 rounded-l-sm
                ${unit === "lbs" ? "bg-blue-500 text-white" : "text-gray-300 bg-gray-100"}`}
          >
            lb
          </button>
          <button
            onClick={() => onUnitChange("kg")}
            className={`border-l-0 border-gray-300 px-2 py-2 rounded-r-sm
                ${unit === "kg" ? "bg-blue-500 text-white" : "text-gray-300 bg-gray-100"}`}
          >
            kg
          </button>
        </div>
      </div>
      <div className="flex justify-between w-full ">
        <button
          onClick={() => adjustWeight(-5)}
          className="bg-gray-200 hover:bg-gray-300 text-black py-1 px-2 rounded-l flex-1"
        >
          -5
        </button>
        <button
          onClick={() => adjustWeight(-2.5)}
          className="shadow-sm hover:bg-gray-300 text-gray-700 py-1 px-2 flex-1"
        >
          -2.5
        </button>
        <button
          onClick={() => adjustWeight(2.5)}
          className="shadow-sm hover:bg-gray-300 text-gray-700 py-1 px-2 flex-1"
        >
          +2.5
        </button>
        <button
          onClick={() => adjustWeight(5)}
          className="shadow-sm hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-r flex-1"
        >
          +5
        </button>
      </div>
    </div>
  );
};

interface NumberInputRepProps {
  value: number;
  onChange: (value: number) => void;
  textColor?: string;
  text?: string;
  placeholder?: string;
  className?: string;
}

const NumberInputRep: React.FC<NumberInputRepProps> = ({
  value,
  onChange,
  textColor = "text-neutral-700",
  text = "Reps",
  placeholder = "reps",
  className = "w-full",
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };
  
  const adjustReps = (amount: number) => {
    const newValue = value + amount;
    onChange(newValue >= 0 ? newValue : 0);
  };

  return (
    <div className={`rounded-md p-2 flex flex-col items-center ${className}`}>
      <div className="flex items-center w-full justify-between mb-2">
        <span className={`${textColor} font-bold text-lg select-none`}>
          {text}
        </span>
        <div className="flex items-center">
          <button
            onClick={() => adjustReps(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-l"
          >
            -
          </button>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            inputMode="numeric"
            className="w-16 px-2 py-1 text-lg remove-arrow text-center"
          />
          <button
            onClick={() => adjustReps(1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-r"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export { NumberInput, NumberInputWeight, NumberInputRep };
