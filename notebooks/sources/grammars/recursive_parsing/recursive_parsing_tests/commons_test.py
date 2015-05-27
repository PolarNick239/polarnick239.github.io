__author__ = "Polyarnyi Nickolay"

import unittest

from recursive_parsing.commons import iter_by_tokens
from recursive_parsing.grammars import pascal_vars_grammar


class TestCommons(unittest.TestCase):

    def test(self):
        pascal_rules = pascal_vars_grammar.rules
        pascal_terminals = pascal_vars_grammar.terminals

        tokenized_rules = {
            'VarsDeclaration': [['var', 'Variables']],
            'Variables': [['Names', ':', 'type', ';'],
                          ['Names', ':', 'type', ';', 'Variables']],
            'Names': [['name'],
                      ['name', ',', 'Names']]
        }

        self.assertEqual(pascal_rules.keys(), tokenized_rules.keys())
        for key, rules in pascal_rules.items():
            self.assertEqual(len(rules), len(tokenized_rules[key]))
            for i, rule in enumerate(rules):
                tokenized_rule = tokenized_rules[key][i]
                res = list(iter_by_tokens(rule, pascal_rules.keys(), pascal_terminals))
                self.assertEqual(res, tokenized_rule)
