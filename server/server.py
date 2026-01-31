import json
import re
import requests
import os.path

from asgiref.wsgi import WsgiToAsgi
from flask import Flask

#TO START SERVER, RUN:
#python3 -m hypercorn server:bird_app
app = Flask(__name__)

def getSessionID():
    global sessionID

    r = requests.get("https://ebird.org/home", allow_redirects=False)
    sessionID = r.headers["set-cookie"]
    pattern = "SESSIONID=(.+?);"
    sessionID = re.search(pattern, sessionID).group(1)
    print(sessionID)
    return sessionID

def getAuthUrl():

    headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': 'XSRF-TOKEN=3e36144d-00c1-4b00-8715-f60522d5f118; _3a55c=5805372865580684; org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE=en-US'}

    # EXECUTION MAY EXPIRE, IF SO: SCRAPE FROM https://secure.birds.cornell.edu/cassso/login
    with open("data", "r") as f:
        data = f.read()
    url = "https://secure.birds.cornell.edu/cassso/login"
    r = requests.post(url, headers = headers, data = data, allow_redirects = False)
    return r.headers["location"]

def authenticate():
    getSessionID()
    authUrl = getAuthUrl()

    headers = {'Cookie': f'_9bf17=d285996586e4f38a; EBIRD_SESSIONID={sessionID}; EBIRD_REGION_CONTEXT=%7B%22regionCode%22%3A%22AU%22%2C%22regionName%22%3A%22Australia%22%7D' }

    requests.get(authUrl, headers = headers, allow_redirects = False)

@app.route('/all')
def getAllUsers():
    files = os.listdir("user_data")
    data = []
    for fileName in files:
        uId = fileName.split(".")[0]
        data.append(getContent(uId)[0])
    return data

@app.route('/<user_id>')
def getContent(user_id, recursions = 0):
    if recursions > 3:
        return "Failed 3 times in a row", 418
    headers = { "Cookie" : f"_9bf17=d285996586e4f38a; EBIRD_SESSIONID={sessionID}; EBIRD_REGION_CONTEXT=%7B%22regionCode%22%3A%22AU%22%2C%22regionName%22%3A%22Australia%22%7D"}

    r = requests.get(f"https://ebird.org/prof/lists?r=world&username={user_id}", headers = headers, allow_redirects = False)
    if (r.status_code == 500):
        return "Invalid user id", 500
    if (r.json() == []):
        authenticate()
        return getContent(user_id, recursions + 1), 200

    return parseResults(r.json(), user_id), 200

def parseResults(rawJson, user_id):
    data = {
        "checklists" : {},
        "username" : rawJson[0]["userDisplayName"],
        "birds" : {},
        "locations" : {},
    }
    try:
        with open(f"user_data/{user_id}.json", "r") as f:
            data = json.load(f)
    except:
        pass
    for x in rawJson:
        if x["subId"] not in data["checklists"]:
           bird = parseChecklist(x["subId"])

           isValid = True
           area = f"{round(x['loc']['lat'],3)},{round(x['loc']['lng'],3)}"
           if (area in data["locations"]):
               if bird in data["locations"][area]:
                   isValid = False
               else:
                   data["locations"][area].append(bird)
           else:
               data["locations"][area] = [ bird ]

           if bird not in data["birds"]:
               data["birds"][bird] = 0

           data["birds"][bird] += 1


           data["checklists"][x["subId"]] = {
                   "bird" : bird, 
                   "date" : x["obsDt"],
                   "location" : x["loc"]["hierarchicalName"], 
                   "coordinates" : f"{x['loc']['lat']},{x['loc']['lng']}", 
                   "valid" : isValid
                   }
    
    
    with open(f"user_data/{user_id}.json", "w") as f:
        json.dump(data, f)
    return data

def parseChecklist(cID):
    r = requests.get(f"https://ebird.org/merlin/checklist/{cID}")

    page = r.text

    pattern = "<span class=\"Heading-main\"  >(.+?)</span>"
    species = re.search(pattern, page).group(1)

    return species

authenticate()
bird_app = WsgiToAsgi(app)
