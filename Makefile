all: clean
	zip -r investing.zip css js main.html manifest.json options.html

clean:
	rm -f investing.zip
