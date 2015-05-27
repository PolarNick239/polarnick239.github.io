__author__ = "Polyarnyi Nickolay"

# This grammar describes correct bracket sequence

# Examples:

# '()()'
# '(())'
# '' <- empty string
# (()((()))()()))()()

rules = {
    'S': ['SS', '(S)', ''],
}

start = 'S'

terminals = ['(', ')']
