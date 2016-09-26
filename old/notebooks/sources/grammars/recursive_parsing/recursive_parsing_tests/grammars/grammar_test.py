__author__ = "Polyarnyi Nickolay"

import unittest

from recursive_parsing.grammars import pascal_vars_grammar
from recursive_parsing.grammars.grammar import Grammar


class TestGrammar(unittest.TestCase):

    def test_brackets(self):
        rules = pascal_vars_grammar.rules
        terminals = pascal_vars_grammar.terminals
        grammar = Grammar('VarsDeclaration', rules, terminals)
