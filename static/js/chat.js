
console.log(
    "chat.js loaded"
);

const socket = io();


let typingTimeout;
const messageInput =
document.getElementById(
    "message"
);

messageInput.addEventListener(
    "input",

    function ()
    {

        socket.emit(
            "typing",
            {
                sender: CURRENT_USER,
                sender_id: CURRENT_USER_ID,
                receiver_id: RECEIVER_ID
            }
        );

        clearTimeout(
            typingTimeout
        );

        typingTimeout =
        setTimeout(

            function ()
            {

                socket.emit(
                    "stop_typing",
                    {
                        sender_id: CURRENT_USER_ID,
                        receiver_id: RECEIVER_ID
                    }
                );

            },

            1000

        );

    }

);

socket.on(
    "show_typing",

    function (data)
    {

        document
        .getElementById(
            "typing-status"
        )
        .innerHTML =
        data.user +
        " is typing...";

    }
);


socket.on(
    "hide_typing",

    function ()
    {

        document
        .getElementById(
            "typing-status"
        )
        .innerHTML = "";

    }
);

socket.on(
    "connect",
    function ()
    {
        console.log(
            "Socket connected"
        );

        socket.emit(
            "join_room",
            {
                sender_id:
                CURRENT_USER_ID,

                receiver_id:
                RECEIVER_ID
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

        if (message.trim() === "")
        {
            return;
        }

        socket.emit(
            "send_message",
            {
                sender:
                CURRENT_USER,

                sender_id:
                CURRENT_USER_ID,

                receiver_id:
                RECEIVER_ID,

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


socket.on(

    "receive_message",

    function(data)
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

        div.innerHTML +=

        `
        <div class="message ${side}">

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

        div.scrollTop =
        div.scrollHeight;

    }

);

socket.on(
    "user_online",

    function(data)
    {
        if (
            parseInt(RECEIVER_ID)
            ===
            data.user_id
        )
        {
            document
            .getElementById(
                "status"
            )
            .innerHTML =
            "🟢 Online";
        }
    }
);

socket.on(
    "user_offline",

    function(data)
    {
        if (
            parseInt(RECEIVER_ID)
            ===
            data.user_id
        )
        {
            document
            .getElementById(
                "status"
            )
            .innerHTML =
            "Last seen "
            +
            data.last_seen;
        }
    }
);

const picker = new EmojiMart.Picker({

    onEmojiSelect: function (emoji)
    {

        messageInput.value +=
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

            messageInput.value =
            event.target.src;

        }

    }

);