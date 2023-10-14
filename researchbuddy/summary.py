import json
import random
import time
import tornado

from .document.directory import find_document_by_id as dir_find_document_by_id
from .document.zotero import find_document_by_id as zo_find_document_by_id
from .llm.datatypes import LLMException
from .llm.engine import summarize
from .llm.engine import split
from .llm.engine import refine
from jupyter_server.base.handlers import APIHandler


class SummeryHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        req = self.get_json_body()
        self.log.warning("Received Summary Request: %s", req)
        lib_type = req.get('libType', 'folder')
        collection = req.get('collection', '')
        if collection == '':
            self.log.error("collection is absent")
            resp = {
                "code": 501, 
                "errMsg": "collection parameter is absent"
            }
            self.finish(json.dumps(resp))
            return

        try:
            #TODO: refine multi-doc structure
            summaries = []
            for doc in req['docList']:
                if (lib_type == 'zotero'):
                    pdf_path = zo_find_document_by_id(doc['id'])
                    summaries.append(summarize(pdf_path))
                elif (lib_type == 'folder'):
                    pdf_path = dir_find_document_by_id(collection, doc['id'])
                    self.log.info("Found pdf location: %s", pdf_path)
                    summaries.append(summarize(pdf_path))

            resp = {
                "code": 0,
                "plaintext": summaries,
                "latex": [
                    "\\documentclass{article}\n"
                    "\\begin{document}\n"
                    "\\latex\n"
                    "\\end{document}\n"
                ],
            }
            self.finish(json.dumps(resp))
        except LLMException as llme:
            self.log.exception("LLM call failed due to: %s", llme)
            resp = {
                "code": llme.code,
                "errMsg": llme.message,
            }
            self.finish(json.dumps(resp))


class SplitHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        req = self.get_json_body()
        self.log.warning("Received Split Request: %s", req)
        lib_type = req.get('libType', 'folder')
        collection = req.get('collection', '')
        if collection == '':
            self.log.error("collection is absent")
            resp = {
                "code": 501, 
                "errMsg": "collection parameter is absent"
            }
            self.finish(json.dumps(resp))
            return
        docId = req.get('docId', '')
        if docId == '':
            self.log.error("docId is absent")
            resp = {
                "code": 501, 
                "errMsg": "docId parameter is absent"
            }
            self.finish(json.dumps(resp))
            return

        try:
            text = ''
            if (lib_type == 'zotero'):
                pdf_path = zo_find_document_by_id(docId)
                text = split(pdf_path)
            elif (lib_type == 'folder'):
                pdf_path = dir_find_document_by_id(collection, docId)
                self.log.info("Found pdf location: %s", pdf_path)
                text = split(pdf_path)

            resp = {
                "code": 0,
                "text": text,
            }
            self.finish(json.dumps(resp))
        except LLMException as llme:
            self.log.exception("LLM call failed due to: %s", llme)
            resp = {
                "code": llme.code,
                "errMsg": llme.message,
            }
            self.finish(json.dumps(resp))


class RefineHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        req = self.get_json_body()
        self.log.warning("Received Refine Request: %s", req)
        lib_type = req.get('libType', 'folder')
        collection = req.get('collection', '')
        if collection == '':
            self.log.error("collection is absent")
            resp = {
                "code": 501, 
                "errMsg": "collection parameter is absent"
            }
            self.finish(json.dumps(resp))
            return
        text = req.get('text', '')
        if text == '':
            self.log.error("text is absent")
            resp = {
                "code": 501, 
                "errMsg": "text parameter is absent"
            }
            self.finish(json.dumps(resp))
            return

        try:
            revised = refine(text)
            resp = {
                "code": 0,
                "revisions": revised,
            }
            self.finish(json.dumps(resp))
        except Exception as e:
            self.log.exception("LLM call failed due to: %s", e)
            resp = {
                "code": 502,
                "errMsg": "Refine text failed"
            }
            self.finish(json.dumps(resp))
