<style type="text/scss">
.sg-video-blade {
    width: 98%;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    position: relative;
    border-top: solid thin #445B47;
    padding-top: 10%;
    
    &__video, &__description {
        position: relative;
        width: 90%;
        margin: 0 auto;
        padding: 25px 0;
        min-height: 30vh;
    }

    &__description {
        display: flex;
        align-items: center;
    }

    @media only screen and (min-width: 800px) {
        padding: 5% 0;
        width: 75%;
        &__video, &__description {
            width: 50%;
            min-height: 30vh;
            margin: 0 auto;
        }
        &__description {
            width: 40%; 
            &__content {
                margin-right: 10%;
            }
        }
    }   
} 
</style>

<div class="sg-video-blade sg-green">
    <div class="sg-video-blade__video"><slot name="video"></slot></div>
    <div class="sg-video-blade__description">
        <div class="sg-video-blade__description__content">
            <slot name="title"></slot>
            <slot name="text"></slot>
        </div>
    </div>
</div>