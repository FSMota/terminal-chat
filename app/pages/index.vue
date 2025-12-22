<template>
    <main>
        <div class='display-anonimous-user'>
            <!-- input for name -->
            <input type="text" placeholder="Enter your name" v-model="username" />
            <button @click="startChat">Start Chatting</button>
            <!-- after clicking the button, show the terminal e save the username -->

        </div>
    </main>
</template>

<script setup lang="ts">
// Usamos auto-import de components do Nuxt; se não estiver habilitado, importe manualmente:
// import Terminal from '~/components/terminal.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const username = ref('')
const router = useRouter()

function startChat() {
    if (username.value.trim()) {
        // quero redirecionar para um página que receber o nome do usuário como parâmetro
        router.push({ name: 'chat', query: { username: username.value } })
        // ou talvez mostrar o terminal aqui mesmo

    } else {
        alert('Please enter your name to start chatting.')
    }
}
</script>

<style scoped>
main {
    padding: 2rem;
}
</style>
