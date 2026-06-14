<template>
    <div class="flex flex-col space-y-3 p-3">
        <div class="text-2xl">{{ editDebate?.id ? 'Edit' : 'New' }} debate</div>
        <div>
            <input v-model="debate.name" type="text" placeholder="Enter debate name" class="inputtext"
                @change="onEditName(debate.name)" />
        </div>
        <div class="text-xl">Orchestrator</div>
        <div v-if="!debate.orchestrator?.id">
            <button class="btn light" @click="isEditOrchestrator = true" v-if="!isEditOrchestrator">Add
                orchestrator</button>
        </div>
        <div v-else>
            <div class="flex flex-row space-x-3 items-center">
                <div>{{ debate.orchestrator.name }}</div>
                <div class="txt-semilight">
                    (&nbsp;<span class="txt-success">{{ debate.orchestrator.model }}</span>&nbsp;)
                </div>
                <div class="txt-semilight truncate">{{ debate.orchestrator.role }}</div>
                <div>
                    <button class="btn small" @click="isEditOrchestrator = true; view = 'edit'">Edit</button>
                </div>
                <div>
                    <button class="btn txt-danger text-sm"
                        @click="deleteParticipant(debate.orchestrator, false, true)">Delete</button>
                </div>
            </div>
        </div>
        <div v-if="isEditOrchestrator == true">
            <AppEditParticipant @cancel="view = 'main'; isEditOrchestrator = false"
                @save="editParticipant($event, false, true)" :participant="debate.orchestrator?.id ?
                    debate.orchestrator : undefined" :is-orchestrator="true">
            </AppEditParticipant>
        </div>
        <div class="text-xl">Participants</div>
        <div v-for="(v, k, i) in debate.participants" class="flex flex-col">
            <div class="flex flex-row space-x-3 items-center max-w-full">
                <div class="flex flex-row" v-if="Object.keys(debate.participants).length - 1">
                    <button class="btn small" v-if="i > 0">
                        <ArrowUpIcon width="24" height="24" class="txt-semilight" @click="reorder(k, 'up')">
                        </ArrowUpIcon>
                    </button>
                    <button class="btn invisible" v-else>
                        <ArrowUpIcon width="24" height="24"></ArrowUpIcon>
                    </button>
                    <button class="btn small" v-if="i < (Object.keys(debate.participants).length - 1)">
                        <ArrowDownIcon width="24" height="24" class="txt-semilight" @click="reorder(k, 'down')">
                        </ArrowDownIcon>
                    </button>
                    <button v-else class="btn invisible">
                        <ArrowDownIcon width="24" height="24"></ArrowDownIcon>
                    </button>
                </div>
                <div>{{ v.name }}</div>
                <div class="txt-semilight">
                    (&nbsp;<span class="txt-success">{{ v.model }}</span>&nbsp;)
                </div>
                <div class="txt-semilight">{{ v.role.slice(0, 92) }}{{ v.role.length < 92 ? '' : '...' }}</div>
                        <div>
                            <button class="btn small" @click="editParticipantId = k; view = 'edit'">Edit</button>
                        </div>
                        <div>
                            <button class="btn txt-danger text-sm" @click="deleteParticipant(v)">Delete</button>
                        </div>
                </div>
                <AppEditParticipant class="pt-3" v-if="editParticipantId == k"
                    @cancel="view = 'main'; editParticipantId = ''" @save="editParticipant($event)" :participant="v">
                </AppEditParticipant>
            </div>
            <div v-if="view == 'main'" class="pt-3">
                <button class="btn light" @click="view = 'addparticipant'">Add participant</button>
            </div>
            <div v-else-if="view == 'addparticipant'" class="ml-8">
                <AppEditParticipant @cancel="view = 'main'" @save="editParticipant($event)"></AppEditParticipant>
            </div>
            <div class="text-xl">Advisors</div>
            <div v-for="(v, k, i) in debate.advisors" class="flex flex-col">
                <div class="flex flex-row space-x-3 items-center">
                    <div class="flex flex-row" v-if="Object.keys(debate.advisors).length - 1">
                        <button class="btn small" v-if="i > 0">
                            <ArrowUpIcon width="24" height="24" class="txt-semilight" @click="reorder(k, 'up', true)">
                            </ArrowUpIcon>
                        </button>
                        <button class="btn invisible" v-else>
                            <ArrowUpIcon width="24" height="24"></ArrowUpIcon>
                        </button>
                        <button class="btn small" v-if="i < (Object.keys(debate.advisors).length - 1)">
                            <ArrowDownIcon width="24" height="24" class="txt-semilight"
                                @click="reorder(k, 'down', true)">
                            </ArrowDownIcon>
                        </button>
                        <button v-else class="btn invisible">
                            <ArrowDownIcon width="24" height="24"></ArrowDownIcon>
                        </button>
                    </div>
                    <div>{{ v.name }}</div>
                    <div class="txt-semilight">
                        (&nbsp;<span class="txt-success">{{ v.model }}</span>&nbsp;)
                    </div>
                    <div class="txt-semilight">{{ v.role.slice(0, 92) }}{{ v.role.length < 92 ? '' : '...' }}</div>
                            <div>
                                <button class="btn small" @click="editAdvisorId = k; view = 'edit'">Edit</button>
                            </div>
                            <div>
                                <button class="btn txt-danger text-sm"
                                    @click="deleteParticipant(v, true)">Delete</button>
                            </div>
                    </div>
                    <AppEditParticipant class="pt-3" v-if="editAdvisorId == k"
                        @cancel="view = 'main'; editAdvisorId = ''" @save="editParticipant($event, true)"
                        :participant="v">
                    </AppEditParticipant>
                </div>
                <div v-if="view == 'main'" class="pt-3">
                    <button class="btn light" @click="view = 'addadvisor'">Add advisor</button>
                </div>
                <div v-else-if="view == 'addadvisor'" class="ml-8">
                    <AppEditParticipant @cancel="view = 'main'" @save="editParticipant($event, true)">
                    </AppEditParticipant>
                </div>
                <div class="pt-3 flex flex-row space-x-2">
                    <button class="btn success" :disabled="!isFormValid" @click="saveDebate()">Save debate</button>
                    <button class="btn txt-danger" @click="_deleteDebate()" v-if="editDebate">Delete
                    </button>
                    <button class="btn" @click="saveDebate(true)">Duplicate</button>
                    <button class="btn" @click="$emit('cancel')">Cancel</button>
                </div>
            </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, toRaw } from 'vue';
import AppEditParticipant from './AppEditParticipant.vue';
import type { Debate, Participant } from './interfaces';
import { slugify } from './utils';
import { api } from './services/api';
import { debates, deleteDebate } from './state';
import { moveKey } from './utils';
import ArrowUpIcon from './widgets/icons/ArrowUpIcon.vue';
import ArrowDownIcon from './widgets/icons/ArrowDownIcon.vue';

const emit = defineEmits(["save", "cancel"]);

const props = defineProps<{
    editDebate?: Debate,
    msg: Record<string, any>,
}>();

const view = ref("main");
const debate = reactive<Debate>({
    id: "",
    name: "",
    orchestrator: {} as Participant,
    participants: {},
    advisors: {},
});

const editParticipantId = ref("");
const editAdvisorId = ref("");
const isEditOrchestrator = ref(false);

function onEditName(n: string) {
    if (!props.editDebate) {
        debate.id = slugify(n)
    }
}

function editParticipant(p: Participant, isAdvisor = false, isOrchestrator = false) {
    const old_pid = p.id;
    const new_pid = slugify(p.name);
    if (isAdvisor) {
        if (old_pid != new_pid) {
            delete debate.advisors[old_pid]
        }
        p.id = new_pid;
        debate.advisors[new_pid] = p;
    } else if (isOrchestrator) {
        debate.orchestrator = p;
        isEditOrchestrator.value = false;
    } else {
        if (old_pid != new_pid) {
            delete debate.participants[old_pid]
        }
        p.id = new_pid;
        debate.participants[new_pid] = p;
    }
    editParticipantId.value = '';
    editAdvisorId.value = '';
    view.value = 'main'
}

function deleteParticipant(p: Participant, isAdvisor = false, isOrchestrator = false) {
    const q = `Delete ${p.name} ? `;
    const conf = confirm(q);
    if (!conf) {
        return
    }
    if (isAdvisor) {
        delete debate.advisors[p.id];
    } else if (isOrchestrator) {
        debate.orchestrator = {} as Participant;
    } else {
        delete debate.participants[p.id];
    }
}

async function saveDebate(duplicate = false) {
    const new_debate_id = slugify(debate.name);
    //console.log("SAVE D", debate.id, "/", new_debate_id, "D:", duplicate)
    if (duplicate) {
        if (new_debate_id in debates) {
            props.msg.warn("Invalid name", "Choose a different name to duplicate");
            return
        }
    }
    else {
        if (debate.id != new_debate_id) {
            //console.log("DEL D", debate.id)
            delete debates[debate.id];
        }
    }
    debate.id = new_debate_id;
    debates[new_debate_id] = debate;
    const data: Record<string, Debate> = { ...debates, [new_debate_id]: debate };
    const res = await api.post("/app/debate/update", data);
    if (!res.ok) {
        throw new Error(`can not update debate ${res.status} ${res.text}`)
    }
    emit('save', debate);
}

async function _deleteDebate() {
    const q = `Delete debate ${debate.name} ? `;
    const conf = confirm(q);
    if (!conf) {
        return
    }
    deleteDebate(debate);
    const data: Record<string, Debate> = toRaw(debates);
    const res = await api.post("/app/debate/update", data);
    if (!res.ok) {
        throw new Error(`can not update debate ${res.status} ${res.text}`)
    }
    emit('cancel');
}

function reorder(k: string, direction: "up" | "down", isAdvisor = false) {
    console.log("Reorder", k, direction);
    if (isAdvisor) {
        debate.advisors = moveKey(debate.advisors, k, direction);
    } else {
        debate.participants = moveKey(debate.participants, k, direction);
    }
}

const isFormValid = computed(() => {
    const nameValid = debate?.name.trim() !== ''
    const orchestratorValid = debate?.orchestrator?.id?.length > 0
    const participantsValid = Object.keys(debate.participants).length > 0
    const advisorsValid = Object.keys(debate.advisors).length > 0
    /*console.log('Name valid:', nameValid, 'name:', debate?.name)
    console.log('Orchestrator valid:', orchestratorValid, 'orchestrator id length:', debate?.orchestrator?.id?.length)
    console.log('Participants valid:', participantsValid, 'participants count:', Object.keys(debate.participants).length)
    console.log('Advisors valid:', advisorsValid, 'advisors count:', Object.keys(debate.advisors).length)*/
    return nameValid && orchestratorValid && participantsValid && advisorsValid
})

// Watch for prop changes to initialize the debate data
watch(() => props.editDebate, (newDebate) => {
    if (newDebate) {
        Object.assign(debate, newDebate);
    }
}, { immediate: true });
</script>