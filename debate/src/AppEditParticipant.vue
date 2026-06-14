<template>
  <div class="flex flex-col space-y-3 w-full container">
    <div class="flex flex-col space-y-2 w-full">
      <div>
        <label class="block text-sm font-medium">Name</label>
        <input v-model="participant.name" type="text" placeholder="Enter name" class="inputtext" />
      </div>
      <div class="flex flex-row space-x-3">
        <div v-for="backend in Object.keys(mainapp.state.models)">
          <label class="block text-sm font-medium">Backend: {{ backend }}</label>
          <select v-model="participant.model" class="inputtext">
            <option v-for="model in mainapp.state.models[backend]" :key="model.id" :value="model.id">{{ model.id }}
            </option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium">Role</label>
        <textarea cols="2" v-model="participant.role" type="text" placeholder="Enter role instructions for the model"
          class="inputtext w-full max-w-xl" />
      </div>
      <div class="flex items-center">
        <input v-model="participant.nothink" type="checkbox" id="nothink" class="mr-2" />
        <label for="nothink" class="text-sm">No Think</label>
      </div>
      <div class="flex items-center">
        <input v-model="searchTool" type="checkbox" id="search" class="mr-2" />
        <label for="search" class="text-sm">Search tool</label>
      </div>
      <div class="flex flex-row items-center space-x-3 pt-3">
        <button @click="addParticipant" :disabled="!isFormValid" class="btn success mt-2 w-max">
          Save
        </button>
        <button @click="$emit('cancel')" class="btn mt-2 w-max txt-warning">Cancel</button>
      </div>
      <div v-if="!isFormValid" class="text-red-500 text-sm pt-2">
        Please fill in all fields
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from 'vue';
import { Participant } from './interfaces';
import { mainapp } from './state.js';
import { slugify } from './utils.js';

const props = defineProps<{
  participant?: Participant;
  isOrchestrator?: boolean;
}>();
const emit = defineEmits(['save', 'cancel']);

const searchTool = ref(false);

const participant = ref<Participant>({
  id: '',
  name: '',
  model: '',
  role: '',
  nothink: false,
  tools: []
});

const isFormValid = computed(() => {
  return (
    participant.value.name.trim() !== '' &&
    participant.value.model !== '' &&
    participant.value.role.trim() !== ''
  );
});

const addParticipant = () => {
  if (!isFormValid.value) return;
  if (!props?.participant) {
    participant.value.id = slugify(participant.value.name);
  }
  if (searchTool.value) {
    participant.value.tools = ["searchweb"];
  }
  emit('save', participant.value);
  // Reset form
  participant.value = {
    id: '',
    name: '',
    model: '',
    role: 'participant',
    nothink: false,
    tools: []
  };
};

onBeforeMount(() => {
  //console.log("P", participant.value);
  searchTool.value = participant.value?.tools?.includes("searchweb") ? true : false;
  if (props.isOrchestrator) {
    participant.value.name = "Leader";
    participant.value.role = "leader";
  }
})

// Watch for prop changes to update the form
watch(() => props.participant, (newVal) => {
  if (newVal) {
    participant.value = { ...newVal };
  }
}, { immediate: true });
</script>