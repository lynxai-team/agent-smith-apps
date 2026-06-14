<template>
    <div class="mt-3">
        <MarkdownRender :content="content" :max-live-nodes="10" :is-strict="true" />
    </div>
</template>

<script setup lang="ts">
import MarkdownRender, { type ParsedNode } from 'markstream-vue'
import { watchEffect } from 'vue';

const props = defineProps({
    node: {
        type: Object as () => ParsedNode,
    },
});

//@ts-ignore
let content = props?.node?.content;
watchEffect(() => {
    //@ts-ignore
    content = props?.node?.content;
    //console.log(typeof props.node, props.node);
})
</script>