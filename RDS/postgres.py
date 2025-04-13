import psycopg2
import os
from psycopg2 import OperationalError
from dotenv import load_dotenv
load_dotenv()

try:
    db_host = os.getenv("db_host")
    db_name = os.getenv("db_name")
    db_user = os.getenv("db_user")
    db_pass = os.getenv("db_pass")

    connection = psycopg2.connect(
        host=db_host,
        port = "5432",
        database=db_name,
        user=db_user,
        password=db_pass,
    )
    print("Connected successfully!")

    cursor = connection.cursor()
    cursor.execute("SELECT version()")
    db_version = cursor.fetchone()
    print(db_version)

    cursor.close()


except OperationalError as e:
    print(f"Connection failed: {e}")