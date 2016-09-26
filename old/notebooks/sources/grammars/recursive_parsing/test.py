__author__ = "Polyarnyi Nickolay"

from recursive_parsing.grammars import pascal_vars_grammar
from recursive_parsing.grammars.grammar import Grammar
from recursive_parsing.lexical_analyzers.pascal_lexical_analyzer import PascalLexicalAnalyzer
from recursive_parsing.syntax_analyzer import syntax_analyze

from IPython.display import Image
from ctree.visual.dot_manager import DotManager

rules = pascal_vars_grammar.rules
terminals = pascal_vars_grammar.terminals
grammar = Grammar(pascal_vars_grammar.start, rules, terminals)

string = '''
var
    a, b: integer;
'''

tree = syntax_analyze(string, PascalLexicalAnalyzer(), grammar)

labels = tree._to_text_labels()
connections = tree._to_text_connections()
text = 'digraph mytree {' + labels + connections + '}'

Image(DotManager.run_dot(text), embed=True)
