all:
	mkdir -p build

	rm -f build/shaders.ts

	printf "var vshader=\`" >> build/shaders.ts 
	cat vshader.c >> build/shaders.ts
	printf "\`;\n" >> build/shaders.ts

	printf "var fshader=\`" >> build/shaders.ts
	cat fshader.c >> build/shaders.ts
	printf "\`;\n" >> build/shaders.ts

	tsc --out ../../js/greencode.js main.ts

	mkdir -p ../../static/greencode/
	cp static/fonts.png ../../static/greencode/
