console.log("group_chat.js loaded");


const socket = io();
let typingTimer;

socket.on(
    "connect",

    function ()
    {

        socket.emit(
            "join_group",
            {
                group_id:
                GROUP_ID
            }
        );

    }
);


document
.getElementById(
    "send-btn"
)
.addEventListener(

    "click",

    function ()
    {

        let message =
        document
        .getElementById(
            "message"
        )
        .value;

        socket.emit(
            "group_message",
            {
                sender:
                CURRENT_USER,

                sender_id:
                CURRENT_USER_ID,

                group_id:
                GROUP_ID,

                message:
                message
            }
        );

        document
        .getElementById(
            "message"
        )
        .value = "";

    }

);

document
.getElementById(
    "message"
)
.addEventListener(

    "input",

    function ()
    {

        socket.emit(
            "group_typing",
            {

                sender:
                CURRENT_USER,

                group_id:
                GROUP_ID

            }
        );

        clearTimeout(
            typingTimer
        );

        typingTimer =
        setTimeout(

            function ()
            {

                socket.emit(
                    "stop_group_typing",
                    {

                        group_id:
                        GROUP_ID

                    }
                );

            },

            1000

        );

    }

);


socket.on(

    "receive_group_message",

    function (data)
    {

        let div =
        document
        .getElementById(
            "messages"
        );

        let side;

        if (
            parseInt(
                data.sender_id
            )
            ===
            parseInt(
                CURRENT_USER_ID
            )
        )
        {
            side = "sent";
        }
        else
        {
            side = "received";
        }

        let html;

        if (
            side
            ===
            "sent"
        )
        {

            html =

            `
            <div class="message sent">

                <div class="bubble">

                    ${
                    data.message.includes(
                        "giphy.com"
                    )

                    ?

                    `<img src="${data.message}" width="200">`

                    :

                    data.message

                    }

                </div>

            </div>
            `;

        }

        else

        {

            html =

            `
            <div class="message received">

                <div>

                    <b>

                        ${data.sender}

                    </b>

                    <div class="bubble">

                        ${
                        data.message.includes(
                            "giphy.com"
                        )

                        ?

                        `<img src="${data.message}" width="200">`

                        :

                        data.message

                        }

                    </div>

                </div>

            </div>
            `;

        }

        div.innerHTML +=
        html;

        div.scrollTo(

            {

                top:
                div.scrollHeight,

                behavior:
                "smooth"

            }

        );

    }

);

socket.on(

    "show_group_typing",

    function (data)
    {

        document
        .getElementById(
            "typing-status"
        )
        .innerHTML =

        data.user
        +
        " is typing...";

    }

);

socket.on(

    "hide_group_typing",

    function ()
    {

        document
        .getElementById(
            "typing-status"
        )
        .innerHTML = "";

    }

);

const picker = new EmojiMart.Picker({

    onEmojiSelect: function (emoji)
    {

        document
        .getElementById(
            "message"
        )
        .value +=
        emoji.native;

    }

});

document
.getElementById(
    "emoji-picker"
)
.appendChild(
    picker
);

document
.getElementById(
    "emoji-btn"
)
.addEventListener(

    "click",

    function ()
    {

        let pickerBox =
        document
        .getElementById(
            "emoji-picker"
        );

        if (
            pickerBox.style.display
            ===
            "none"
        )
        {
            pickerBox.style.display =
            "block";
        }
        else
        {
            pickerBox.style.display =
            "none";
        }

    }

);

document
.getElementById(
    "gif-btn"
)
.addEventListener(

    "click",

    function ()
    {

        let gifBox =
        document
        .getElementById(
            "gif-box"
        );

        if (
            gifBox.style.display
            ===
            "none"
        )
        {
            gifBox.style.display =
            "block";
        }
        else
        {
            gifBox.style.display =
            "none";
        }

    }

);


document
.getElementById(
    "search-gif"
)
.addEventListener(

    "click",

    async function ()
    {

        let query =
        document
        .getElementById(
            "gif-search"
        ).value;

        let response =
        await fetch(

"https://api.giphy.com/v1/gifs/search?api_key=Zt8Ic9FaANW5acUbyFCRCEk3vIUKVdBC&q="
+
query
+
"&limit=8"

        );

        let data =
        await response.json();

        let gifResults =
        document
        .getElementById(
            "gif-results"
        );

        gifResults.innerHTML = "";

        data.data.forEach(

            function(gif)
            {

                gifResults.innerHTML +=

                `
                <img
                src="${gif.images.fixed_width.url}"
                width="120"
                class="gif-image">
                `;

            }

        );

    }

);

document
.getElementById(
    "gif-results"
)
.addEventListener(

    "click",

    function(event)
    {

        if (
            event.target.tagName
            ===
            "IMG"
        )
        {

            document
            .getElementById(
                "message"
            )
            .value =
            event.target.src;

        }

    }

);
let messagesBox =
document
.getElementById(
    "messages"
);

messagesBox.scrollTop =
messagesBox.scrollHeight;