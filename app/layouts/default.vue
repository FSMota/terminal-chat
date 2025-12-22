<template>
    <div class="layout">
        <Header />
        <main>
            <slot />
        </main>
        <Footer />
    </div>
</template>

<style scoped>
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #0f1114;
}

main {
    flex: 1;
    padding: 2rem;
}
</style>
