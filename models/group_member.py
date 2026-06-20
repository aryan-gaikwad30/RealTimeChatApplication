from extensions import db


class GroupMember(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    group_id = db.Column(
        db.Integer,
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )