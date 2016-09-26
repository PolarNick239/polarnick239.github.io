__author__ = "Polyarnyi Nickolay"

rules = {
    "E": [("E+T", {-1: lambda key, e, op, t: {'val': e['val'] + t['val']}}),
          ("T", {-1: lambda key, t: {'val': t['val']}})],
    "T": [("T*F", {-1: lambda key, t, op, f: {'val': t['val'] * f['val']},
                   0: lambda key, t, op, f: {'right multiplier': f['val']},
                   2: lambda key, t, op, f: {'left multiplier': t['val']}}),
          ("F", {-1: lambda key, f: {'val': f['val']}})],
    "F": [("(E)", {-1: lambda key, br0, e, br1: {'val': e['val']}}),
          ("num", {-1: lambda key, id: {'val': int(id['val'])}})],
}

start = 'E'

terminals = ['num', '(', ')', '+', '*']
