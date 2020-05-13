const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET;
const emailPass = process.env.EMAIL_PASS;

const presets = {
    rust: "https://f002.backblazeb2.com/file/srg-presets/1.dng",
    rays: "https://f002.backblazeb2.com/file/srg-presets/2.dng",
    rosy: "https://f002.backblazeb2.com/file/srg-presets/3.dng",
    rare: "https://f002.backblazeb2.com/file/srg-presets/4.dng",
};

module.exports = async (req, res) => {
    console.log("Sale has been made!");
    const sig = req.headers["stripe-signature"];
    let event;
    let bodyChunks = [];

    let customerEmail;

    let items = [];

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "donotreply.srgphoto@gmail.com",
            pass: emailPass,
        },
    });

    const mailOptions = () => {
        return {
            from: "donotreply.srgphoto@gmail.com",
            to: [customerEmail, "savannargrunzke@gmail.com"],
            subject: "SRG Photo Presets",
            text: "That was easy!",
            html: (() => {
                return `
                    <h2>Thank you for shopping with SRG Photography!</h2>
                    <h4>All download links are one-time-downloads. If you have any issues, please contact <a href="mailto:savannargrunzke@gmail.com">savannargrunzke@gmail.com</a> </h4>
                    <p>Download your preset(s) here: ${items}</p>
                    <p>See how to use the presets <a href="https://srgphoto.video/#/instructions">here</a></p>
                    `;
            })(),
        };
    };

    const sendMail = () => {
        transporter.sendMail(mailOptions(), function (error, info) {
            if (error) {
                console.log(error);
                res.json({ received: true });
            } else {
                console.log("Email sent: " + info.response);
                res.json({ received: true });
            }
        });
    };

    const getCustomerInfo = session => {
        try {
            stripe.customers.retrieve(session.customer, function (
                err,
                customer
            ) {
                customerEmail = customer.email;
                // asynchronously called
                sendMail();
            });
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    };

    req.on("data", chunk => bodyChunks.push(chunk)).on("end", async () => {
        const rawBody = Buffer.concat(bodyChunks).toString("utf8");

        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                endpointSecret
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log(session);
            session.display_items.forEach(item => {
                if (item.custom.name === "preset package") {
                    for (let [key, val] of Object.entries(presets)) {
                        items.push(`<a href="${val}">${key}</a>`);
                    }
                } else {
                    return items.push(
                        `<a href="${presets[item.custom.name]}">${
                            item.custom.name
                        }</a> `
                    );
                }
            });
            getCustomerInfo(session);
        }
    });
};
