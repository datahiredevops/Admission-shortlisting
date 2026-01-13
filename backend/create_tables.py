import models
import database

print("⏳ Connecting to Neon Database...")
print(f"🔗 Target: {database.SQLALCHEMY_DATABASE_URL}")

# This line forces SQLAlchemy to create all missing tables (admins, applications, etc.)
models.Base.metadata.create_all(bind=database.engine)

print("✅ Tables Created Successfully!")