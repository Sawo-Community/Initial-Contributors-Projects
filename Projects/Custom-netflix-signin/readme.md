## Custom Netflix Signin


Requirements – Python, pip.

Steps:

1. Install the sawo package

   ```
   pip install sawo
   ```

2. From Sawo import createTemplate, getContext and verifyToken methods The getContext method is used to create sawo dictionary object from data gain from DB in Django

   ```
   from sawo import createTemplate, getContext, verifyToken
   ```

3. Login to sawo dev console [sawo-dev-console](https://dev.sawolabs.com/ "sawo-dev-console")

4. Create new project
   Set project name
   Set project host
   For dev: point to localhost
   For prod: point to your domain
   Copy the API key

5. Setup
   Getting started Creating template for sawo password less and OTP-less Authentication for your website.

   Flask

   ```createTemplate("./<filepath>",flask=True)
   #example
   createTemplate("./templates/partials",flask=True)
   ```

   #Sending data required by \_sawo.html

   The variable name used in \_sawo.html template are sawo.auth_key, sawo.identifier and sawo.to so to send that data we create a json.

   Note
   *The "to" route should be a post route which can receive posted data.
   *If you don’t know how data is passed to templates in Django or Flask, We will suggest looking into it first

   Flask

   METHOD 1. SENDING STATIC DATA

   ```
   context = {
     "sawo":{
     "auth_key": "<api_key>",
     "identifier": "email | phone_number_sms"
     "to": <route> #the route where you will recieve
     the payload sent by sdk
     }
   }

   #example
   context = {
     "sawo":{
     "auth_key": "785ha-hdjsdsd-799-ss345",
     "identifier": "email | phone_number_sms"
     "to": login
     }
   }
   ```

   METHOD 2. USING ADMIN AND DATABASE TO SAVE CONFIG FOR SAWO

   Step 1. Creating fields for sawo api_key and identifier to set it from admin dashboard. copy this code in models of your app

   ```
   class Config(models.Models):
   api_key = models.CharField(max_length=200)
   identifier = models.CharField(max_length=200)
   choices = [("email","Email"),("phone_number_sms","Phone")]
   ```

   Step 2. Setting up view.py of app. Note: Route should be the receiving end where you can handle post request

   ```
   from models import Config
   from sawo import getContext

   def <your_function>(request):
   config = Config.objects.order_by('-api_key')[:1]
   context = {
   "sawo" = getContext(config,<route>) #the route where you will recieve
   the payload sent by sdk
   }

   #example

   def index(request):
   config = Config.objects.order_by('-api_key')[:1]
   context = {
       "sawo" = getContext(config,"login")
   }
   ```

   Verifying Token

   When the login is done on the webpage it sends the data to backend as payload to verify user, you can use verifyToken function, it returns a boolean.
   
   BACKEND CODE IS SAME FOR DJANGO AND FLASK

   ```
   from sawo import verifyToken

   #use the method provided by flask and django to receive the
   #data from post request the use this function it will return
   #True or False depending on user status
   verifyToken(payload)

   //example
   payload = <data from POST request>
   if(verifyToken(payload)):
   #do something
   else:
   #do something else
   ```

   You are all set to use SAWO in your Flask Application
