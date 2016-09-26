__author__ = "Polyarnyi Nickolay"

rules = {
    "expr": ["addExpr"],
    "addExpr": ["multExpr",
                "addExpr+multExpr",
                'addExpr-multExpr'],
    "multExpr": ["indexedExpr",
                 "multExpr*indexedExpr",
                 "multExpr/indexedExpr"],
    "indexedExpr": ['atomExpr',
                    'atomExpr^atomExpr',
                    'atomExpr_atomExpr'],
    "atomExpr": ['sqrtExpr',
                 'Number',
                 'Variable',
                 '(expr)'],
    'sqrtExpr': ['\\sqrt{expr}'],
}

start = 'expr'

terminals = ['Variable', 'Number', '(', ')', '+', '-', '*', '/', '\\sqrt{', '}', '^', '_']
#
#
# latexExpr	:	expr;
#
# expr	:	addExpr;
#
# addExpr	:	multExpr (('+'|'-') multExpr)*;
#
# multExpr	:	indexedExpr (('*'|'/') indexedExpr)*;
#
# indexedExpr	:	atomExpr |
# 				atomExpr '^' atomExpr |
# 				atomExpr '_' atomExpr ;
#
# atomExpr	:	sqrtExpr | Number | Variable | '(' expr ')';
# sqrtExpr	:	'\\sqrt{' expr '}';
#
#
#
# Number	:	('0'..'9')+ ('.' ('0'..'9')+)?;
#
# Variable	:	('a'..'z'|'A'..'Z')+;
#
# // Ignore all white space characters
# WS : [ \t\r\n]+ -> skip ;
