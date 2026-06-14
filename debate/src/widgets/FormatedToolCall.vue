<template>
    <div class="flex flex-row space-x-2 items-center">
        <ToolsIcon width="24" height="24" class=" opacity-50" :class="toolIconCls(turn, tool)">
        </ToolsIcon>
        <div class="font-semibold">{{ tool.call.name }}</div>
        <div>
            <div class="flex flex-col space-y-3 ml-5 ">
                <div v-for="(k, v) in tool.call.arguments" class="flex flex-row space-x-2">
                    <div class="txt-semilight">
                        <ArgumentIcon width="24" height="24"></ArgumentIcon>
                    </div>
                    <div>{{ v }}:</div>
                    <div class="txt-semilight">{{ k }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ToolTurn } from '@locallm/types';
import ToolsIcon from './icons/ToolsIcon.vue';
import ArgumentIcon from './icons/ArgumentIcon.vue';

defineProps({
    tool: {
        type: Object as () => ToolTurn,
        required: true
    },
    turn: {
        type: Object as () => Record<string, any>,
        required: true
    }
});

function toolIconCls(turn: Record<string, any>, tool: ToolTurn): string {
    if (tool.call.id in turn.state.confirmToolCalls) {
        return 'txt-warning'
    }
    if (tool?.response) {
        if (tool.response == "tool execution denied") {
            return 'txt-danger'
        }
        return 'txt-success'
    } else {
        return 'txt-danger'
    }
}
</script>