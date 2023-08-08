from sqlalchemy import create_engine, MetaData, Table, Column, BigInteger, String, JSON, Float
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .db_connector import session

# Create metadata
metadata = MetaData()

# Create base
Base = declarative_base()


# Create table
class Lens_model(Base):
    __tablename__ = 'Lens'
    id = Column(BigInteger, primary_key=True, autoincrement=True)    
    name = Column(String(255))
    image = Column(String(255))
    url = Column(String(255))
    specification = Column(JSON)
    maker = Column(String(32))
    mount = Column(String(16))
    price = Column(Float)
    CMOS_size = Column(String(16))
    type = Column(String(16))


def auto_to_database(lens_list):
  print("auto to database")
  try:
    for lens in lens_list:
      session.merge(Lens_model(
        name=lens.name,
        image=lens.image, 
        url=lens.url, 
        specification=lens.specification,
        maker=lens.maker,
        mount=lens.mount,
        price=lens.price,
        CMOS_size=lens.CMOS_size,
        type=lens.type
        ))
    session.commit()
    session.close()
    print("done")
    print("--------------------")
    return True
  
  except Exception as e:
    session.rollback()
    session.close()
    print("auto failed")
    print(e)
    print("--------------------")
    return False

# Write to database
def write_to_database(lens_list):
  print("writing to database")
  try:
    for lens in lens_list:
      session.add(Lens_model(
        name=lens.name,
        image=lens.image, 
        url=lens.url, 
        specification=lens.specification,
        maker=lens.maker,
        mount=lens.mount,
        price=lens.price,
        CMOS_size=lens.CMOS_size,
        type=lens.type
        ))
    session.commit()
    session.close()
    print("done")
    print("--------------------")
    return True

  except Exception as e:
    session.rollback()
    session.close()
    print("write failed")
    print(e)
    print("--------------------")
    return False


# update database
def update_to_database(lens_list):
  print("updating database")
  try:
    for lens in lens_list:
      session.query(Lens_model).filter(Lens_model.name == lens.name).update({
        Lens_model.image:lens.image, 
        Lens_model.url:lens.url, 
        Lens_model.specification:lens.specification,
        Lens_model.maker:lens.maker,
        Lens_model.mount:lens.mount,
        Lens_model.price:lens.price,
        Lens_model.CMOS_size:lens.CMOS_size,
        Lens_model.type:lens.type
        })
    session.commit()
    session.close()
    print("done")
    print("--------------------")
    return True

  except Exception as e:
    session.rollback()
    session.close()

    print("update failed")
    print(e)
    print("--------------------")
    return False


def delete_from_database(lens_list):
  print("deleting from database")
  try: 
    for lens in lens_list:
      session.query(Lens_model).filter(Lens_model.name == lens.name).delete()
    session.commit()
    session.close()
    print("done")
    print("--------------------")
    return True

  except Exception as e:
    session.rollback()
    session.close()

    print("delete failed")
    print(e)
    print("--------------------")
    return False
