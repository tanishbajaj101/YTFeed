from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    google_id = db.Column(db.String(100), primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    user_data = db.relationship('UserData', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.first_name} {self.last_name} - {self.google_id}>"

class VideoData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(500), nullable=False, unique=True)
    tags = db.Column(db.String(200), nullable=False)
    # timestamp here is needed to track max no. of videos it pushes per day
    timestamp = db.Column(db.Float, nullable=False)
    count = db.Column(db.Integer, default=1)

    user_data = db.relationship('UserData', backref='video', lazy=True)

    def __repr__(self):
        return f"<VideoData {self.video_id} - {self.tags}>"

class UserData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), db.ForeignKey('user.google_id'), nullable=False) 
    video_id = db.Column(db.String(500), nullable=False)
    tags = db.Column(db.String(200), nullable=False)

    user = db.relationship('User', backref=db.backref('user_data', lazy=True))  

    def __repr__(self):
        return f"<UserData {self.video_id} - {self.tags}>"

class CachedVideoData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(500), nullable=False)
    tag_category = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(500))
    thumbnail_url = db.Column(db.String(500))
    view_count = db.Column(db.Integer)
    video_created_at = db.Column(db.String(100))
    channel_name = db.Column(db.String(200))
    channel_photo_url = db.Column(db.String(500))
    cache_timestamp = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<CachedVideoData {self.video_id} - {self.tag_category}>"
