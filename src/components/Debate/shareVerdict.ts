import { Platform } from 'react-native';

interface VerdictCardData {
    topic: string;
    forVotes: number;
    againstVotes: number;
    winner?: 'FOR' | 'AGAINST' | 'DRAW';
    url?: string;
}

// Draws a shareable 1200x630 verdict card on a canvas and hands it to the
// native share sheet (falls back to downloading the PNG). Web only.
export async function shareVerdictCard(data: VerdictCardData): Promise<boolean> {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return false;

    try {
        const W = 1200;
        const H = 630;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        // Background
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0B0E14');
        bg.addColorStop(1, '#06070A');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Ambient glows
        const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, 400);
        glow1.addColorStop(0, 'rgba(56,189,248,0.18)');
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, H);
        const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 0, W * 0.1, H * 0.95, 400);
        glow2.addColorStop(0, 'rgba(248,113,113,0.12)');
        glow2.addColorStop(1, 'transparent');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, W, H);

        // HUD corner brackets
        ctx.strokeStyle = 'rgba(56,189,248,0.7)';
        ctx.lineWidth = 4;
        const b = 36;
        const inset = 28;
        const corners: Array<[number, number, number, number]> = [
            [inset, inset + b, inset, inset], [inset, inset, inset + b, inset],
            [W - inset - b, inset, W - inset, inset], [W - inset, inset, W - inset, inset + b],
            [inset, H - inset - b, inset, H - inset], [inset, H - inset, inset + b, H - inset],
            [W - inset - b, H - inset, W - inset, H - inset], [W - inset, H - inset, W - inset, H - inset - b],
        ];
        ctx.beginPath();
        for (let i = 0; i < corners.length; i += 2) {
            ctx.moveTo(corners[i][0], corners[i][1]);
            ctx.lineTo(corners[i][2], corners[i][3]);
            ctx.lineTo(corners[i + 1][2], corners[i + 1][3]);
        }
        ctx.stroke();

        // Brand
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('[ DATARIOT // ARENA.VERDICT ]', 70, 100);

        // Topic (wrapped)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px sans-serif';
        const words = data.topic.toUpperCase().split(' ');
        let line = '';
        let y = 200;
        for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > W - 140 && line) {
                ctx.fillText(line, 70, y);
                line = word;
                y += 64;
                if (y > 330) { line += '…'; break; }
            } else {
                line = test;
            }
        }
        ctx.fillText(line, 70, y);

        // Vote bar
        const total = data.forVotes + data.againstVotes;
        const forPct = total > 0 ? data.forVotes / total : 0.5;
        const barY = 420;
        const barW = W - 140;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(70, barY, barW, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.roundRect(70, barY, Math.max(26, barW * forPct), 26, 13);
        ctx.fill();

        ctx.font = 'bold 26px monospace';
        ctx.fillStyle = '#7DD3FC';
        ctx.fillText(`FOR ${data.forVotes}`, 70, barY - 16);
        ctx.fillStyle = '#F87171';
        ctx.textAlign = 'right';
        ctx.fillText(`${data.againstVotes} AGAINST`, W - 70, barY - 16);

        // Verdict line
        ctx.textAlign = 'left';
        ctx.font = 'bold 34px monospace';
        ctx.fillStyle = '#D9E4FF';
        const verdictLine = data.winner
            ? (data.winner === 'DRAW' ? '>> VERDICT: DRAW' : `>> VERDICT: ${data.winner} WINS`)
            : '>> THE ARENA IS STILL VOTING — JOIN IN';
        ctx.fillText(verdictLine, 70, 540);

        if (data.url) {
            ctx.font = '22px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText(data.url.replace(/^https?:\/\//, ''), 70, 580);
        }

        const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/png'));
        if (!blob) return false;

        const file = new File([blob], 'datariot-verdict.png', { type: 'image/png' });
        const nav: any = navigator;
        if (nav.canShare && nav.canShare({ files: [file] })) {
            await nav.share({
                files: [file],
                title: 'Datariot Arena Verdict',
                text: data.topic,
                url: data.url,
            });
        } else {
            // Fallback: download the card
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'datariot-verdict.png';
            a.click();
            URL.revokeObjectURL(a.href);
        }
        return true;
    } catch (err) {
        console.error('Error sharing verdict card:', err);
        return false;
    }
}
