console.log("group_chat.js loaded");


const socket = io();

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


socket.on(
    "receive_group_message",

    function (data)
    {

        let div =
        document
        .getElementById(
            "messages"
        );

        div.innerHTML +=
            "<p><b>"
            +
            data.sender
            +
            "</b>: "
            +
            data.message
            +
            "</p>";

    }

);