__author__ = "Polyarnyi Nickolay"


rules = {
    'VarsDeclaration': ['varVariables'],
    'Variables': [('Names:type;Variables', {0: lambda key, names, _, type, __, vars: {'type': type['val']}}),
                  ('Names:type;', {0: lambda key, names, _, type, __: {'type': type['val']}})],
    'Names': [('name,Names', {0: lambda key, name, _, names: {'type': key['type']},
                              2: lambda key, name, _, names: {'type': key['type']}}),
              ('name', {0: lambda key, name: {'type': key['type']}})],
}

start = 'VarsDeclaration'

terminals = ['var', 'name', 'type', ',', ':', ';']
