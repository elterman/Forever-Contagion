import { isNumber, random } from 'lodash-es';
import { APP_KEY, DEAD_MS, PET_COUNT, PET_RADIUS, PET_VELOCITY, TICK_MS, ZET_RADIUS } from './const';
import { _sound } from './sound.svelte';
import { _prompt, _stats, ss } from './state.svelte';
import { clientRect, handleCollision, isZet, overlap, post } from './utils';

export const _log = (value) => console.log($state.snapshot(value));

const wellScattered = () => {
    const zet = findZet();

    for (const fob1 of ss.fobs) {
        for (const fob2 of ss.fobs) {
            if (fob1 === fob2) {
                continue;
            }

            const dist = Math.hypot(fob1.cx - fob2.cx, fob1.cy - fob2.cy);

            if (dist < zet.radius * 5) {
                return false;
            }
        }
    }

    return true;
};

export const onStart = () => {
    if (!_sound.musicPlayed) {
        _sound.playMusic();
    }

    _sound.play('dice');

    delete ss.over;
    delete ss.restart;

    ss.ticks = 0;

    do {
        ss.fobs = [];

        addZet();
        addPets();
    } while (!wellScattered());

    clearInterval(ss.timer);
    ss.timer = setInterval(onTick, TICK_MS);

    _stats.plays += 1;
    persist();
};

const hitEdge = (fob) => {
    const x = fob.cx;
    const y = fob.cy;

    if (x - fob.radius <= 0) {
        return fob.vel.x > 0 ? 0 : 4;
    }

    if (x + fob.radius >= ss.space.width) {
        return fob.vel.x < 0 ? 0 : 2;
    }

    if (y - fob.radius <= 0) {
        return fob.vel.y > 0 ? 0 : 1;
    }

    if (y + fob.radius >= ss.space.height) {
        return fob.vel.y < 0 ? 0 : 3;
    }

    return 0;
};

const onOver = () => {
    ss.over = ss.ticks;

    _sound.play('lost');
    // clearInterval(ss.timer);
    // delete ss.timer;

    if (_stats.best_ticks === 0 || ss.ticks < _stats.best_ticks) {
        _stats.best_ticks = ss.ticks;
        persist();
    }

};

const onTick = () => {
    if (ss.dlg) {
        return;
    }

    ss.ticks += 1;

    if (!ss.over && liveCount() === 0) {
        onOver();
        return;
    }

    const zet = findZet();
    zet.cx += zet.vel.x;
    zet.cy += zet.vel.y;

    const excluded = [];

    for (const fob of ss.fobs) {
        if (!isZet(fob)) {
            fob.cx += fob.vel.x;
            fob.cy += fob.vel.y;

            if (!ss.over && isNumber(fob.dead) && ((ss.ticks - fob.dead) * TICK_MS) >= DEAD_MS) {
                shake(fob);
                delete fob.dead;
                _sound.play('won', { rate: liveCount() < PET_COUNT ? 4 : 1 });
            }
        }

        const edge = hitEdge(fob);

        if (edge) {
            if (isZet(fob)) {
                !ss.over && _sound.play('plop');
                ss.bounced = true;
                post(() => delete ss.bounced, 1000);
            }

            excluded.push(fob);

            if (edge === 4 || edge === 2) {
                fob.vel = { x: -fob.vel.x, y: fob.vel.y };
            } else if (edge === 1 || edge === 3) {
                fob.vel = { x: fob.vel.x, y: -fob.vel.y };
            }
        }
    }

    for (const fob1 of ss.fobs) {
        if (excluded.includes(fob1)) {
            continue;
        }

        for (const fob2 of ss.fobs) {
            if (fob1 === fob2) {
                continue;
            }

            if (excluded.includes(fob2)) {
                continue;
            }

            if (!overlap(fob1, fob2)) {
                continue;
            }

            if (!!fob1.dead !== !!fob2.dead) {
                _sound.play('lost', { rate: 2 });

                shake(fob1);
                shake(fob2);

                if (!fob1.dead) {
                    fob1.dead = ss.ticks;
                }

                if (!fob2.dead) {
                    fob2.dead = ss.ticks;
                }
            }

            const { v1, v2 } = handleCollision(fob1, fob2);

            if (isZet(fob1)) {
                v1.x = Math.round((v1.x.toFixed(1) * 2)) / 2;
                v1.y = Math.round((v1.y.toFixed(1) * 2)) / 2;
            }

            fob1.vel = v1;
            fob2.vel = v2;

            excluded.push(fob1);
            excluded.push(fob2);
        }
    }
};

export const showDialog = (value, plop = true) => {
    plop && _sound.play('plop');
    ss.dlg = value;
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
        _stats.best_ticks = job.best_ticks;
    } else {
        _stats.plays = 0;
        _stats.best_ticks = 0;
    }
};

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

const addZet = () => {
    const radius = ZET_RADIUS * ss.scale;

    const width = ss.space.width - radius * 2;
    const height = ss.space.height - radius * 2;

    const zet = { id: 'zet', cx: random(width) + radius, cy: random(height) + radius, radius, vel: { x: 0, y: 0 }, dead: true };
    ss.fobs.push(zet);
};

const addPets = () => {
    const radius = PET_RADIUS * ss.scale;

    const width = ss.space.width - radius * 2;
    const height = ss.space.height - radius * 2;

    for (let i = 0; i < PET_COUNT; i++) {
        ss.fobs.push({ id: `pet-${i + 1}`, cx: random(width) + radius, cy: random(height) + radius, radius, vel: makeVelocity(PET_VELOCITY) });
    }
};

export const findZet = () => ss.fobs.find((fob) => isZet(fob));

export const doResize = (init) => {
    ss.space = clientRect('.space');

    let scx = 1;
    let scy = 1;

    const long = Math.max(ss.space.width, ss.space.height);
    const short = Math.min(ss.space.width, ss.space.height);

    if (long < 1700) {
        scx = long / 1700;
    }

    if (short < 940) {
        scy = short / 940;
    }

    ss.scale = Math.min(scx, scy);

    if (!init) {
        return;
    }

    _prompt.hide(false);
    _sound.stopMusic();

    if (ss.fobs.length) {
        ss.fobs = [];
        ss.dlg = true;

        delete ss.over;
    }
};

const shake = (fob) => {
    fob.shake = true;
    post(() => delete fob.shake, 200);
};

export const liveCount = () => ss.fobs.filter((f) => !f.dead).length;
