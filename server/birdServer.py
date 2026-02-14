import json
import re
import requests
import os.path
from datetime import datetime

from asgiref.wsgi import WsgiToAsgi
from flask import Flask, jsonify, request

#TO START SERVER, RUN:
#python3 -m hypercorn --config python:config server:bird_app
app = Flask(__name__)


#requires
#uid
# lat, long
# bird Name
# bird code
# image
#region
@app.route('/', methods=['GET'])
def submitBird():
    birdInfo = json.loads(body)

    uid = birdInfo["uid"]

    
    data = {
        "birds" : [],
        "username" : "New User",
        "birdCounts" : {},
        "locations" : {},
        "points" : 0
    }

    try:
        with open(f"user_data/{uid}.json", "r") as f:
            data = json.load(f)
    except:
        pass

    area = round(birdInfo['lat'],3) + "," + round(birdInfo['long'],3)
    if area in data["locations"]:
        if birdInfo["bird"][1] in data["locations"]["area"]:
            return f"Already found a {birdInfo['bird'][1]} here", 400
        else:
            data["locations"]["area"].append(birdInfo["bird"][1])
    else:
        data["locations"]["area"] = [ birdInfo["bird"][1] ]



    # Bird count
    if birdInfo["bird"][1] not in data["birdCounts"]:
        data["birdCounts"][birdInfo["bird"][1]] = 0
    data["birdCounts"][birdInfo["bird"][1]]

    # Rarity (needs bird code)
    headers = {"X-eBirdApiToken" : "jfekjedvescr"}
    r = requests.get(f"https://api.ebird.org/v2/product/barchart?spp={birdInfo['bird'][0]}&regionCodes={birdInfo['region']}", headers = headers)
    freqs =r.json()["dataRows"][0]["values"] 

    yrPercent = float(datetime.now().strftime('%-j'))/365
    index = round((len(freqs) - 1) * yrPercent)
    
    rarity = freqs[index]
    isRare = rarity < 0.1
    data["points"] += 5 if isRare else 1

    #Bird list
    data["birds"].append({
        "name" : birdInfo["bird"][1],
        "region" : birdInfo["region"],
        "isRare" : isRare,
        "image" : birdInfo["image"]
        })

    with open(f"{uid}.json", "w") as f:
        json.dump(data, f, indent = 4)

    return data


if __name__ == "__main__":
    app.run(port = 8000, host='0.0.0.0')
