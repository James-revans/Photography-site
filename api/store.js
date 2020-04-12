// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_vO0AEr9FkLr94SVOSykpNz5M00KeRkAg2y');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Content-Type, X-Auth-Token'
    );
    let body = JSON.parse(JSON.stringify(req.body));
    body = JSON.parse(Object.keys(body)[0]);
    const response = await stripe.checkout.sessions.create(body);
    console.log(response);
    res.json(response);
};
