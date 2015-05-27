__author__ = "Polyarnyi Nickolay"

import unittest

from recursive_parsing.lexical_analyzers.pascal_lexical_analyzer import PascalLexicalAnalyzer


class TestPascalLexicalAnalyzer(unittest.TestCase):

    def test(self):
        string = """
            var
            age, weekdays : integer;
             taxrate, net_income: real;
             choice, isready: boolean;
             initials, grade: char;
             name, surname : string;
            """
        analyzer = PascalLexicalAnalyzer()
        expected_tokens = [
            ('var', 'var'),
            ('name', 'age'), (',', ','), ('name', 'weekdays'), (':', ':'), ('type', 'integer'), (';', ';'),
            ('name', 'taxrate'),  (',', ','), ('name', 'net_income'), (':', ':'), ('type', 'real'), (';', ';'),
            ('name', 'choice'), (',', ','), ('name', 'isready'), (':', ':'), ('type', 'boolean'), (';', ';'),
            ('name', 'initials'), (',', ','), ('name', 'grade'), (':', ':'), ('type', 'char'), (';', ';'),
            ('name', 'name'), (',', ','), ('name', 'surname'), (':', ':'), ('type', 'string'), (';', ';'),
            ('$', '$'),
        ]
        for i, (a, b) in enumerate(analyzer.parse(string)):
            self.assertEqual((a, b), expected_tokens[i])
