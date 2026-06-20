from extensions import db
from flask_login import UserMixin


class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="offline"
    )

    status = db.Column(
    db.String(20),
    default="offline"
)

last_seen = db.Column(
    db.DateTime
)