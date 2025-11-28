import { useEffect, useState } from 'react';
import { useLottie } from 'lottie-react';
import runData from '../lottie/run.json';
import crashData from '../lottie/crash.json';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [stage, setStage] = useState<'run' | 'crash' | 'logo'>('run');

    const runOptions = { animationData: JSON.parse(JSON.stringify(runData)), loop: false, autoplay: true };
    const crashOptions = { animationData: JSON.parse(JSON.stringify(crashData)), loop: false, autoplay: true };

    const runLottie = useLottie(runOptions, { width: 300, height: 300 });
    const crashLottie = useLottie(crashOptions, { width: 300, height: 300 });

    useEffect(() => {
        // Run stage ends → go to crash
        if (stage === 'run') {
            const timeout = setTimeout(() => setStage('crash'), runLottie.View?.duration * 1000 || 2000);
            return () => clearTimeout(timeout);
        }
        // Crash stage → go to logo reveal
        if (stage === 'crash') {
            const timeout = setTimeout(() => setStage('logo'), crashLottie.View?.duration * 1000 || 1500);
            return () => clearTimeout(timeout);
        }
        // Letter-by-letter text reveal
        if (stage === 'logo') {
            let i = 0;
            const text = 'MEDZORA';
            const reveal = setInterval(() => {
                i++;
                (document.getElementById('logo-text') as any).textContent = text.slice(0, i);
                if (i === text.length) clearInterval(reveal);
            }, 150);
            const finishTimeout = setTimeout(onFinish, text.length * 150 + 500);
            return () => { clearInterval(reveal); clearTimeout(finishTimeout); };
        }
    }, [stage]);

    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
            {stage === 'run' && runLottie.View}
            {stage === 'crash' && crashLottie.View}
            {stage === 'logo' && <div id="logo-text" className="text-6xl font-bold text-green-400 tracking-wider"></div>}
        </div>
    );
}
