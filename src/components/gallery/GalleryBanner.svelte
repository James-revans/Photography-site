<style type="text/scss">
.gallery {
    &__filter {
        button {
            border: none;
            border-radius: 0;
            background: transparent;
            border-bottom: solid thin transparent;
            transition: 0.2s;
            margin-right: 40px;
            
            &:hover {
                cursor: pointer;
                border-color: black;
            }
            &:focus {
                border-bottom: solid 2px #F0DEB4;
                transition: 0.2s;
            }     
        }

    }
}

</style>


<div class="p-3">
    <h1 class="prata">Gallery</h1>
    <div class="gallery__filter raleway">
        <button>portraits</button>
        <button>family</button>
        <button>events</button>
        <button>misc</button>
    </div>
</div>
