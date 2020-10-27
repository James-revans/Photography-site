<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

    .text{
        display: flex;
        flex-direction: column;
        width: 60%;
        margin: 0 auto;
        padding-left: 5px;
        padding-right: 5px;   
    }

    .text-body{
        display:inline-block;
        text-align: left;
        margin-bottom: 50px;
    }

    h1{
        font-size: 60px;
        margin: 50px 0;
    }

    p {
        font-size: 24px;
        line-height: 1.5;
        font-family: 'Alegreya Sans SC', sans-serif;
        color: var(--sg-green);
        margin: 0;
    }
    @include break-up('md') {
        h1 {
            margin: 100px 0;
        }
        .text-body {
            margin-bottom: 80px;
        }
    }


    @media only screen and (max-width: 600px) {
        h1{
            font-size: 33px;
        }
        p {
            font-size: 20px;
        }
        
        .text{
            width: 80%;
        }
    }
</style>

<div class='text'>
    <h1 class="sg-green vollkorn">Packages</h1>
    <div class='text-body'>
        <p>Choose from one of the following or contact me to customize a package that meets your needs.</p>
        <p>Travel fee: $0.50/mile after 60 mile radius from Eau Claire</p>
        <p style="padding-top: 32px;">* All packages will receive photos through an online photo gallery</p>
    </div>
</div>

