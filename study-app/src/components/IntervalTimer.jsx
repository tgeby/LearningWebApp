

import { useEffect, useRef, useState } from "react";

function IntervalTimer() {
    // Timer specification
    const [intervals, setIntervals] = useState([]);
    const [currentRestTime, setCurrentRestTime] = useState('');
    const [currentWorkTime, setCurrentWorkTime] = useState('');
    // Timer management
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState("work"); // "work" or "rest"
    const [remainingTime, setRemainingTime] = useState(null); // in ms
    const [isRunning, setIsRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const [resuming, setResuming] = useState(false);
    // Show time
    const [displayTime, setDisplayTime] = useState(null);
    const intervalRef = useRef(null);

    const timerId = useRef(null);
    const pauseTimestamp = useRef(null);
    const endTimestamp = useRef(null);

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
        if (Notification.permission === "granted") {
            new Notification(title, { body, requireInteraction: false });
        }
    }

    function startPhase(durationMs) {
        const now = Date.now();
        endTimestamp.current = now + durationMs;
        //setRemainingTime(durationMs);
        clearTimeout(timerId.current);
        clearInterval(intervalRef.current);
        startDisplayCountdown(durationMs);

        timerId.current = setTimeout(() => {
    
            if (currentIndex === intervals.length-1 && phase=== "rest") {
                showNotification("All intervals completed!");
                clearInterval(intervalRef.current);
                setIsRunning(false);
                return;
            } else {
                showNotification(`End of ${phase} phase ${currentIndex + 1}`);
            }
            clearInterval(intervalRef.current);
            if (phase === "work") {
                setPhase("rest");
            } else {
                setPhase("work");
                setCurrentIndex((i) => i + 1);
            }
        }, durationMs);

        setIsRunning(true);
        setPaused(false);
    }

    useEffect(() => {
        if (!isRunning || paused) return;

        let duration;
        if (resuming && remainingTime) {
            duration = remainingTime;
            setRemainingTime(null);
            setResuming(false);
        } else {
            const [work, rest] = intervals[currentIndex];
            duration = phase === "work" ? parseInt(work) * 1000 : parseInt(rest) * 1000;
        }
        
        startPhase(duration);

        return () => {
            clearTimeout(timerId.current);
            clearInterval(intervalRef.current);
        };
    }, [currentIndex, phase, isRunning, paused]);

    function handleStart() {
        if (!isRunning) {
            clearTimeout(timerId.current);
            clearInterval(intervalRef.current);
            setPhase("work");
            setCurrentIndex(0);
            setIsRunning(true);
        }
    }

    function handlePause() {
        if (!isRunning || paused) return;
        clearTimeout(timerId.current);
        clearInterval(intervalRef.current);
        pauseTimestamp.current = Date.now();
        const remaining = endTimestamp.current - pauseTimestamp.current;
        setRemainingTime(remaining);
        setPaused(true);
    }

    function handleResume() {
        if (paused && remainingTime > 0) {
            setResuming(true);
            startPhase(remainingTime);
        }
    }

    function startTimer(e) {
        // timer logic
        // async timers with scheduled push notifications
        // store scheduled timestamps. If the timer is paused, record how long pause is. Add that to each unreached timestamps on play.
        e.preventDefault();
        if (intervals.length === 0) {
            return;
        }
        handleStart();
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

    function handleEnd() {
        if (!isRunning && !paused) return;
        clearTimeout(timerId.current);
        clearInterval(intervalRef.current);
        setCurrentIndex(0);
        setPhase('work');
        setRemainingTime(null);
        setIsRunning(false);
        setPaused(false);
        setDisplayTime(null);

        // unnecessary 
        intervalRef.current = null;
        timerId.current = null;
        pauseTimestamp.current = null;
        endTimestamp.current = null;
    }

    function deleteIthInterval(i) {
        try {
            const nextIntervals = [...intervals.slice(0,i), ...intervals.slice(i+1)];
            setIntervals(nextIntervals);
        } catch(error) {
            console.log(error);
        }
    }

    function startDisplayCountdown(durationMs) {
        const durationSec = Math.ceil(durationMs / 1000);
        setDisplayTime(durationSec);

        intervalRef.current = setInterval(() => {
            setDisplayTime(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
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
        <div>
            <h1>Enter time intervals in seconds</h1>
            <p>Time intervals under 8 seconds cause delayed notifications since their timeout occurs before the previous notification runs out.</p>
            <div>
                <form onSubmit={addInterval}>
                    <input 
                        placeholder="Work Time"
                        value={currentWorkTime}
                        onChange= {(e) => setCurrentWorkTime(e.target.value)}
                    />
                    <input 
                        placeholder="Rest Time"
                        value={currentRestTime}
                        onChange={(e) => setCurrentRestTime(e.target.value)}
                    />
                    <button type="submit">Add interval</button>
                    <ol>
                        {jsxIntervals}
                    </ol>
                </form>
                <button type="button" onClick={handlePause}>Pause</button>
                <button type="button" onClick={handleResume}>Resume</button>
                <button type="button" onClick={startTimer}>Start Timer</button>
                <button type="button" onClick={handleEnd}>End Timer</button>
            </div>
            {isRunning && (
                <div>
                    <h3>{phase.toUpperCase()} phase {currentIndex+1}</h3>
                    <h1>{displayTime}s remaining</h1>
                </div>
            )}
        </div>
    );
}
export default IntervalTimer;