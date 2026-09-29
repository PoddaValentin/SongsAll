from flask import Flask
import flask
import json
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello, World!"

@app.route('/bubbleChartData', methods=["GET"])
def bubbleChartData():

    year = flask.request.args.get('year')
    
    with open("./../data/albums_structure.json", "r") as f:
        album_structure = json.load(f)
    
    if year in album_structure:
        structure = album_structure[year]
    else:
        return flask.jsonify([])

    with open("./../data/subgenres_by_genre.json") as f:
        subgenres_by_genre = json.load(f)
        
    subgenre2genre = { v: k for k, l in subgenres_by_genre.items() for v in l }
    subgenre2genre[""] = "Unspecified"


    # Load albums
    albums = []

    for country in structure:
        for file in structure[country]:
            with open(f"./../data/processed_albums/{year}/{country}/{file}", "r", encoding="utf-8") as f:
                data = json.load(f)
                albums.extend(data)

    df_albums = pd.DataFrame(albums)

    df_albums["_id"] = df_albums["_id"].apply(lambda x: x["$oid"])
    df_albums["genre"] = df_albums["genre"].map(subgenre2genre)
    df_albums["dateRelease"] = df_albums["dateRelease"].astype("int")


    # Handle when album has no songs
    if not os.path.exists(f"./../data/processed_songs/{year}"):
        df_albums["explicitness"] = 0
        df_albums["classiness"] = 0
        return flask.jsonify(json.loads(df_albums.to_json(orient="records")))


    # Load songs
    songs = []

    files = os.listdir(f"./../data/processed_songs/{year}")
    for file in files:
        with open(f"./../data/processed_songs/{year}/{file}", "r") as f:
            data = json.load(f)
            songs.extend(data)    

    df_songs = pd.DataFrame(songs)

    df_songs["_id"] = df_songs["_id"].apply(lambda x: x["$oid"])
    df_songs["id_album"] = df_songs["id_album"].apply(lambda x: x["$oid"] if "$oid" in x else x)
    df_songs["count"] = 1
    df_songs = df_songs.drop(columns=["_id", "title", "name", "genre", "releaseYear"])


    # Process songs
    df_grouped = df_songs.groupby(by="id_album").sum()

    df_joined = df_albums.merge(df_grouped, left_on='_id', right_on='id_album', suffixes=('_album', '_song'))
    
    df_joined["explicitness"] = df_joined.apply(lambda x: x["explicitLyrics"] / x["count"], axis=1)
    df_joined["classiness"] = df_joined.apply(lambda x: x["isClassic"] / x["count"], axis=1)

    df_joined = df_joined.drop(columns=["explicitLyrics", "isClassic", "count"])
        
    return flask.jsonify(json.loads(df_joined.to_json(orient="records")))

if __name__ == "__main__":
    app.run("localhost", 3000)