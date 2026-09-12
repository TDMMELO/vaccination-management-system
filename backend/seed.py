"""
Seed real users with hashed passwords.

Why this exists: your Data.sql inserts users with password_hash = 'TEMP_HASH'.
Login runs pwdlib's verify() against that string, which can never match a real
password, so login would always fail. This script hashes passwords the same way
the /users endpoint does, so login works.

Run from the project root (the folder that contains the `app/` package):

    python seed.py

Safe to run more than once: it skips usernames that already exist.
"""

from app.database import SessionLocal
from app import models
from app.security import hash_password


USERS = [
    {
        "first_name": "Faten",
        "last_name": "Ezzat",
        "username": "reception1",
        "password": "reception123",
        "role": "RECEPTIONIST",
    },
    {
        "first_name": "Mostafa",
        "last_name": "Elsayed",
        "username": "doctor1",
        "password": "doctor123",
        "role": "DOCTOR",
    },
]


def main():
    db = SessionLocal()
    try:
        for u in USERS:
            exists = (
                db.query(models.User)
                .filter(models.User.username == u["username"])
                .first()
            )
            if exists:
                print(f"skip: {u['username']} already exists")
                continue

            db.add(
                models.User(
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    username=u["username"],
                    role=u["role"],
                    password_hash=hash_password(u["password"]),
                )
            )
            print(f"created: {u['username']} ({u['role']})")

        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()