import os
import pymysql.cursors
from pymysql import converters
from fastapi import HTTPException, status

class DatabaseConnector:
    def __init__(self):
        self.host = os.getenv("DATABASE_HOST")
        self.user = "root"
        self.password = "123456"
        self.database = os.getenv("DATABASE")
        self.port = int(os.getenv("DATABASE_PORT"))
        self.conversions = converters.conversions
        self.conversions[pymysql.FIELD_TYPE.BIT] = (
            lambda x: False if x == b"\x00" else True
        )
    
    def get_connection(self):
        connection = pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.database,
            conv=self.conversions,
            charset="utf8",
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection

    def query_get(self, sql: str, params: tuple, limit: int = None):
        """
        Truy vấn tất cả dữ liệu từ cơ sở dữ liệu
        """
        
        try:
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
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
            connection = self.get_connection()
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(sql, params)
                    connection.commit()
                    return cursor.lastrowid
        
        except pymysql.MySQLError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi database: {e}",
            )
    