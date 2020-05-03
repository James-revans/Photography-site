import fs from "fs";

const pretty = require("pretty");

export default ({ name }) => ({
    generateBundle(options, bundle) {
        const ref = Object.keys(bundle)[0];

        return new Promise((resolve, reject) => {
            const template = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${ref}.css"></link>
                <link rel="icon" type="image/jpg" href="/images/SavLogo.jpg" />
                <script src="https://kit.fontawesome.com/1d402ad3cf.js"></script>
                <title>SRG | Photo & Video</title>
            </head>
            <body>
                <form name="contact" netlify data-netlify-honeypot="bot-field" hidden>
                    <input type="text" name="name" />
                    <input type="email" name="email" />
                    <input type="phone" name="phone" />
                    <select name="package">
                    <option value="" disabled selected
                        >Select a package ($100 minimum)</option
                    >
                    <option value="portrait">portrait</option>
                    <option value="family">family</option>
                    <option value="event">event</option>
                    <option value="misc">misc</option>
                    </select>
                    <textarea name="message"></textarea>
                </form>
                <script src="https://js.pusher.com/5.1/pusher.min.js"></script>
                <script src="${ref}"></script>
            </body>
            </html>
            `;

            fs.writeFile(name, pretty(template), (err) => {
                if (err) {
                    reject();

                    return;
                }

                resolve();
            });
        });
    },
});
