## General Base Agent 

from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import CharHuggingFace 
from langchain_core.output_parsers import StrOutPutParser

class BaseAgent: 

    def __init__(self):
        self.prompt = ChatPromptTemplate()
        self.llm = self.ChatHuggingFace()

        self.chain = self.prompt | self.llm | StrOutPutParser() 

        