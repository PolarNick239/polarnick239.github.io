__author__ = "Polyarnyi Nickolay"


def get_prefix_token(string, tokens):
    for token in tokens:
        if string.startswith(token):
            return token
    return None


def iter_by_tokens(string, non_terminals, terminals):
    """
    :type string: str
    :return: every substring from string, that contains in tokens, or the most short to next token entrance
    """
    while len(string) > 0:
        token = get_prefix_token(string, list(non_terminals) + list(terminals))
        assert token is not None
        yield token
        string = string[len(token):]


def ensure_list(value_or_list):
    if not isinstance(value_or_list, list):
        return [value_or_list]
    return value_or_list
