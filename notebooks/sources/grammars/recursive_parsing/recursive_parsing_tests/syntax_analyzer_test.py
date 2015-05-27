__author__ = "Polyarnyi Nickolay"

import unittest

from recursive_parsing.grammars import pascal_vars_grammar
from recursive_parsing.grammars.grammar import Grammar
from recursive_parsing.lexical_analyzers.pascal_lexical_analyzer import PascalLexicalAnalyzer
from recursive_parsing.syntax_analyzer import syntax_analyze


class TestCommons(unittest.TestCase):

    def test(self):
        pascal_rules = pascal_vars_grammar.rules
        pascal_terminals = pascal_vars_grammar.terminals
        string = 'var a, b: integer; c: integer;'

        tree = syntax_analyze(string,
                              PascalLexicalAnalyzer(),
                              Grammar(pascal_vars_grammar.start, pascal_rules, pascal_terminals))

        pass
