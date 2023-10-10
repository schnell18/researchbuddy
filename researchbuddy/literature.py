import json
import tornado

from jupyter_server.base.handlers import APIHandler


class LiteratureHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):

        rows = [
            {
                'title': "Lost in the Middle: How Language Models Use Long Contexts",
                'pages': 10,
                'author': "Liu et al.",
                'year': 2020
            },
            {
                'title': "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
                'pages': 8,
                'author': "Frantar et al.",
                'year': 2022
            },
            {
                'title': "HuggingFace's Transformers: State-of-the-art Natural Language Processing",
                'pages': 9,
                'author': "Wolf et al.",
                'year': 2021
            },
            {
                'title': "Attention is All you Need",
                'pages': 9,
                'author': "Vaswani et al.",
                'year': 2018
            },
            {
                'title': "Concrete Problems in AI Safety",
                'pages': 9,
                'author': "Amodei et al.",
                'year': 2020
            },
            {
                'title': "LLaMA: Open and Efficient Foundation Language Models",
                'pages': 9,
                'author': "Touvron et al.",
                'year': 2022
            },
            {
                'title': "Orca: Progressive Learning from Complex Explanation Traces of GPT-4",
                'pages': 9,
                'author': "Mukherjee et al.",
                'year': 2023
            },
            {
                'title': "Survey on Explainable AI: From Approaches, Limitations and Applications Aspects",
                'pages': 9,
                'author': "Yang et al.",
                'year': 2020
            },
        ]
         
        self.finish(
            json.dumps({
                "data": rows
            })
        )
