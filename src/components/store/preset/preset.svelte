<script>
import PresetDescription from './preset-description.svelte';
import PresetCarousel from './preset-carousel.svelte';
import presets from '../data.js';
</script>

<style type="text/scss">
@import '../../../assets/scss/mixins/mixins';

.preset {
    display: flex;
    max-width: 1500px;
    margin: 0 auto;
    padding: 0px 10px 50px 10px;
    flex-wrap: wrap;
    justify-content: center;
    @include break-up('xl') {
        padding: 0px 10px 100px 10px;
    }
}
.title {
    text-align: center;    
    padding: 20px 0 20px;
    font-size: 20px;
    margin: 0;
    @include break-up('xl') {
        font-size: 60px;
        padding: 100px 0 100px;
    }
}
h1 {
    font-weight: 100;
}
</style>

<h1 class="title sg-green vollkorn">Presets</h1>
<div class="presets">
{#each presets as preset, i}
    <div class="preset">
        <PresetCarousel photos={preset.examples} index={i}/>
        <PresetDescription {...preset}/>
    </div>
{/each}
</div>

