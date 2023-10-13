import json
import tornado

from .document.directory import load_literatures as dir_load_literatures
from .document.zotero import load_literatures as zo_load_literatures
from .document.zotero import load_collections as zo_load_collections
from .document.zotero import validate_zotero

from jupyter_server.base.handlers import APIHandler


class LiteratureHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        lib_type = self.get_argument('libType')
        collection = self.get_argument('collection')
        self.log.info("Received libType: %s, collection: %s", lib_type, collection)
        rows = []
        if (lib_type == 'zotero'):
            rows = zo_load_literatures(collection)
        elif (lib_type == 'folder'):
            #TODO: fix hard-code diretory location
            rows = dir_load_literatures("pdfs")
            self.log.info("Loaded: %s", rows)

        self.finish(
            json.dumps({
                "data": rows
            })
        )


class LibraryTypeHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        options = [{'value': 'folder', 'label': 'Folder'}]
        # check if zotero is installed or configed
        if validate_zotero():
            options.append({'value': 'zotero', 'label': 'Zotero'})

        self.finish(
            json.dumps({
                "data": options
            })
        )


class FolderLibraryHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        options = [{'value': 'default', 'label': 'Default Folder'}]
        self.finish(
            json.dumps({
                "data": options
            })
        )


class ZoteroLibraryHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):

        options = [{'value': t[1], 'label': t[0]} for t in zo_load_collections()]
        self.finish(
            json.dumps({
                "data": options
            })
        )
