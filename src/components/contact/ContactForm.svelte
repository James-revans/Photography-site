

<style type="text/scss">
.sg-form{
    padding: 10px;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &__wrapper{
        width: 100%;
        margin: 0 auto;
        &__header {
            margin-bottom: 50px;
            border-bottom: solid thin;
            display: inline-block;
            h1 {
                font-weight: 100;
                font-size: 50px;
            }
        }
        &__form {
            input, textarea, select {
                width: 100%;
                padding: 10px;
                margin: 5px auto;  
                border-color: rgb(68, 91, 71);
                color: rgb(68, 91, 71);
                text-transform: uppercase;
            }
            textarea {
                height: 200px;
                resize: none;
            }
            ::placeholder { 
                color: rgb(68, 91, 71);
            }
            select {
                option {
                    &:hover {
                        background: rgb(68, 91, 71);
                        color: white;
                    }
                }
            }
            button {
                background: white;
                padding: 8px 35px;
                transition: 0.3s;
                border: solid 2px rgb(68, 91, 71);
                color: rgb(68, 91, 71);
                text-transform: uppercase;
                
                &:hover {
                    cursor: pointer;
                    background: rgb(68, 91, 71);
                    color: white;
                    transition: 0.2s;
                    border-color: rgb(68, 91, 71);
                }
            }
        }
        
        @media only screen and (min-width: 900px) {
            width: 40%;
            float: left;
            margin: 50px auto;
        }
    }
    &__image {
        width: 100%;
        max-height: 500px;
        margin: 80px auto;
        margin-bottom: 0;

        img {
            height: 100%;
            width: 100%;
            object-fit: cover;
        }
        @media only screen and (min-width: 900px) {
            width: 40%;
            float: right;
            margin: 50px auto;
        }
    }
    @media only screen and (min-width: 520px) {
        padding: 120px;
    }
    @media only screen and (min-width: 900px) {
        padding: 60px;
    }
}


</style>


<div class="sg-form">
    <div class="sg-form__wrapper">
        <div class="sg-form__wrapper__header sg-green vollkorn">
            <h1>Let's chat</h1>
            <p class="alegreya" style="font-size: 25px;">I’m so glad that you’re interested in working with me. Fill out the form and let’s get planning! Talk to you soon!</p>
        </div>
        <form class="sg-form__wrapper__form montserrat">
            <input name="name" type="text" placeholder="name">
            <input name="email" type="email" placeholder="email">
            <input name="phone" type="phone" placeholder="phone">
            <select name="package"> 
                <option value="" disabled selected>Select a package ($100 minimum)</option>
                <option value="portrait">portrait</option>
                <option value="family">family</option>
                <option value="event">event</option>
                <option value="misc">misc</option>
            </select>

            <textarea name="message" placeholder="Tell me about the services you are interested in"></textarea>
            <button name="submit" type="submit">Send message</button>
        </form>
    </div>

    <div class="sg-form__image">
        <img src="https://lh3.googleusercontent.com/5-rihuqXVZP7hbLYK9fx4O0sbl_dqzVMsgcv76e4cEoM4E4xgtP2A97GNHef1EkGvBWqPM2H0_WZLoBchiWNhoe-ENFAGpXRF46-6aG1uDOsZY5nK00XfxerGPZ5DN128sltFf-6qnrx3x3S-I2hrc7ohTz6KKOqCs608Ok4Sw1JGO-FPVMKWsB7cXtkEYZn7XlQmo3cOvFdLMmOiAHr1OnOpmgCSsKTOM0JQC8vSHn68d6io8bpiqSsy4R-_ahJgv6dWdD4c_dk5QQxtxYmYZ4lUL903S7EpF7y-ZohFTykgHXOiq2mrJBbeXlmCo2BolOUrtZLSlhS4kyuNhAcRJS4fbH_syjRiHCYycRnQ0kLCsEJFon_1MrZVCsvDKMe4_0KhlD96-t-zgedImVgGfS49xXkMUbvmtrus-JYiLirN2D9PLzmdHrifUvPSiFgcPJ4xX5bx4gK4Wy74pvUInudY-oN9Z7Zm-walEicJ1hw5fD0zi0sSwsZjUaqR4gumvgIHFnOfrMP1pZXOPcy04gbaFj8jliGi8ZirUsbmlD_DLEM25kY5KL_wPzVWG14lgOtncSs3TLZDcqUEmdl7YSAH9I8czF5sGKffJfzIE2zPE7EaNi8uR2xeUKTj0wmvy97H7gVdkCOF5gHr4g3ategTtj6K6oZ9rsmZ7rU6rb2bYsTVcmSGdBKLRIMiqQIxbB3JHMfcecYLDXdyzFbs4qfI8nyoaTctC3quhVQiL664kq8mw=w1334-h890-no">
    </div>
</div>


