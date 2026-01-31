import json
import re
import requests

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

    headers = {'Host': 'secure.birds.cornell.edu', 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9', 'Accept-Encoding': 'gzip, deflate, br, zstd', 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': '7717', 'Origin': 'https://secure.birds.cornell.edu', 'Connection': 'keep-alive', 'Referer': 'https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US', 'Cookie': 'XSRF-TOKEN=3e36144d-00c1-4b00-8715-f60522d5f118; _3a55c=5805372865580684; org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE=en-US', 'Upgrade-Insecure-Requests': '1', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-User': '?1', 'Priority': 'u=0, i', 'TE': 'trailers'}

    # EXECUTION MAY EXPIRE, IF SO: SCRAPE FROM https://secure.birds.cornell.edu/cassso/login
    with open("data", "r") as f:
        data = f.read()
    url = "https://secure.birds.cornell.edu/cassso/login"
    r = requests.post(url, headers = headers, data = data, allow_redirects = False)
    return r.headers["location"]

def authenticate():
    getSessionID()
    authUrl = getAuthUrl()

    headers = {'Host': 'ebird.org', 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9', 'Accept-Encoding': 'gzip, deflate, br, zstd', 'Referer': 'https://secure.birds.cornell.edu/', 'Connection': 'keep-alive', 'Cookie': f'_9bf17=d285996586e4f38a; EBIRD_SESSIONID={sessionID}; EBIRD_REGION_CONTEXT=%7B%22regionCode%22%3A%22AU%22%2C%22regionName%22%3A%22Australia%22%7D', 'Upgrade-Insecure-Requests': '1', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-User': '?1', 'Priority': 'u=0, i'}

    requests.get(authUrl, headers = headers, allow_redirects = False)

@app.route('/<user_id>', methods=["GET"])
def getContent(user_id, recursions = 0):
    if recursions > 10:
        return "Failed 10 times in a row", 418
    headers = { "Cookie" : f"_9bf17=d285996586e4f38a; EBIRD_SESSIONID={sessionID}; EBIRD_REGION_CONTEXT=%7B%22regionCode%22%3A%22AU%22%2C%22regionName%22%3A%22Australia%22%7D"}

    r = requests.get(f"https://ebird.org/prof/lists?r=world&username={user_id}", headers = headers, allow_redirects = False)
    if (r.status_code == 500):
        return "Invalid user id", 500
    if (r.json == []):
        authenticate()
        return getContent(user_id, recursions + 1), 200
    return r.text, 200

authenticate()
# getContent("NDY0MTkyMQ")
bird_app = WsgiToAsgi(app)
