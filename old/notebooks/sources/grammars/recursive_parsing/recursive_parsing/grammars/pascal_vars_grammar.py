__author__ = "Polyarnyi Nickolay"


rules = {
    'VarsDeclaration': ['varAtLeastOneVariables'],
    'AtLeastOneVariables': ['AtLeastOneName:type;Variables'],
    'AtLeastOneName': ['nameNames'],
    'Variables': ['', 'AtLeastOneName:type;Variables'],
    'Names': ['', ',nameNames'],
}

start = 'VarsDeclaration'

terminals = ['var', 'name', 'type', ',', ':', ';']
