<template>
    <div class="w-full h-full flex flex-col">
        <template v-if="view == 'main'">
            <div class="p-3 flex flex-col space-y-3 flex-grow">
                <div class="flex flex-row space-x-1" v-for="(debate, name) in debates">
                    <button class="btn flex flex-row space-x-2" @click="_openDebate(debate)">
                        <div>{{ debate.name }}</div>
                    </button>
                    <button class="btn txt-lighter" @click="editDebate(debate)">
                        <EditIcon width="24" height="24"></EditIcon>
                    </button>
                </div>

            </div>
            <div class="mb-5 w-full flex flex-row justify-center">
                <button class="btn w-max mx-3 flex flex-row items-center space-x-2 
                txt-semilight border bord-light hover:lighter" @click="newDebate()">
                    <AddIcon width="24" height="24"></AddIcon>
                    <div>New debate</div>
                </button>
            </div>
        </template>
        <div class="flex flex-col" v-else>
            <button class="btn border bord-lighter flex flex-row space-x-2 txt-semilight items-center"
                @click="_closeDebate()">
                <div>
                    <BackIcon height="16" width="16"></BackIcon>
                </div>
                <div>Debates</div>
            </button>
            <AppSidebarDebate></AppSidebarDebate>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { closeDebate, currentDebate, debates, onStateReady, openDebate } from './state.js';
import AppSidebarDebate from './AppSidebarDebate.vue';
import BackIcon from "./widgets/icons/BackIcon.vue";
import type { Debate } from './interfaces.js';
import AddIcon from './widgets/icons/AddIcon.vue';
import EditIcon from './widgets/icons/EditIcon.vue';

const view = ref("main");

function _openDebate(debate: Debate) {
    view.value = debate.id;
    openDebate(debate.id);
}

function _closeDebate() {
    view.value = "main";
    closeDebate()
}

function editDebate(d: Debate) {
    currentDebate.isEdit = true;
    currentDebate.debate = d;
}

function newDebate() {
    currentDebate.debate = {} as Debate;
    currentDebate.isEdit = true;
}

onBeforeMount(() => {
    onStateReady.then(() => {
        if (currentDebate?.isActive) {
            view.value = currentDebate.debate.id;
        }
    });
})
</script>