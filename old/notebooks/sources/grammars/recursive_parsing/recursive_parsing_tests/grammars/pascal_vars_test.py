__author__ = "Polyarnyi Nickolay"


import unittest

from recursive_parsing.grammars.pascal_vars_grammar import start, rules, terminals, tests

from recursive_parsing.grammars.grammar import Grammar
from recursive_parsing.lexical_analyzers.pascal_lexical_analyzer import PascalLexicalAnalyzer
from recursive_parsing.syntax_analyzer import syntax_analyze


class PascalVarsTest(unittest.TestCase):

    def _sort_tree_lines(self, lines):
        assert '' in lines
        decls = []
        connections = []
        for line in lines:
            if 'label' in line:
                decls.append(line)
            elif '->' in line:
                connections.append(line)
            else:
                self.assertEqual('', line)
        decls = sorted(decls, key=lambda line: int(line[:line.index(' ')]))
        return decls + connections + ['']


    def test_cases(self):
        grammar = Grammar(start, rules, terminals)
        for string, expected_tree_lines in tests:
            tree = syntax_analyze(string, PascalLexicalAnalyzer(), grammar)
            text = tree.to_text(True)
            print(text)
            lines = set(text.split(';\n'))

            sorted_lines = self._sort_tree_lines(lines)
            # for line in sorted_lines:
                # print("'{}',".format(line))

            self.assertEqual(set(sorted_lines), expected_tree_lines, msg='Failed case: {}'.format(string))
