from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import snowflake.connector

app = FastAPI()

# Allow React (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return snowflake.connector.connect(
        user="RANAND@SPAULDINGRIDGE.COM",
        account="HXKIFRZ-SPAULDING_US_WEST",
        warehouse="COMPUTE_WH",
        database="RANAND",
        schema="TEST_SCHEMA",
        role="SYSADMIN",
        authenticator="externalbrowser"
    )

@app.get("/rate-card/12-months")
def get_rate_card():
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT
            sr_title,
            project_role,
            billable_rate,
            ta_rate,
            internal_rate,
            default_hours,
            (ta_rate * default_hours) AS total_billable,
            ROUND(((ta_rate - internal_rate) / ta_rate) * 100, 2) AS contribution_margin
        FROM RATE_CARD_12_MONTHS
        WHERE rate_card_id = '12_MONTHS'
    """

    cur.execute(query)

    columns = [c[0].lower() for c in cur.description]
    data = [dict(zip(columns, row)) for row in cur.fetchall()]

    cur.close()
    conn.close()

    return data


@app.get("/rate-card/ms")
def get_rate_card_ms():
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT
            sr_title,
            project_role,
            billable_rate,
            ta_rate,
            internal_rate,
            default_hours,
            (ta_rate * default_hours) AS total_billable,
            ROUND(
              CASE 
                WHEN ta_rate = 0 THEN 0
                ELSE ((ta_rate - internal_rate) / ta_rate) * 100
              END
            , 2) AS contribution_margin
        FROM RATE_CARD_MS
        WHERE rate_card_id = 'MS'
    """

    cur.execute(query)
    columns = [c[0].lower() for c in cur.description]
    data = [dict(zip(columns, row)) for row in cur.fetchall()]

    cur.close()
    conn.close()

    return data


@app.get("/rate-card/last-6-months")
def get_rate_card_last_6_months():
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT
            sr_title,
            project_role,
            billable_rate,
            billable_rate AS ta_rate,
            internal_rate,
            total_hours AS default_hours,
            billable_rate * total_hours AS total_billable,
            ROUND(
                CASE 
                    WHEN billable_rate = 0 THEN 0
                    ELSE ((billable_rate - internal_rate) / billable_rate) * 100
                END, 2
            ) AS contribution_margin
        FROM RATE_CARD_LAST_6_MONTHS
        WHERE rate_card_id = 'LAST_6_MONTHS'
    """

    cur.execute(query)
    columns = [c[0].lower() for c in cur.description]
    data = [dict(zip(columns, row)) for row in cur.fetchall()]

    cur.close()
    conn.close()
    return data
