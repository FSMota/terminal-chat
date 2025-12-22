<script lang="ts" setup>
import { ref, nextTick } from 'vue'

const props = defineProps<{
    username?: string
}>()

const command = ref('')
const history = ref<string[]>([])
const historyRef = ref<HTMLElement | null>(null)

function executeCommand() {
    const cmd = command.value.trim()
    if (!cmd) return
    history.value.push(`> ${cmd}`)
    command.value = ''
    nextTick(() => {
        if (historyRef.value) historyRef.value.scrollTop = historyRef.value.scrollHeight
    })
}
</script>

<template>
    <div class="max-w-3xl mx-auto p-4">
        <div class="bg-gray-900 text-gray-100 font-mono rounded-lg border-2 border-indigo-600 overflow-hidden">
            <!-- header / info -->
            <div class="flex items-center justify-between px-4 py-2 bg-gray-800/50">
                <div class="text-sm text-gray-300">Terminal Chat <span v-if="props?.username" class="text-indigo-300">·
                        {{ props.username }}</span></div>
                <div class="text-xs text-gray-400">Type a command and press Enter</div>
            </div>

            <!-- history -->
            <div ref="historyRef" id="history" class="px-4 py-3 max-h-96 overflow-y-auto flex flex-col space-y-2">
                <div v-for="(entry, i) in history" :key="i"
                    class="self-start bg-gray-800 text-green-200 px-3 py-2 rounded-md break-words">
                    {{ entry }}
                </div>
            </div>

            <!-- input -->
            <div class="px-4 py-3 bg-gray-800/40 border-t border-gray-700">
                <label class="sr-only" for="command-input">Command</label>
                <input id="command-input" v-model="command" @keydown.enter="executeCommand" autocomplete="off" autofocus
                    placeholder="e.g. help"
                    class="w-full bg-transparent text-green-400 placeholder-green-600 focus:outline-none focus:ring-0" />
            </div>
        </div>
    </div>
</template>