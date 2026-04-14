import React, { useState, useEffect } from 'react';
import { TriangleAlert, XCircle } from 'lucide-react';

const AccidentDetector = () => {
  const [detecting, setDetecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertActive, setAlertActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Some devices require explicit permission to use sensors
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      // We will show a button to request if needed, handled in UI
    } else {
      // Standard browser, can attach directly
      setPermissionGranted(true);
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const p = await DeviceMotionEvent.requestPermission();
        if (p === 'granted') setPermissionGranted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!permissionGranted || !detecting) return;

    let baselineSet = false;
    let baselineMagnitude = 9.81; // Gravity average
    const ACCIDENT_THRESHOLD = 25; // m/s^2 (Rough collision spike)

    const handleMotion = (event) => {
      // Don't process if an alert is already active
      if (alertActive || countdown > 0) return;

      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || !acc.x) return;

      const magnitude = Math.sqrt(
        Math.pow(acc.x, 2) + Math.pow(acc.y, 2) + Math.pow(acc.z, 2)
      );

      // If acceleration spike is severe
      if (magnitude > ACCIDENT_THRESHOLD) {
        console.log("Accident detected! Magnitude:", magnitude);
        triggerSOSSequence();
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [permissionGranted, detecting, alertActive, countdown]);

  const triggerSOSSequence = () => {
    setAlertActive(true);
    setCountdown(10);
  };

  const cancelSOS = () => {
    setAlertActive(false);
    setCountdown(0);
  };

  useEffect(() => {
    let timer;
    if (alertActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (alertActive && countdown === 0) {
      // Send actual SOS
      sendSOSBackend();
      setAlertActive(false); 
      // Option: could show success toast
    }
    return () => clearTimeout(timer);
  }, [alertActive, countdown]);

  const sendSOSBackend = async () => {
    try {
      let lat = 0, lng = 0;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
           lat = pos.coords.latitude;
           lng = pos.coords.longitude;
           await postAPI(lat, lng);
        }, async () => {
           await postAPI(lat, lng);
        });
      } else {
        await postAPI(lat, lng);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const postAPI = async (lat, lng) => {
    try {
      // Assuming user ID stored in localStorage token
      const ustr = localStorage.getItem('user');
      let uid = "anonymous";
      if (ustr) uid = JSON.parse(ustr).id;

      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          location: { latitude: lat, longitude: lng }
        })
      });
      alert('AUTOMATIC SOS HAS BEEN DISPATCHED!');
      window.location.href = 'tel:112';
    } catch (e) {
      console.error(e);
    }
  };

  if (alertActive) {
    return (
      <div className="sos-overlay">
        <div className="sos-dialog">
          <TriangleAlert size={64} className="sos-icon" />
          <h1>Crash Detected!</h1>
          <p>Automatic SOS will be sent in</p>
          <div className="sos-countdown">{countdown}</div>
          <button className="cancel-btn" onClick={cancelSOS}>
            <XCircle size={24} /> I'm OK, Cancel
          </button>
        </div>
        <style>{`
          .sos-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(220, 38, 38, 0.95);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; backdrop-filter: blur(8px);
          }
          .sos-dialog {
            background: white; padding: 3rem 2rem; border-radius: 20px;
            text-align: center; max-width: 350px; width: 90%;
            display: flex; flex-direction: column; align-items: center;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          }
          .sos-icon { color: #dc2626; margin-bottom: 1rem; animation: pulse 1s infinite alternate; }
          .sos-dialog h1 { font-size: 1.8rem; margin: 0; color: #111827; font-weight: 800; }
          .sos-dialog p { color: #6b7280; margin-top: 0.5rem; }
          .sos-countdown {
            font-size: 4.5rem; font-weight: 900; color: #dc2626; line-height: 1; margin: 1rem 0 2rem;
          }
          .cancel-btn {
            background: #f3f4f6; color: #1f2937; border: none; padding: 1rem;
            width: 100%; border-radius: 12px; font-weight: 700; font-size: 1.1rem;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            cursor: pointer; transition: background 0.2s;
          }
          .cancel-btn:hover { background: #e5e7eb; }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Small floating toggle or config for the feature
  return (
    <div className="accident-detector-toggle">
      {!permissionGranted ? (
        <button onClick={requestPermission} className="sensor-req-btn">Enable Crash Detection</button>
      ) : (
        <div className="toggle-wrapper" onClick={() => setDetecting(!detecting)}>
          <div className={'toggle-switch ' + (detecting ? 'on' : 'off')}>
             <div className="knob"></div>
          </div>
          <span>Auto-SOS (Accidents)</span>
        </div>
      )}
      <style>{`
        .accident-detector-toggle {
          background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px;
          display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .sensor-req-btn {
          background: var(--primary); color: white; border: none; padding: 0.8rem;
          border-radius: 8px; font-weight: 600; cursor: pointer;
        }
        .toggle-wrapper {
          display: flex; align-items: center; gap: 0.75rem; cursor: pointer;
        }
        .toggle-wrapper span { color: var(--text-main); font-weight: 600; font-size: 0.95rem; }
        .toggle-switch {
          width: 44px; height: 24px; border-radius: 20px; background: #4b5563;
          position: relative; transition: background 0.3s;
        }
        .toggle-switch.on { background: #10b981; }
        .toggle-switch .knob {
          width: 20px; height: 20px; background: white; border-radius: 50%;
          position: absolute; top: 2px; left: 2px; transition: transform 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-switch.on .knob { transform: translateX(20px); }
      `}</style>
    </div>
  );
};

export default AccidentDetector;
