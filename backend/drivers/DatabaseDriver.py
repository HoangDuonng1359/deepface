import os
import pymysql.cursors
# from pymysql import converters
from fastapi import HTTPException, status


DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = int(os.getenv("DATABASE_PORT"))
DATABASE = os.getenv("DATABASE")
DATABASE_USER = "root"
DATABASE_PASSWORD = "123456"

class DatabaseConnector:
    def __init__(self):
        self.connection = pymysql.connect(
            host=DATABASE_HOST,
            port=DATABASE_PORT,
            user=DATABASE_USER,
            password=DATABASE_PASSWORD,
            database=DATABASE,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )
    
    def query_get(self, sql: str, params: tuple, limit: int = None) -> list:
        """
        Truy vấn tất cả dữ liệu từ cơ sở dữ liệu
        """
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(sql, params)
                
                if limit is None:
                    result = cursor.fetchall()
                elif limit == 1:
                    result = cursor.fetchone()
                else:
                    result = cursor.fetchmany(limit)
                
                return result
        except pymysql.MySQLError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi database: {e}",
            )
    
    def query_set(self, sql: str, params: tuple):
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(sql, params)
                self.connection.commit()
        
        except pymysql.MySQLError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi database: {e}",
            )



    