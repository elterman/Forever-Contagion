import { PET_COUNT, PROMPT_TRANSITION } from './const';
import { showDialog } from './shared.svelte';
import { post } from './utils';

export const ss = $state({
    fobs: [],
    dlg: true,
    pet_count: PET_COUNT,
});

export const _prompt = $state({
    id: '',
    opacity: 0,

    hide: (plop = true) => {
        if (!_prompt.opacity) {
            return;
        }

        _prompt.opacity = 0;
        post(() => _prompt.id = null, PROMPT_TRANSITION);

        if (plop && !ss.over && ss.flies.length === 0) {
            post(() => showDialog(true, plop));
        }
    },

    set: (id) => {
        const doSet = () => {
            _prompt.id = id;
            _prompt.opacity = id ? 1 : 0;
        };

        if (_prompt.id) {
            _prompt.hide(false);
            post(doSet, PROMPT_TRANSITION);
        } else {
            doSet();
        }
    }
});

export const _stats = $state({
    plays: 0,
    won: 0,
    total_ticks: 0,
    best_ticks: 0,
});