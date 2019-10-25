<script>
    import PageBanner from "../base/PageBanner.svelte";
    import VideoList from "./VideoList.svelte";
    import Footer from "../home/Footer.svelte";
    // const url = "https://lh3.googleusercontent.com/VtJoIMYZ5iA0aYQEOPicly-PUt02n3AU7OdMiINVgEP5ZlpYz8_N7Qx2HngJRxX70Wwudg8nFyybcdHDq8Ko5FNfZkvJM75GCa7vNGkSLBNJs0TPdBR6Lhdovt_X6pXnj4joutd94dsKnDjNL7-iIax8eGPlAVDLxghLh0xHsoPCB7OniL2yhvJ3QquKVYXKbxWMK1vARd6HyLstCdhyZDHkMqYbQ7W3GSCxTZ5pE8TSj6SKbLXjtle3AUXOrhRwmivgnwtJRLEAWd-JpbKCC21rev_cr-y8X7WZO4sl0LMyFyKHvnrL1T7_wD4zO-FCW4AGKZi_VGLdq-Hf7EYMofJ_9e-9fZeYypYFuxMPE9Ti0yiYV3pHar4ptaFVpSl3fuZ3h5rNOoHIq32vQnF_mnhc6sA7iQ-VyW1Z1R2qnx2lqAhvZmKIUCi8tVhyGCX8sWeF8vXUGrcRW7imigGqC28S-4WC0NxsEtU3xxhFYx-5PrTu8QhDaMpJdsWpFlCVrg8ynqJ0kw9SQPfv5B6t0B-G1nr2-CwmB_Acs8Q9qxxWbFWI5mNSJlLp93-yMZ1ssJCUWkgvkfloTT995_KoE7PF-avmkRyE2J3KvRqyvqdIxjP9HPCb_A0Mo5ZyVshFtVkRPU7VOduy3pgLqurdn4zf645owaImfOc40usaFZu-EDwY6mT0thhfWCCNdD9phmlxOxFpF6oWZv9jHnCB2SeVX71Unc86wrTQ7XY08tw1eUFEXg=w1485-h990-no";
</script>

<style type="text/scss">
    .video-background {
        // pointer-events: none;
        position: relative;
        width: 100vw;
        height: 75vh;
        overflow: hidden;
        z-index: 1000;
        iframe {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            width: 100vw;
            height: 120vh;
            object-fit: cover;
        }
    }

</style>
<div class="video-background">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/ZGn8UYaJrFk?controls=0&autoplay=1&mute=1&title=0&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=ZGn8UYaJrFk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>   
    <PageBanner>
        <h1>Videography</h1>
    </PageBanner> 
</div>



<VideoList/>
<Footer/>

