import urllib.request
import json
import re

url = 'http://localhost:8000/api/register/'
data = json.dumps({
    'username': 'testnew7', 
    'email': 'test@test.com', 
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'User'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json'
})

try:
    urllib.request.urlopen(req)
    print("Success")
except Exception as e:
    html = getattr(e, 'read', lambda: b'')().decode('utf-8')
    m = re.search(r'<pre class="exception_value">(.*?)</pre>', html, re.DOTALL)
    if m:
        print("ERROR:", m.group(1).strip())
    else:
        print("HTML:", html[:500])
