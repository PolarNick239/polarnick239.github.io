__author__ = "Polyarnyi Nickolay"

import copy

from recursive_parsing.commons import iter_by_tokens


# def remove_direct_left_recursion(A, rules):
#     new_rules = {A: []}
#     left_recursion_rules = []
#     for rule in rules[A]:
#         if len(rule) > 0 and rule[0] == A:
#             left_recursion_rules.append(rule)
#         else:
#             new_rules[A].append(rule)
#
#     new_key = A + '_'
#     if len(left_recursion_rules) != 0:
#         with_right_recursion_rules = []
#         for new_rule in new_rules[A]:
#             with_right_recursion = list(new_rule)
#             with_right_recursion.append(new_key)
#             with_right_recursion_rules.append(with_right_recursion)
#         new_rules[A] += with_right_recursion_rules
#
#         new_rules[new_key] = []
#         for left_recursion_rule in left_recursion_rules:
#             without_left = left_recursion_rule[1:]
#             new_rules[new_key].append(without_left)
#             with_right_recursion = list(without_left)
#             with_right_recursion.append(new_key)
#             new_rules[new_key].append(with_right_recursion)
#
#     for key in rules:
#         if key != A and key != new_key:
#             new_rules[key] = rules[key]
#     return new_rules


# def calc_epsilonable_non_terminals(rules):
#     can_be_epsilon = {''}
#     changing = True
#     while changing:
#         changing = False
#         for key, key_rules in rules.items():
#             if key in can_be_epsilon:
#                 break
#             for rule in key_rules:
#                 all_can_be_epsilon = True
#                 for token in rule:
#                     if token not in can_be_epsilon:
#                         all_can_be_epsilon = False
#                         break
#                 if all_can_be_epsilon:
#                     can_be_epsilon.add(key)
#                     changing = True
#                     break
#     return can_be_epsilon


# def iter_binary_mask(n):
#     mask = [False] * n
#     for i in range(2**n):
#         yield mask
#         for i in range(n):
#             if mask[i]:
#                 mask[i] = False
#             else:
#                 mask[i] = True
#                 break
#
#
# def remove_epsilon_rules(rules):
#     can_be_epsilon = calc_epsilonable_non_terminals(rules)
#     can_be_epsilon.remove('')
#     new_rules = {}
#     for key, key_rules in rules.items():
#         new_rules[key] = []
#         for rule in key_rules:
#             epsilonable_n = 0
#             for token in rule:
#                 if token in can_be_epsilon:
#                     epsilonable_n += 1
#             for mask in iter_binary_mask(epsilonable_n):
#                 new_rule = []
#                 epsilonable_i = 0
#                 for token in rule:
#                     if token in can_be_epsilon:
#                         if mask[epsilonable_i]:
#                             new_rule.append(token)
#                         epsilonable_i += 1
#                     elif token != '':
#                         new_rule.append(token)
#                 if new_rule:
#                     new_rules[key].append(new_rule)
#     return new_rules




# def remove_left_recursion(rules):
#     non_terminals = list(rules.keys())
#     for i, key1 in enumerate(non_terminals):
#         for key2 in non_terminals[:i]:
#             new_rules = []
#             for rule in rules[key1]:
#                 if len(rule) > 0 and rule[0] == key2:
#                     for rule2 in rules[key2]:
#                         new_rules.append(rule2 + rule[1:])
#                 else:
#                     new_rules.append(rule)
#             rules[key1] = new_rules
#
#         rules = remove_direct_left_recursion(key1, rules)
#     return rules


def calc_first(start, rules):
    first = {}
    for non_terminal in rules:
        first[non_terminal] = set()
    for key in rules:
        for rule, foo in rules[key]:
            for token in rule:
                if token not in rules:
                    terminal = token
                    first[terminal] = {terminal}

    changing = True
    while changing:
        changing = False
        for key in rules.keys():
            for rule, foo in rules[key]:
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
            for rule, foo in key_rules:
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


# def remove_right_branching(rules):
#     changing = True
#     while changing:
#         changing = False
#         new_rules = {}
#         for key, key_rules in rules.items():
#             max_prefix = []
#             for rule in key_rules:
#                 for rule2 in key_rules:
#                     if rule2 is rule:
#                         continue
#                     prefix = 0
#                     for token1, token2 in zip(rule, rule2):
#                         if token1 != token2:
#                             break
#                         prefix += 1
#                     if prefix > len(max_prefix):
#                         max_prefix = rule[:prefix]
#
#             rules_with_prefix = []
#             rules_without_prefix = []
#             for rule in key_rules:
#                 match = len(rule) >= len(max_prefix)
#                 if match:
#                     for i in range(len(max_prefix)):
#                         if rule[i] != max_prefix[i]:
#                             match = False
#                             break
#                 if match and len(max_prefix) > 0:
#                     rules_with_prefix.append(rule)
#                 else:
#                     rules_without_prefix.append(rule)
#
#             new_rules[key] = []
#             for rule in rules_without_prefix:
#                 new_rules[key].append(rule)
#             new_key = key + '^'
#             if rules_with_prefix:
#                 new_rules[new_key] = []
#                 changing = True
#                 new_rules[key].append(max_prefix + [new_key])
#             for rule in rules_with_prefix:
#                 suffix = rule[len(max_prefix):]
#                 if suffix:
#                     new_rules[new_key].append(suffix)
#                 else:
#                     new_rules[new_key].append([''])
#         rules = new_rules
#     return rules


def closure(item, rules):
    new_item = copy.copy(item)
    changing = True
    while changing:
        changing = False
        for A, rule, foo, point in new_item:
            # rule: A -> alpha . B beta
            if point < len(rule):
                B = rule[point]
                if B not in rules:
                    continue
                for gamma, foo2 in rules[B]:

                    contains = False
                    for C, item_rule, foo3, point in new_item:
                        if C == B and point == 0:
                            equal = len(item_rule) == len(gamma)
                            if equal:
                                for token1, token2 in zip(gamma, item_rule):
                                    if token1 != token2:
                                        equal = False
                                        break
                            if equal:
                                contains = True

                    if not contains:
                        new_item.append((B, gamma, foo2, 0))
                        changing = True
    return new_item


def goto(item, rules, symbol):
    new_item = []
    for A, rule, foo, i in item:
        if i < len(rule) and symbol == rule[i]:
            new_item.append((A, rule, foo, i + 1))
    return closure(new_item, rules)


def _to_strings_set(item):
    item_set = set()
    for key, rule, foo, i in item:
        string = '{} -> '.format(key)
        for token in rule:
            string += token
        string += ' #{}'.format(i)
        item_set.add(string)
    return item_set


def _to_string(item, dot_inlined=False):
    if not dot_inlined:
        string_set = _to_strings_set(item)
        string = ''
        for string_i in sorted(string_set):
            string += string_i + '\n'
    else:
        string = ''
        for key, rule, foo, i in item:
            string += '{} → '.format(key)
            for token in rule[:i]:
                string += token
            string += '·'
            for token in rule[i:]:
                string += token
            string += '\n'
    return string


def find(items, item):
    for i, candidate in enumerate(items):
        if len(candidate) != len(item):
            continue
        item_set, candidate_set = _to_strings_set(item), _to_strings_set(candidate)
        matched = True
        for string in item_set:
            if string not in candidate_set:
                matched = False
                break
        for string in candidate_set:
            if string not in item_set:
                matched = False
                break
        if matched:
            return i
    return None


def calc_items_and_goto(rules, terminals, start, end='$'):
    items = []
    goto_m = {}
    item_start = []

    start_rule, foo = rules[start][0]
    item_start.append((start, start_rule, foo, 0))

    item_start = closure(item_start, rules)

    items.append(item_start)

    changing = True
    while changing:
        changing = False
        for i, item_i in enumerate(items):
            for symbol in terminals + list(rules.keys()):
                new_item = goto(item_i, rules, symbol)
                item_index = find(items, new_item)
                if len(new_item) == 0:
                    continue
                if item_index is None:
                    item_index = len(items)
                    items.append(new_item)
                    changing = True
                goto_m[i, symbol] = item_index
    return items, goto_m


def calc_syntax_analyze_table(follow, rules, items, goto, start, end='$'):
    M = {}
    for i, item in enumerate(items):
        for key, rule, foo, point_i in item:
            if point_i < len(rule) and (i, rule[point_i] in goto):
                M[i, rule[point_i]] = ('shift', goto[i, rule[point_i]])
            elif key != start and point_i == len(rule):
                for token in follow[key]:
                    M[i, token] = ('reduce', (key, rule, foo))
            elif key == start and point_i == len(rule):
                M[i, end] = ('accept', None)
    return M




class Grammar:

    def __init__(self, start, rules, terminals, end='$'):
        self.start = start + "'"
        assert self.start not in rules
        self.end = end
        rules = {key: [rule if isinstance(rule, tuple) else (rule, {}) for rule in key_rules]
                 for key, key_rules in rules.items()}
        self._raw_rules = {key: [(list(iter_by_tokens(rule[0], rules.keys(), terminals)), rule[1]) for rule in key_rules]
                           for key, key_rules in rules.items()}
        self._raw_rules[self.start] = [([start], {-1: lambda key, start: {'val': start['val']}})]
        # no_epsilon_rules = remove_epsilon_rules(self._raw_rules)
        # no_left_recursion = remove_left_recursion(no_epsilon_rules)
        # self.rules = remove_right_branching(no_left_recursion)
        self.rules = self._raw_rules
        self.terminals = terminals
        self.first = calc_first(self.start, self.rules)
        self.follow = calc_follow(self.first, self.start, self.rules, self.end)
        self.items, self.goto = calc_items_and_goto(self.rules, terminals, self.start, self.end)
        self.M = None

    def get_syntax_analyze_table(self):
        self.M = self.M or calc_syntax_analyze_table(self.follow, self.rules, self.items, self.goto, self.start, self.end)
        return self.M
