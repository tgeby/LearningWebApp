import '../styles/global-styles.css';
import './IntervalTimer.css';

import { useEffect, useRef, useState, useCallback } from "react";

function IntervalTimer() {
    const [intervals, setIntervals] = useState([]);
    const [currentRestTime, setCurrentRestTime] = useState('');
    const [currentWorkTime, setCurrentWorkTime] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState("work");
    const [remainingTime, setRemainingTime] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const [displayTime, setDisplayTime] = useState(null);
    const [totalPhaseSeconds, setTotalPhaseSeconds] = useState(null);

    const timerId = useRef(null);
    const intervalRef = useRef(null);
    const pauseTimestamp = useRef(null);
    const endTimestamp = useRef(null);

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, []);

    function showNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }
    }

    function mmssToMs(timeStr) {
        if (!timeStr) return 0;
        const [m, s] = timeStr.split(':').map(Number);
        return (m * 60 + s) * 1000;
    }

    const startPhase = useCallback((durationMs) => {
        const now = Date.now();
        endTimestamp.current = now + durationMs;
        clearTimeout(timerId.current);
        clearInterval(intervalRef.current);
        startDisplayCountdown(durationMs);

        timerId.current = setTimeout(() => {
            if (currentIndex === intervals.length - 1 && phase === "rest") {
                showNotification("All intervals completed!", "");
                clearInterval(intervalRef.current);
                setIsRunning(false);
                return;
            } else {
                showNotification(`End of ${phase} phase ${currentIndex + 1}`, "");
            }

            clearInterval(intervalRef.current);

            if (phase === "work") {
                setPhase("rest");
            } else {
                setPhase("work");
                setCurrentIndex(i => i + 1);
            }
        }, durationMs);

        setIsRunning(true);
        setPaused(false);
    }, [currentIndex, intervals.length, phase]);

    useEffect(() => {
        if (!isRunning || paused || remainingTime !== null) return;

        const [work, rest] = intervals[currentIndex];
        const duration = phase === "work" ? mmssToMs(work) : mmssToMs(rest);
        startPhase(duration);

        return () => {
            clearTimeout(timerId.current);
            clearInterval(intervalRef.current);
        };
    }, [currentIndex, phase, isRunning, paused, remainingTime, intervals, startPhase]);

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
        setRemainingTime(endTimestamp.current - pauseTimestamp.current);
        setPaused(true);
    }

    function handleResume() {
        if (paused && remainingTime > 0) {
            setPaused(false);
            setIsRunning(true);
            startPhase(remainingTime);
            setRemainingTime(null);
        }
    }

    function startTimer(e) {
        e.preventDefault();
        if (intervals.length === 0) return;
        handleStart();
    }

    function parseAndNormalizeTime(input) {
        if (!input) return 0;
        const parts = input.split(':').map(str => str.trim());

        if (parts.length === 1) {
            const seconds = Number(parts[0]);
            return isNaN(seconds) ? 0 : seconds;
        }

        if (parts.length === 2) {
            let minutes = Number(parts[0]);
            let seconds = Number(parts[1]);
            if (isNaN(minutes) || isNaN(seconds)) return 0;

            minutes += Math.floor(seconds / 60);
            seconds = seconds % 60;
            return minutes * 60 + seconds;
        }

        return 0;
    }

    function secondsToMMSS(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function addInterval(e) {
        e.preventDefault();
        const workSeconds = parseAndNormalizeTime(currentWorkTime);
        const restSeconds = parseAndNormalizeTime(currentRestTime);

        if (
            isNaN(workSeconds) || isNaN(restSeconds) ||
            workSeconds <= 0 || restSeconds <= 0
        ) {
            alert("Please enter valid positive time values.");
            return;
        }

        const workStr = secondsToMMSS(workSeconds);
        const restStr = secondsToMMSS(restSeconds);

        setIntervals([...intervals, [workStr, restStr]]);
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

        intervalRef.current = null;
        timerId.current = null;
        pauseTimestamp.current = null;
        endTimestamp.current = null;
    }

    function deleteIthInterval(i) {
        const nextIntervals = [...intervals.slice(0, i), ...intervals.slice(i + 1)];
        setIntervals(nextIntervals);
    }

    function secondsToDisplay(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startDisplayCountdown(durationMs) {
        const interval = 1000;
        const expectedEnd = endTimestamp.current ?? (Date.now() + durationMs);
        const totalSeconds = Math.ceil((expectedEnd - Date.now()) / 1000);
        setTotalPhaseSeconds(totalSeconds);

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const timeLeft = Math.max(0, Math.ceil((expectedEnd - now) / 1000));
            setDisplayTime(secondsToDisplay(timeLeft));

            if (timeLeft <= 0) {
                clearInterval(intervalRef.current);
            }
        }, interval);
    }

    const jsxIntervals = intervals.map((intervalPair, index) => (
        <li key={index}>
            <p>{intervalPair[0]} work, {intervalPair[1]} rest.</p>
            <button type="button" onClick={() => deleteIthInterval(index)}>Delete</button>
        </li>
    ));

    let progressPercent = 100;
    let progressColor = '#4caf50';

    if (displayTime && totalPhaseSeconds) {
        const [min, sec] = displayTime.split(":").map(Number);
        const secondsLeft = min * 60 + sec;
        progressPercent = (secondsLeft / totalPhaseSeconds) * 100;

        if (progressPercent <= 25) {
            progressColor = '#f44336';
        } else if (progressPercent <= 50) {
            progressColor = '#ff9800';
        } else if (progressPercent <= 75) {
            progressColor = '#ffc107';
        } else {
            progressColor = '#4caf50';
        }
    }

    return (
        <div>
            <h1>Enter time intervals in seconds</h1>
            <p>Time intervals under 8 seconds cause delayed notifications since their timeout occurs before the previous notification runs out.</p>
            <div>
                <form onSubmit={addInterval}>
                    <input
                        placeholder="Work Time (mm:ss or ss)"
                        value={currentWorkTime}
                        onChange={(e) => setCurrentWorkTime(e.target.value)}
                    />
                    <input
                        placeholder="Rest Time (mm:ss or ss)"
                        value={currentRestTime}
                        onChange={(e) => setCurrentRestTime(e.target.value)}
                    />
                    <button type="submit">Add interval</button>
                    <ol>{jsxIntervals}</ol>
                </form>
                <button type="button" onClick={handlePause}>Pause</button>
                <button type="button" onClick={handleResume}>Resume</button>
                <button type="button" onClick={startTimer}>Start Timer</button>
                <button type="button" onClick={handleEnd}>End Timer</button>
            </div>
            {isRunning && (
                <div className='timer-display'>
                    <h3>{phase.toUpperCase()} phase {currentIndex + 1}</h3>
                    <div className='timer-text fade-in'>
                        {displayTime ? `${displayTime} remaining` : "Starting..."}
                    </div>
                    <div className='progress-bar-container'>
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IntervalTimer;