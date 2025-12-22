<template>
    <main>
        <div class='display-terminal'>
            <div class="intro-text">
                <h2>Welcome to Terminal Chat</h2>
                <p>Start chatting by typing your message below:</p>
            </div>
            <Terminal :props.username="username" />
        </div>
    </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const username = route.query.username || 'Guest'
</script>

<style scoped>

.display-terminal {
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin: 0 auto;
    color: #d4d4d4;
    font-family: monospace, 'Courier New', Courier;
}
.intro-text {
    text-align: center;
    margin-bottom: 1rem;
}

</style>