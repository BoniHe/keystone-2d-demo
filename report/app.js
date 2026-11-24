const benchmark = [
    { actors: 1, fps: 60.2, low: 59.6, frame: 16.62 },
    { actors: 10, fps: 60.1, low: 59.6, frame: 16.64 },
    { actors: 50, fps: 60.2, low: 59.6, frame: 16.61 },
    { actors: 99, fps: 60.0, low: 59.6, frame: 16.66 }
];

const actorStage = document.querySelector('#actorStage');
const actorTabs = [...document.querySelectorAll('.actor-tab')];
const selectedActors = document.querySelector('#selectedActors');
const selectedFps = document.querySelector('#selectedFps');
const selectedLow = document.querySelector('#selectedLow');
const selectedFrame = document.querySelector('#selectedFrame');

function renderActors(index) {
    const result = benchmark[index];
    actorStage.replaceChildren();

    for (let actor = 0; actor < result.actors; actor += 1) {
        const dot = document.createElement('span');
        dot.className = 'actor-dot';
        dot.style.setProperty('--delay', actor);
        actorStage.append(dot);
    }

    selectedActors.textContent = result.actors;
    selectedFps.textContent = result.fps.toFixed(1);
    selectedLow.textContent = result.low.toFixed(1);
    selectedFrame.textContent = `${result.frame.toFixed(2)} ms`;

    actorTabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
    });
}

actorTabs.forEach((tab) => {
    tab.addEventListener('click', () => renderActors(Number(tab.dataset.index)));
});
renderActors(0);

const canvas = document.querySelector('#fpsChart');
const context = canvas.getContext('2d');

function drawChart() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 28, right: 24, bottom: 42, left: 46 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const min = 58.8;
    const max = 60.8;
    const x = (index) => padding.left + (plotWidth * index) / (benchmark.length - 1);
    const y = (value) => padding.top + plotHeight - ((value - min) / (max - min)) * plotHeight;

    context.clearRect(0, 0, width, height);
    context.font = '12px system-ui';
    context.textAlign = 'right';
    context.textBaseline = 'middle';

    [59, 59.5, 60, 60.5].forEach((value) => {
        const lineY = y(value);
        context.strokeStyle = value === 60 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)';
        context.setLineDash(value === 60 ? [6, 6] : []);
        context.beginPath();
        context.moveTo(padding.left, lineY);
        context.lineTo(width - padding.right, lineY);
        context.stroke();
        context.fillStyle = 'rgba(157,168,189,.9)';
        context.fillText(value.toFixed(1), padding.left - 10, lineY);
    });

    const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(76,230,196,.28)');
    gradient.addColorStop(1, 'rgba(76,230,196,0)');
    context.setLineDash([]);
    context.beginPath();
    benchmark.forEach((point, index) => {
        if (index === 0) context.moveTo(x(index), y(point.fps));
        else context.lineTo(x(index), y(point.fps));
    });
    context.lineTo(x(benchmark.length - 1), height - padding.bottom);
    context.lineTo(x(0), height - padding.bottom);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    benchmark.forEach((point, index) => {
        if (index === 0) context.moveTo(x(index), y(point.fps));
        else context.lineTo(x(index), y(point.fps));
    });
    context.strokeStyle = '#4ce6c4';
    context.lineWidth = 3;
    context.lineJoin = 'round';
    context.stroke();

    benchmark.forEach((point, index) => {
        context.beginPath();
        context.arc(x(index), y(point.fps), 5, 0, Math.PI * 2);
        context.fillStyle = '#070b16';
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = '#4ce6c4';
        context.stroke();
        context.fillStyle = 'rgba(157,168,189,.95)';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(String(point.actors), x(index), height - padding.bottom + 13);
    });
}

drawChart();
window.addEventListener('resize', drawChart);

const ranges = {
    players: document.querySelector('#playersRange'),
    tick: document.querySelector('#tickRange'),
    bytes: document.querySelector('#bytesRange')
};

function updateBandwidth() {
    const players = Number(ranges.players.value);
    const tick = Number(ranges.tick.value);
    const bytes = Number(ranges.bytes.value);
    const totalMbps = players * Math.max(players - 1, 0) * tick * bytes * 8 / 1_000_000;
    const perClientMbps = Math.max(players - 1, 0) * tick * bytes * 8 / 1_000_000;

    document.querySelector('#playersOutput').textContent = players;
    document.querySelector('#tickOutput').textContent = `${tick} Hz`;
    document.querySelector('#bytesOutput').textContent = `${bytes} B`;
    document.querySelector('#bandwidthResult').textContent = `${totalMbps.toFixed(1)} Mbps`;
    document.querySelector('#clientBandwidth').textContent = `Each client receives about ${perClientMbps.toFixed(2)} Mbps`;
}

Object.values(ranges).forEach((range) => range.addEventListener('input', updateBandwidth));
updateBandwidth();

document.querySelector('#printReport').addEventListener('click', () => window.print());

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
