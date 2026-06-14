<template>
    <div class="p-3 flex flex-col space-y-3">
        <div class="text-2xl">{{ debate.state.name }}</div>
        <div class="text-xl">Orchestrator</div>
        <div class="ml-2">
            <span v-if="debate.state.talking.id == debate.state.orchestrator.id" class="txt-success font-bold">{{
                debate.state.orchestrator.name }}</span>
            <template v-else>{{ debate.state.orchestrator.name }}</template>
        </div>
        <div class="text-xl">Participants</div>
        <div v-for="(v, k) of debate.state.participants" class="ml-2">
            <span v-if="debate.state.talking.id == k" class="txt-success font-bold">{{ v.name }}</span>
            <template v-else>{{ v.name }}</template>
        </div>
        <div class="text-xl">Advisors</div>
        <div v-for="(v, k) of debate.state.advisors" class="ml-2">
            <span v-if="debate.state.talking.id == k" class="txt-success font-bold">{{ v.name }}</span>
            <template v-else>{{ v.name }}</template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { debate } from './state.js';
</script>