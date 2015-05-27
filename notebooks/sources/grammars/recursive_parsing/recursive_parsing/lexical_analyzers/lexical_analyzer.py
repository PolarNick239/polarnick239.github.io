__author__ = "Polyarnyi Nickolay"


class LexicalAnalyzer:

    def __init__(self):
        self.current_token = None

    def parse(self, string):
        string = self._trim(string)
        while len(string) > 0:
            self.current_token, string = self._nip_first_token(string)
            string = self._trim(string)
            yield self.current_token
        self.current_token = self._string_end()
        yield self.current_token

    def _trim(self, string):
        return string.strip()

    def _nip_first_token(self, string):
        raise NotImplementedError

    def _string_end(self):
        raise NotImplementedError

    def _try_nip_first_token(self, string, variants_by_terminal_name):
        for terminal in variants_by_terminal_name:
            for variant in variants_by_terminal_name[terminal]:
                if string.startswith(variant):
                    return terminal, variant
        return None, None
