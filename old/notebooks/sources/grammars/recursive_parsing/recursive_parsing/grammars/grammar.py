__author__ = "Polyarnyi Nickolay"

from recursive_parsing.commons import iter_by_tokens


def remove_direct_left_recursion(A, rules):
    new_rules = {A: []}
    left_recursion_rules = []
    for rule in rules[A]:
        if len(rule) > 0 and rule[0] == A:
            left_recursion_rules.append(rule)
        else:
            new_rules[A].append(rule)

    new_key = A + '_'
    if len(left_recursion_rules) != 0:
        with_right_recursion_rules = []
        for new_rule in new_rules[A]:
            with_right_recursion = list(new_rule)
            with_right_recursion.append(new_key)
            with_right_recursion_rules.append(with_right_recursion)
        new_rules[A] += with_right_recursion_rules

        new_rules[new_key] = []
        for left_recursion_rule in left_recursion_rules:
            without_left = left_recursion_rule[1:]
            new_rules[new_key].append(without_left)
            with_right_recursion = list(without_left)
            with_right_recursion.append(new_key)
            new_rules[new_key].append(with_right_recursion)

    for key in rules:
        if key != A and key != new_key:
            new_rules[key] = rules[key]
    return new_rules


def remove_left_recursion(rules):
    non_terminals = list(rules.keys())
    for i, key1 in enumerate(non_terminals):
        for key2 in non_terminals[:i]:
            new_rules = []
            for rule in rules[key1]:
                if len(rule) > 0 and rule[0] == key2:
                    for rule2 in rules[key2]:
                        new_rules.append(rule2 + rule[1:])
                else:
                    new_rules.append(rule)
            rules[key1] = new_rules

        rules = remove_direct_left_recursion(key1, rules)
    return rules


def calc_first(start, rules):
    first = {}
    for non_terminal in rules:
        first[non_terminal] = set()
    for key in rules:
        for rule in rules[key]:
            for token in rule:
                if token not in rules:
                    terminal = token
                    first[terminal] = {terminal}

    changing = True
    while changing:
        changing = False
        for key in rules.keys():
            for rule in rules[key]:
                before = len(first[key])
                if len(rule) == 0:
                    first[key].add('')
                else:
                    first[key] = first[key] | first[rule[0]]
                after = len(first[key])
                if before != after:
                    changing = True
    return first


def calc_follow(first, start, rules, end='$'):
    follow = {}
    for non_terminal in rules.keys():
        follow[non_terminal] = set()
    follow[start].add(end)

    changing = True
    while changing:
        changing = False
        for A, key_rules in rules.items():
            for rule in key_rules:
                for i, B in enumerate(rule):
                    if B not in rules.keys():
                        continue
                    firstAfterB = first[rule[i + 1]] if i + 1 < len(rule) else {''}
                    before = len(follow[B])
                    follow[B] |= (firstAfterB - {''})
                    if '' in firstAfterB:
                        follow[B] |= follow[A]
                    after = len(follow[B])
                    if after != before:
                        changing = True
    return follow


class Grammar:

    def __init__(self, start, rules, terminals, end='$'):
        self.start = start
        self.end = end
        self._raw_rules = {key: [list(iter_by_tokens(rule, rules.keys(), terminals)) for rule in key_rules]
                           for key, key_rules in rules.items()}
        self.rules = remove_left_recursion(self._raw_rules)
        self.terminals = terminals
        self.first = calc_first(self.start, self.rules)
        self.follow = calc_follow(self.first, self.start, self.rules, self.end)
