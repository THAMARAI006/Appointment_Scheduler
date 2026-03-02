import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Extract connection details
conn = psycopg2.connect(
    host="localhost",
    database="wp_crm_db",
    user="postgres",
    password="lotus28",
    port=5432
)

cursor = conn.cursor()

# Get all tables
cursor.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public'
""")

print("=" * 60)
print("TABLES IN wp_crm_db DATABASE:")
print("=" * 60)
tables = cursor.fetchall()
for table in tables:
    print(f"  • {table[0]}")

print("\n" + "=" * 60)
print("VIEWING DATA:")
print("=" * 60)

# View data from each table
for table in tables:
    table_name = table[0]
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    print(f"\n📋 TABLE: {table_name}")
    print(f"   Rows: {len(rows)}")
    
    if rows:
        # Get column names
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table_name}'")
        columns = [col[0] for col in cursor.fetchall()]
        print(f"   Columns: {', '.join(columns)}")
        print(f"   Data:")
        for row in rows:
            print(f"     {row}")
    else:
        print("   (No data)")

cursor.close()
conn.close()
print("\n" + "=" * 60)
