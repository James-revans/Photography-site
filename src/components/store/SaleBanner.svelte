<script>

let days = 0;
let hours = 0; 
let minutes = 0;
let seconds = 0;
let y = 0;
let distance = 0;
// Set the date we're counting down to

let countDownDate = new Date("Sept 21, 2020 00:00:00").getTime();

// Update the count down every 1 second
let x = setInterval(function() {

  // Get today's date and time
  let now = new Date().getTime();

  // Find the distance between now and the count down date
  distance = countDownDate - now;

  // gets the pixel width of current viewport
  y = window.innerWidth;

  // Time calculations for days, hours, minutes and seconds
  days = Math.floor(distance / (1000 * 60 * 60 * 24));
  hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor((distance % (1000 * 60)) / 1000);
  

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
  }
}, 1000);

</script>

<style type='text/scss'>
@import '../../assets/scss/mixins/mixins';

.banner{
    padding: 20px 0px;
    background-color: var(--sg-cream);
    text-align: center;
    color: var(--sg-green);
    font-size: 20px;
}

h1{
    margin: 0 0;
}

p{
    font-size: 25px;
    font-weight: 300;
    margin-bottom: 0;
    @include break-up('md') {
        font-size: 40px;
    }
}
.number{
    font-size: 30px;
    margin-top: 0;
}

.grid{
    display: grid;
    max-width: 1200px;
    margin: 0 auto;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr;
    grid-template-rows: 2fr;
    grid-gap: 20px;
}

#days{ grid-area: 1/2/2/3}
#hours{ grid-area: 1/3/2/4}
#minutes{ grid-area: 1/4/2/5}
#seconds{ grid-area: 1/5/2/6}

.days{ grid-area: 2/2/3/3}
.hours{ grid-area: 2/3/3/4}
.minutes{ grid-area: 2/4/3/5}
.seconds{ grid-area: 2/5/3/6}

.expired{
    grid-area: 1/3/2/5;
    color: rgb(231, 105, 105);
}
</style>

<div class="banner p-marker">
    <h1>BACK TO SCHOOL PRESET SALE! 25% OFF</h1>
    {#if distance >= 0}
    <div id="check" class="grid montserrat font">
        {#if y > 1260}
        <p id="days">{days}</p>
        <p id="hours">{hours}</p>
        <p id="minutes">{minutes}</p>
        <p id="seconds">{seconds}</p>
        <p class="days number">days</p>
        <p class="hours number">hours</p>
        <p class="minutes number">minutes</p>
        <p class="seconds number">seconds</p> 
        {:else}
        <p id="days">{days}d</p>
        <p id="hours">{hours}h</p>
        <p id="minutes">{minutes}m</p>
        <p id="seconds">{seconds}s</p>
        {/if}       
    </div>
    {:else}
    <p class ="expired">EXPIRED</p>
    {/if}

</div>
