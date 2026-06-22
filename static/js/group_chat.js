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