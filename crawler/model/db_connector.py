import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table, Column, BigInteger, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


# Load environment variables
load_dotenv()
db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_pwd = os.getenv('DB_PWD')
db_database = os.getenv('DB_NAME')


# Create engine
engine = create_engine(f'mysql+pymysql://{db_user}:{db_pwd}@{db_host}/{db_database}')

# Create session
Session = sessionmaker(bind=engine)
session = Session()

# export session for use in other files
