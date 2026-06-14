<template>
    <div class="h-full">
        <template v-if="currentDebate.isEdit">
            <AppEditDebate @save="addDebate($event)" :edit-debate="currentDebate?.debate?.id ?
                currentDebate.debate : {} as Debate" :msg="msg"
                @cancel="currentDebate.isEdit = false; currentDebate.debate = {} as Debate"></AppEditDebate>
        </template>
        <div v-show="!currentDebate.isEdit" id="main-output"
            class="flex flex-col flex-grow w-full h-max overflow-y-auto h-max">
            <div class="flex flex-col space-y-3 p-5">
                <!-- div v-if="question.length > 0" class="text-xl">
                    {{ question }}
                </div -->
                <div v-for="turn in debate.state.history">
                    <div v-if="turn?.orchestratorMsg" class="flex flex-col space-y-2">
                        <div class="flex flex-row space-x-3 items-center">
                            <div class="flex flex-row items-center space-x-3">
                                <svg class="txt-semilight" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                        d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4s-1.72-4-4-4s-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2s.82-2 2-2s2 .82 2 2m5.54 3.54c2.02-2.02 2.02-5.06 0-7.07l-1.41 1.41c1.23 1.23 1.23 3.01 0 4.24l1.41 1.41Z" />
                                    <path fill="currentColor"
                                        d="M21.1 8c0-2.34-.97-4.6-2.74-6.36l-1.41 1.41C18.34 4.44 19.1 6.19 19.1 8s-.76 3.56-2.15 4.95l1.41 1.41C20.12 12.6 21.1 10.34 21.1 8M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3" />
                                </svg>
                                <div class="font-bold text-xl">
                                    <span class="txt-danger">{{ turn.from.name }}</span>&nbsp;
                                    <span class="txt-light">{{ turn.from.model }}</span>
                                </div>
                            </div>
                            <div> => </div>
                            <div class="font-semibold txt-warning">{{ turn.orchestratorMsg.action }}</div>
                            <div v-if="turn.orchestratorMsg.to.length > 0">
                                <span class="txt-semilight">to</span> &nbsp;<span class="txt-success">{{
                                    turn.orchestratorMsg.to.join(', ')
                                    }}&nbsp;</span>
                            </div>
                        </div>
                        <div v-if="turn?.think" class="pb-3 pl-3">
                            <ThinkingContent :content="turn.think"></ThinkingContent>
                        </div>
                        <span>
                            <MarkdownRender :content="turn.orchestratorMsg.content ?? ''" custom-id="main" class=""
                                :custom-html-tags="customHtmlTags" :max-live-nodes="10" :is-strict="true" />
                        </span>
                    </div>
                    <div v-else class="flex flex-col space-y-2">
                        <div class="font-bold text-xl flex flex-row space-x-3 items-center">
                            <svg class="txt-semilight" xmlns="http://www.w3.org/2000/svg" width="21" height="21"
                                viewBox="0 0 24 24">
                                <path fill="currentColor"
                                    d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5s-5 2.24-5 5s2.24 5 5 5m0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3s-3-1.35-3-3s1.35-3 3-3M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1m6-7h4c2.76 0 5 2.24 5 5H5c0-2.76 2.24-5 5-5" />
                            </svg>
                            <div class="font-bold text-xl">
                                <template v-if="turn.from != 'user'">
                                    <span class="text-semibold"
                                        :class="turn.from == debate.orchestrator ? 'txt-danger' : 'txt-success'">{{
                                            turn.from.name }}</span>&nbsp;
                                    <span class="txt-light">{{ turn.from.model }}</span>
                                </template>
                                <template v-else>
                                    <span class="text-semibold txt-warning">User</span>
                                </template>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <div v-if="turn?.think" class="pb-3 pl-3">
                                <ThinkingContent :content="turn.think" v-if="turn.think != '\n\n'"></ThinkingContent>
                            </div>
                            <MarkdownRender :content="turn.content" v-if="uistate.viewMode == 'markdown'"
                                :custom-html-tags="customHtmlTags" />
                            <div v-else-if="uistate.viewMode == 'text'"
                                v-html="turn.content.replaceAll('\n', '<br />')">
                            </div>
                            <div v-else>
                                <pre>{{ turn.content }}</pre>
                            </div>
                        </div>
                    </div>
                    <div v-if="turn?.tools">
                        <div v-for="tool in turn.tools" class="flex flex-col cursor-pointer px-3" @click="
                            toolCallRequest ?
                                () => null :
                                toggleViewToolResult(tool.call.id, turn)">
                            <FormatedToolCall :tool="tool" :turn="turn"></FormatedToolCall>
                            <div v-if="tool.call.id in turn.state.confirmToolCalls" class="flex flex-row space-x-2">
                                <button class="btn danger text-sm"
                                    @click="turn.state.confirmToolCalls[tool.call.id].resolve(false)">Deny</button>
                                <button class="btn success text-sm"
                                    @click="turn.state.confirmToolCalls[tool.call.id].resolve(true)">Authorize</button>
                            </div>
                            <div v-if="tool?.response" class="mt-3 pl-5 overflow-y-auto slide-y max-w-5xl"
                                v-html="tool.response.replaceAll('\n', '<br />')" :class="turn.state.showToolResponses.includes(tool.call.id) ? [
                                    ['slidedown', 'mb-3']
                                ] : 'slideup'">
                            </div>
                            <div v-else class="mb-3"></div>
                        </div>
                    </div>
                </div>
                <!-- div v-if="debate.state.history.length == 0 && debate.stream.value == ''">
                    <button class="btn" @click="debate.run(question)">Start</button>
                </div -->
                <!-- div v-if="debate.state.talking?.id" class="font-bold text-xl flex flex-row space-x-3 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path class="txt-semilight" fill="currentColor"
                            d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4s-1.72-4-4-4s-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2s.82-2 2-2s2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m5.29-3.29l3 3c.2.2.45.29.71.29s.51-.1.71-.29l5-5L20.3 8.3l-4.29 4.29l-2.29-2.29l-1.41 1.41Z" />
                    </svg>
                    <div class="text-xl">
                        <span class="font-bold text-semibold txt-success"
                            :class="debate.state.talking.id == debate.state.orchestrator.id ? 'txt-danger' : 'txt-success'">{{
                                debate.state.talking.name }}</span>&nbsp;
                        <span class="txt-light">{{ debate.state.talking.model }}</span>
                    </div>
                </div -->
                <div>
                    <template v-if="hasThinking">
                        <ThinkingNode :nodes="thinkingNodes" custom-id="think" :is-strict="true"></ThinkingNode>
                    </template>
                    <MarkdownRender v-if="uistate.viewMode == 'markdown'" :nodes="debate.nodes.value"
                        custom-id="talking" class="" :custom-html-tags="customHtmlTags" />
                    <template v-else>
                        <div v-if="uistate.viewMode == 'text'" v-html="debate.stream.value.replaceAll('\n', '<br />')">
                        </div>
                        <div v-else>
                            <pre>{{ debate.stream.value }}</pre>
                        </div>
                    </template>
                </div>
            </div>
            <div v-if="toolCallRequest" class="flex flex-row space-x-2 txt-warning items-center">
                <ToolsIcon width="24" height="24"></ToolsIcon>
                <div>Tool call request in progress ...</div>
            </div>
            <div id="bottom-output" class="mt-5"></div>
        </div>
        <div class="flex flex-col p-3" id="prompt-input" :class="currentDebate.isActive ? 'opacity-100' : 'opacity-0'">
            <!-- div>tps={{ taskEvents.perf.tps }}</div -->
            <div class="w-full">
                <AutoTextarea :data="prompt" @update="prompt = $event" @run="exec()"></AutoTextarea>
            </div>
            <div class="flex flex-row w-full justify-end items-center flex-grow">
                <PromptNavbarLeft :uistate="uistate" class="text-left flex-grow"></PromptNavbarLeft>
                <button class="btn flex justify-end p-3" :disabled="debate.state.history.length == 0"
                    @click="resetDebate()"
                    :class="(debate.state.history.length == 0 || debate.stream.value.length > 0) ? 'txt-light' : 'txt-semilight'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-width="2"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10ZM5 5l14 14" />
                    </svg>
                </button>
                <button class="btn flex justify-end p-3" :disabled="debate.stream.value.length > 0 && !debate.isPause"
                    @click="debate.isPause.value ? endPause() : startPause()" :class="pauseColor">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16">
                        <path fill="currentColor"
                            d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m0 14.5a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13M5 5h2v6H5zm4 0h2v6H9z" />
                    </svg>
                </button>
                <button class="btn flex justify-end p-3" :disabled="debate.stream.value.length == 0"
                    @click="debate.stop()" :class="debate.stream.value.length > 0 ? 'txt-semilight' : 'txt-light'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                        <path fill="currentColor"
                            d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m0 14.5a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13M5 5h6v6H5z" />
                    </svg>
                </button>
                <button class="btn flex justify-end p-3" @click="exec()"
                    :class="prompt.length == 0 ? 'txt-semilight' : ''">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                        <path fill="currentColor"
                            d="M440 6.5L24 246.4c-34.4 19.9-31.1 70.8 5.7 85.9L144 379.6V464c0 46.4 59.2 65.5 86.6 28.6l43.8-59.1l111.9 46.2c5.9 2.4 12.1 3.6 18.3 3.6c8.2 0 16.3-2.1 23.6-6.2c12.8-7.2 21.6-20 23.9-34.5l59.4-387.2c6.1-40.1-36.9-68.8-71.5-48.9M192 464v-64.6l36.6 15.1zm212.6-28.7l-153.8-63.5L391 169.5c10.7-15.5-9.5-33.5-23.7-21.2L155.8 332.6L48 288L464 48z" />
                    </svg>
                </button>
            </div>
        </div>
        <SwToast :toasts="toasts" />
    </div>
</template>

<script setup lang="ts">
import MarkdownRender, { CodeBlockNode, enableMermaid, setCustomComponents, type ParsedNode } from 'markstream-vue';
import { computed, onBeforeMount, onMounted, ref, toRaw, watch, type ShallowReactive } from 'vue';
import type { AgentState, UiHistoryTurn } from "@agent-smith/types";
import AutoTextarea from './widgets/AutoTextarea.vue';
import { initState, debate, currentDebate, addDebate } from './state.js';
import AppEditDebate from './AppEditDebate.vue';
import type { Debate } from './interfaces';
import ThinkingContent from './widgets/ThinkingContent.vue';
import ActionNode from './widgets/ActionNode.vue';
import ContentNode from './widgets/ContentNode.vue';
import ToNode from './widgets/ToNode.vue';
import FormatedToolCall from './widgets/FormatedToolCall.vue';
import ToolsIcon from './widgets/icons/ToolsIcon.vue';
import PromptNavbarLeft from './widgets/PromptNavbarLeft.vue';
import SwToast from './components/vibe/toast/SwToast.vue';
import { toasts } from './components/vibe/toast/composable';
import ThinkingNode from './components/ThinkingNode.vue';

const props = defineProps<{
    msg: Record<string, any>,
    state: ShallowReactive<AgentState>,
    uistate: ShallowReactive<Record<string, any>>
}>();

setCustomComponents({
    code_block: CodeBlockNode,
    action: ActionNode,
    content: ContentNode,
    to: ToNode,
});
enableMermaid();
const customHtmlTags = new Array<string>("think", "action", "content", "to");

const toolCallRequest = ref(false);
const prompt = ref("");
const question = ref("");
const isReady = ref(false);
const thinkingNodes = ref<ParsedNode[]>([]);
const hasThinking = ref(false);

async function exec() {
    //console.log("EXEC hist:", debate.state.history.length);
    if (debate.state.history.length == 0) {
        question.value = prompt.value;
        debate.run(prompt.value);
        prompt.value = "";
        setTimeout(() => {
            setH();
        }, 100);
    } else {
        debate.continueWithInput(prompt.value);
        prompt.value = "";
    }
}

async function initLocal() {
    debate.init(
        scrollOutput,
        customHtmlTags,
        thinkingNodes,
        toolCallRequest,
        hasThinking
    )
}

function startPause() {
    debate.pause();
    props.msg.info("Pause on", "The inference will stop at the end of the current turn");
}

function endPause() {
    debate.endPause();
    props.msg.info("Pause off", "Continue the debate");
}

function resetDebate() {
    const ok = confirm("Reset the current debate?");
    if (!ok) {
        return
    }
    debate.reset();
    prompt.value = question.value;
    setTimeout(() => {
        setH()
    }, 100);
    question.value = "";
}

function toggleViewToolResult(id: string, turn: UiHistoryTurn) {
    //console.log("TOGGLE TOOL RESULT VIEW", id in turn.state.confirmToolCalls);
    if (id in turn.state.confirmToolCalls) {
        return
    }
    if (turn.state.showToolResponses.includes(id)) {
        turn.state.showToolResponses = turn.state.showToolResponses.filter(r => r != id)
    } else {
        turn.state.showToolResponses.push(id)
    }
}

function scrollOutput(nosmooth: boolean = true, delay = 50) {
    if (!props.uistate.autoscroll) {
        return
    }
    const el = document.getElementById('bottom-output')!;
    const p: ScrollIntoViewOptions = { block: "end", inline: "nearest" };
    if (nosmooth) {
        p.behavior = "instant"
    } else {
        p.behavior = "smooth"
    }
    if (delay > 0) {
        setTimeout(() => {
            // @ts-ignore
            el.scrollIntoView(p);
        }, delay);
    } else {
        el.scrollIntoView(p);
    }
}

function setH() {
    // @ts-ignore
    const offsetHeight = document.getElementById('prompt-input').offsetHeight
    const maino = document.getElementById('main-output')!;
    maino.style.height = `calc(100% - ${offsetHeight}px)`;
    //console.log("m", maino.style.height)
};

const pageTitle = `<div class="flex flex-row items-center space-x-3 ml-5">
    <div class="txt-light">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="36" height="36">
        <path fill="currentColor"
            d="M8 19H6v-2a3.003 3.003 0 0 1 3-3h5v2H9a1 1 0 0 0-1 1Zm4-6a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4m0-6a2 2 0 1 0 2 2a2 2 0 0 0-2-2m8 13a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4m0-6a2 2 0 1 0 2 2a2 2 0 0 0-2-2m6 12h-2v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v2h-2v-2a3.003 3.003 0 0 1 3-3h6a3.003 3.003 0 0 1 3 3Z" />
        <path fill="currentColor"
            d="M8 30H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4v2H4v24h4Zm20 0h-4v-2h4V4h-4V2h4a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2" />
    </svg>
    </div>
    <div class="text-2xl txt-semilight">
        Debate
    </div>
</div>`

const pauseColor = computed(() => {
    if (debate.isPause.value) {
        return "txt-success"
    }
    if (debate.stream.value.length > 0) {
        return "txt-semilight"
    }
    return "txt-light"
});

watch(currentDebate, () => {
    if (!currentDebate.isEdit) {
        //console.log("CD not edit")
        setH()
    }
    //console.log("PR", offsetHeight, "/", maino.offsetHeight)
});

watch(prompt, () => {
    if (isReady.value) {
        setH()
    }
    //console.log("PR", offsetHeight, "/", maino.offsetHeight)
});

onBeforeMount(() => initState(toRaw(props.state)));

onMounted(() => {
    props.uistate.title = pageTitle;
    setH();
    initLocal();
    isReady.value = true
})
</script>

<style lang="sass">
.intputtext
    @apply w-max border bord-light 
.btn.small
    @apply txt-semilight border bord-lighter hover:light text-sm py-1
</style>