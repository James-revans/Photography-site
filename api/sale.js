const nodemailer = require("nodemailer");
const stripe = require("stripe")("sk_test_vO0AEr9FkLr94SVOSykpNz5M00KeRkAg2y");
const endpointSecret = "whsec_3QBUvIDUSuOYH0cB89ubxgbVLVBshkw2";

const presets = {
    rust: "https://f002.backblazeb2.com/file/srg-presets/1.dng",
    rays: "https://f002.backblazeb2.com/file/srg-presets/2.dng",
    rosy: "https://f002.backblazeb2.com/file/srg-presets/3.dng",
    rare: "https://f002.backblazeb2.com/file/srg-presets/4.dng",
    "preset package": [
        {
            name: "rust",
            url: "https://f002.backblazeb2.com/file/srg-presets/1.dng",
        },
        {
            name: "rays",
            url: "https://f002.backblazeb2.com/file/srg-presets/2.dng",
        },
        {
            name: "rosy",
            url: "https://f002.backblazeb2.com/file/srg-presets/3.dng",
        },
        {
            name: "rare",
            url: "https://f002.backblazeb2.com/file/srg-presets/4.dng",
        },
    ],
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
            user: "evans.james00@gmail.com",
            pass: "!Qudojames1$",
        },
    });

    const mailOptions = () => {
        return {
            from: "evans.james00@gmail.com",
            to: customerEmail,
            subject: "SRG Photo Presets",
            text: "That was easy!",
            html: (() => {
                return (
                    `
                    <h2>Thank you for shopping with SRG Photography!</h2>
                    <h4>All download links are one-time-downloads. If you have any issues, please contact <a href="mailto:savannagrunzke@gmail.com">savannagrunzke@gmail.com</a> </h4>
                    <p>Download your preset(s) here: 
                    ` + `${items}`
                );
            })(),
        };

        // <a href="${rosy}">Rosy</a> <a href="${rays}">Rays</a> <a href="${rust}">Rust</a> <a href="${rare}">Rare</a></p>
    };

    const sendMail = () => {
        console.log(items);
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

    const getCustomerInfo = (session) => {
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

    req.on("data", (chunk) => bodyChunks.push(chunk)).on("end", async () => {
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
            session.display_items.forEach((item) => {
                if (item.custom.name === "preset package") {
                    presets[item.custom.name].forEach((preset) => {
                        items.push(
                            `<a href="${preset.url}">${preset.name}</a>`
                        );
                    });
                } else {
                    return items.push(
                        `<a href="${presets[item.custom.name]}">${
                            item.custom.name
                        }</a>`
                    );
                }
            });
            getCustomerInfo(session);
        }
    });
};
