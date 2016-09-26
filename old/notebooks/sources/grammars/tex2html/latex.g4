grammar latex;

latexExpr	:	expr;

expr	:	addExpr;

addExpr	:	multExpr (('+'|'-') multExpr)*;

multExpr	:	indexedExpr (('*'|'/') indexedExpr)*;

indexedExpr	:	atomExpr |
				atomExpr '^' atomExpr |
				atomExpr '_' atomExpr ;

atomExpr	:	sqrtExpr | Number | Variable | '(' expr ')';
sqrtExpr	:	'\\sqrt{' expr '}';



Number	:	('0'..'9')+ ('.' ('0'..'9')+)?;

Variable	:	('a'..'z'|'A'..'Z')+;

// Ignore all white space characters
WS : [ \t\r\n]+ -> skip ;