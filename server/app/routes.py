from flask import request, jsonify, session
from app.models import db, VideoData, CachedVideoData, UserData
from app.services import fetch_youtube_data
import time

def register_routes(app):

    @app.route('/')
    def home():
        return "Flask is running"

    @app.route('/api/store-data', methods=['POST'])
    def store_data():
        try:
            data = request.get_json()
            video_url = data.get('video_url')
            video_id = video_url.split('watch?v=')[1].split('&')[0] 
            tags = data.get('tags')

            if not video_id or not tags:
                return jsonify({"message": "Missing video_id or tags"}), 400

            tags = ",".join(tags)  # Convert the list of tags to a comma-separated string
            timestamp = time.time()  # Get the current timestamp
            
            user_google_id = session.get("user", {}).get("google_id")

            if not user_google_id:
                return jsonify({"message": "User is not authenticated"}), 401
            
            # Step 3: Check if the video already exists in VideoData table
            existing_data = VideoData.query.filter_by(video_id=video_id).first()

            if existing_data:
                # If the video exists, increment the count in VideoData but do not update UserData count
                existing_data.count += 1
                db.session.commit()

                # Step 4: Store the video data in UserData for the current user
                user_data = UserData.query.filter_by(google_id=user_google_id, video_id=video_id).first()

                if not user_data:
                    # If this video is not stored by the user yet, store the video data in UserData
                    new_user_data = UserData(google_id=user_google_id, video_id=video_id, tags=tags, timestamp=timestamp)
                    db.session.add(new_user_data)
                    db.session.commit()

                return jsonify({"message": "Data updated successfully", "count": existing_data.count}), 200
            else:
                # Step 5: If the video doesn't exist, create a new entry in VideoData
                new_data = VideoData(video_id=video_id, tags=tags, timestamp=timestamp)
                db.session.add(new_data)
                db.session.commit()

                # Step 6: Store the video data in UserData for the current user
                new_user_data = UserData(google_id=user_google_id, video_id=video_id, tags=tags, timestamp=timestamp)
                db.session.add(new_user_data)
                db.session.commit()

                return jsonify({"message": "Data stored successfully", "count": 1}), 200

        except Exception as e:
            return jsonify({"message": f"Error storing data: {e}"}), 500

    @app.route('/api/get-data-by-tag/<tag>', methods=['GET'])
    def get_data_by_tag(tag):
        try:
            matching_data = VideoData.query.filter(VideoData.tags.like(f"%{tag}%")).all()
            if matching_data:
                return jsonify([
                    {"video_id": entry.video_id, "tags": entry.tags.split(","), "count": entry.count}
                    for entry in matching_data
                ]), 200
            return jsonify({"message": f"No data found for tag: {tag}"}), 404
        except Exception as e:
            return jsonify({"message": f"Error fetching data by tag: {e}"}), 500

    @app.route('/api/get-cached-videos/<tag>', methods=['GET'])
    def get_cached_videos(tag):
        try:
            cached_videos = CachedVideoData.query.filter_by(tag_category=tag).all()
            if cached_videos:
                return jsonify([
                    {"video_id": video.video_id, "title": video.title, "thumbnail_url": video.thumbnail_url,
                     "view_count": video.view_count, "video_created_at": video.video_created_at,
                     "channel_name": video.channel_name, "channel_photo_url": video.channel_photo_url}
                    for video in cached_videos
                ]), 200
            return jsonify({"message": f"No cached videos found for tag: {tag}"}), 404
        except Exception as e:
            return jsonify({"message": f"Error fetching cached videos: {e}"}), 500
