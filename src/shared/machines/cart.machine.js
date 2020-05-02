export default {
    id: "cart",
    initial: "browse",
    states: {
        browse: {
            on: {
                CHECKOUT: "checkout",
            },
        },
        checkout: {
            on: {
                BROWSE: "browse",
                CANCEL: "browse",
            },
        },
    },
};
