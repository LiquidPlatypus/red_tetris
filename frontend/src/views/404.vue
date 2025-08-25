<script setup>
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";

const router = useRouter();
function returnHome() {
    router.push('/');
}

</script>
<template>
    <main class="404">
        <h1>HAHAH TU T'ES PERDU NULOS</h1>
        <AppButton @click="returnHome">RETURN HOME</AppButton>
        <a class="dondiego" href="https://www.youtube.com/watch?v=nk63slyfAF0" target="_blank">don diego de la vega</a>
        <a class="dondiego" href="https://www.youtube.com/watch?v=AF22vaGLziM&list=RDAF22vaGLziM&start_radio=1" target="_blank">tahiti</a>
    </main>
</template>
<style scoped>
    .dondiego {
        color: #008282;
    }
</style>