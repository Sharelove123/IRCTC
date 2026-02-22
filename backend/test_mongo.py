from pymongo import MongoClient

try:
    client = MongoClient("mongodb+srv://rachitkumarsingh144_db_user:fWpdfVrm2nxXsjwb@cluster0.kyhlcbj.mongodb.net/", serverSelectionTimeoutMS=2000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("MongoDB Connection: SUCCESS")
except Exception as e:
    print(f"MongoDB Connection: FAILED - {e}")
