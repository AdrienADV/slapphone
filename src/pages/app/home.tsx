import { useRef, useEffect, useState } from "react";
import { setupPage } from '@capgo/capacitor-transitions/react';
import { CapacitorAccelerometer } from '@capgo/capacitor-accelerometer';
import { useTabbarHeight } from '@/layouts/tab-layout';
import { motion } from 'motion/react';
import { TrendingUp, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

import comboSound from '@/assets/sounds/combo.mp3';
import fartSound from '@/assets/sounds/fart.mp3';
import gentlemanSound from '@/assets/sounds/gentleman.mp3';
import goatSound from '@/assets/sounds/goat.mp3';
import manSound from '@/assets/sounds/man.mp3';
import metalSound from '@/assets/sounds/metal.mp3';
import sampleManSound from '@/assets/sounds/sample-man.mp3';
import sexySound from '@/assets/sounds/sexy.mp3';
import yameteSound from '@/assets/sounds/yamete.mp3';

const SOUNDS = [
  { id: 'fart', label: 'Fart', emoji: '💨', src: fartSound },
  { id: 'combo', label: 'Combo', emoji: '💥', src: comboSound },
  { id: 'gentleman', label: 'Gentleman', emoji: '🎩', src: gentlemanSound },
  { id: 'goat', label: 'Goat', emoji: '🐐', src: goatSound },
  { id: 'man', label: 'Groan', emoji: '😩', src: manSound },
  { id: 'metal', label: 'Metal', emoji: '🤘', src: metalSound },
  { id: 'sample-man', label: 'Dude', emoji: '🧔', src: sampleManSound },
  { id: 'sexy', label: 'Sexy', emoji: '🔥', src: sexySound },
  { id: 'yamete', label: 'Yamete', emoji: '🇯🇵', src: yameteSound },
] as const;

const THRESHOLDS = { Soft: 1.4, Medium: 1.9, Hard: 2.8 } as const;
const COOLDOWN_MS = 600;

function Card({ children, className = '' }: {
  readonly children: React.ReactNode; readonly className?: string;
}) {
  return (
    <div
      className={`mx-4 bg-card rounded-[22px] p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.07)]
        dark:shadow-none dark:border dark:border-white/[0.08] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string>('sexy');
  const [slapped, setSlapped] = useState(false);
  const [sensitivity, setSensitivity] = useState<'Soft' | 'Medium' | 'Hard'>('Soft');
  const tabbarHeight = useTabbarHeight();

  const selectedIdRef = useRef(selectedId);
  const sensitivityRef = useRef(sensitivity);
  const lastSlapRef = useRef(0);
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  useEffect(() => {
    SOUNDS.forEach(({ id, src }) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.load();
      audioRef.current[id] = audio;
    });
  }, []);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  function triggerSlap() {
    const audio = audioRef.current[selectedIdRef.current];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => { });
    }
    setSlapped(true);
    setTimeout(() => setSlapped(false), 400);
  }

  useEffect(() => {
    CapacitorAccelerometer.startMeasurementUpdates();

    const listenerPromise = CapacitorAccelerometer.addListener('measurement', (m) => {
      const mag = Math.hypot(m.x, m.y, m.z);
      const now = Date.now();

      if (mag > THRESHOLDS[sensitivityRef.current] && now - lastSlapRef.current > COOLDOWN_MS) {
        lastSlapRef.current = now;
        triggerSlap();
      }
    });

    return () => {
      listenerPromise.then(l => l.remove());
      CapacitorAccelerometer.stopMeasurementUpdates();
    };
  }, []);

  const selected = SOUNDS.find(s => s.id === selectedId)!;

  return (
    <cap-page ref={pageRef}>
      <cap-content className='bg-background'>
        <div className="pt-(--safe-area-top) bg-background" style={{ paddingBottom: (tabbarHeight || 48) + 10 }}>

          {/* Header */}
          <div className="px-5 pt-4 pb-5">
            <h1 className="text-[28px] font-bold tracking-tight">Slap Phone</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Slap your iPhone to play a sound</p>
          </div>

          {/* Main indicator */}
          <div className="mx-4 mb-5">
            <motion.div
              animate={slapped ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden rounded-[22px] p-5 flex items-center gap-3
                bg-card shadow-[0_2px_12px_rgba(0,0,0,0.07)]
                dark:shadow-none dark:border dark:border-white/[0.08]"
            >
              {slapped && (
                <motion.div
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-primary pointer-events-none rounded-[22px]"
                />
              )}
              <motion.span
                animate={slapped ? { scale: [1, 1.6, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="text-[40px] leading-none"
              >
                {selected.emoji}
              </motion.span>
              <div>
                <p className="font-semibold text-[16px]">{selected.label}</p>
                <p className="text-[12px] text-muted-foreground">
                  {slapped ? '👋 Slap!' : 'Listening...'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sound grid */}
          <div className="px-4 mb-5">
            <p className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-1">
              Sounds
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {SOUNDS.map(({ id, label, emoji }) => {
                const sel = id === selectedId;
                return (
                  <Button
                    key={id}
                    variant={sel ? 'default' : 'secondary'}
                    onClick={() => {
                      setSelectedId(id);
                      const audio = audioRef.current[id];
                      if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
                    }}
                    className={`rounded-[18px] h-auto py-3.5 flex flex-col items-center gap-1.5
                      ${sel ? 'shadow-[0_4px_14px_rgba(0,0,0,0.18)]' : ''}`}
                  >
                    <span className="text-[30px] leading-none">{emoji}</span>
                    <span className="text-[11px] font-medium">{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sensitivity */}
          <Card className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-primary" />
              <span className="font-semibold text-[14px]">Sensitivity</span>
            </div>
            <div className="flex gap-2">
              {(['Soft', 'Medium', 'Hard'] as const).map((level) => (
                <Button
                  key={level}
                  variant={sensitivity === level ? 'default' : 'secondary'}
                  onClick={() => setSensitivity(level)}
                  className="flex-1 rounded-full text-[12px]"
                >
                  {level}
                </Button>
              ))}
            </div>
          </Card>

          {/* Best results tip */}
          <Card className="mb-5">
            <div className="flex items-start gap-3">
              <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                For best results, hold your iPhone firmly and slap it on your palm or a flat surface.
                Avoid false triggers by keeping the sensitivity on{' '}
                <span className="font-semibold text-foreground">Medium</span>.
              </p>
            </div>
          </Card>

          {/* Top sounds */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Star className="size-4 text-primary" />
              <span className="font-semibold text-[14px]">Top sounds</span>
            </div>
            {[
              { emoji: '💨', label: 'Fart', pct: 100, count: 52 },
              { emoji: '💥', label: 'Combo', pct: 71, count: 37 },
              { emoji: '🤘', label: 'Metal', pct: 52, count: 27 },
              { emoji: '😩', label: 'Groan', pct: 38, count: 20 },
            ].map(({ emoji, label, pct, count }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">{emoji}</span>
                    <span className="font-semibold">{label}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">{count} slaps</span>
                </div>
                <div className="h-[6px] rounded-full overflow-hidden bg-primary/15">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </Card>

        </div>
      </cap-content>
    </cap-page>
  );
}
