__author__ = "Polyarnyi Nickolay"

rules = {
    "E": ["E+T", "T"],
    "T": ["T*F", "F"],
    "F": ["(E)", "id"],
}

start = 'E'

terminals = ['id', '(', ')', '+', '*']
