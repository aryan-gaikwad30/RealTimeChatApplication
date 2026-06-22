from flask import Flask, render_template, request, redirect
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import emit, join_room
from datetime import datetime
from models.group import Group
from models.group_member import GroupMember
from models.group_message import GroupMessage

from config import Config
from extensions import db, login_manager, socketio



app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
socketio.init_app(
    app,
    cors_allowed_origins="*"
)
login_manager.init_app(app)
login_manager.login_view = "login"

from models.user import User
from models.message import Message

active_connections = {}

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route("/")
def home():

    return render_template(
        "auth.html"
    )


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            return "Email already exists!"

        hashed_password = generate_password_hash(password)

        new_user = User(
            username=username,
            email=email,
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        return redirect("/login")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            login_user(user)

            return redirect("/dashboard")

        return render_template(
            "login.html",
            error="Invalid email or password"
        )

    return render_template("login.html")


@app.route("/dashboard")
@login_required
def dashboard():

    users = User.query.filter(
        User.id != current_user.id
    ).all()

    memberships = GroupMember.query.filter_by(
        user_id=current_user.id
    ).all()

    group_ids = [
        membership.group_id
        for membership in memberships
    ]

    groups = Group.query.filter(
        Group.id.in_(group_ids)
    ).all()

    return render_template(
        "dashboard.html",
        users=users,
        groups=groups
    )

@app.route("/chat/<int:user_id>")
@login_required
def chat(user_id):

    receiver = User.query.get_or_404(user_id)

    # if request.method == "POST":
    #     content = request.form["message"]
    #
    #     new_message = Message(
    #         sender_id=current_user.id,
    #         receiver_id=user_id,
    #         content=content
    #     )
    #
    #     db.session.add(new_message)
    #     db.session.commit()
    #
    #     return redirect(f"/chat/{user_id}")

    messages = Message.query.filter(
        (
            (Message.sender_id == current_user.id)
            &
            (Message.receiver_id == user_id)
        )
        |
        (
            (Message.sender_id == user_id)
            &
            (Message.receiver_id == current_user.id)
        )
    ).all()

    return render_template(
        "chat.html",
        receiver=receiver,
        messages=messages
    )

@socketio.on("send_message")
def handle_send_message(data):

    sender_id = int(data["sender_id"])
    receiver_id = int(data["receiver_id"])
    content = data["message"]

    room_name = "_".join(
        map(
            str,
            sorted(
                [sender_id, receiver_id]
            )
        )
    )

    # Save message to database
    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )

    db.session.add(new_message)
    db.session.commit()

    
    emit(
        "receive_message",
        {
            "sender": data["sender"],
            "message": content
        },
        room=room_name
    )

@app.route("/logout")
@login_required
def logout():

    logout_user()

    return redirect("/login")

@socketio.on("join_room")
def handle_join_room(data):

    sender_id = data["sender_id"]
    receiver_id = data["receiver_id"]

    room_name = "_".join(
        map(
            str,
            sorted(
                [sender_id, receiver_id]
            )
        )
    )

    join_room(room_name)

    print(
        f"Joined room: {room_name}"
    )

@socketio.on("typing")
def handle_typing(data):

    sender_id = int(data["sender_id"])
    receiver_id = int(data["receiver_id"])

    room_name = "_".join(
        map(
            str,
            sorted(
                [sender_id, receiver_id]
            )
        )
    )

    emit(
        "show_typing",
        {
            "user": data["sender"]
        },
        room=room_name,
        include_self=False
    )


@socketio.on("stop_typing")
def handle_stop_typing(data):

    sender_id = int(data["sender_id"])
    receiver_id = int(data["receiver_id"])

    room_name = "_".join(
        map(
            str,
            sorted(
                [sender_id, receiver_id]
            )
        )
    )

    emit(
        "hide_typing",
        room=room_name,
        include_self=False
    )

@socketio.on("connect")
def handle_connect(auth=None):

    if current_user.is_authenticated:

        user_id = current_user.id

        active_connections[user_id] = (
            active_connections.get(user_id, 0)
            + 1
        )

        user = db.session.get(
            User,
            user_id
        )

        user.status = "online"

        db.session.commit()

        print(
            f"{user.username} connected "
            f"({active_connections[user_id]} tabs)"
        )

        socketio.emit(
    "user_online",
    {
        "user_id": user_id
    }
)




@socketio.on("disconnect")
def handle_disconnect(reason=None):

    if current_user.is_authenticated:

        user_id = current_user.id

        active_connections[user_id] -= 1

        if active_connections[user_id] == 0:

            del active_connections[user_id]

            user = db.session.get(
                User,
                user_id
            )

            user.status = "offline"

            user.last_seen = datetime.now()

            db.session.commit()

            print(
                f"{user.username} offline"
            )

            socketio.emit(
    "user_offline",
    {
        "user_id": user_id,
        "last_seen":
        user.last_seen.strftime(
            "%I:%M %p"
        )
    }
)

@app.route("/create_group", methods=["GET", "POST"])
@login_required
def create_group():

    if request.method == "POST":

        group_name = request.form["group_name"]
        selected_members = request.form.getlist("members")
  
        new_group = Group(
            name=group_name
        )

        db.session.add(
            new_group
        )

        db.session.commit()

        creator = GroupMember(
            group_id=new_group.id,
            user_id=current_user.id
        )

        db.session.add(creator)

        for user_id in selected_members:
            member = GroupMember(
                group_id=new_group.id,
                user_id=int(user_id)
            )
            db.session.add(member)

        db.session.commit()

        return redirect("/groups")

    users = User.query.filter(
        User.id != current_user.id
     ).all()

    return render_template(
    "create_group.html",
    users=users
    )   

@app.route("/groups")
@login_required
def groups():

    memberships = GroupMember.query.filter_by(
        user_id=current_user.id
    ).all()

    group_ids = [
        membership.group_id
        for membership in memberships
    ]

    groups = Group.query.filter(
        Group.id.in_(
            group_ids
        )
    ).all()

    return render_template(
        "groups.html",
        groups=groups
    )

@app.route(
    "/leave_group/<int:group_id>"
)
@login_required
def leave_group(group_id):

    membership = GroupMember.query.filter_by(

        group_id=group_id,

        user_id=current_user.id

    ).first()

    if membership:

        db.session.delete(
            membership
        )

        db.session.commit()

    return redirect(
        "/dashboard"
    )

@app.route("/group_chat/<int:group_id>")
@login_required
def group_chat(group_id):

    group = Group.query.get_or_404(
        group_id
    )

    messages = GroupMessage.query.filter_by(
        group_id=group_id
    ).all()

    message_data = []

    for msg in messages:

        sender = db.session.get(
            User,
            msg.sender_id
        )

        message_data.append(
            {
                "sender": sender.username,
                "content": msg.content
            }
        )

    return render_template(
        "group_chat.html",
        group=group,
        messages=message_data
    )

@socketio.on("join_group")
def handle_join_group(data):

    room_name = (
        f"group_"
        f"{data['group_id']}"
    )

    join_room(
        room_name
    )

    print(
        room_name
    )

@socketio.on("group_message")
def handle_group_message(data):


    print("GROUP MESSAGE RECEIVED")

    print(data)

    room_name = (
        f"group_"
        f"{data['group_id']}"
    )

    new_message = GroupMessage(

        group_id=
        data["group_id"],

        sender_id=
        data["sender_id"],

        content=
        data["message"]

    )

    db.session.add(
        new_message
    )

    db.session.commit()

    emit(

        "receive_group_message",

        {

            "sender":
            data["sender"],

            "message":
            data["message"]

        },

        room=room_name

    )

@socketio.on("group_typing")
def handle_group_typing(data):

    room_name = f"group_{data['group_id']}"

    emit(

        "show_group_typing",

        {

            "user":
            data["sender"]

        },

        room=room_name,

        include_self=False

    )

@socketio.on("stop_group_typing")
def handle_stop_group_typing(data):

    room_name = f"group_{data['group_id']}"

    emit(

        "hide_group_typing",

        room=room_name,

        include_self=False

    )



if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    socketio.run(
    app,
    host="0.0.0.0",
    port=5000,
    debug=True
)