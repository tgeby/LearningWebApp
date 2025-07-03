import "../styles/global-styles.css";
import "./IntervalTimer.css";
import InfoToolTip from './InfoToolTip';
import { useCallback, useEffect, useRef, useState } from "react";

function IntervalTimer() {
    // Timer specification
    const [playSound, setPlaySound] = useState(true);
    const [intervals, setIntervals] = useState([]);
    const [currentRestTime, setCurrentRestTime] = useState('');
    const [currentWorkTime, setCurrentWorkTime] = useState('');
    const workInputRef = useRef(null);
    const audioRef = useRef(null);
    // Timer management
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState(null); // null or "work" or "rest"
    const [pauseTime, setPauseTime] = useState(null);
    const nextEndTime = useRef(null); // in ms
    // Timer display
    const [timeRemaining, setTimeRemaining] = useState(0); // in ms
    const [notificationPermission, setNotificationPermission] = useState('default');
    // Mobile help
    const [isFlashing, setIsFlashing] = useState(false);


    useEffect(() => {
        audioRef.current = new Audio('/notificationSound.mp3');
        audioRef.current.preload = 'auto';
    }, []);

    useEffect(() => {
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);

            if (notificationPermission === 'default') {
                Notification.requestPermission().then(permission => {
                    setNotificationPermission(permission);
                });
            }
        } else {
            console.warn("Browser does not support notifications.");
        }
    }, [notificationPermission]);

    useEffect(() => {
        document.title = "Interval Timer";
        const stored = localStorage.getItem('intervals');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setIntervals(parsed);
                }
            } catch (error) {
                console.error("Failed to parse intervals from local storage: ", error);
            }
        }
        const timerState = localStorage.getItem('timer-state');
        if (timerState) {
            try {
                const parsed = JSON.parse(timerState);
                setCurrentIndex(parsed['currentIndex']);
                setPhase(parsed['phase']);
                const restoredPauseTime = parsed['pauseTime'] ? new Date(parsed['pauseTime']) : null;
                setPauseTime(restoredPauseTime);
                nextEndTime.current = parsed['nextEndTime']; 
                if (restoredPauseTime && parsed['nextEndTime']) {
                    const remaining = parsed['nextEndTime'] - restoredPauseTime.getTime();
                    setTimeRemaining(remaining > 0 ? remaining : 0);
                }  
            } catch (error) {
                console.log("Failed to parse stored timer state: ", error);
            }
        }
    }, []);

    const showNotification = useCallback((title, body) => {
        try {
            if (playSound && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(error => {
                    console.warn('Autoplay was prevented:', error);
                });
            }
            if ('vibrate' in navigator) {
                navigator.vibrate([500, 100, 500]);
            }
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 1000);
            if (Notification.permission !== "granted") {
                console.log("Notifications not permitted");

                Notification.requestPermission().then (permission => {
                    setNotificationPermission(permission);
                    if (permission === 'granted') {
                        createNotification(title, body);
                    }
                });
                return;
            }
            createNotification(title, body);
        } catch (error) {
            // do nothing... hopefully this fixes the iOS glitch
        }
    }, [playSound]);

    function createNotification(title, body) {
        try {
            const notification = new Notification(title, {
                body,
                icon: "/favicon.ico",
                requireInteraction: false,
                silent: false,
                tag: "interval-timer",
                renotify: true // if a new notification is triggered before the previous is dismissed, notify again
            });

            const timeoutId = setTimeout(() => {
                notification.close();
            }, 4000);

            notification.onclick = function() {
                try {
                    window.focus();
                    clearTimeout(timeoutId);
                    this.close();
                } catch (error) {
                    console.warn("Error handling notification:", error.message);
                }
            };

            notification.onclose = function() {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
    }
    
    const writeTimerState = useCallback(() => {
        const timerState = {
            currentIndex: currentIndex,
            phase: phase,
            pauseTime: pauseTime?.toISOString() ?? null,
            nextEndTime: nextEndTime.current,
        };
        localStorage.setItem("timer-state", JSON.stringify(timerState));
    }, [currentIndex, phase, pauseTime]);

    function handleStart() {
        if (intervals.length === 0) return;

        // Initialize audio on user interaction for iOS
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }).catch(() => {

            });
        }

        setCurrentIndex(0);
        setPhase('work');
        const endTime = Date.now() + intervals[0][0] * 1000;
        nextEndTime.current = endTime;
        
        const timerState = {
            currentIndex: 0,
            phase: 'work',
            nextEndTime: endTime,
            pauseTime: null
        };
        localStorage.setItem("timer-state", JSON.stringify(timerState));
    }

    function handlePause() {
        if (pauseTime) return;
        const now = new Date();
        const remaining = nextEndTime.current - now.getTime();

        setPauseTime(now);
        setTimeRemaining(remaining);

        const timerState = {
            currentIndex,
            phase,
            pauseTime: now.toISOString(),
            nextEndTime: nextEndTime.current
        };
        localStorage.setItem("timer-state", JSON.stringify(timerState));
    }

    function handleResume() {
        if (!pauseTime) return;
        const adjustedEndTime = nextEndTime.current + (Date.now() - pauseTime.getTime());
        nextEndTime.current = adjustedEndTime;
        setPauseTime(null);

        const timerState = {
            currentIndex,
            phase,
            pauseTime: null,
            nextEndTime: adjustedEndTime
        };
        localStorage.setItem("timer-state", JSON.stringify(timerState));
    }

    const handleReset = useCallback(() => {
        document.title = "Interval Timer";
        setPauseTime(null);
        setCurrentIndex(0);
        setPhase(null);
        nextEndTime.current = null;
        setTimeRemaining(0);
        
        const timerState = {
            currentIndex: 0,
            phase: null,
            pauseTime: null,
            nextEndTime: null,
        };
        localStorage.setItem("timer-state", JSON.stringify(timerState));
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            writeTimerState();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [writeTimerState]);

    useEffect(() => {
        if (!phase || currentIndex >= intervals.length || pauseTime) return;

        const intervalId = setInterval(() => {
            writeTimerState();
        }, 60000);
        
        return () => clearInterval(intervalId);
    }, [phase, currentIndex, pauseTime, writeTimerState, intervals.length]);

    useEffect(() => {
        // Timer updates
        if (!phase || currentIndex >= intervals.length) return;

        const intervalId = setInterval(() => {
            if (pauseTime || !nextEndTime.current) return;
            
            const now = Date.now();
            const remaining = nextEndTime.current - now;

            setTimeRemaining(remaining);

            if (remaining <= 0) {
                // An interval expired
                
                if (currentIndex >= intervals.length - 1 && phase === 'rest') {
                    // Timer finished
                    showNotification(`Timer Complete!`, 'All intervals finished! Great job!');
                    handleReset();
                    return;
                } else {
                    // Move to next phase
                    showNotification(`${phase.toUpperCase()} Complete!`, `Moving to ${phase === 'work' ? 'rest' : 'work'} phase`);
                    
                    const nextPhase = phase === 'work' ? 'rest' : 'work';
                    let nextIndex = currentIndex;

                    if (phase === 'rest') {
                        nextIndex = currentIndex + 1;
                        setCurrentIndex(nextIndex);
                    }
                    setPhase(nextPhase);

                    const nextIntervalSeconds = intervals[nextIndex][nextPhase === 'work' ? 0 : 1];
                    nextEndTime.current = now + nextIntervalSeconds * 1000;
                    
                    writeTimerState();
                }
            } else {
                const capitalizedPhase = phase.charAt(0).toUpperCase() + phase.slice(1);
                document.title = `${secondsToMinuteSecondsString(Math.ceil(remaining / 1000))} - ${capitalizedPhase}`;
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, [phase, currentIndex, pauseTime, intervals, handleReset, writeTimerState, showNotification]);


    function splitAndSum(intervalString) {
        const split = intervalString.split(":");

        if (split.length === 2) {
            const minutes = parseInt(split[0], 10);
            const seconds = parseInt(split[1], 10);
            if (isNaN(minutes) || isNaN(seconds) || seconds > 59) {
                return NaN;
            }
            return minutes * 60 + seconds;
        } else {
            const seconds = parseInt(split[0], 10);
            if (isNaN(seconds)) {
                return NaN;
            }
            return seconds;
        }
    }

    function handleClearIntervals() {
        localStorage.removeItem('intervals');
        setIntervals([]);
    }

    function addInterval(e) {
        e.preventDefault();

        const work = splitAndSum(currentWorkTime);
        const rest = splitAndSum(currentRestTime);

        if (
            isNaN(work) || isNaN(rest) ||
            work <= 0 || rest <= 0
        ) {
            alert("Please enter valid positive whole numbers for both work and rest times.");
            return;
        }
        if (currentRestTime === '' || currentWorkTime ==='') {
            return;
        }
        const nextIntervals = [...intervals, [work, rest]];
        setIntervals(nextIntervals);
        localStorage.setItem('intervals', JSON.stringify(nextIntervals));
        setCurrentRestTime('');
        setCurrentWorkTime('');
        workInputRef.current?.focus();
    }

    function deleteIthInterval(i) {
        try {
            const nextIntervals = [...intervals.slice(0,i), ...intervals.slice(i+1)];
            setIntervals(nextIntervals);
            localStorage.setItem('intervals', JSON.stringify(nextIntervals));
        } catch(error) {
            console.error(error);
        }
    }

    function secondsToMinuteSecondsString(seconds) {
        const minutes = Math.floor(seconds/60).toString().padStart(2, '0');
        const secs = seconds % 60;
        const paddedSecs = secs.toString().padStart(2, '0');
        return `${minutes}:${paddedSecs}`;
    }

    const jsxIntervals = intervals.map((intervalPair, index) => {
        const isCurrentInterval = phase && index === currentIndex;
        return (
            <li key={index} id={index.toString()} className={isCurrentInterval ? 'current-interval' : ''}>
                <div className="listed-interval-text" id={"Divider for interval" + (index + 1).toString()}>
                    <p>Work: {secondsToMinuteSecondsString(intervalPair[0])}</p>
                    <p>Rest: {secondsToMinuteSecondsString(intervalPair[1])}</p>
                </div>
                <button 
                    type="button" 
                    onClick={() => deleteIthInterval(index)} 
                    id={"Delete button" + (index + 1).toString()}
                    className={`delete-button ${phase ? 'hidden' : ''}`}
                >
                    Delete
                </button>
            </li>
        )
    });

    return (
        <div className="main">
            <h1 className='interval-title'>
                Interval Timer 
                <InfoToolTip text="Short time intervals (<10s) may be inaccurate. Browser notifications may only appear if you are in another window or tab. Your system settings may also silence the browser notifications such as having focus mode activated on your mac. A sound will play when an interval expires if the box below is checked." />
            </h1>
            
            <label>
                <input 
                    type='checkbox' 
                    checked={playSound}
                    id="Use sound checkbox"
                    onChange={() => setPlaySound(prev => !prev)}
                />
                Play Timer Sound
            </label>

            {!phase &&
                <form onSubmit={addInterval} className='timer-form' id="interval-specification-form">
                    <p className="work-label" id="work-time-label">Work Time</p>
                    <input 
                        placeholder="ss or mm:ss"
                        className='input work-time-input'
                        value={currentWorkTime}
                        ref={workInputRef}
                        id="work-time-input-box"
                        onChange= {(e) => setCurrentWorkTime(e.target.value)}
                    />
                    <p className="rest-label" id="rest-time-label">Rest Time</p>
                    <input 
                        placeholder="ss or mm:ss"
                        className="input rest-time-input"
                        value={currentRestTime}
                        id="rest-time-input-box"
                        onChange={(e) => setCurrentRestTime(e.target.value)}
                    />

                    <button type="button" id="clear-intervals-button" onClick={handleClearIntervals} disabled={intervals.length === 0} className="timer-button clear-interval">Clear Intervals</button>
                    <button type="submit" id="add-interval-button" className="timer-button add-interval">Add Interval</button>

                    {intervals.length > 0 && 
                    <div className="interval-list timer-interval-list" id="List of inputted intervals">
                        <ol>
                            {jsxIntervals}
                        </ol>
                    </div>            
                    }
                </form>
            }

            <div className="timer-area">
                {phase && (
                    <div className={`timer-display ${isFlashing ? 'flash-alert' : ''}`}>
                        <h3>{phase.toUpperCase()} phase {currentIndex+1}</h3>
                        <h1>{timeRemaining < 0 ? '00:00' : `${secondsToMinuteSecondsString(Math.ceil(timeRemaining / 1000))}s remaining`}</h1>
                    </div>
                )}

                <div className="buttons">

                    {!pauseTime && phase && 
                        <button type="button" onClick={handlePause} className="timer-button">Pause</button>                    
                    }

                    {pauseTime && 
                        <button type="button" onClick={handleResume} className="timer-button">Resume</button>                
                    }

                    {!phase &&                    
                        <button type="button" onClick={handleStart} className="timer-button" disabled={intervals.length === 0 ? true : false}>Start Timer</button>
                    }

                    {phase &&
                        <button type="button" onClick={handleReset} className="timer-button">End Timer</button>                    
                    }
                </div>

                
                {intervals.length > 0 && phase &&
                    <div className="interval-list timer-interval-list" id="List of inputted intervals">
                        <ol className='numbered'>
                            {jsxIntervals}
                        </ol>
                    </div>            
                }
            </div>
        </div>
        
    );
}
export default IntervalTimer;