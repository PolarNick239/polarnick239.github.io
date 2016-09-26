__author__ = "Polyarnyi Nickolay"


from recursive_parsing.lexical_analyzers.lexical_analyzer import LexicalAnalyzer


class PascalLexicalAnalyzer(LexicalAnalyzer):

    def _nip_first_token(self, string):
        string = string.replace(" ", "")
        string = string.replace("\n", "")
        pascal_vars_terminals = {'var': ['var'],
                                 'type': ['integer', 'real', 'boolean', 'char', 'string'],
                                 }
        separators = [',', ':', ';']
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
