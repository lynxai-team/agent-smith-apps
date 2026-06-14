<template>
    <div class="flex flex-row space-x-2 txt-light">
        <button class="btn px-0" v-if="uistate.autoscroll" @click="toggleAutoscroll(false)">
            <ScrollIcon height="32" width="32"></ScrollIcon>
        </button>
        <button class="btn px-0" v-else>
            <NoScrollIcon height="32" width="32" @click="toggleAutoscroll(true)"></NoScrollIcon>
        </button>
        <button class="btn px-0" v-if="uistate.viewMode == 'markdown'" @click="toggleTextViewMode('text')">
            <MarkdownIcon height="32" width="32"></MarkdownIcon>
        </button>
        <button class="btn px-0 flex flex-row space-x-2" v-else-if="uistate.viewMode == 'text'"
            @click="toggleTextViewMode('raw')">
            <TextFormatIcon height="32" width="32" class="mt-1"></TextFormatIcon>
        </button>
        <button class="btn px-0 flex flex-row space-x-2" v-else @click="toggleTextViewMode('markdown')">
            <TextIcon height="32" width="32" class="mt-1"></TextIcon>
        </button>
    </div>
</template>

<script setup lang="ts">
import MarkdownIcon from './icons/MarkdownIcon.vue';
import TextIcon from './icons/TextIcon.vue';
import ScrollIcon from './icons/ScrollIcon.vue';
import NoScrollIcon from './icons/NoScrollIcon.vue';
import { toast } from '../components/vibe/toast/composable.js';
import TextFormatIcon from './icons/TextFormatIcon.vue';
import type { ShallowReactive } from 'vue';

const props = defineProps({
    uistate: {
        type: Object as () => ShallowReactive<Record<string, any>>,
        required: true
    }
})

function toggleTextViewMode(mode: "text" | "markdown" | "raw") {
    props.uistate.viewMode = mode;
    toast.info(`View <b>${mode}</b> mode`);
}

function toggleAutoscroll(mode: boolean) {
    props.uistate.autoscroll = mode;
    toast.info(`Autoscroll <b>${mode}</b>`);
}
</script>