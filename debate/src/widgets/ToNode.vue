<template>
    <div class="flex flex-row space-x-3 items-center ml-8">
        <div class="txt-semilight">to</div>
        <div class="font-semibold txt-success">{{ content.split(',').join(', ') }}</div>
    </div>
</template>

<script setup lang="ts">
import { type ParsedNode } from 'markstream-vue'
import { watchEffect } from 'vue';

const props = defineProps({
    node: {
        type: Object as () => ParsedNode,
    },
});

//@ts-ignore
let content = props?.node?.content ?? "";
watchEffect(() => {
    //@ts-ignore
    content = props?.node?.content ?? "";
})
</script>