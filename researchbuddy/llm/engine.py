import json
import re

from pypdf import PdfReader
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyMuPDFLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import ChatPromptTemplate
from langchain.prompts import SystemMessagePromptTemplate
from langchain.prompts import HumanMessagePromptTemplate
from langchain.schema.output_parser import StrOutputParser
from openai.error import InvalidRequestError

from .datatypes import LLMException
from ..utils import load_config_item

CONTINUE_PAT = re.compile(r"-\n", re.MULTILINE)
SENTENCE_PAT = re.compile(r"\.", re.MULTILINE)


def summarize(pdf_path):
    try:
        loader = PyMuPDFLoader(pdf_path)
        docs = loader.load()
        llm = _get_chatgpt_model()
        chain = load_summarize_chain(llm, chain_type="stuff")
        return chain.run(docs)
    except InvalidRequestError as oair:
        raise LLMException(500, str(oair))


def split(pdf_path):
    reader = PdfReader(pdf_path)
    lines = []
    for i, page in enumerate(reader.pages):
        lines.append(f"=============== page {i+1} ===============")
        lines.append(CONTINUE_PAT.sub('', page.extract_text()))
    return "\n".join(lines)


def refine(text):
    template = """Refine the input text to conform to academic writing style. Correct mispell and gramma error, replace simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary.
    List the original sentences along with the improved ones, and give explanation in JSON format, e.g.:

    ```json
    [{{"original": "sentence1", "revised", "reason": "xxx"}}]
    ```"""
    prompt = ChatPromptTemplate.from_messages(
        [("system", template), ("human", "{input}")]
    )

    llm = _get_chatgpt_model()

    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"input": text})
    return json.loads(result)

    # sentences = re.split(SENTENCE_PAT, text)
    # dikt = []
    # for sentence in sentences:
    #     dikt.append({
    #         'original': sentence,
    #         'revised': sentence,
    #         'reason': 'Good enough, no change',
    #     })
    # return dikt


def _get_chatgpt_model():
    api_key = load_config_item('OpenAI', 'api_key')
    model_name = load_config_item('OpenAI', 'model_name_large_context')
    return ChatOpenAI(
        openai_api_key = api_key,
        temperature=0,
        model_name=model_name,
    )


if __name__ == "__main__":
    text = """
As AI technologies flourish in recent years, which is examplified by the viral growth of ChatGPT, choosing a right model and associated tools becomes a daunting task for people who want to build intelligent applications. In this paper, we explore an data-driven approach to help AI application developers to make informed decision of the appropriate AI technologies to use. We harness the Github API to collect AI projects to identify and analyze active AI ecosystems. Our key finds are TBDs. The further research is to incorporate soical media mining techniques to cross-validate the results.
    """
    print(refine(text))

