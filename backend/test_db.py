from sqlalchemy import text
from app.core.database import engine


try:
    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT version()")
        )

        print("Database connection successful!")

        print(result.scalar())

        vector_result = connection.execute(
            text("SELECT extversion FROM pg_extension WHERE extname = 'vector'")
        )

        print("pgvector version:", vector_result.scalar())

except Exception as error:
    print("Database connection failed!")
    print(error)