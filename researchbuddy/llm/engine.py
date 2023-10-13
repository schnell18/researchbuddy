from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyMuPDFLoader
from langchain.chains.summarize import load_summarize_chain
from .datatypes import LLMException
from ..utils import load_access_token
from openai.error import InvalidRequestError


def summarize(pdf_path):
    try:
        loader = PyMuPDFLoader(pdf_path)
        docs = loader.load()

        api_key = load_access_token('OpenAI', 'api_key')
        model_name = load_access_token('OpenAI', 'model_name_large_context')
        llm = ChatOpenAI(
            openai_api_key = api_key,
            temperature=0,
            model_name=model_name,
        )
        chain = load_summarize_chain(llm, chain_type="stuff")
        return chain.run(docs)
    except InvalidRequestError as oair:
        raise LLMException(500, str(oair))


