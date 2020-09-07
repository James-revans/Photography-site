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
    margin: 0px auto;
    padding: 30px 5px 30px 5px;
    flex-wrap: wrap;
    justify-content: center;
    border-bottom: solid thin var(--sg-green);
    @include break-up('xl') {
        padding: 0px 10px 100px 10px;
        border-bottom: none;
    }
}
.title {
    text-align: center;    
    padding: 50px 0 20px;
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
        <PresetCarousel photos={preset.images} index={i}/>
        <PresetDescription {...preset}/>
    </div>
{/each}
</div>

