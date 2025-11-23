import { isNumber, random } from 'lodash-es';
import { APP_KEY, DEAD_MS, PET_COUNT, PET_RADIUS, PET_VELOCITY, TICK_MS, ZET_RADIUS } from './const';
import { _sound } from './sound.svelte';
import { _prompt, _stats, ss } from './state.svelte';
import { clientRect, handleCollision, isPet, isZet, overlap, post } from './utils';

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

const onTick = () => {
    if (ss.dlg) {
        return;
    }

    ss.ticks += 1;

    if (liveCount() === PET_COUNT) {
        ss.streak_ticks += 1;

        if (ss.streak_ticks > _stats.best_streak) {
            _stats.best_streak = ss.streak_ticks;
            persist();
        }
    }

    const zet = findZet();
    zet.cx += zet.vel.x;
    zet.cy += zet.vel.y;

    const excluded = [];

    for (const fob of ss.fobs) {
        if (!isZet(fob)) {
            let { x, y } = fob.vel;

            if ((ss.ticks * TICK_MS) % 1000 === 0) {
                x *= 1.15;
                y *= 1.15;

                if (Math.abs(x) + Math.abs(y) <= PET_VELOCITY) {
                    fob.vel = { x, y };
                }
            }

            fob.cx += fob.vel.x;
            fob.cy += fob.vel.y;

            if (isNumber(fob.dead) && fob.lives > 0 && ((ss.ticks - fob.dead) * TICK_MS) >= DEAD_MS) {
                shake(fob);
                delete fob.dead;
                _sound.play('won', { rate: liveCount() < PET_COUNT ? 4 : 1 });
            }
        }

        const edge = hitEdge(fob);

        if (edge) {
            if (isZet(fob)) {
                _sound.play('plop');
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

            const checkDied = (zob, fob) => {
                if (isPet(fob) && !fob.dead) {
                    shake(fob);

                    if (isZet(zob)) {
                        shake(zob);
                    }

                    if (liveCount() === PET_COUNT) {
                        _stats.last_streak = ss.streak_ticks;
                        persist();
                    }

                    fob.dead = ss.ticks;
                    ss.streak_ticks = 0;

                    _sound.play('lost', { rate: 2 });
                }
            };

            if (isZet(fob1) || fob1.dead) {
                checkDied(fob1, fob2);
            } else if (isZet(fob2) || fob2.dead) {
                checkDied(fob2, fob1);
            }

            const { v1, v2 } = handleCollision(fob1, fob2);

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
        _stats.last_streak = job.last_streak;
        _stats.best_streak = job.best_streak;
    } else {
        _stats.plays = 0;
        _stats.last_streak = 0;
        _stats.best_streak = 0;
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

    const zet = { id: 'zet', cx: random(width) + radius, cy: random(height) + radius, radius, vel: { x: 0, y: 0 }, dead: true, lives: 0 };
    ss.fobs.push(zet);
};

const addPets = () => {
    const radius = PET_RADIUS * ss.scale;

    const width = ss.space.width - radius * 2;
    const height = ss.space.height - radius * 2;

    for (let i = 0; i < PET_COUNT; i++) {
        ss.fobs.push({ id: `pet-${i + 1}`, lives: 9, cx: random(width) + radius, cy: random(height) + radius, radius, vel: makeVelocity(PET_VELOCITY * 0.1) });
    }
};

export const findZet = () => ss.fobs.find((fob) => isZet(fob));

export const doResize = (init) => {
    ss.space = clientRect('.space');

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
