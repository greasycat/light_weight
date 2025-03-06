
interface NumberInputProps {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onIncrement: () => void;
    onDecrement: () => void;
    arrowColor: string;
    textColor: string;
    text: string;
    placeholder: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, onIncrement, onDecrement, arrowColor, textColor, text, placeholder }) => {
    return (
                    <div className='rounded-md p-1 cursor-pointer flex items-center'>
                        <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-10 ${arrowColor} hover:bg-neutral-100`} stroke='currentColor' onClick={onDecrement}>
                            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"></line>
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
                        <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-10 ${arrowColor} hover:bg-neutral-100`} stroke='currentColor' onClick={onIncrement}>
                            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"></line>
                            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"></line>
                        </svg>
                    </div>
    );
};

export default NumberInput;
