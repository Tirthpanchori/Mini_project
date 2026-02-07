from youtube_transcript_api import YouTubeTranscriptApi

video_id = "-e649JbOQp4"

try:
    ytt_api = YouTubeTranscriptApi()
    transcript = ytt_api.fetch(video_id)

    text = " ".join(snippet.text for snippet in transcript.snippets)
    print(text)

except Exception as e:
    print("Transcript not available:", e)
