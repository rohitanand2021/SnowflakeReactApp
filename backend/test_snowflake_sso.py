
import snowflake.connector

print("Connecting to Snowflake...")

conn = snowflake.connector.connect(
    user="RANAND@SPAULDINGRIDGE.COM",
    account="HXKIFRZ-SPAULDING_US_WEST",
    warehouse="COMPUTE_WH",
    database="RANAND",
    schema="TEST_SCHEMA",
    role="SYSADMIN",
    authenticator="externalbrowser"
)

print("Connected ✅")

cur = conn.cursor()
cur.execute("SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_WAREHOUSE()")
print(cur.fetchone())

cur.close()
conn.close()
