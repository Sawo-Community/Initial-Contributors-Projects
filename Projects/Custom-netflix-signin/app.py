from flask import Flask, render_template, request
from sawo import createTemplate, verifyToken
import json
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")


app = Flask(__name__)
# using flask = True genrates flask template
createTemplate("templates/partials", flask=True)

load = ''
loaded = 0


def setPayload(payload):
    global load
    load = payload


def setLoaded(reset=False):
    global loaded
    if reset:
        loaded = 0
    else:
        loaded += 1


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login_page")
def login_page():
    setLoaded()
    setPayload(load if loaded < 2 else '')
    sawo = {
        "auth_key": API_KEY,
        "to": "login",
        "identifier": "email"
    }
    return render_template("login.html", sawo=sawo, load=load)


@app.route("/login", methods=["POST", "GET"])
def login():
    payload = json.loads(request.data)["payload"]
    setLoaded(True)
    setPayload(payload)
    status = 200 if(verifyToken(payload)) else 404
    return {"status": status}


if __name__ == '__main__':
    app.run()
