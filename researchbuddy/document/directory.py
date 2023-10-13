import os
import os.path

from hashlib import md5
from pathlib import Path
from pypdf import PdfReader

from ..utils import load_config_item

DEFAULT_LITERATURE_ROOT = './LITERATURES'


def load_literatures(collection):
    dikt = []
    for entry in _load_doc_file_info(collection):
        title, pages, author, year = load_one_pdf(entry['path'])
        dikt.append({
            'id': entry['id'],
            'title': title,
            'author': author,
            'pages': pages,
            'year': year,
        })
    return dikt


def find_document_by_id(collection, id):
    for info in _load_doc_file_info(collection):
        if info['id'] == id:
            return info['path']
    return None


def load_collections():
    folder_root = load_config_item(
        "general",
        "literature_root_dir",
        DEFAULT_LITERATURE_ROOT
    )
    results = []
    for d in os.listdir(folder_root):
        dir = os.path.join(folder_root, d) 
        if os.path.isdir(dir):
            pdfs = len(list(Path(dir).glob('*.pdf')))
            if pdfs > 0:
                results.append((d, pdfs))
    return [d[0] for d in sorted(results, key=lambda t: t[1], reverse=True)]

        
def _load_doc_file_info(collection):
    folder_root = load_config_item(
        "general",
        "literature_root_dir",
        DEFAULT_LITERATURE_ROOT
    )
    dir = os.path.join(folder_root, collection)
    dikt = []
    for pdf_path in Path(dir).glob('*.pdf'):
        dikt.append({
            'id': md5(bytes(pdf_path.name, "utf-8")).hexdigest(),
            'path': f"{pdf_path}",
        })
    return dikt


def load_one_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    if reader.pages and len(reader.pages) > 0:
        page = reader.pages[0]
        author = ''
        if reader.metadata and reader.metadata.author:
            frist_author_str = reader.metadata.author.split(',', 1)[0]
            if len(frist_author_str) > 0:
                comps = frist_author_str.split(" ")
                if len(comps) > 1:
                    author = f"{comps[1]} et al."
                else:
                    author = f"{comps[0]} et al."
        year = 0
        if reader.metadata and reader.metadata.creation_date_raw:
            # trap data parsing error
            try:
                year = reader.metadata.creation_date.year
            except Exception as ex:
                pass

        return (
            page.extract_text().split("\n", 1)[0],
            len(reader.pages),
            author,
            year
        )
    else:
        return "", 0, "", 0


if __name__ == "__main__":
    #print(find_document_by_id("ai", "e99bdfc24b6e9bc8d28840a914768a73"))
    print(load_collections())
    print(load_literatures("ai"))

