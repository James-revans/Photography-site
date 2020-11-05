<script>
let src = "images/Coffee.JPG";
let src2 = "images/flowers.jpeg";
</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

.sg-form{
    padding: 10px;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &__wrapper{
        // width: 100%;
        // margin: 0 auto;
        // &__header {
        //     margin-bottom: 45px;
        //     border-bottom: solid thin;
        //     display: inline-block;
        //     h1 {
        //         font-weight: 100;
        //         font-size: 50px;
        //         margin: 45px 0;
        //     }
        //     p {
        //         margin-bottom: 5px;
        //     }
        // }
        // &__form {
        //     input, textarea, select {
        //         width: 100%;
        //         padding: 10px;
        //         margin: 8px auto;  
        //         border-color: rgb(68, 91, 71);
        //         color: rgb(68, 91, 71);
        //         font-size: 18px;
        //     }
        //     textarea {
        //         height: 200px;
        //         resize: none;
        //     }
        //     ::placeholder { 
        //         color: rgb(68, 91, 71);
        //     }
        //     select {
        //         option {
        //             &:hover {
        //                 background: rgb(68, 91, 71);
        //                 color: white;
        //             }
        //         }
        //     }
        //     button {
        //         background: white;
        //         padding: 8px 35px;
        //         transition: 0.3s;
        //         border: solid 2px rgb(68, 91, 71);
        //         color: rgb(68, 91, 71);
        //         text-transform: uppercase;
                
        //         &:hover {
        //             cursor: pointer;
        //             background: rgb(68, 91, 71);
        //             color: white;
        //             transition: 0.2s;
        //             border-color: rgb(68, 91, 71);
        //         }
        //     }
        // }
        width: 100%;
        text-align: center;
        margin-top: 50px;
        iframe {
            max-width: 700px;
            width: 100%;
            overflow: hidden;
        }
        // @include break-up('xl') {
        //     float: left;
        //     margin: 50px auto;
        //     width: 40%;       
        // }
    }
    &__image {
        width: 100%;
        max-width: 630px;
        // max-height: 500px;
        margin: 80px auto;
        margin-bottom: 0;

        img {
            height: 100%;
            width: 100%;
            object-fit: cover;
        }
        // @include break-up('xl') {
        //     width: 40%;
        //     float: right;
        //     margin: 50px auto;            
        // }
    }
    // @include break-up('md') {
    //     padding: 120px;
    // }
    // @include break-up('xl') {
    //     padding: 60px;
    // }
}

</style>

<div class="sg-form">
    <!-- <div class="sg-form__wrapper">
        <div class="sg-form__wrapper__header sg-green vollkorn">
            <h1>Let's chat</h1>
            <p class="alegreya" style="font-size: 25px;">I’m so glad that you’re interested in working with me. Fill out the form and let’s get planning! Talk to you soon!</p>
        </div>
        <form name="contact" method="post" netlify data-netlify-honeybot="bot-field" class="sg-form__wrapper__form alegreya">
            <input type="hidden" name="form-name" value="contact" />
            <input name="name" type="text" placeholder="name" />
            <input name="email" type="email" placeholder="email" />
            <input name="phone" type="phone" placeholder="phone" />
            <select name="package"> 
                <option value="" disabled selected>Select a package ($50 minimum)</option>
                <option value="portrait">portrait</option>
                <option value="family">family</option>
                <option value="event">event</option>
                <option value="misc">misc</option>
            </select>

            <textarea name="message" placeholder="Tell me about the services you are interested in"></textarea>
            <button name="submit" type="submit">Send message</button>
        </form>
    </div> -->
    <div class="sg-form__wrapper">
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeQX8JXZ9f3XSI2MOi0WfTjk1AFAhPb43fqPppn5ttdYZWd5Q/viewform?embedded=true" width="640" height="1543" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>    
    </div>

    <div class="sg-form__image">
        <img src={src}/>
        <img src={src2}/>
    </div>
</div>

