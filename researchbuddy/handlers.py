import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from .literature import LiteratureHandler
from .literature import LibraryTypeHandler
from .literature import ZoteroLibraryHandler
from .literature import DirectoryLibraryHandler
from .summary import SummeryHandler

def setup_handlers(web_app):
    routing = {
        'literature': LiteratureHandler,
        'literature/summary': SummeryHandler,
        'libtype': LibraryTypeHandler,
        'libtype/zotero': ZoteroLibraryHandler,
        'libtype/directory': DirectoryLibraryHandler,
    }
    host_pattern = ".*$"
    path_prefix =  "researchbuddy"
    base_url = web_app.settings["base_url"]
    handlers = []
    for k, v in routing.items():
        pat = url_path_join(base_url, path_prefix, k)
        handlers.append((pat, v))
    web_app.add_handlers(host_pattern, handlers)
