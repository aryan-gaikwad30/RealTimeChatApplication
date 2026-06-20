from extensions import db


class GroupMessage(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    group_id = db.Column(
        db.Integer,
        nullable=False
    )

    sender_id = db.Column(
        db.Integer,
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    timestamp = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )