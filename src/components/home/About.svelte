<script>
import sal from 'sal.js';

import { onMount } from 'svelte';
onMount(async () => {
    sal();
});
</script>

<style type="text/scss">
.about {
    background: white;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    position: relative;
        &__photo {
            width: 100%;
            padding: 2.5%;
            img {
                width: 100%;
            }
            @media only screen and (min-width: 800px) {
                width: 50%;
            }
        }
        &__bio {
            padding: 10px;
            width: 100%;
            text-align: left;
            font-weight: 500;
            color: #445B47;
            
            &__header {
                border-bottom: solid 1px black;
                padding-bottom: 15px;
                display: inline-block;
                text-align: center;
                h2 {
                    display: inline;
                    font-size: 40px;
                    margin: 5% 0;
                    
                    font-weight: 100;
                    color: #445B47;
                }
            }
            &__content {
                padding-top: 50px;
                
                p {
                    font-size: 15px;
                }
            }
            @media only screen and (min-width: 800px) {
                width: 50%;
                padding: 2.5%;
                &__header {
                    text-align: left;
                }
                &__content {
                    padding-right: 100px;
                    p {
                        font-size: 1.1vw;
                    }
                }
            }
        }
}
.about-nav {
    position: relative;
    top: -60px;
}
</style>

<div class="about-nav" id="about"></div>
<div class="about row">
    <div class="about__photo col">
        <img src="https://lh3.googleusercontent.com/d2EiTY8hlnugFfKdBuR3OQzvz2h9o80rmYOYi_8VaIMAXKAbHlbXY3lkB-0kFDH7qRasDsNVlFIrZHQ7AlR6577yWn-UuxP8M1gtuKLboztxLoG_lIHIKC8xzDr-gcTXQl3rW5m7944KgwRmaoAYy2DEeuu_KCT6yIQtOlY4dgc-REZEJkbDs8a3aUYEVK9kRMRkROljo15_o7uKxd6BQ72lcRHbbLxDBZRSgjCCor3er1VlYlFZ45rAlahp6aWDtVHMIcuQ4H9PkH4hkce16IBkKs6fkhl2hf_DQtrvloL7wRcIvZWSeC3jKu0KPzAKNfXc3I_toUNPUAHkiByp8KNRU0XRRDDaqdAa3NyoyVSTSGlOwqGRxbbYNvG_rAhFwtKd7cDB186gUlw1P8_N69rfzKaJ9A9Rhpo1rnirrc5_dy0BnDTn6VFKvouBBsFIMNTPDAeE_NcyThxfPiwBPfwuYk64Mkjm4txUs9-qw9wVDGZ6TeG9EKcfklgwqZ7qyrqDPJfR215biujI9J1oSlYtHjj7_Zl29yDxT1oVOMBkmUXSsBjgKgxkQ2lQ3xrWJRlsNZyId5iZkXPua6ugSUAsMD_jkD9hLqFFxR3XJkLQJeJzuLDyylqTBl7-VBqaYyxRSWlh1zh2nOqThpFk6ToazHY3pDKoYn5SnppcUMyEwoMowOAzAn6fpOjcZ48nTC7lrsRtUGXRcthogX0jgCIA-qRW2B1rI7AD1ScWCgYIHyHr=w1485-h990-no" alt="Savanna Grunzke photography">
    </div>
    <div class="about__bio col">
        <div class="about__bio__header vollkorn">
            <h2>Behind the lens</h2>
        </div>
        <div class="about__bio__content raleway">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur pariatur eaque, est laborum voluptatum unde incidunt, laudantium alias deleniti ex fuga, officiis repudiandae rerum. In tempora ratione voluptate perferendis aliquid! Consequatur pariatur eaque, est laborum voluptatum unde incidunt, laudantium alias deleniti ex fuga, officiis repudiandae rerum. In tempora ratione voluptate perferendis aliquid!</p>
            <p>In tempora ratione voluptate perferendis aliquid! Consequatur pariatur eaque, est laborum voluptatum unde incidunt, laudantium alias deleniti ex fuga, officiis repudiandae rerum.</p>
            <p>Consequatur pariatur eaque, est laborum voluptatum unde incidunt, laudantium alias deleniti ex fuga, officiis repudiandae rerum. In tempora ratione voluptate perferendis aliquid!</p>
        </div>
        
    </div>
</div>

