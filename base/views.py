from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time 
# Create your views here.

def getToken(request):
    appId = 'REDACTED_APP_ID'
    appCertificate  =  'REDACTED_CERT'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 255)
    expirationTimeInSeconds = 3600*24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token, 'uid':uid }, safe=False)
def lobby(request):
    return render(request, 'base/lobby.html')
def room(request):
    return render(request, 'base/room.html')