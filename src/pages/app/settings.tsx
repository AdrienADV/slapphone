import { useRef, useEffect, useState } from "react";
import { setupPage } from '@capgo/capacitor-transitions/react';
import { CapacitorAccelerometer } from '@capgo/capacitor-accelerometer';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import sirenSound from '@/assets/sounds/siren.mp3';

const PICKUP_THRESHOLD = 1.35;

type Status = 'idle' | 'arming' | 'armed' | 'triggered';

export default function SafeMode() {
  const pageRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [countdown, setCountdown] = useState(3);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  useEffect(() => {
    const audio = new Audio(sirenSound);
    audio.preload = 'auto';
    audio.loop = true;
    audio.load();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  function arm() {
    // Unlock iOS audio via user gesture
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().then(() => audio.pause()).catch(() => {});
    }

    setStatus('arming');
    setCountdown(3);

    let c = 3;
    const interval = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        setStatus('armed');
      }
    }, 1000);
  }

  function disarm() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setStatus('idle');
  }

  useEffect(() => {
    if (status !== 'armed') return;

    CapacitorAccelerometer.startMeasurementUpdates();

    const listenerPromise = CapacitorAccelerometer.addListener('measurement', (m) => {
      const mag = Math.hypot(m.x, m.y, m.z);
      if (mag > PICKUP_THRESHOLD) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
        setStatus('triggered');
      }
    });

    return () => {
      listenerPromise.then(l => l.remove());
      CapacitorAccelerometer.stopMeasurementUpdates();
    };
  }, [status]);

  const isFlashing = status === 'triggered';

  return (
    <cap-page ref={pageRef}>
      <cap-content className="bg-background">
        <div className="pt-(--safe-area-top) bg-background pb-12 flex flex-col items-center min-h-full">

          {/* Police flash overlay */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                className="fixed inset-0 pointer-events-none z-50"
                animate={{ backgroundColor: ['#ff3b3080', '#007aff80', '#ff3b3080'] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="w-full px-5 pt-4 pb-6">
            <h1 className="text-[28px] font-bold tracking-tight">Thief Mode</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Arm your phone — it'll scream if a thief picks it up
            </p>
          </div>

          {/* Gyrophare */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-5">
            <div className="relative flex items-center justify-center">

              {isFlashing && (
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 220, height: 220 }}
                  animate={{ backgroundColor: ['#ff3b30', '#007aff', '#ff3b30'], scale: [1, 1.06, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {status === 'armed' && (
                <motion.div
                  className="absolute rounded-full bg-green-500/20"
                  style={{ width: 220, height: 220 }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <motion.div
                className="relative rounded-full flex items-center justify-center"
                style={{ width: 180, height: 180 }}
                animate={
                  isFlashing
                    ? { backgroundColor: ['#ff3b30', '#007aff', '#ff3b30'] }
                    : status === 'armed'
                    ? { backgroundColor: '#30d15820' }
                    : { backgroundColor: 'var(--color-card)' }
                }
                transition={isFlashing ? { duration: 0.6, repeat: Infinity } : { duration: 0.4 }}
              >
                {status === 'armed' && (
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{ background: 'conic-gradient(from 0deg, transparent 0%, #30d15840 10%, transparent 20%)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                <motion.span
                  className="text-[72px] leading-none relative z-10"
                  animate={isFlashing ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5] } : {}}
                  transition={isFlashing ? { duration: 0.4, repeat: Infinity } : {}}
                >
                  🚨
                </motion.span>
              </motion.div>
            </div>

            <div className="text-center">
              {status === 'idle' && (
                <p className="text-[15px] font-semibold text-muted-foreground">Disarmed</p>
              )}
              {status === 'arming' && (
                <>
                  <p className="text-[28px] font-bold tabular-nums">{countdown}</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Place your phone down…</p>
                </>
              )}
              {status === 'armed' && (
                <p className="text-[15px] font-semibold text-green-500">Armed — watching…</p>
              )}
              {status === 'triggered' && (
                <motion.p
                  className="text-[15px] font-bold text-red-500"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  🚨 Phone moved!
                </motion.p>
              )}
            </div>

            {status === 'idle' && (
              <Button size="lg" onClick={arm} className="w-48 rounded-full">
                Arm
              </Button>
            )}
            {status === 'arming' && (
              <Button size="lg" variant="secondary" onClick={disarm} className="w-48 rounded-full">
                Cancel
              </Button>
            )}
            {(status === 'armed' || status === 'triggered') && (
              <Button size="lg" variant="destructive" onClick={disarm} className="w-48 rounded-full">
                Disarm
              </Button>
            )}
          </div>

        </div>
      </cap-content>
    </cap-page>
  );
}
