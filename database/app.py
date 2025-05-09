from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

@app.get("/api/courses")
async def get_courses():
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)