import { random } from 'lodash-es';
import { APP_KEY, ELON_RADIUS, TICK_MS, UFO_COUNT, UFO_RADIUS, UFO_VELOCITY } from './const';
import { _sound } from './sound.svelte';
import { _stats, ss } from './state.svelte';
import { clientRect, post } from './utils';

export const _log = (value) => console.log($state.snapshot(value));

const makeVelocity = (velocity) => {
    velocity *= ss.scale;

    let x = random(0, velocity, true);
    let y = velocity - x;

    if (random() % 2) {
        x = -x;
    }

    if (random() % 2) {
        y = -y;
    }

    return { x, y };
};

const addElon = () => {
    const radius = ELON_RADIUS * ss.scale;

    const width = ss.space.width - radius * 2;
    const height = ss.space.height - radius * 2;

    const elon = { id: 'elon', cx: random(width) + radius, cy: random(height) + radius, radius, vel: { x: 0, y: 0 }, ticks: 0 };
    ss.fobs.push(elon);
};

const addUFOs = () => {
    const radius = UFO_RADIUS * ss.scale;

    const width = ss.space.width - radius * 2;
    const height = ss.space.height - radius * 2;

    for (let i = 0; i < UFO_COUNT; i++) {
        ss.fobs.push({ id: `ufo-${i + 1}`, cx: random(width) + radius, cy: random(height) + radius, radius, vel: makeVelocity(UFO_VELOCITY), ticks: 0 });
    }
};

export const onStart = () => {
    if (!_sound.musicPlayed) {
        _sound.playMusic();
    }

    _sound.play('dice');

    delete ss.over;
    delete ss.restart;
    delete ss.lastDist;
    delete ss.velocity;

    ss.ticks = 0;

    do {
        ss.fobs = [];

        addElon();
        addUFOs();
    } while (false);

    clearInterval(ss.timer);
    ss.timer = setInterval(onTick, TICK_MS);

    _stats.plays += 1;
    persist();
};

const hitEdge = (fob) => {
    const x = fob.cx;
    const y = fob.cy;

    if (x - fob.radius <= 0) {
        return 4;
    }

    if (x + fob.radius >= ss.space.width) {
        return 2;
    }

    if (y - fob.radius <= 0) {
        return 1;
    }

    if (y + fob.radius >= ss.space.height) {
        return 3;
    }

    return 0;
};

const onTick = () => {
    if (ss.dlg) {
        return;
    }

    ss.ticks += 1;
};

export const score = () => {
    const secs = Math.floor(((ss.ticks || 0) * TICK_MS) / 1000);
    return Math.max(1000 - secs, 0);
};

const shake = () => {
    const elon = findElon();
    elon.shake = true;
    post(() => delete elon.shake, 200);
};

export const lost = () => (ss.over && ss.over !== 'won') ? ss.over : false;

export const showDialog = (value, plop = true) => {
    plop && _sound.play('plop');
    ss.dlg = value;
};

export const doResize = (init) => {
    ss.space = clientRect('.space');

    if (!init) {
        return;
    }

    _sound.stopMusic();

    if (ss.fobs.length) {
        ss.fobs = [];
        ss.dlg = true;

        delete ss.over;
    }
};

export const persist = () => {
    let json = { ..._sound, ..._stats };
    localStorage.setItem(APP_KEY, JSON.stringify(json));
};

export const loadGame = () => {
    const json = localStorage.getItem(APP_KEY);
    const job = JSON.parse(json);

    if (job) {
        _sound.sfx = job.sfx;
        _sound.music = job.music;
        _stats.plays = job.plays;
        _stats.won = job.won;
        _stats.total_points = job.total_points;
        _stats.best_points = job.best_points;
    } else {
        _stats.plays = 0;
        _stats.won = 0;
        _stats.total_points = 0;
        _stats.best_points = 0;
    }
};

export const isElon = (fob) => fob?.id === 'elon';

export const findElon = () => ss.fobs.find((fob) => isElon(fob));
