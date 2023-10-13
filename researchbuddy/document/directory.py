from hashlib import md5
from pathlib import Path
from pypdf import PdfReader


def load_literatures(dir):
    dikt = []
    for entry in _load_doc_file_info(dir):
        title, pages, author, year = load_one_pdf(entry['path'])
        dikt.append({
            'id': entry['id'],
            'title': title,
            'author': author,
            'pages': pages,
            'year': year,
        })
    return dikt


def find_document_by_id(dir, id):
    for info in _load_doc_file_info(dir):
        if info['id'] == id:
            return info['path']
    return None

        
def _load_doc_file_info(dir):
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

        return (
            page.extract_text().split("\n", 1)[0],
            len(reader.pages),
            author,
            reader.metadata.creation_date.year if reader.metadata.creation_date else 0
        )
    else:
        return "", 0, "", 0


if __name__ == "__main__":
    #print(find_document_by_id("pdfs", "e99bdfc24b6e9bc8d28840a914768a73"))
    print(load_literatures("pdfs"))
