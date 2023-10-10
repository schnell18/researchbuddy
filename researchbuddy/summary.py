import json
import random
import time
import tornado

from jupyter_server.base.handlers import APIHandler


class SummeryHandler(APIHandler):

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        self.log.warning("Received: %s", input_data)
        time.sleep(random.randint(3, 10))
        resp = {
            "plaintext": [
                "Good explanation\n"
            ],
            "latex": [
                "\\documentclass{article}\n"
                "\\begin{document}\n"
                "\\latex\n"
                "\\end{document}\n"
            ],
        }
        self.finish(json.dumps(resp))

