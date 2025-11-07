import { PI_OVER_180 } from './const';

export const windowSize = () => {
    const d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        w = e.clientWidth || g.clientWidth,
        h = e.clientHeight || g.clientHeight;

    return { w, h };
};

export const clientRect = selector => {
    const ob = document.querySelector(selector);
    const r = ob?.getBoundingClientRect();

    return r;
};

export const underMouse = (event, selectors) => {
    for (const selector of selectors) {
        const r = clientRect(selector);

        if (!r) {
            continue;
        }

        const x = event.clientX;
        const y = event.clientY;

        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            return true;
        }
    }

    return false;
};

export const focusOnApp = () => {
    document.querySelector('.app')?.focus();
};

export const isTouchable = () => navigator.maxTouchPoints > 0;

export const tapOrClick = (lower = false) => {
    const verb = isTouchable() ? 'Tap' : 'Click';
    return lower ? verb.toLowerCase() : verb;
};

export const isAppleDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const scrollClass = () => `root-scroll ${isTouchable() ? 'root-scroll-mobile' : ''}`;

export const post = (fn, ms) => setTimeout(fn, ms);

export const range = (n) => [...Array(n + 1).keys()].slice(1);

export const sameFob = (f1, f2) => f1.id === f2.id;

export const bounceAngle = (fob, other) => {
    const a = Math.atan2(other.cy - fob.cy, other.cx - fob.cx) / PI_OVER_180;
    const deg = Math.atan2(fob.vel.y, fob.vel.x) / PI_OVER_180;
    return (180 - deg - a * 2) % 360;
};

export const overlap = (rob1, rob2) => {
    return Math.hypot(rob1.cx - rob2.cx, rob1.cy - rob2.cy) < rob1.radius + rob2.radius;
};

// Usage with collision
export const handleCollision = (fob1, fob2) => {
    const dx = fob2.cx - fob1.cx;
    const dy = fob2.cy - fob1.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    const reflectVelocity = (velocity, normalVector) => {
        // velocity and normalVector are { x, y }
        // Formula: v_reflected = v - 2(v·n)n

        const dotProduct = velocity.x * normalVector.x + velocity.y * normalVector.y;

        return {
            x: velocity.x - 2 * dotProduct * normalVector.x,
            y: velocity.y - 2 * dotProduct * normalVector.y
        };
    };

    // Reflect velocities
    const v1 = reflectVelocity(fob1.vel, { x: nx, y: ny });
    const v2 = reflectVelocity(fob2.vel, { x: -nx, y: -ny });

    return { v1, v2 };
};
