const nodemailer = require("nodemailer");

const rust = "https://f002.backblazeb2.com/file/srg-presets/1.dng";
const rays = "https://f002.backblazeb2.com/file/srg-presets/2.dng";
const rosy = "https://f002.backblazeb2.com/file/srg-presets/3.dng";
const rare = "https://f002.backblazeb2.com/file/srg-presets/4.dng";

module.exports = async (req, res) => {
    console.log("Sale has been made!");
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "evans.james00@gmail.com",
            pass: "",
        },
    });

    const mailOptions = {
        from: "evans.james00@gmail.com",
        to: "evans.james00@gmail.com",
        subject: "SRG Photo Presets",
        text: "That was easy!",
        html: `
        <h2>Thank you for shopping with SRG Photography!</h2>
        <h4>All download links are one-time-downloads. If you have any issues, please contact <a href="mailto:savannagrunzke@gmail.com">savannagrunzke@gmail.com</a> </h4>
        <p>Download your preset(s) here: <a href="${rosy}">Rosy</a> <a href="${rays}">Rays</a> <a href="${rust}">Rust</a> <a href="${rare}">Rare</a></p>
        `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};
