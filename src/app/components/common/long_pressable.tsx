import { useState, useEffect, useRef } from 'react';

interface LongPressableProps {
    onTrigger: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
    duration?: number; // Duration in ms
}

const LongPressable = ({ onTrigger, children, duration = 700, style }: LongPressableProps) => {
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (isLongPressing) {
            startTimeRef.current = Date.now();
            const intervalId = window.setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const progress = Math.min(elapsed / duration, 1);
                setLoadingProgress(progress);

                if (progress >= 1) {
                    onTrigger();
                    clearInterval(intervalId);
                }
            }, 16); // ~60fps
            timerRef.current = intervalId;
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setLoadingProgress(0);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isLongPressing, duration, onTrigger]);

    const handleStart = () => {
        setIsLongPressing(true);
    };

    const handleEnd = () => {
        setIsLongPressing(false);
    };

    const handleLeave = () => {
        setIsLongPressing(false);
    };

    return (
        <div
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleLeave}
            style={style}
        >
            {loadingProgress > 0 && (
                <div 
                    style={{
                        position: 'absolute',
                        width: `${loadingProgress * 100}%`,
                        transition: 'width 0.05s linear',
                        top: 0,
                        left: 0,
                        height: '100%',
                        backgroundColor: 'rgba(133, 133, 133, 0.25)',
                        zIndex: 0,
                    }}
                />
            )}
            {children}
        </div>
    );
};

export default LongPressable;