all: build_greencode serve
	
build_greencode:
	cd src/greencode && $(MAKE)

serve:
	jekyll serve
