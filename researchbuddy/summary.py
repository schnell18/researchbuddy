import json
import random
import time
import tornado

from .document.directory import find_document_by_id as dir_find_document_by_id
from .document.zotero import find_document_by_id as zo_find_document_by_id
from .llm.datatypes import LLMException
from .llm.engine import summarize
from jupyter_server.base.handlers import APIHandler


class SummeryHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        req = self.get_json_body()
        self.log.warning("Received Summary Request: %s", req)
        lib_type = req.get('libType', 'directory')

        try:
            #TODO: refine multi-doc structure
            summaries = []
            for doc in req['docList']:
                if (lib_type == 'zotero'):
                    pdf_path = zo_find_document_by_id(doc['id'])
                    summaries.append(summarize(pdf_path))
                elif (lib_type == 'directory'):
                    #TODO: fix hard-code diretory location
                    pdf_path = dir_find_document_by_id("pdfs", doc['id'])
                    self.log.warning("Found pdf location: %s", pdf_path)
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

