
<style type="text/scss">
@import '../../../assets/scss/mixins/mixins';

.container {
    padding: 5px;
    max-width: 700px;
    margin: 0 auto;
}

h4, h2 {
    text-align: center;
}

h2 {
    font-size: 20px;
    margin-top: 50px;
}
h4 {
    font-size: 20px;
}
ol, li {
    font-size: 15px;
}
.list {
    line-height: 40px;
}
.divider {
   display: none; 
}

@include break-up('lg') {
    .divider {
        display: block;
        width: 75%;
        margin: 20px auto 120px;
        height: 1px;
        background: rgb(68, 91, 71);  
    }
    h2 {
        font-size: 50px;
        margin-top: 0;
    }
    h4 {
        font-size: 35px;
    }
    ol, li {
        font-size: 25px;
    }
}
</style>

<div class="container sg-green alegreya instructions" id="instructions">
    <div class="divider"></div>
    <h2 class="vollkorn">How to use the presets</h2>
    <ol class="list">
        <li>Download Adobe Lightroom Mobile in the App store.</li>
        <li>Save the DNG files to your phone *(they will just look like black boxes in your photos because of the file type.)</li>
        <li>Upload the DNG “black box” files to the Lightroom app.</li>
        <li>In each photo, save the preset by clicking the three dots in the upper right hand corner.
            <ol type="a">
                <li>Click “Create Preset”</li>
                <li>Name the preset accordingly with the text box at the top of the screen.</li>
                <li>Repeat for each preset</li>
            </ol>
        </li>
        <li>Now when you upload your own photos there is an editing tab on the bottom of the screen when you scroll all the way to the right that is labeled “Presets.” You can see all your saved presets from there and test them out on your photos before choosing one.</li>
        <li>*These presets are meant to be one-click edits, but sometimes they need more adjusting with exposure or saturation and light tweaking* If you need any help or tips, contact me through my email.</li>
    </ol>
    <h4 class="vollkorn">HAPPY EDITING</h4>
</div>