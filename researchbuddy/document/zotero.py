import os.path
import sqlite3

from pathlib import Path
from .directory import load_one_pdf


__sql1 = """
with tbl1 as (
  select i.key            as key,
         i.itemID         as itemID,
         it.typeName      as typeName,
         c.collectionID   as collection_id,
         idv.value        as val,
         f.fieldName      as fieldName,
         ca.firstName     as author_first,
         ca.lastName      as author_last
    from items i
   inner join itemCreators ic on (ic.itemID = i.itemID and ic.orderIndex = 0)
   inner join creatorTypes ct on (ct.creatorTypeID = ic.creatorTypeID and ct.creatorType = 'author')
   inner join creators ca on (ca.creatorID= ic.creatorID)
   inner join collectionItems ci on (ci.itemID = i.itemID)
   inner join collections c on (c.collectionID = ci.collectionID)
   inner join itemTypes it on (it.itemTypeID = i.itemTypeID)
   inner join itemTypeFields itf on (itf.itemTypeID = it.itemTypeID)
   inner join fields f on (f.fieldID = itf.fieldID)
   inner join itemData id on (id.fieldID = f.fieldID and i.itemID = id.itemID)
   inner join itemDataValues idv on (idv.valueID = id.valueID)
    left join deletedItems di on (di.itemID = i.itemID)
   where di.dateDeleted is null
),
tbl_pub_year as (
  select key               as key,
         itemID            as itemID,
         collection_id     as collection_id,
         substr(val, 1, 4) as year,
         author_first      as author_first,
         author_last       as author_last
    from tbl1
   where fieldName = 'date'
),
tbl_title as (
  select key           as key,
         itemID        as itemID,
         collection_id as collection_id,
         val           as title,
         author_first  as author_first,
         author_last   as author_last
    from tbl1
   where fieldName = 'title'
),
tbl_storage_path as (
  select t1.key             as key,
         i.key              as storage_key,
         collection_id      as collection_id,
         substr(ia.path, 9) as store_path
    from tbl_title t1
   inner join itemAttachments ia on t1.itemID = ia.parentItemID and ia.contentType = 'application/pdf'
   inner join items i on i.itemID = ia.itemID
)
select t3.storage_key         as key,
       t1.collection_id       as collection_id,
       t2.title               as title,
       t1.year                as year,
       t3.store_path          as store_path,
       t1.author_first        as author_first,
       t1.author_last         as author_last
  from tbl_pub_year t1
 inner join tbl_title t2 on t1.key = t2.key
 inner join tbl_storage_path t3 on t3.key = t2.key
 where t1.collection_id = ?
"""

__sql2 = """
select substr(ia.path, 9) as store_path
  from items i
 inner join itemAttachments ia on ia.itemID = i.itemID
 where i.key = ?
"""

__sql3 = """
select count(*) from items
"""

__sql4 = """
select collectionID,
       parentCollectionID,
       collectionName
  from collections
"""

__sql5 = """
with collection_item_agg as (
    select collectionID  as collectionID,
           count(*)      as cnt
      from collectionItems
     group by collectionID
     order by cnt desc
)
select c.collectionID   as id,
       c.collectionName as name
  from collections c
 inner join collection_item_agg ci on ci.collectionId = c.collectionId
"""

ZOTERO_HOME = os.path.join(Path.home(), 'Zotero')


def validate_zotero():
    try:
        conn = _get_connection()
        cur = conn.cursor()
        cur.execute(__sql3)
        return cur.fetchone()[0] > 0
    except Exception as e:
        print(e)
        raise
    finally:
        conn.close()
    return False


def load_literatures(collection):
    try:
        conn = _get_connection()
        cur = conn.cursor()
        seen = {}
        dikt = []
        for key, _, title, year, store_path, _, author_last in cur.execute(__sql1, (collection,)):
            val = seen.get(key)
            if val is not None:
                continue
            seen[key] = 1
            pdf_path = os.path.join(
                ZOTERO_HOME, 'storage', key, store_path
            )
            _, pages, _, _ = load_one_pdf(pdf_path)
            dikt.append({
                'id': key,
                'title': title,
                'author': f"{author_last} et al.",
                'year': year,
                'pages': pages,
            })
        return dikt
    except Exception as e:
        print(e)
        raise
    finally:
        conn.close()


def load_collections():
    try:
        conn = _get_connection()
        cur = conn.cursor()
        list = []
        for name, id in cur.execute(__sql5):
            list.append((id, name))
        return list
    except Exception as e:
        print(e)
        raise
    finally:
        conn.close()


def find_document_by_id(key):
    try:
        conn = _get_connection()
        cur = conn.cursor()
        cur.execute(__sql2, (key,))
        store_path = cur.fetchone()[0]
        return os.path.join(ZOTERO_HOME, 'storage', key, store_path)
    except Exception as e:
        print(e)
        raise
    finally:
        conn.close()


# def _mktree(list):
#     initial = []
#     children = []
#     for t in list:
#         if t[1] is None:
#             initial.append({'value': t[0], 'label': t[2]})
#         else:
#             children.append(t)
#     return initial

         
def _get_connection():
    sqlite_db_path = os.path.join(ZOTERO_HOME, 'zotero.sqlite')
    return sqlite3.connect(sqlite_db_path)

        
if __name__ == "__main__":
    #print(find_document_by_id("5MNBD2FV"))
    #print(load_literatures("vul"))
    print(load_collections())
