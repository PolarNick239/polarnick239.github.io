__author__ = "Polyarnyi Nickolay"


class UnexpectedToken(Exception):

    def __init__(self, message):
        super(UnexpectedToken, self).__init__(message)

next_id = 1


class Tree:

    def __init__(self, key, value=None, child_trees=None, parent=None, foo={}):
        self.key = key
        self.value = value
        self.child_trees = child_trees or []
        self.parent = None
        self.foo = foo
        self.attributes = {}
        if value:
            self.attributes['val'] = value
        for child in self.child_trees:
            child.parent = self

    def not_empty(self):
        not_empty = self.value is not None
        for child in self.child_trees:
            if child.not_empty():
                not_empty = True
        return not_empty

    def _to_text_labels(self, with_empty=False):
        global next_id
        if not self.not_empty() and not with_empty:
            return ''
        self.id = next_id
        next_id += 1

        label = self.key
        # if self.value is not None and self.key != self.value:
        #     label += '={}'.format(self.value)
        if self.attributes:
            for key, value in self.attributes.items():
                label += '\n{}={}'.format(key, value)
        text = '{} [label=\"{}\"];\n'.format(self.id, label)
        for child in self.child_trees:
            text += child._to_text_labels(with_empty)
        return text

    def _to_text_connections(self, with_empty=False):
        text = ''
        for child in self.child_trees:
            if child.not_empty() or with_empty:
                text += '{} -> {};\n'.format(self.id, child.id)
                text += child._to_text_connections(with_empty)
        return text

    def to_text(self, with_empty=False):
        global next_id
        next_id = 1
        return self._to_text_labels(with_empty) + self._to_text_connections(with_empty)

    @staticmethod
    def update(a, b):
        changed = False
        for key, value in b.items():
            if key not in a:
                changed = True
            a[key] = value
        return changed

    def calculate(self):
        dicts = []
        for child in self.child_trees:
            if child.calculate():
                changed = True
            dicts.append(child.attributes)

        changed = True
        while changed:
            changed = False
            for key, foo in self.foo.items():
                if key != -1:
                    try:
                        values = foo(self.attributes, *dicts)
                    except KeyError:
                        continue
                    if self.update(self.child_trees[key].attributes, values):
                        changed = True
            if -1 in self.foo:
                try:
                    values = self.foo[-1](self.attributes, *dicts)
                except KeyError:
                    continue
                if self.update(self.attributes, values):
                    changed = True
        return changed


def syntax_analyze(string, lexical_analyze, grammar):
    ''':type lexical_analyze: recursive_parsing.lexical_analyzers.lexical_analyzer.LexicalAnalyzer
       :type grammar: recursive_parsing.grammars.grammar.Grammar'''
    token_iter = lexical_analyze.parse(string)
    next(token_iter)
    return _analyze(grammar.start, lexical_analyze, token_iter, grammar)


def _analyze(key, lexical_analyze, token_iter, grammar):
    children = []
    token_type, token_value = lexical_analyze.current_token
    if token_type not in grammar.first[key]:
        if token_type not in grammar.follow[key]:
            raise UnexpectedToken('At {}: found token_type={} (with value={}), while expected one of: {}'
                                  .format(key, token_type, token_value, grammar.first[key]))
    matched_rule = None
    for rule in grammar.rules[key]:
        if len(rule) == 0:
            continue
        if token_type in grammar.first[rule[0]]:
            if matched_rule is not None:
                raise Exception('At {}: grammar is bad: in rule={} token_type={} (with value={})'
                                ' matches many rules! ({} and {})'
                                .format(key, rule, token_type, token_value, matched_rule, rule))
            matched_rule = rule
    if matched_rule is None:
        for rule in grammar.rules[key]:
            if len(rule) == 0:
                if token_type not in grammar.follow[key]:
                    raise Exception('At {}: after epsilon rule token_type={} (with value={}) found, '
                                    'while expected one of: {}!'.format(token_type, token_value, grammar.follow[key]))
                else:
                    matched_rule = rule
    if matched_rule is None:
        raise Exception('At {}: no rule matched for token_type={} (with value={})'
                        .format(key, token_type, token_value))
    for part in matched_rule:
        if part in grammar.terminals:
            token_type, token_value = lexical_analyze.current_token
            children.append(Tree(token_type, token_value))
            next(token_iter)
        else:
            children.append(_analyze(part, lexical_analyze, token_iter, grammar))
    tree = Tree(key, child_trees=children)
    for child in children:
        child.parent = tree
    return tree
