
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

    function (data)
    {

        let div =
        document
        .getElementById(
            "messages"
        );

        div.innerHTML +=
            "<p><b>"
            + data.sender
            + "</b>: "
            + data.message
            + "</p>";

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