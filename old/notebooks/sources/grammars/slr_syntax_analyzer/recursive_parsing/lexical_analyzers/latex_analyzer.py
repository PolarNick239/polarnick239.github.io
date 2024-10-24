__author__ = "Polyarnyi Nickolay"


from recursive_parsing.lexical_analyzers.lexical_analyzer import LexicalAnalyzer


class LatexLexicalAnalyzer(LexicalAnalyzer):

    def _nip_first_token(self, string):
        pascal_vars_terminals = {'Number': [self.number], 'Variable': [self.variable]}
        separators = ['(', ')', '+', '-', '*', '/', '\\sqrt{', '}', '^', '_']
        for separator in separators:
            pascal_vars_terminals[separator] = [separator]

        terminal, variant = self._try_nip_first_token(string, pascal_vars_terminals)
        if terminal is not None:
            return (terminal, variant), string[len(variant):]

        min_separator_index = len(string)
        for separator in separators:
            if separator in string:
                min_separator_index = min(min_separator_index, string.index(separator))
        token, string = string[:min_separator_index], string[min_separator_index:]
        return ('name', self._trim(token)), string

    def _string_end(self):
        return '$', '$'
