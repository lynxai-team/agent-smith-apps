<template>
    <div class="text-lg font-semibold flex flex-row space-x-2 items-center">
        <ActionIcon height="20" width="20" class="txt-semilight"></ActionIcon>
        <div class="txt-warning">{{ content }}</div>
    </div>
</template>

<script setup lang="ts">
import { type ParsedNode } from 'markstream-vue'
import ActionIcon from './icons/WaitIcon.vue';

const props = defineProps({
    node: {
        type: Object as () => ParsedNode,
    },
});

//@ts-ignore
const content = props?.node?.content;
</script>