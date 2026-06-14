<template>
  <div class="w-full h-min">
    <textarea v-if="auto" v-model="_data" :rows="rows"
      class="txt-in w-full overflow-y-visible focus:ring-0 bord-lighter p-3" @focusout="ch()" />
    <textarea v-else v-model="_data" :rows="rows" class="txt-in w-full overflow-y-visible focus:ring-0 bord-lighter p-3"
      @focusout="ch()" />
    <span></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { onKeyStroke } from '@vueuse/core';

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
  maxlines: {
    type: Number,
    default: 8,
  }
});

const emit = defineEmits(["update", "run"]);

const _data = ref(props.data);

function ch() {
  emit("update", _data.value);
}

onKeyStroke(
  e => e.key === 'Enter' && e.ctrlKey,
  (e) => emit("run")
)

const auto = computed(() => {
  const nlines = _data.value.split("\n").length;
  return (nlines <= props.maxlines) ? true : false
});

const rows = computed(() => {
  const nlines = _data.value.split("\n").length;
  //console.log("nl", nlines);
  if (nlines > props.maxlines) {
    //console.log("=>", props.maxlines);
    return props.maxlines
  }
  //console.log("=>", nlines);
  return nlines
});

watchDebounced(
  _data,
  () => { ch() },
  { debounce: 200, maxWait: 1000 },
)

watch(
  () => props.data,
  (_d) => {
    _data.value = _d
  }
)
</script>
