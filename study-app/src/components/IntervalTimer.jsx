import "../styles/global-styles.css";
import "./IntervalTimer.css";

import { useEffect, useRef, useState } from "react";

function IntervalTimer() {
    // Timer specification
    const [intervals, setIntervals] = useState([]);
    const [currentRestTime, setCurrentRestTime] = useState('');
    const [currentWorkTime, setCurrentWorkTime] = useState('');
    // Timer management
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState(null); // null or "work" or "rest"
    const [pauseTime, setPauseTime] = useState(null);
    const nextEndTime = useRef(null); // in ms
    // Timer display
    const [timeRemaining, setTimeRemaining] = useState(0); // in ms

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission:", permission);
            });
        } else {
            console.log("Browser does not support notifications.");
        }
    }, []);

    function showNotification(title, body) {
        console.log("Show notification called");
        if (Notification.permission === "granted") {
            console.log("Permission granted");
            new Notification(title, 
                { 
                    body, 
                    requireInteraction: false,
                    icon: "/favicon.ico",
                    silent: false
                });
        }
    }
    
    useEffect(() => {
        // Timer updates
        if (!phase || currentIndex >= intervals.length) return;

        const intervalId = setInterval(() => {
            if (pauseTime || !nextEndTime.current) return;

            const remaining = nextEndTime.current - Date.now();

            if (remaining <= 0) {
                if (currentIndex >= intervals.length - 1 && phase === 'rest') {
                    showNotification(`End of set: ${currentIndex + 1}, phase: ${phase}`, 'All sets complete! Great job!');
                    handleReset();
                    return;
                } else {
                    showNotification(`End of set: ${currentIndex + 1}, phase: ${phase}`, 'On to the next set!');
                    const nextPhase = phase === 'work' ? 'rest' : 'work';
                    if (phase === 'rest') {
                        setCurrentIndex(prev => prev + 1)
                    }
                    setPhase(nextPhase);

                    const nextIntervalSeconds = parseInt(intervals[currentIndex][nextPhase === 'work' ? 0 : 1]);
                    nextEndTime.current = Date.now() + nextIntervalSeconds * 1000;
                }
            } else {
                setTimeRemaining(remaining);
            }
        }, 200);

        return () => clearInterval(intervalId);
    }, [phase, currentIndex, pauseTime, intervals]);

    function handleStart() {
        if (intervals.length === 0) return;
        setCurrentIndex(0);
        setPhase('work');
        nextEndTime.current = Date.now() + intervals[0][0] * 1000;
    }

    function handlePause() {
        if (pauseTime) return;
        setPauseTime(new Date());
    }

    function handleResume() {
        if (!pauseTime) return;
        nextEndTime.current += Date.now() - pauseTime.getTime();
        setPauseTime(null);
    }

    function handleReset() {
        setPauseTime(null);
        setCurrentIndex(0);
        setPhase(null);
        nextEndTime.current = null;
    }

    function addInterval(e) {
        e.preventDefault();
        const work = parseInt(currentWorkTime, 10);
        const rest = parseInt(currentRestTime, 10);

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
        const nextIntervals = [...intervals, [currentWorkTime, currentRestTime]];
        setIntervals(nextIntervals);
        setCurrentRestTime('');
        setCurrentWorkTime('');
    }

    function deleteIthInterval(i) {
        try {
            const nextIntervals = [...intervals.slice(0,i), ...intervals.slice(i+1)];
            setIntervals(nextIntervals);
        } catch(error) {
            console.log(error);
        }
    }

    const jsxIntervals = intervals.map((intervalPair, index) => {
        return (
            <li key={index}>
                <p>{intervalPair[0]} work, {intervalPair[1]} rest.</p>
                <button type="button" onClick={() => deleteIthInterval(index)}>Delete</button>
            </li>
        )
    });

    return (
        <div className='main'>
            <h1>Enter time intervals in seconds</h1>
            <p>Time intervals under 8 seconds cause delayed notifications since their timeout occurs before the previous notification runs out.</p>
            <div>
                <form onSubmit={addInterval} className='form'>
                    <input 
                        placeholder="Work Time (in seconds)"
                        className='input'
                        value={currentWorkTime}
                        onChange= {(e) => setCurrentWorkTime(e.target.value)}
                    />
                    <input 
                        placeholder="Rest Time (in seconds)"
                        className="input"
                        value={currentRestTime}
                        onChange={(e) => setCurrentRestTime(e.target.value)}
                    />
                    <button type="submit" className="small-button">Add interval</button>
                </form>

                <div className="interval-list">
                    <ol>
                        {jsxIntervals}
                    </ol>
                </div>

                <div className="buttons">
                    {!pauseTime && phase && 
                        <button type="button" onClick={handlePause} className="small-button">Pause</button>                    
                    }

                    {pauseTime && 
                        <button type="button" onClick={handleResume} className="small-button">Resume</button>                
                    }

                    {!phase &&                    
                        <button type="button" onClick={handleStart} className="small-button">Start Timer</button>
                    }

                    {phase &&
                        <button type="button" onClick={handleReset} className="small-button">End Timer</button>                    
                    }
                </div>
            </div>
            {phase && (
                <div>
                    <h3>{phase.toUpperCase()} phase {currentIndex+1}</h3>
                    <h1>{timeRemaining === null ? 'Starting...' : `${Math.ceil(timeRemaining / 1000)}s remaining`}</h1>
                </div>
            )}
        </div>
        
    );
}
export default IntervalTimer;