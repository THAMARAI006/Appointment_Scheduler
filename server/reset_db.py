#!/usr/bin/env python
"""Reset database - drop all tables and recreate them"""

from app.core.database import engine, Base
import app.models  # noqa: F401

print("🔄 Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("✅ Tables dropped")

print("🔄 Creating all tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")

print("\nDatabase reset complete. You can now start the API.")
